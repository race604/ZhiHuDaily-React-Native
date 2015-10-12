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
  TouchableOpacity,
} = React

var StoryItem = require('./StoryItem');
var ThemesList = require('./ThemesList');
var DataRepository = require('./DataRepository');
var ViewPager = require('react-native-viewpager');
var StoryScreen = require('./StoryScreen');

var LOADING = {};
var WEEKDAY = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
var DRAWER_WIDTH_LEFT = 56;
var toolbarActions = [
  {title: '提醒', icon: require('image!ic_message_white'), show: 'always'},
  {title: '夜间模式', show: 'never'},
  {title: '设置选项', show: 'never'},
];

var repository = new DataRepository();

var dataCache = {
  dataForTheme: {},
  topDataForTheme: {},
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

var StoriesList = React.createClass({

  getInitialState: function() {
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    var headerDataSource = new ViewPager.DataSource({
      pageHasChanged: (p1, p2) => p1 !== p2,
    });

    return {
      isLoading: false,
      isLoadingTail: false,
      dataSource: dataSource,
      headerDataSource: headerDataSource,
    };
  },
  componentWillUnmount: function() {
    repository.saveStories(dataCache.dataForTheme, dataCache.topDataForTheme);
  },
  componentDidMount: function() {
    this.fetchStories(this.props.theme, true);
  },
  componentWillReceiveProps(nextProps) {
    this.fetchStories(nextProps.theme, true);
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
    var topData = dataCache.topDataForTheme[themeId];

    this.setState({
      isLoading: isRefresh,
      isLoadingTail: !isRefresh,
      dataSource: this.state.dataSource,
    });

    repository.fetchThemeStories(themeId, lastID)
      .then((responseData) => {
        var newLastID;
        var dataSouce;
        var headerDataSource = this.state.headerDataSource;
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
          if (responseData.topData) {
            topData = responseData.topData;
            headerDataSource = headerDataSource.cloneWithPages(topData.slice())
          }

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

          if (responseData.topData) {
            topData = responseData.topData;
          }

          dataBlob = newDataBlob;
          dataSouce = this.state.dataSource.cloneWithRows(newDataBlob);
        }
        dataCache.lastID[themeId] = newLastID;
        dataCache.dataForTheme[themeId] = dataBlob;
        dataCache.topDataForTheme[themeId] = topData;

        // console.log('lastID: ' + lastID);
        // console.log('newLastID: ' + newLastID);

        LOADING[themeId] = false;
        this.setState({
          isLoading: (isRefresh ? false : this.state.isLoading),
          isLoadingTail: (isRefresh ? this.state.isLoadingTail : false),
          dataSource: dataSouce,
          headerDataSource: headerDataSource,
        });

        isRefresh && this.props.onRefreshFinish && this.props.onRefreshFinish();
      })
      .catch((error) => {
        console.error(error);
        this.setState({
          isLoading: (isRefresh ? false : this.state.isLoading),
          isLoadingTail: (isRefresh ? this.state.isLoadingTail : false),
          dataSource: this.state.dataSource.cloneWithRows([]),
        });
        isRefresh && this.props.onRefreshFinish && this.props.onRefreshFinish();
      })
      .done();
  },
  _renderPage: function(
    story: Object,
    pageID: number | string,) {
    return (
      <TouchableOpacity style={{flex: 1}} onPress={() => {this.selectStory(story)}}>
        <Image
          source={{uri: story.image}}
          style={styles.headerItem} >
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}
              numberOfLines={2}>
              {story.title}
            </Text>
          </View>
        </Image>
      </TouchableOpacity>
    )
  },
  _renderHeader: function() {
    if (this.props.theme) {
      var themeId = this.props.theme ? this.props.theme.id : 0;
      var topData = dataCache.topDataForTheme[themeId];
      if (!topData) {
        return null;
      }

      var editorsAvator = [];
      if (topData.editors) {
        topData.editors.forEach((editor) => {
          editorsAvator.push(<Image style={styles.editorAvatar} source={{uri: editor.avatar}} />)
        });
      }

      return (
        <View style={{flex: 1}}>
          {this._renderPage({image: topData.background, title: topData.description}, 0)}
          <View style={styles.editors}>
            <Text style={styles.editorsLable}>主编:</Text>
            {editorsAvator}
          </View>
        </View>
      );
    } else {
      return (
        <View style={{flex: 1, height: 200}}>
          <ViewPager
            dataSource={this.state.headerDataSource}
            style={styles.listHeader}
            renderPage={this._renderPage}
            isLoop={true}
            autoPlay={true} />
        </View>
      );
    }
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
    if (this.props.theme) {
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
    // if (Platform.OS === 'ios') {
    //   this.props.navigator.push({
    //     title: story.title,
    //     component: StoryScreen,
    //     passProps: {story},
    //   });
    // } else {
      this.props.navigator.push({
        title: story.title,
        name: 'story',
        story: story,
      });
    // }
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
    this.fetchStories(this.props.theme, false);
  },
  setTheme: function(theme) {
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
  onRefresh: function() {
    this.onSelectTheme(this.props.theme);
  },
  render: function() {
    var content = this.state.dataSource.getRowCount() === 0 ?
      <View style={styles.centerEmpty}>
        <Text>{this.state.isLoading ? '正在加载...' : '加载失败'}</Text>
      </View> :
      <ListView
        ref="listview"
        style={styles.listview}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        onEndReached={this.onEndReached}
        renderSectionHeader={this.renderSectionHeader}
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps={true}
        showsVerticalScrollIndicator={false}
        renderHeader={this._renderHeader}
      />;
    return content;
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
  listview: {
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
  },
  headerPager: {
    height: 200,
  },
  headerItem: {
    flex: 1,
    height: 200,
    flexDirection: 'row',
  },
  headerTitleContainer: {
    flex: 1,
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    marginBottom: 10,
  },
  editors: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  editorsLable: {
    fontSize: 14,
    color: '#888888',
  },
  editorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#AAAAAA',
    margin: 4,
  }
});

module.exports = StoriesList;
