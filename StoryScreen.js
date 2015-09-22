'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
} = React;

var WebView = require('./WebView');

var BASE_URL = 'http://news.at.zhihu.com/api/4/news/';

var StoryScreen = React.createClass({
  getInitialState: function() {
    return({
      isLoading: false,
      detail: null,
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
  render: function() {
    var url = BASE_URL + this.props.story.id;
    if (this.state.isLoading) {
      return (
        <View style={[styles.container, styles.center]}>
          <Text>
            正在加载...
          </Text>
        </View>
      );
    } else {
      if (this.state.detail) {
        return (
          <View style={styles.container}>    
            <WebView
              style={styles.content}
              html={this.state.detail.body}
              css={this.state.detail.css[0]}/>
            <Image
              source={{uri: this.state.detail.image}}
              style={styles.headerImage} >
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  {this.props.story.title}
                </Text>
              </View>
            </Image>
          </View>
        );
      } else {
        return (
          <View style={[styles.container, styles.center]}>
            <Text>
              加载失败
            </Text>
          </View>
        );
      }
    }

  }
});

var styles = StyleSheet.create({
  headerImage: {
    height: 200,
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
    top:0,
  },
});

module.exports = StoryScreen;
