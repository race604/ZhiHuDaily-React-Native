'use strict';

import React, { Component } from 'React';
import {
  AsyncStorage,
  Platform,
  Dimensions,
  ListView,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import {
  parseDateFromYYYYMMdd,
} from './FormatUtils';

import StoryItem from './StoryItem';
import ThemesList from './ThemesList';
import DataRepository from './DataRepository';
import ViewPager from 'react-native-viewpager';
import StoryScreen from './StoryScreen';

var LOADING = {};
var WEEKDAY = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

var repository = new DataRepository();

var dataCache = {
  dataForTheme: {},
  topDataForTheme: {},
  sectionsForTheme: {},
  lastID: {},
};

class StoriesList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
      }),
      headerDataSource: new ViewPager.DataSource({
        pageHasChanged: (p1, p2) => p1 !== p2,
      })
    }
    this.renderRow = this.renderRow.bind(this);
    this.renderSectionHeader = this.renderSectionHeader.bind(this);
    this.renderPage = this.renderPage.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.selectStory = this.selectStory.bind(this);
  }

  componentWillUnmount() {
    repository.saveStories(dataCache.dataForTheme, dataCache.topDataForTheme);
  }

  componentDidMount() {
    this.fetchStories(this.props.theme, true);
  }

  componentWillReceiveProps(nextProps) {
    this.fetchStories(nextProps.theme, true);
  }

  fetchStories(theme, isRefresh) {
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
  }

  renderPage(
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
  }

  renderHeader() {
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
          {this.renderPage({image: topData.background, title: topData.description}, 0)}
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
            renderPage={this.renderPage}
            isLoop={true}
            autoPlay={true} />
        </View>
      );
    }
  }

  getSectionTitle(str) {
    var date = parseDateFromYYYYMMdd(str);
    if (date.toDateString() == new Date().toDateString()) {
      return '今日热闻';
    }
    var title = str.slice(4, 6)  + '月' + str.slice(6, 8) + '日';
    title += ' ' + WEEKDAY[date.getDay()];
    return title;
  }

  renderSectionHeader(sectionData: Object,
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
  }

  selectStory(story: Object) {
    story.read = true;
      this.props.navigator.push({
        title: story.title,
        name: 'story',
        story: story,
      });
  }

  renderRow(
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
  }

  onEndReached() {
    console.log('onEndReached() ' + this.state.isLoadingTail);
    if (this.state.isLoadingTail) {
      return;
    }
    this.fetchStories(this.props.theme, false);
  }

  setTheme(theme) {
    this.drawer.closeDrawer();
    this.setState({
      isLoading: this.state.isLoading,
      isLoadingTail: this.state.isLoadingTail,
      theme: theme,
      dataSource: this.state.dataSource,
    });
    this.fetchStories(theme, true);
  }

  onRefresh() {
    this.onSelectTheme(this.props.theme);
  }

  render() {

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
        renderHeader={this.renderHeader}
      />;

    return content;
  }
}

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

export default StoriesList;
