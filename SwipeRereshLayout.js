'use strict';

import React, { PropTypes, Component } from 'react';
import ReactNative, {
    requireNativeComponent,
    StyleSheet,
    Text,
    View,
} from 'react-native';

var ColorPropType = require('ColorPropType');
var createReactNativeComponentClass = requireNativeComponent('createReactNativeComponentClass');
var ReactNativeViewAttributes = require('ReactNativeViewAttributes');
var RCTUIManager = require('NativeModules').UIManager;

var NativeMethodsMixin = requireNativeComponent('NativeMethodsMixin');
var SwipeRefreshLayout =  require('UIManager').AndroidSwipeRefreshLayout;
var RK_SWIPE_REF = 'swiperefreshlayout';
var INNERVIEW_REF = 'innerView';

class SwipeRefreshLayoutAndroid extends Component {
  constructor(props) {
    super(props);
    this._onRefresh = this._onRefresh.bind(this);
  }
  mixins: [NativeMethodsMixin]

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
      1, //TODO, startRefresh is not defined. RCTUIManager.AndroidSwipeRefreshLayout.Commands.startRefresh,
      null
    );
  }

  finishRefresh() {
    RCTUIManager.dispatchViewManagerCommand(
      this._getSwipeRefreshLayoutHandle(),
      2,//TODO: finishRefresh is not defined. RCTUIManager.AndroidSwipeRefreshLayout.Commands.finishRefresh,
      null
    );
  }

  _getSwipeRefreshLayoutHandle() {
    return ReactNative.findNodeHandle(this.refs[RK_SWIPE_REF]);
  }
}

SwipeRefreshLayoutAndroid.propTypes = {
    onRefresh: PropTypes.func,
    testID: PropTypes.string,
    accessibilityComponentType: PropTypes.string,
    accessibilityLabel: PropTypes.string,
    progressViewOffset: PropTypes.number,
    progressBackgroundColor: ColorPropType,
    enabled: PropTypes.bool,
    colors: React.PropTypes.arrayOf(ColorPropType),
    size: React.PropTypes.oneOf([SwipeRefreshLayout.DEFAULT, SwipeRefreshLayout.LARGE]),
    accessibilityLiveRegion: PropTypes.string,
    renderToHardwareTextureAndroid: PropTypes.bool,
    refreshing: PropTypes.bool,
    importantForAccessibility: PropTypes.string,
    onLayout: PropTypes.bool,
    };

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

/*var AndroidSwipeRefreshLayout = createReactNativeComponentClass({
  validAttributes: ReactNativeViewAttributes.UIView,
  uiViewClassName: 'AndroidSwipeRefreshLayout',
});*/
var AndroidSwipeRefreshLayout = requireNativeComponent('AndroidSwipeRefreshLayout', SwipeRefreshLayoutAndroid, {nativeOnly:{onRefresh:true}});

module.exports = SwipeRefreshLayoutAndroid;
