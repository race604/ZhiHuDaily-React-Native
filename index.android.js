/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var TimerMixin = require('react-timer-mixin');

var WelcomeScreen = require('./WelcomeScreen');
var ListScreen = require('./ListScreen');

var RCTZhiHuDaily = React.createClass({
  mixins: [TimerMixin],
  componentDidMount: function() {
    this.setTimeout(
      () => {
        this.setState({splashed: true});
      },
      2000
    );
  },
  getInitialState: function() {
    return {
      splashed: false,
    };
  },
  render: function() {
    if (!this.state.splashed) {
      return (
        <WelcomeScreen />
      );
    } else {
      return (
        <ListScreen />
      );
    }
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('RCTZhiHuDaily', () => RCTZhiHuDaily);
