'use strict';

import React, { Component } from 'React';
import {
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
} from 'react-native';

import Drawer from 'react-native-drawer';
import StoriesList from './StoriesList';
import ThemesList from './ThemesList';
import SwipeRefreshLayoutAndroid from './SwipeRereshLayout';

var DRAWER_REF = 'drawer';
var DRAWER_WIDTH_LEFT = 56;
var toolbarActions = [
  {title: '提醒', icon: require('image!ic_message_white'), show: 'always'},
  {title: '夜间模式', show: 'never'},
  {title: '设置选项', show: 'never'},
];

class MainScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      theme: null
    };

    this.onSelectTheme = this.onSelectTheme.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this._renderNavigationView = this._renderNavigationView.bind(this);
  }

  onSelectTheme(theme) {
    this.refs[DRAWER_REF].closeDrawer();
    this.setState({theme: theme});
  }

  _renderNavigationView() {
    return (
      <ThemesList
        onSelectItem={this.onSelectTheme}
      />
    );
  }

  onRefresh() {
    this.onSelectTheme(this.state.theme);
  }

  onRefreshFinish() {
    this.swipeRefreshLayout && this.swipeRefreshLayout.finishRefresh();
  }

  render() {
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
}

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

export default MainScreen;
