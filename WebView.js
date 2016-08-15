'use strict';

import React, { PropTypes, Component } from 'react';
import {
      View,
      requireNativeComponent,
} from 'react-native';

var ReactNativeViewAttributes = require('ReactNativeViewAttributes');

class ObservableWebView extends React.Component {
  constructor() {
    super();
    this._onChange = this._onChange.bind(this);
  }

  _onChange(event: Event) {
    if (!this.props.onScrollChange) {
      return;
    }
    this.props.onScrollChange(event.nativeEvent.ScrollY);
  }

  render() {
    return <RCTWebView {...this.props} onChange={this._onChange} />;
  }
}

ObservableWebView.propTypes = {
  ...View.propTypes,
  url: PropTypes.string,
  html: PropTypes.string,
  css: PropTypes.string,
  onScrollChange: PropTypes.func,
  javaScriptEnabled: React.PropTypes.bool,
  domStorageEnabled: React.PropTypes.bool,
  userAgent: React.PropTypes.string,
  mediaPlaybackRequiresUserAction: React.PropTypes.bool,
  source: PropTypes.oneOfType([
            PropTypes.shape({
                   uri: PropTypes.string,
                   method: PropTypes.oneOf(['GET', 'POST']),
                   headers: PropTypes.object,
                   body: PropTypes.string,
                   }),
            PropTypes.shape({
                   html: PropTypes.string,
                   baseUrl: PropTypes.string,
                   }),
            PropTypes.number,
  ]),
  injectedJavaScript: PropTypes.string,
  scalesPageToFit: PropTypes.bool,
};
//
// ObservableWebView.viewConfig = {
//   uiViewClassName: 'RCTWebView',
//   validAttributes: ReactNativeViewAttributes.RKView
// };

var RCTWebView = requireNativeComponent('RCTWebView', ObservableWebView, {
  nativeOnly: {onChange: true}
});

module.exports = ObservableWebView;
