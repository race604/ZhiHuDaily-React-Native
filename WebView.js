'use strict';

var React = require('react-native');
var {
  requireNativeComponent,
  PropTypes
} = React;

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
  url: PropTypes.string,
  html: PropTypes.string,
  css: PropTypes.string,
  onScrollChange: PropTypes.func,
};

var RCTWebView = requireNativeComponent('RCTWebView', ObservableWebView, {
  nativeOnly: {onChange: true}
});

module.exports = ObservableWebView;
