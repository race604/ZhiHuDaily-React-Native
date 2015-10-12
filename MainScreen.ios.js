'use strict';

var React = require('react-native');
var {
  AsyncStorage,
  Image,
  StyleSheet,
  Text,
  View,
} = React;

var Drawer = require('react-native-drawer');
var StoriesList = require('./StoriesList');
var ThemesList = require('./ThemesList');

var DRAWER_REF = 'drawer';

var MainScreen = React.createClass({
  getInitialState: function() {
    return ({
      theme: null,
    });
  },
  onSelectTheme: function(theme) {
    this.refs[DRAWER_REF].close();
    this.setState({theme: theme});
  },
  onRefresh: function() {
    this.onSelectTheme(this.state.theme);
  },
  render: function() {
    var drawer = <ThemesList onSelectItem={this.onSelectTheme} />;
    return (
        <Drawer
          ref={DRAWER_REF}
          openDrawerOffset={100}
          panCloseMask={1}
          content={drawer} >
          <StoriesList theme={this.state.theme} navigator={this.props.navigator}/>
        </Drawer>
      );
  }

});

module.exports = MainScreen;
