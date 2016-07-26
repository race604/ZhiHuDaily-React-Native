'use strict';
import React, { Component } from 'React';
import {
  Dimensions,
} from 'react-native';

export function getWindowWidth() {
  return Dimensions.get('window').width;
}
