'use strict';

var React = require('react-native');
var {
  AsyncStorage,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
} = React;

var Animated = require('Animated');

var REQUEST_URL = "http://news-at.zhihu.com/api/4/start-image/1080*1776";

var COVER_KEY = '@WelcomeScreen:cover';

var WINDOW_WIDTH = Dimensions.get('window').width;

var SplashScreen = React.createClass({
  fetchData: function() {
    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        //console.log(responseData);
        try {
          AsyncStorage.setItem(COVER_KEY, JSON.stringify(responseData));
        } catch (error) {
          console.error(error);
        }
      })
      .done();
  },
  async _loadInitialState() {
    try {
      var value = await AsyncStorage.getItem(COVER_KEY);
      var cover = JSON.parse(value);
      console.log('saved: ' + cover);
      if (value !== null){
        this.setState({cover: cover});
      }
    } catch (error) {
      console.error(error);
    }
  },
  getInitialState: function() {
    return {
      cover: null,
      bounceValue: new Animated.Value(1),
    };
  },
  componentDidMount: function() {
    this.fetchData();
    this._loadInitialState().done();
    this.state.bounceValue.setValue(1);
    Animated.timing(
      this.state.bounceValue,
      {
        toValue: 1.2,
        duration: 5000,
      }
    ).start();
  },
  render: function() {
    var img, text;
    if (this.state.cover) {
      img = {uri: this.state.cover.img};
      text = this.state.cover.text;
    } else {
      img = require('image!splash');
      text = '';
    }

    return(
      <View style={styles.container}>
        <Animated.Image
          source={img}
          style={{
            flex: 1,
            width: WINDOW_WIDTH,
            height: 1,
            transform: [
              {scale: this.state.bounceValue},
            ]
          }} />
        <Text style={styles.text}>
            {text}
        </Text>
        <Image style={styles.logo} source={require('image!splash_logo')} />
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  cover: {
    flex: 1,
    width: 200,
    height: 1,
  },
  logo: {
    resizeMode: 'contain',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 30,
    height: 54,
  },
  text: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
  }
});

module.exports = SplashScreen;
