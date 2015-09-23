'use strict';

var React = require('react-native');
var {
  AppRegistry,
  PixelRatio,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  ToastAndroid,
} = React;

var SwitchAndroid = require('SwitchAndroid');
var ToolbarAndroid = require('ToolbarAndroid');

var API_STROY_EXTRA = 'http://news-at.zhihu.com/api/4/story-extra/';

var DetailToolbar = React.createClass({
  getInitialState: function() {
    return({
      isLoading: true,
      extra: null,
    });
  },
  componentDidMount: function() {
    this.fetchStroyExtra();
  },
  fetchStroyExtra: function() {
    fetch(API_STROY_EXTRA + this.props.story.id)
      .then((response) => response.json())
      .catch((error) => {
        this.setState({
          isLoading: false,
          extra: null,
        });
      })
      .then((responseData) => {
        this.setState({
          isLoading: false,
          extra: responseData,
        });
      })
      .done();
  },
  _onPressBackButton: function() {
    if (this.props.navigator) {
      this.props.navigator.pop();
    }
  },
  _onPressShareButton: function() {
    // TODO:
    ToastAndroid.show('分享', ToastAndroid.SHORT);
  },
  _onPressCollectButton: function() {
    // TODO:
    ToastAndroid.show('收藏', ToastAndroid.SHORT);
  },
  _onPressCommentButton: function() {
    // TODO:
    ToastAndroid.show('评论', ToastAndroid.SHORT);
  },
  _onPressPriseButton: function() {
    // TODO:
    ToastAndroid.show('赞', ToastAndroid.SHORT);
  },
  render: function() {
    return(
      <View {...this.props}>
        <View style={styles.actionsContainer}>
          <TouchableWithoutFeedback onPress={this._onPressBackButton}
            style={styles.actionItem}>
            <Image
              style={styles.backIcon}
              source={require('image!ic_back_white')}
              resizeMode='contain' />
          </TouchableWithoutFeedback>
          <View style={{flex: 1}} />
          <TouchableWithoutFeedback onPress={this._onPressShareButton}
            style={styles.actionItem}>
            <Image
              style={styles.actionIcon}
              source={require('image!ic_share_white')}
              resizeMode='contain' />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this._onPressCollectButton}
            style={styles.actionItem}>
            <Image
              style={styles.actionIcon}
              source={require('image!ic_collect_white')}
              resizeMode='contain' />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this._onPressCommentButton}
            style={styles.actionItem}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                style={styles.actionIconWithCount}
                source={require('image!ic_comment_white')}
                resizeMode='contain' />
              <Text style={styles.count}>
                {this.state.isLoading ? '...' : this.state.extra.comments}
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this._onPressPraiseButton}
            style={styles.actionItem}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 16}}>
              <Image
                style={styles.actionIconWithCount}
                source={require('image!ic_praise_white')}
                resizeMode='contain' />
              <Text style={styles.count}>
                {this.state.isLoading ? '...' : this.state.extra.popularity}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

      </View>
      // <ToolbarAndroid
      //   navIcon={require('image!ic_back_white')}
      //   onIconClicked={this.props.navigator.pop}
      //   titleColor="white"
      //   actions={[]} >
      // </ToolbarAndroid>
    );
  },

});

var styles = StyleSheet.create({
  actionsContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 32,
    height: 32,
    marginLeft: 16,
    marginRight: 16,
  },
  actionItem: {
    height: 56,
    alignItems: 'center',

  },
  actionIcon: {
    width: 32,
    height: 32,
    marginLeft: 5,
    marginRight: 5,
  },
  actionIconWithCount: {
    width: 32,
    height: 32,
    marginLeft: 5,
  },
  count: {
    fontSize: 16,
    color: 'white',
    marginRight: 5,
  },
});

module.exports = DetailToolbar;
