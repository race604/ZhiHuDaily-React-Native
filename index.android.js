/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import React, { Component } from 'React';
import {
  AppRegistry,
  BackAndroid,
  Text,
  View,
  Navigator,
  StyleSheet,
  ToastAndroid,
  InteractionManager,
} from 'react-native';

import ToolbarAndroid from 'ToolbarAndroid';
import SplashScreen from './SplashScreen';
import MainScreen from './MainScreen';
import StoryScreen from './StoryScreen';
import TimerMixin from 'react-timer-mixin';

var _navigator;
BackAndroid.addEventListener('hardwareBackPress', function() {
  if (_navigator && _navigator.getCurrentRoutes().length > 1) {
    _navigator.pop();
    return true;
  }
  return false;
});

class RCTZhiHuDaily extends Component {

  constructor(props){
    super(props);
    this.state = {
      splashed:false
    }
  }
  componentDidMount() {
    this.timer = setTimeout(
      () => {
        this.setState({splashed: true});
      },
      2000,
    );
  }

  RouteMapper(route, navigationOperations, onComponentRef) {
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
  }

  onActionSelected(position) {
  }

  render() {
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
}

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
