import React from 'react';
import { Image, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

import { Images } from '../config';
import { View } from './View';

export const Logo = ({ uri }) => {
  // uncomment to restore firebase flame logo
   return <Image source={uri} style={styles.image} />;

// animated coffee cup
// return  (
//   <View style={styles.container}>
//     <LottieView style={styles.coffeeLogo} source={require('../assets/coffee_anim.json')} autoPlay loop  />
//   </View>
//   )
};

const styles = StyleSheet.create({
  image: {
    width: 250,
    height: 250,
    marginTop: 20
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  coffeeLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
