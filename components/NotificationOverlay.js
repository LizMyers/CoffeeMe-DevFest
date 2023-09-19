// NotificationOverlay.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationOverlay = ({ message }) => {
  return (
    <View style={styles.overlay}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: '#fff',
  },
});

export default NotificationOverlay;
