/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');

var {
  AppRegistry,
  BackAndroid,
  Text,
  View,
  Navigator,
  StyleSheet,
  ToolbarAndroid,
  ToastAndroid,
} = React;

var ToolbarAndroid = require('ToolbarAndroid');

var TimerMixin = require('react-timer-mixin');

var SplashScreen = require('./SplashScreen');
var MainScreen = require('./MainScreen');
var StoryScreen = require('./StoryScreen');

var _navigator;
BackAndroid.addEventListener('hardwareBackPress', function() {
  if (_navigator && _navigator.getCurrentRoutes().length > 1) {
    _navigator.pop();
    return true;
  }
  return false;
});

var RCTZhiHuDaily = React.createClass({
  mixins: [TimerMixin],
  componentDidMount: function() {
    this.setTimeout(
      () => {
        this.setState({splashed: true});
      },
      2000,
    );
  },
  RouteMapper: function(route, navigationOperations, onComponentRef) {
    _navigator = navigationOperations;
    if (route.name === 'home') {
      return (
        <View style={styles.container}>
          <MainScreen navigator={navigationOperations}/>
        </View>
      );
    } else if (route.name === 'story') {
      return (
        <View style={styles.container}>
          <StoryScreen
            style={{flex: 1}}
            navigator={navigationOperations}
            story={route.story} />
        </View>
      );
    }
  },
  getInitialState: function() {
    return {
      splashed: false,
    };
  },
  onActionSelected: function(position) {
  },
  render: function() {
    if (this.state.splashed) {
      var initialRoute = {name: 'home'};
      return (
        <Navigator
          style={styles.container}
          initialRoute={initialRoute}
          configureScene={() => Navigator.SceneConfigs.FadeAndroid}
          renderScene={this.RouteMapper}
        />
      );
    } else {
      return (
        <SplashScreen />
      );
    }
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('RCTZhiHuDaily', () => RCTZhiHuDaily);
