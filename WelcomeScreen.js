'use strict';

var React = require('react-native');
var {
  AsyncStorage,
  Image,
  StyleSheet,
  Text,
  View,
} = React;

var REQUEST_URL = "http://news-at.zhihu.com/api/4/start-image/1080*1776";

var COVER_KEY = '@WelcomeScreen:cover';

var WelcomeScreen = React.createClass({
  fetchData: function() {
    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        //console.log(responseData);
        this.setState({cover: responseData});
        //this._onCoverLoaded(responseData);
      })
      .done();
  },
  async _onCoverLoaded(value) {
    try {
      await AsyncStorage.setItem(COVER_KEY, value);
    } catch (error) {
      console.log(error);
    }
  },
  componentDidMount: function() {
    this.fetchData();
    //this._loadInitialState().done();
  },
  async _loadInitialState() {
    try {
      var value = await AsyncStorage.getItem(COVER_KEY);
      if (value !== null){
        this.setState({cover: value});
      }
    } catch (error) {
    }
  },
  getInitialState: function() {
    return {
      cover: null,
    };
  },
  renderEmpty: function() {
    return(
      <View style={styles.container}>
        <Text style={styles.title}>
          知乎日报
        </Text>
      </View>
    );
  },
  render: function() {
    if (!this.state.cover) {
      return this.renderEmpty();
    }

    return(
      <Image
        source={{uri: this.state.cover.img}}
        style={styles.cover}>
        <Text style={styles.text}>
            {this.state.cover.text}
        </Text>
      </Image>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  cover: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
  },
  text: {
    flex: 1,
    fontSize: 16,
    alignSelf: 'flex-end',
    textAlign: 'center',
    marginBottom: 10,
  }
});

module.exports = WelcomeScreen;
