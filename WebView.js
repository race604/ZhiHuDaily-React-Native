'use strict';

var { requireNativeComponent, PropTypes } = require('react-native');

var iface = {
  name: 'WebView',
  propTypes: {
    url: PropTypes.string,
    html: PropTypes.string,
    css: PropTypes.string,
  },
};

module.exports = requireNativeComponent('RCTWebView', iface);
