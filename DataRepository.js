'use strict';

var React = require('react-native');

var {
  AsyncStorage,
} = React;

var API_COVER_URL = "http://news-at.zhihu.com/api/4/start-image/1080*1776";
var API_LATEST_URL = 'http://news-at.zhihu.com/api/4/news/latest';
var API_HOME_URL = 'http://news.at.zhihu.com/api/4/news/before/';
var API_THEME_URL = 'http://news-at.zhihu.com/api/4/theme/';
var API_THEMES_URL = 'http://news-at.zhihu.com/api/4/themes';

var KEY_COVER = '@Cover';
var KEY_THEMES = '@Themes:';
var KEY_HOME_LIST = '@HomeList:';
var KEY_THEME_LIST = '@ThemeList:';
var KEY_THEME_TOPDATA = '@ThemeTop:';

function parseDateFromYYYYMMdd(str) {
  if (!str) return new Date();
  return new Date(str.slice(0, 4),str.slice(4, 6) - 1,str.slice(6, 8));
}

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
};

function DataRepository() { // Singleton pattern
  if (typeof DataRepository.instance === 'object') {
    return DataRepository.instance;
  }

  DataRepository.instance = this;
}

DataRepository.prototype._safeStorage = function(key: string) {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(key, (error, result) => {
      var retData = JSON.parse(result);
      if (error) {
        console.error(error);
        resolve(null);
      } else {
        resolve(retData);
      }
    });
  });
};

DataRepository.prototype._safeFetch = function(reqUrl: string) {
  console.log('reqUrl', reqUrl);
  return new Promise((resolve, reject) => {
    fetch(reqUrl)
      .then((response) => response.json())
      .then((responseData) => {
        //console.log(responseData);
        resolve(responseData);
      })
      .catch((error) => {
        console.error(error);
        resolve(null);
      });
  });
};

DataRepository.prototype.getCover = function() {
  return this._safeStorage(KEY_COVER);
}

DataRepository.prototype.updateCover = function() {
  fetch(API_COVER_URL)
    .then((response) => response.json())
    .then((responseData) => {
      AsyncStorage.setItem(KEY_COVER, JSON.stringify(responseData));
    })
    .catch((error) => {
      console.error(error);
    })
    .done();
}

DataRepository.prototype.fetchStories = function(date?: Date,
  callback?: ?(error: ?Error, result: ?Object) => void
) {
  var reqUrl;
  var topData = null;
  if (!date) {
    date = new Date();
    reqUrl = API_LATEST_URL;
    topData = this._safeStorage(KEY_THEME_TOPDATA+ '0');
  } else {
    var beforeDate = new Date(date);
    beforeDate.setDate(date.getDate() + 1);
    reqUrl = API_HOME_URL + beforeDate.yyyymmdd();
  }

  var localStorage = this._safeStorage(KEY_HOME_LIST + date.yyyymmdd());

  var networking = this._safeFetch(reqUrl);

  var merged = new Promise((resolve, reject) => {
    Promise.all([localStorage, networking, topData])
      .then((values) => {
        var error, result;
        result = this._mergeReadState(values[0], values[1]);
        if (!result) {
          error = new Error('Load story error');
        }
        callback && callback(error, result);
        if (error) {
          reject(error);
        } else {
          if (values[1] && values[1].top_stories) {
            result.topData = values[1].top_stories;
          } else {
            result.topData = values[2];
          }
          resolve(result);
        }
      });
  });
  return merged;
};

DataRepository.prototype.fetchThemeStories = function(themeId: number, lastID?: string,
  callback?: ?(error: ?Error, result: ?Object) => void
) {
  // Home story list
  if (themeId === 0) {
    var date;
    if (lastID) {
      date = parseDateFromYYYYMMdd(lastID);
      date.setDate(date.getDate() - 1);
    }
    return this.fetchStories(date, callback);
  }

  // Stroy list by theme
  var isRefresh = !lastID;
  var localStorage = isRefresh ? this._safeStorage(KEY_THEME_LIST + themeId) : null;

  var reqUrl = API_THEME_URL + themeId;
  var topData = null;
  if (lastID) {
    reqUrl += '/before/' + lastID;
  } else {
    topData = this._safeStorage(KEY_THEME_TOPDATA + themeId);
  }

  var networking = this._safeFetch(reqUrl);

  var merged = new Promise((resolve, reject) => {
    Promise.all([localStorage, networking, topData])
      .then((values) => {
        var error, result;
        result = this._mergeReadState(values[0], values[1]);
        if (!result) {
          error = new Error('Load story by theme error');
        }
        callback && callback(error, result);
        if (error) {
          reject(error);
        } else {
          var topDataRet;
          if (values[1] && values[1].background) {
            topDataRet = {};
            topDataRet.description = values[1].description;
            topDataRet.background = values[1].background;
            topDataRet.editors = values[1].editors;
          } else {
            topDataRet = values[2];
          }
          result.topData = topDataRet;
          resolve(result);
        }
      });
  });

  return merged;
};

DataRepository.prototype.saveStories = function(themeList: object, topData: object,
  callback?: ?(error: ?Error, result: ?Object) => void
) {
  var homeList = themeList[0];
  var keyValuePairs = [];

  for (var date in homeList) {
   if (homeList.hasOwnProperty(date)) {
     //console.log(date, homeData[date]);
     keyValuePairs.push([KEY_HOME_LIST + date, JSON.stringify({date: date, stories: homeList[date]})]);
   }
  }

  for (var key in themeList) {
   if (themeList.hasOwnProperty(key)) {
     //console.log(key, data[key]);
     if (key !== '0') {
       keyValuePairs.push([KEY_THEME_LIST + key, JSON.stringify(themeList[key])]);
     }
   }
  }

  for (var theme in topData) {
    if (topData.hasOwnProperty(theme)) {
      //console.log(theme, topData[key]);
      keyValuePairs.push([KEY_THEME_TOPDATA + theme, JSON.stringify(topData[theme])]);
    }
  }

  AsyncStorage.multiSet(keyValuePairs, callback);
};

DataRepository.prototype.getThemes = function(
  callback?: ?(error: ?Error, result: ?Object) => void
) {
  return this._safeStorage(KEY_THEMES)
    .then((result) => {
      if (!result) {
        throw new Error('No themes')
      } else {
        return result;
      }
    })
    .catch((error) => {
      console.error(error);
      return this._safeFetch(API_THEMES_URL)
        .then((themes) => {
          AsyncStorage.setItem(KEY_THEMES, JSON.stringify(themes));
          return themes;
        });
    })
    .then((responseData) => {
      var themes = [];
      if (responseData.subscribed) {
        var len = responseData.subscribed.length;
        var theme
        for (var i = 0; i < len.length; i++) {
          theme = responseData.subscribed[i];
          theme.subscribed = true;
          themes.push(theme);
        }
      }
      if (responseData.others) {
        themes = themes.concat(responseData.others);
      }
      return themes;
    });

};

DataRepository.prototype._mergeReadState = function(src, dst) {

  if (!src) {
    return dst;
  }

  if (!dst) {
    return src;
  }

  var reads = {};
  var story;
  for (var i = src.stories.length - 1; i >= 0 ; i--) {
    story = src.stories[i];
    reads[story.id] = story.read;
  }

  for (var i = dst.stories.length - 1; i >= 0 ; i--) {
    story = dst.stories[i];
    if (reads[story.id]) {
      story.read = true;
    }
  }

  return dst;
};

module.exports = DataRepository;
