// BarcodeModal.js
import React from 'react';
import ModalHeader from './ModalHeader';
import { BarCodeScanner } from 'expo-barcode-scanner';

export const BarcodeModal = ({ setModalVisible, handleBarCodeScanned }) => {

  return (
    <>
      <ModalHeader title="Scan Barcode" setModalVisible={setModalVisible} />

      <BarCodeScanner 
      onBarCodeScanned={handleBarCodeScanned} 
      style={{ height: 300, width: '100%', alignSelf: 'center' }}/>
    </>
  );
};

  