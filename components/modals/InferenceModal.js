// InferenceModal.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '../../components';
import ModalHeader from './ModalHeader';
import { Camera } from 'expo-camera';
import LottieView from 'lottie-react-native';
import { Colors } from '../../config';

import axios from 'axios';
import { db } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';


export const InferenceModal = ({ setModalVisible, cameraRef, coffeeData, takePicture }) => {
  
  const [containerWidth, setContainerWidth] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [displayText, setDisplayText] = useState('');

  const [loading, setLoading] = useState(false);

  // Function to map class name to the actual name in Firebase
  const getActualName = (className, coffeeData) => {
    const actualName = coffeeData[className]?.name || className;
    return actualName;
  };

  // Converting coffeeData array to an object
const convertCoffeeArrayToObject = (coffeeDataArray) => {
  const coffeeObject = {};
  coffeeDataArray.forEach((coffee) => {
    coffeeObject[coffee.id] = coffee;
  });
  return coffeeObject;
};

const processPredictions = (predictions, coffeeDataArray) => {
  if (!predictions || predictions.length === 0) return;

  const coffeeData = convertCoffeeArrayToObject(coffeeDataArray);

  const topPrediction = predictions[0];
  const actualName = getActualName(topPrediction.class, coffeeData);

  // Triggering the subtract function
  subtractOneFromInventory(topPrediction.class, coffeeData);
};


  const getInference = async (base64Image) => {
    setLoading(true);

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
      console.log('PREDICTION:', response.data);
      const predictionsArray = response.data.predictions;

      // Process your predictions
      //processPredictions(predictionsArray);

      if (coffeeData) {  // Check if coffeeData exists
        // Process your predictions
        processPredictions(predictionsArray, coffeeData);  // Pass coffeeData
      } else {
        console.log('coffeeData is undefined.');
      }

      let tempDisplayText = '';

      predictionsArray.forEach((prediction) => {
        const confidence = Math.round(prediction.confidence * 100);
        const className = getActualName(prediction.class, coffeeData);
        tempDisplayText += `${confidence}% | ${className}, `;
      });

      // Remove the trailing comma and space
      tempDisplayText = tempDisplayText.slice(0, -2);

      // Update the state
      setDisplayText(tempDisplayText);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
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

  const subtractOneFromInventory = async (classId, coffeeData) => {
    const actualName = getActualName(classId, coffeeData);
  
    Alert.alert(
      'Inventory Update',
      `Subtract 1 from ${actualName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            console.log('Debug - classId:', classId);
            console.log('Debug - coffeeData:', JSON.stringify(coffeeData));
            
            const foundCoffee = coffeeData[classId];
            if (foundCoffee) {
              console.log('Debug - foundCoffee:', foundCoffee);
              console.log('Debug - foundCoffee.count:', foundCoffee.count);
              const newCount = foundCoffee.count - 1;
              console.log('Debug - newCount:', newCount);
  
              // Import and usage changed here:
              const docRef = doc(db, 'original', classId);
              await setDoc(docRef, { count: newCount }, { merge: true });

              
              //alert('Inventory updated!');
              setModalVisible(false);
            } else {
              alert('Coffee type not found!');
            }
          },
        },
      ],
      { cancelable: true }
    );
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
        {/* ../../assets/loading.json == Googley dots dancing */}
        {loading && <LottieView source={require('../../assets/coffee_anim.json')} autoPlay loop 
          style={{
            position: 'absolute',
            top: 30, 
            left: 100, 
            transform: [
              {translateX: -75}, 
              {translateY: -75}  
            ],
            width: 150,  
            height: 150, 
          }}
        />}
        </View>

        <View style={{ flex: 1, marginTop: 100,  width: '100%', padding: 16 }}>
        { displayText ? 
          <View style={styles.predictionView}>
            <Text style={styles.predictionText}>
              {displayText}
            </Text>
          </View>
          :
          <View style={styles.predictionView}>
            <Text style={styles.predictionText}>
              No prediction yet...
            </Text>
          </View>
        }      
    

          <Button title="Take Picture" onPress={modifiedTakePicture} style={styles.button}>
            <Text style={styles.buttonText}>Take Picture</Text>
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
  },
  predictionView: {
     width: '100%', 
     height: 200, 
     alignItems: 'center', 
     justifyContent: 'center',
     borderWidth: 0,
     borderColor: Colors.coffee,
  },
  predictionText: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    lineHeight: 40,
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    borderColor: Colors.coffee,
    borderWidth: 0,
  }
});