'use strict';

var React = require('react-native');
var {
  AppRegistry,
  PixelRatio,
  StyleSheet,
  Text,
  View,
  Image,
  ToolbarAndroid,
  TouchableHighlight,
} = React;

var precomputeStyle = require('precomputeStyle');

var MyWebView = require('./WebView');
var DetailToolbar = require('./DetailToolbar');

var BASE_URL = 'http://news.at.zhihu.com/api/4/news/';
var REF_HEADER = 'header';
var PIXELRATIO = PixelRatio.get();

var StoryScreen = React.createClass({
  getInitialState: function() {
    return({
      isLoading: false,
      detail: null,
      scrollY: 0,
    });
  },
  componentDidMount: function() {
    this.fetchStroyDetail();
  },
  fetchStroyDetail: function() {
    var reqUrl = BASE_URL + this.props.story.id;
    this.setState({
      isLoading: true,
      detail: null,
    });
    fetch(reqUrl)
      .then((response) => response.json())
      .catch((error) => {
        this.setState({
          isLoading: false,
          detail: null,
        });
      })
      .then((responseData) => {
        this.setState({
          isLoading: false,
          detail: responseData,
        });
      })
      .done();
  },
  onWebViewScroll: function(event) {
    //console.log('ScrollY: ' + event);
    var scrollY = -event / PIXELRATIO;
    var nativeProps = precomputeStyle({transform: [{translateY: scrollY}]});
    this.refs[REF_HEADER].setNativeProps(nativeProps);
  },
  render: function() {
    var toolbar = <DetailToolbar navigator={this.props.navigator} style={styles.toolbar}
      story={this.props.story}/>;
    if (this.state.isLoading) {
      return (
        <View style={[styles.container, styles.center]}>
          <Text>
            正在加载...
          </Text>
          {toolbar}
        </View>
      );
    } else {
      if (this.state.detail) {
        // var headerStyle = {
        //   height: 200,
        //   flexDirection: 'row',
        //   transform: [{translateY: this.state.scrollY}],
        // };
        var toolbar
        return (
          <View style={styles.container}>
            <MyWebView
              style={styles.content}
              html={this.state.detail.body}
              css={this.state.detail.css[0]}
              onScrollChange={this.onWebViewScroll}/>
            <Image
              ref={REF_HEADER}
              source={{uri: this.state.detail.image}}
              style={styles.headerImage} >
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  {this.props.story.title}
                </Text>
              </View>
            </Image>
            {toolbar}
          </View>
        );
      } else {
        return (
          <View style={[styles.container, styles.center]}>
            <Text>
              加载失败
            </Text>
            {toolbar}
          </View>
        );
      }
    }

  }
});

var styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#00a2ed',
    height: 56,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  headerImage: {
    height: 200,
    flexDirection: 'row',
    backgroundColor: '#DDDDDD',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 56,
  },
  titleContainer: {
    flex: 1,
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top:56,
  },
});

module.exports = StoryScreen;
