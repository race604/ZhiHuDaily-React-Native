/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');

var {
  AppRegistry,
  BackAndroid,
  Dimensions,
  Text,
  View,
  Navigator,
  StyleSheet,
  ToolbarAndroid,
  DrawerLayoutAndroid,
  ToastAndroid,
} = React;

var ToolbarAndroid = require('ToolbarAndroid');

var TimerMixin = require('react-timer-mixin');

var WelcomeScreen = require('./WelcomeScreen');
var ListScreen = require('./ListScreen');
var StoryScreen = require('./StoryScreen');
var ThemesList = require('./ThemesList');
var DRAWER_WIDTH_LEFT = 56;

var _navigator;
BackAndroid.addEventListener('hardwareBackPress', function() {
  if (_navigator && _navigator.getCurrentRoutes().length > 1) {
    _navigator.pop();
    return true;
  }
  return false;
});

var RCTZhiHuDaily = React.createClass({
  // mixins: [TimerMixin],
  // componentDidMount: function() {
  //   this.setTimeout(
  //     () => {
  //       this.setState({splashed: true});
  //     },
  //     50
  //   );
  // },
  RouteMapper: function(route, navigationOperations, onComponentRef) {
    _navigator = navigationOperations;
    if (route.name === 'home') {
      return (
        <View style={styles.container}>
          <ToolbarAndroid
            navIcon={require('image!ic_menu_white')}
            title="知乎日报"
            titleColor="white"
            style={styles.toolbar}
            actions={toolbarActions}
            onIconClicked={() => this.drawer.openDrawer()}
            onActionSelected={this.onActionSelected} />
          <ListScreen navigator={navigationOperations}/>
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
  onSelectTheme: function(theme) {
    ToastAndroid.show('选择' + theme.name, ToastAndroid.SHORT);
  },
  _renderNavigationView: function() {
    return (
      <ThemesList
        onSelectItem={this.onSelectTheme}
      />
    );
  },
  render: function() {
    var initialRoute = {name: 'home'};
    var navigationView = ThemesList;
    return (
      <DrawerLayoutAndroid
        ref={(drawer) => { this.drawer = drawer; }}
        drawerWidth={Dimensions.get('window').width - DRAWER_WIDTH_LEFT}
        keyboardDismissMode="on-drag"
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={this._renderNavigationView}>
        <Navigator
          style={styles.container}
          initialRoute={initialRoute}
          configureScene={() => Navigator.SceneConfigs.FadeAndroid}
          renderScene={this.RouteMapper}
        />
      </DrawerLayoutAndroid>
    );
    // if (!this.state.splashed) {
    //   return (
    //     <WelcomeScreen />
    //   );
    // } else {
    //   return (
    //     <View style={styles.container}>
    //       <ToolbarAndroid
    //         navIcon={require('image!ic_menu_white')}
    //         title="知乎日报"
    //         titleColor="white"
    //         style={styles.toolbar}
    //         actions={toolbarActions}
    //         onActionSelected={this.onActionSelected} />
    //       <ListScreen />
    //     </View>
    //
    //   );
    // }
  }
});

var toolbarActions = [
  {title: '提醒', icon: require('image!ic_message_white'), show: 'always'},
  {title: '夜间模式', show: 'never'},
  {title: '设置选项', show: 'never'},
];

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
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
  toolbar: {
    backgroundColor: '#00a2ed',
    height: 56,
  },
});

AppRegistry.registerComponent('RCTZhiHuDaily', () => RCTZhiHuDaily);
