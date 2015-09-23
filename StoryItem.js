'use strict';

var React = require('react-native');

var {
  Image,
  PixelRatio,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  View
} = React;

var StoryItem = React.createClass({
  render: function() {
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
      TouchableElement = TouchableNativeFeedback;
    }
    return (
      <View {...this.props}>
        <TouchableElement
          onPress={this.props.onSelect}
          onShowUnderlay={this.props.onHighlight}
          onHideUnderlay={this.props.onUnhighlight}>
          <View style={styles.row}>
            {/* $FlowIssue #7363964 - There's a bug in Flow where you cannot
              * omit a property or set it to undefined if it's inside a shape,
              * even if it isn't required */}
            <Text style={styles.storyTitle} numberOfLines={3}>
                {this.props.story.title}
            </Text>
            <Image
              source={{uri: ((this.props.story.images && this.props.story.images[0])
                ? this.props.story.images[0] : '')}}
              style={styles.cellImage} />
          </View>
        </TouchableElement>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  storyTitle: {
    flex: 1,
    fontSize: 16,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    marginVertical: 5,
    borderColor: '#dddddd',
    borderStyle: null,
    borderWidth: 0.5,
    borderRadius: 2,
  },
  cellImage: {
    backgroundColor: '#dddddd',
    height: 60,
    marginLeft: 10,
    width: 80,
  },
});

module.exports = StoryItem;
