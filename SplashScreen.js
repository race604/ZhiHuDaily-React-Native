'use strict';

import React, { Component } from 'React';
import {
  AsyncStorage,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getWindowWidth,
} from './CommonUtils';

import Animated from 'Animated';
import DataRepository from './DataRepository';

class SplashScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cover: null,
      bounceValue: new Animated.Value(1),
    }
  }

  fetchData() {
    new DataRepository()
      .getCover()
      .then((result) => {
        if (result){
          this.setState({
            cover: result
          });
          Animated.timing(
            this.state.bounceValue,
            {
              toValue: 1.5,
              duration: 3000,
            }
          ).start();
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .done();
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    var img, text;
    if (this.state.cover) {
      img = {uri: this.state.cover.img};
      text = this.state.cover.text;
    } else {
      img = require('image!splash');
      text = '';
    }

    return(
      <View style={styles.container}>
        <Animated.Image
          source={img}
          style={{
            flex: 1,
            width: getWindowWidth(),
            height: 1,
            transform: [
              {
                scale: this.state.bounceValue
              },
            ]
          }} />

        <View style = {styles.bottomContainer}>
          <Image style={styles.logo} source={require('image!splash_logo')} />
          <Text style={styles.text}> {text} </Text>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomContainer: {
    position:'absolute',
    bottom:20,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logo: {
    resizeMode: 'contain',
    height:60,
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    alignSelf:'center',
    color: 'white',
    backgroundColor: 'transparent',
  }
});

export default SplashScreen;
