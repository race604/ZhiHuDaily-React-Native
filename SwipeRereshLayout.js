'use strict';

import React, { Component } from 'React';
import {
  requireNativeComponent,
  PropTypes,
  StyleSheet,
  View,
} from 'react-native';

import createReactNativeComponentClass from 'createReactNativeComponentClass';
import ReactNativeViewAttributes from 'ReactNativeViewAttributes';
import RCTUIManager from 'NativeModules';

var RK_SWIPE_REF = 'swiperefreshlayout';
var INNERVIEW_REF = 'innerView';

class SwipeRefreshLayoutAndroid extends Component {

  getInnerViewNode() {
    return this.refs[INNERVIEW_REF].getInnerViewNode();
  }

  render() {
    var childrenWrapper =
      <View ref={INNERVIEW_REF} style={styles.mainSubview} collapsable={false}>
        {this.props.children}
      </View>;
    return (
      <AndroidSwipeRefreshLayout
        {...this.props}
        ref={RK_SWIPE_REF}
        style={styles.base}
        onRefresh={this._onRefresh}>
        {childrenWrapper}
      </AndroidSwipeRefreshLayout>
    );
  }

  _onRefresh() {
    if (this.props.onRefresh) {
      this.props.onRefresh();
    }
  }

  startRefresh() {
    RCTUIManager.dispatchViewManagerCommand(
      this._getSwipeRefreshLayoutHandle(),
      RCTUIManager.AndroidSwipeRefreshLayout.Commands.startRefresh,
      null
    );
  }

  finishRefresh() {
    RCTUIManager.dispatchViewManagerCommand(
      this._getSwipeRefreshLayoutHandle(),
      RCTUIManager.AndroidSwipeRefreshLayout.Commands.finishRefresh,
      null
    );
  }

  _getSwipeRefreshLayoutHandle() {
    return React.findNodeHandle(this.refs[RK_SWIPE_REF]);
  }
}

var styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  mainSubview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

var AndroidSwipeRefreshLayout = createReactNativeComponentClass({
  validAttributes: ReactNativeViewAttributes.UIView,
  uiViewClassName: 'AndroidSwipeRefreshLayout',
});

SwipeRefreshLayoutAndroid.propTypes = {
  ...View.propTypes,
  onRefresh: PropTypes.func,
};

export default SwipeRefreshLayoutAndroid;
