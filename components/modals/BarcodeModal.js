// BarcodeModal.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../config';
import ModalHeader from './ModalHeader';
import { BarCodeScanner } from 'expo-barcode-scanner';

export const BarcodeModal = ({ setModalVisible, handleBarCodeScanned }) => {

  return (
    <>
      <ModalHeader title="Scan Barcode" setModalVisible={setModalVisible} />

      <BarCodeScanner 
      onBarCodeScanned={handleBarCodeScanned} 
      style={{ height: 300, width: '100%', alignSelf: 'center' }}/>
      <View 
      style={{
        flex: 1, 
        backgroundColor: Colors.cream,
        justifyContent: 'center',
        alignItems: 'center',
      }}>

        <Text style={{ width: '80%', marginTop: -40, fontSize: 20, textAlign: 'center', color: Colors.coffee, fontWeight: '700' }}>
          URL to BarCodes online
        </Text>

      </View>
    </>
  );
};

  