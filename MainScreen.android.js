'use strict';

var React = require('react-native');
var {
  AsyncStorage,
  Image,
  StyleSheet,
  Text,
  View,
  DrawerLayoutAndroid,
  ToolbarAndroid,
  ToastAndroid,
  BackAndroid,
  TouchableOpacity,
  Dimensions,
} = React;

var Drawer = require('react-native-drawer');
var StoriesList = require('./StoriesList');
var ThemesList = require('./ThemesList');
var SwipeRefreshLayoutAndroid = require('./SwipeRereshLayout');

var DRAWER_REF = 'drawer';
var DRAWER_WIDTH_LEFT = 56;
var toolbarActions = [
  {title: '提醒', icon: require('image!ic_message_white'), show: 'always'},
  {title: '夜间模式', show: 'never'},
  {title: '设置选项', show: 'never'},
];

var MainScreen = React.createClass({
  getInitialState: function() {
    return ({
      theme: null,
    });
  },
  onSelectTheme: function(theme) {
    this.refs[DRAWER_REF].closeDrawer();
    this.setState({theme: theme});
  },
  _renderNavigationView: function() {
    return (
      <ThemesList
        onSelectItem={this.onSelectTheme}
      />
    );
  },
  onRefresh: function() {
    this.onSelectTheme(this.state.theme);
  },
  onRefreshFinish: function() {
    this.swipeRefreshLayout && this.swipeRefreshLayout.finishRefresh();
  },
  render: function() {
    var title = this.state.theme ? this.state.theme.name : '首页';
    return (
      <DrawerLayoutAndroid
        ref={DRAWER_REF}
        drawerWidth={Dimensions.get('window').width - DRAWER_WIDTH_LEFT}
        keyboardDismissMode="on-drag"
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={this._renderNavigationView}>
        <View style={styles.container}>
          <ToolbarAndroid
            navIcon={require('image!ic_menu_white')}
            title={title}
            titleColor="white"
            style={styles.toolbar}
            actions={toolbarActions}
            onIconClicked={() => this.refs[DRAWER_REF].openDrawer()}
            onActionSelected={this.onActionSelected} />
          <SwipeRefreshLayoutAndroid
            ref={(swipeRefreshLayout) => { this.swipeRefreshLayout = swipeRefreshLayout; }}
            onSwipeRefresh={this.onRefresh}>
            <StoriesList theme={this.state.theme} navigator={this.props.navigator}
              onRefreshFinish={this.onRefreshFinish}/>
          </SwipeRefreshLayoutAndroid>
        </View>
      </DrawerLayoutAndroid>

    );
  }

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FAFAFA',
  },
  toolbar: {
    backgroundColor: '#00a2ed',
    height: 56,
  },
});

module.exports = MainScreen;
