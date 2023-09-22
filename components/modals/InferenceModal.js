// InferenceModal.js
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components';
import ModalHeader from './ModalHeader';
import { Camera } from 'expo-camera';
import LottieView from 'lottie-react-native';
import { Colors } from '../../config';

import axios from 'axios';

export const InferenceModal = ({ setModalVisible, cameraRef, takePicture }) => {
  
  const [containerWidth, setContainerWidth] = useState(0);
  const [prediction, setPrediction] = useState(null);

  const getInference = async (base64Image) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://detect.roboflow.com/nespresso_capsules/2',
        params: {
          api_key: '3wQRrZxbeul5IzxT9DEj',
        },
        data: base64Image,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      setPrediction(response.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  const modifiedTakePicture = async () => {
    console.log('Modified Take Picture called...');
    if (cameraRef) {
      console.log('Camera Ref:', cameraRef);
      const photo = await cameraRef.takePictureAsync({ base64: true });
      // console.log('Photo:', photo);
      getInference(photo.base64);
    }
  };

  return (
     <>
      <ModalHeader title="Coffee Detection" setModalVisible={setModalVisible} />

      <Camera 
        style={{height: 300, width: '100%', alignSelf: 'center'}}
        // ref={(ref) => {
        //   cameraRef.current = ref;
        // }}
        ref={(ref) => cameraRef = ref} // directly assign the ref here
      />

    <View 
      style={{flex: 1, backgroundColor: Colors.cream,}} 
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      <View style={{ position: 'absolute', top: 0, width: '100%', padding: 16 }}>
        <LottieView source={require('../../assets/loading.json')} autoPlay loop 
          style={{
            position: 'absolute',
            top: 30, // adjust this as needed
            left: 100, // adjust this as needed
            transform: [
              {translateX: -75}, // half of your LottieView's width
              {translateY: -75}  // half of your LottieView's height
            ],
            width: 150,  // adjust this as needed
            height: 150, // adjust this as needed
          }}
        />
        </View>

        <View style={{ flex: 1, marginTop: 100,  width: '100%', padding: 16 }}>
          <Button title="Take Picture" onPress={modifiedTakePicture} style={styles.button}>
            <Text style={styles.buttonText}>Take Picture</Text>
            {prediction && <Text>{JSON.stringify(prediction)}</Text>}
          </Button>
        </View>
        
      </View>
    
    </>
  );
};

const styles = StyleSheet.create({
  loadingIndicator: {
    width: 150,
    height: 150,
  },
  button: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: Colors.coffee,
    padding: 10,
    borderRadius: 8
  },
  buttonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700'
  },
  borderlessButtonContainer: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center'
  }
});