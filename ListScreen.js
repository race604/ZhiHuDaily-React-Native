'use strict';

var React = require('react-native');
var {
  AsyncStorage,
  Platform,
  Dimensions,
  ListView,
  Image,
  StyleSheet,
  Text,
  View,
  DrawerLayoutAndroid,
  ToolbarAndroid,
  ToastAndroid,
  BackAndroid,
} = React

var TimerMixin = require('react-timer-mixin');
var StoryItem = require('./StoryItem');
var ThemesList = require('./ThemesList');
var DataRepository = require('./DataRepository');
var SwipeRefreshLayoutAndroid = require('./SwipeRereshLayout');

var API_LATEST_URL = 'http://news.at.zhihu.com/api/4/news/latest';
var API_HISTORY_URL = 'http://news.at.zhihu.com/api/4/news/before/';
var API_THEME_URL = 'http://news-at.zhihu.com/api/4/theme/';
var LOADING = {};
// var lastDate = null;
// var latestDate = null;
// var dataBlob = {};
var WEEKDAY = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
var DRAWER_WIDTH_LEFT = 56;
var toolbarActions = [
  {title: '提醒', icon: require('image!ic_message_white'), show: 'always'},
  {title: '夜间模式', show: 'never'},
  {title: '设置选项', show: 'never'},
];

var HOME_LIST_KEY = 'home_list_key_';
var THEME_LIST_KEY = 'theme_list_key_';

var repository = new DataRepository();

var dataCache = {
  dataForTheme: {},
  sectionsForTheme: {},
  lastID: {},
};

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
      theme: null,
      dataSource: dataSource,
    };
  },
  componentWillMount: function() {
    BackAndroid.addEventListener('hardwareBackPress', this._handleBackButtonPress);
  },
  componentWillUnmount: function() {
    repository.saveStories(dataCache.dataForTheme);
  },
  _handleBackButtonPress: function() {
    if (this.state.theme) {
      this.onSelectTheme(null);
      return true;
    }
    return false;
  },
  componentDidMount: function() {
    this.fetchStories(this.state.theme, true);
  },
  fetchStories: function(theme, isRefresh) {
    var themeId = theme ? theme.id : 0;
    var isInTheme = themeId !== 0
    var lastID = isRefresh ? null : dataCache.lastID[themeId];

    var dataBlob = dataCache.dataForTheme[themeId];
    if (!dataBlob) {
      dataBlob = isInTheme ? [] : {};
    }
    var sectionIDs = dataCache.sectionsForTheme[themeId];

    this.setState({
      isLoading: isRefresh,
      isLoadingTail: !isRefresh,
      theme: this.state.theme,
      dataSource: this.state.dataSource,
    });

    repository.fetchThemeStories(themeId, lastID)
      .then((responseData) => {
        var newLastID;
        var dataSouce;
        if (!isInTheme) {
          newLastID = responseData.date;
          var newDataBlob = {};
          var newSectionIDs = sectionIDs ? sectionIDs.slice() : []
          if (newSectionIDs.indexOf(newLastID) < 0) {
            newSectionIDs.push(newLastID);
            newSectionIDs.sort((a, b) => (b - a));
          }

          for (var i = 0; i < newSectionIDs.length; i++) {
            newDataBlob[newSectionIDs[i]] = dataBlob[newSectionIDs[i]];
          }
          newDataBlob[newLastID] = responseData.stories;

          dataCache.sectionsForTheme[themeId] = newSectionIDs;

          dataBlob = newDataBlob;
          sectionIDs = newSectionIDs;
          dataSouce = this.state.dataSource.cloneWithRowsAndSections(newDataBlob, newSectionIDs, null);
        } else {
          var length = responseData.stories.length;
          if (length > 0) {
            newLastID = responseData.stories[length - 1].id;
          }
          var newDataBlob;

          if (isRefresh) {
            newDataBlob = responseData.stories;
          } else {
            newDataBlob = dataBlob.concat(responseData.stories);
          }
          dataBlob = newDataBlob;
          dataSouce = this.state.dataSource.cloneWithRows(newDataBlob);
        }
        dataCache.lastID[themeId] = newLastID;
        dataCache.dataForTheme[themeId] = dataBlob;

        // console.log('lastID: ' + lastID);
        // console.log('newLastID: ' + newLastID);

        LOADING[themeId] = false;
        this.setState({
          isLoading: (isRefresh ? false : this.state.isLoading),
          isLoadingTail: (isRefresh ? this.state.isLoadingTail : false),
          theme: this.state.theme,
          dataSource: dataSouce,
        });

        this.swipeRefreshLayout && this.swipeRefreshLayout.finishRefresh();
      })
      .catch((error) => {
        console.error(error);
        this.setState({
          isLoading: (isRefresh ? false : this.state.isLoading),
          isLoadingTail: (isRefresh ? this.state.isLoadingTail : false),
          theme: this.state.theme,
          dataSource: this.state.dataSource.cloneWithRows([]),
        });
        this.swipeRefreshLayout && this.swipeRefreshLayout.finishRefresh();
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
    if (this.state.theme) {
      return (
        <View></View>
      );
    } else {
      return (
        <Text style={styles.sectionHeader}>
          {this.getSectionTitle(sectionID)}
        </Text>
      );
    }
  },
  selectStory: function(story: Object) {
    story.read = true;
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
    this.fetchStories(this.state.theme, false);
  },
  onSelectTheme: function(theme) {
    // ToastAndroid.show('选择' + theme.name, ToastAndroid.SHORT);
    this.drawer.closeDrawer();
    this.setState({
      isLoading: this.state.isLoading,
      isLoadingTail: this.state.isLoadingTail,
      theme: theme,
      dataSource: this.state.dataSource,
    });
    this.fetchStories(theme, true);
  },
  _renderNavigationView: function() {
    return (
      <ThemesList
        onSelectItem={this.onSelectTheme}
      />
    );
  },
  onRefresh: function() {
    this.onSelectTheme(this.state.theme);
  },
  render: function() {
    var content = this.state.dataSource.getRowCount() === 0 ?
      <View style={styles.centerEmpty}>
        <Text>{this.state.isLoading ? '正在加载...' : '加载失败'}</Text>
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
    var title = this.state.theme ? this.state.theme.name : '首页';
      return (
        <DrawerLayoutAndroid
          ref={(drawer) => { this.drawer = drawer; }}
          drawerWidth={Dimensions.get('window').width - DRAWER_WIDTH_LEFT}
          keyboardDismissMode="on-drag"
          drawerPosition={DrawerLayoutAndroid.positions.Left}
          renderNavigationView={this._renderNavigationView}>
          <View style={styles.container}>
            <ToolbarAndroid
              navIcon={require('image!ic_menu_white')}
              title={title}
              titleColor="white"
              style={styles.toolbar}
              actions={toolbarActions}
              onIconClicked={() => this.drawer.openDrawer()}
              onActionSelected={this.onActionSelected} />
            <SwipeRefreshLayoutAndroid
              ref={(swipeRefreshLayout) => { this.swipeRefreshLayout = swipeRefreshLayout; }}
              onRefresh={this.onRefresh}>
              {content}
            </SwipeRefreshLayoutAndroid>
          </View>
        </DrawerLayoutAndroid>

      );
  }
});

var styles = StyleSheet.create({
  centerEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FAFAFA',
  },
  toolbar: {
    backgroundColor: '#00a2ed',
    height: 56,
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
