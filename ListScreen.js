'use strict';

var React = require('react-native');
var {
  AsyncStorage,
  Platform,
  ListView,
  Image,
  StyleSheet,
  Text,
  View,
} = React

var TimerMixin = require('react-timer-mixin');
var StoryItem = require('./StoryItem');

var API_LATEST_URL = 'http://news.at.zhihu.com/api/4/news/latest';
var API_HISTORY_URL = 'http://news.at.zhihu.com/api/4/news/before/';
var LOADING = {};
var lastDate = null;
var latestDate = null;
var dataBlob = {};
var WEEKDAY = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

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

var ListScreen = React.createClass({
  mixins: [TimerMixin],
  getInitialState: function() {
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    return {
      isLoading: false,
      isLoadingTail: false,
      dataSource: dataSource,
    };
  },
  componentDidMount: function() {
    this.fetchStories(lastDate);
  },
  fetchStories: function(dateBefore) {
    var isRefresh = !dateBefore
    var reqUrl = isRefresh ? API_LATEST_URL : API_HISTORY_URL + dateBefore.yyyymmdd();
    console.log('request url: ' + reqUrl);
    this.setState({
      isLoading: isRefresh,
      isLoadingTail: !isRefresh,
      dataSource: this.state.dataSource,
    });
    fetch(reqUrl)
      .then((response) => response.json())
      .catch((error) => {
        LOADING[API_LATEST_URL] = false;
        this.setState({
          isLoading: (isRefresh ? false : this.state.isLoading),
          isLoadingTail: (isRefresh ? this.state.isLoadingTail : false),
          dataSource: this.state.dataSource,
        });
      })
      .then((responseData) => {
        lastDate = parseDateFromYYYYMMdd(responseData.date);
        if (isRefresh) {
          latestDate = lastDate;
        }

        console.log('lastDate: ' + lastDate);
        console.log('latestDate: ' + latestDate);
        var sectionIDs = [];
        var date = new Date(latestDate);
        while(date >= lastDate) {
          sectionIDs.push(date.yyyymmdd());
          date.setDate(date.getDate() - 1);
          console.log('add: ' + date);
        }

        dataBlob[lastDate.yyyymmdd()] = responseData.stories;

        this.setState({
          isLoading: (isRefresh ? false : this.state.isLoading),
          isLoadingTail: (isRefresh ? this.state.isLoadingTail : false),
          dataSource: this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, null),
        });
      })
      .done();
  },
  getSectionTitle: function(str) {
    var date = parseDateFromYYYYMMdd(str);
    if (date.toDateString() == new Date().toDateString()) {
      return '今日热闻';
    }
    var title = str.slice(4, 6)  + '月' + str.slice(6, 8) + '日';
    title += ' ' + WEEKDAY[date.getDay()];
    return title;
  },
  renderSectionHeader: function(sectionData: Object,
    sectionID: number | string) {
    return (
      <Text style={styles.sectionHeader}>
        {this.getSectionTitle(sectionID)}
      </Text>
    );
  },
  selectStory: function(story: Object) {
    if (Platform.OS === 'ios') {
      this.props.navigator.push({
        title: story.title,
        component: StoryScreen,
        passProps: {story},
      });
    } else {
      this.props.navigator.push({
        title: story.title,
        name: 'story',
        story: story,
      });
    }
  },
  renderRow: function(
    story: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <StoryItem
        key={story.id}
        onSelect={() => this.selectStory(story)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        story={story}
      />
    );
  },
  onEndReached: function() {
    console.log('onEndReached() ' + this.state.isLoadingTail);
    if (this.state.isLoadingTail) {
      return;
    }
    this.fetchStories(lastDate);
  },
  render: function() {
    var content = this.state.dataSource.getRowCount() === 0 ?
      <View style={styles.container}>
        <Text>
          This is the list Screen.
        </Text>
      </View> :
      <ListView
        ref="listview"
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        onEndReached={this.onEndReached}
        renderSectionHeader={this.renderSectionHeader}
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps={true}
        showsVerticalScrollIndicator={false}
      />;
      return (
        <View style={styles.container}>
          <View style={styles.separator} />
          {content}
        </View>
      );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  rator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  scrollSpinner: {
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 14,
    color: '#888888',
    margin: 10,
    marginLeft: 16,
  }
});

module.exports = ListScreen;
