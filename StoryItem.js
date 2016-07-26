'use strict';

import React, { Component } from 'React';

import {
  Image,
  PixelRatio,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  View,
} from 'react-native';

var TITLE_REF = 'title';

class StoryItem extends Component {

  constructor(props){
    super(props);
    this.updateReadSate = this.updateReadSate.bind(this);
  }
  updateReadSate() {
    this.refs[TITLE_REF].setNativeProps({style: {color: '#777777'}});
    this.props.onSelect();
  }

  render() {
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
      TouchableElement = TouchableNativeFeedback;
    }
    var image = null;
    if (this.props.story.images && this.props.story.images[0]) {
      image = <Image
        source={{uri: this.props.story.images[0]}}
        style={styles.cellImage} />
    }

    return (
        <TouchableElement
          onPress={this.updateReadSate}
          onShowUnderlay={this.props.onHighlight}
          onHideUnderlay={this.props.onUnhighlight}>
          <View style={styles.row}>
            <Text
              ref={TITLE_REF}
              style={this.props.story.read ? styles.storyTitleRead : styles.storyTitle}
              numberOfLines={3}>
                {this.props.story.title}
            </Text>
            {image}
          </View>
        </TouchableElement>
    );
  }
}

var styles = StyleSheet.create({
  storyTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  storyTitleRead: {
    flex: 1,
    fontSize: 16,
    color: '#777777',
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

export default StoryItem;
