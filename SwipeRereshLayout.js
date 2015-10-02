'use strict';

var React = require('react-native');
var {
  requireNativeComponent,
  PropTypes,
  StyleSheet,
  View,
} = React;

var createReactNativeComponentClass = require('createReactNativeComponentClass');
var ReactNativeViewAttributes = require('ReactNativeViewAttributes');
var RCTUIManager = require('NativeModules').UIManager;

var NativeMethodsMixin = require('NativeMethodsMixin');

var RK_SWIPE_REF = 'swiperefreshlayout';
var INNERVIEW_REF = 'innerView';

var SwipeRefreshLayoutAndroid = React.createClass({
  propTypes: {
    onRefresh: PropTypes.func,
  },

  mixins: [NativeMethodsMixin],

  getInnerViewNode: function() {
    return this.refs[INNERVIEW_REF].getInnerViewNode();
  },

  render: function() {
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
  },

  _onRefresh: function() {
    if (this.props.onRefresh) {
      this.props.onRefresh();
    }
  },

  startRefresh: function() {
    RCTUIManager.dispatchViewManagerCommand(
      this._getSwipeRefreshLayoutHandle(),
      RCTUIManager.AndroidSwipeRefreshLayout.Commands.startRefresh,
      null
    );
  },

  finishRefresh: function() {
    RCTUIManager.dispatchViewManagerCommand(
      this._getSwipeRefreshLayoutHandle(),
      RCTUIManager.AndroidSwipeRefreshLayout.Commands.finishRefresh,
      null
    );
  },

  _getSwipeRefreshLayoutHandle: function() {
    return React.findNodeHandle(this.refs[RK_SWIPE_REF]);
  },
});

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

module.exports = SwipeRefreshLayoutAndroid;
