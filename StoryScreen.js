'use strict';

import React, { Component } from 'React';
import {
  AppRegistry,
  PixelRatio,
  StyleSheet,
  Text,
  View,
  Image,
  ToolbarAndroid,
  TouchableHighlight,
  Animated,
  Platform,
  WebView,
} from 'react-native';

import DetailToolbar from './DetailToolbar';
import ObservableWebView from './WebView';

var BASE_URL = 'http://news.at.zhihu.com/api/4/news/';
var REF_HEADER = 'header';
var PIXELRATIO = PixelRatio.get();
var HEADER_SIZE = 200;

class StoryScreen extends Component {

  constructor(props){
    super(props);
    this.state = {
      isLoading: false,
      detail: null,
      scrollY: 0,
      scrollValue: new Animated.Value(0),
    }

    this.onWebViewScroll = this.onWebViewScroll.bind(this);
  }

  componentDidMount() {
    this.fetchStroyDetail();
  }

  fetchStroyDetail() {
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
  }

  onWebViewScroll(event) {
    var scrollY = -event / PIXELRATIO;
    this.state.scrollValue.setValue(scrollY);
  }

  render() {
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
        var translateY = this.state.scrollValue.interpolate({
          inputRange: [0, HEADER_SIZE, HEADER_SIZE + 1], outputRange: [0, HEADER_SIZE, HEADER_SIZE]
        });
        var html = '<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="'
          + this.state.detail.css[0]
          + '" /></head><body>' + this.state.detail.body
          + '</body></html>';
        return (
          <View style={styles.container}>
            <ObservableWebView
              style={styles.content}
              html={html}
              onScrollChange={this.onWebViewScroll}/>
            <Animated.View style={[styles.header, {transform: [{translateY}]}]}>
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
            </Animated.View>
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
}

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
  header: {
    height: HEADER_SIZE,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 56,
  },
  headerImage: {
    height: HEADER_SIZE,
    flexDirection: 'row',
    backgroundColor: '#DDDDDD',
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

export default StoryScreen;
