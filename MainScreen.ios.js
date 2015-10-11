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
  onSelectTheme: function(theme) {
    // this.drawer.closeDrawer();
    // this.setState({
    //   isLoading: this.state.isLoading,
    //   isLoadingTail: this.state.isLoadingTail,
    //   theme: theme,
    //   dataSource: this.state.dataSource,
    // });
    // this.fetchStories(theme, true);
  },
  render: function() {
    var drawer = <ThemesList onSelectItem={this.onSelectTheme} />;
    return (
        <Drawer
          ref={DRAWER_REF}
          openDrawerOffset={100}
          panCloseMask={1}
          content={drawer} >
          <StoriesList navigator={this.props.navigator}/>
        </Drawer>
      );
  }

});

module.exports = MainScreen;
