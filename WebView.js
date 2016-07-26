'use strict';

import React, { Component } from 'React';
import {
  View,
  requireNativeComponent,
  PropTypes
} from 'react-native';

import ReactNativeViewAttributes from 'ReactNativeViewAttributes';

var RCTWebView = requireNativeComponent('RCTWebView', ObservableWebView, {
  nativeOnly: {onChange: true}
});

class ObservableWebView extends Component {

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: Event) {
    if (!this.props.onScrollChange) {
      return;
    }
    this.props.onScrollChange(event.nativeEvent.ScrollY);
  }

  render() {
    return <RCTWebView {...this.props} onChange={this.onChange} />;
  }
}

ObservableWebView.propTypes = {
  ...View.propTypes,
  url: PropTypes.string,
  html: PropTypes.string,
  css: PropTypes.string,
  onScrollChange: PropTypes.func,
};

export default ObservableWebView;
