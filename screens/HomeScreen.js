import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Button, Text, FlatList, TouchableOpacity, Image, Modal, Alert } from 'react-native';
//firestore
import { signOut, getAuth } from 'firebase/auth';
import { query, where, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';  // Make sure 'db' is correctly exported from your config
import { collection, onSnapshot} from 'firebase/firestore';

import imageLookup from '../utils/imageLookup';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { set } from 'lodash';

export const HomeScreen = ({navigation}) => {
  const [coffeeData, setCoffeeData] = useState([]);
  const auth = getAuth();  // Initialize auth

  const [hasPermission, setHasPermission] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleLogout = () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };

  useEffect(() => {
    let unsubscribe;
  
    try {
      const coffeeCollection = collection(db, 'original');
  
      unsubscribe = onSnapshot(coffeeCollection,
        (snapshot) => {
          //console.log('Received snapshot: ', snapshot);
          const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const inStockCoffee = allData.filter(item => item.count >= 1);
          setCoffeeData(inStockCoffee);
        },
        (error) => {
          console.log('Error in snapshot listener: ', error);
        }
      );
  
    } catch (error) {
      console.log('Error setting up snapshot: ', error);
    }
  
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  
  //handle barcode scanning
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={{ marginLeft: 20 }}>
          <Feather
            name="coffee"
            size={32}
            color="#F5E7D9"
            onPress={() => {
              setIsCameraMode(true);
              setModalVisible(true);
            }}
          />
        </View>
      ),
      headerRight: () => (
        <View style={{ marginRight: 20 }}>
          <Ionicons
            name="barcode-sharp"
            size={32}
            color="#F5E7D9"
            onPress={() => {
              setIsCameraMode(false);
              setModalVisible(true);
              setScanned(false);
            }}
          />
        </View>
      ),
      setOptions: { title: 'CoffeeMe' },
    });
  }, [navigation]);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setModalVisible(false);
    await updateCoffeeCount(data);  
    //alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const updateCoffeeCount = async (barcode) => {
    const coffeeCollection = collection(db, 'original');
    const q = query(coffeeCollection, where("barcode", "==", barcode));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      const currentCount = docData.data().count;
      const updatedCount = currentCount + 10;
      const coffeeName = docData.data().name;

      Alert.alert(
        "Add Capsules",
        `Adding 10 capsules for ${coffeeName}.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              await updateDoc(doc(db, 'original', docData.id), {
                count: updatedCount
              });
              //alert('Coffee count updated!');
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      alert('Coffee with this barcode does not exist.');
    }
  };

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      //console.log('Photo:', photo);
  
      // Request permissions to save to media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        // Save the photo to the album
        const asset = await MediaLibrary.createAssetAsync(photo.uri);
        //console.log('Asset:', asset);
        setModalVisible(false);
        setIsCameraMode(false);
        alert('Photo saved to general album!');
      }
    }
  };
  

  //setup item for flatlist
  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Image 
        source={imageLookup[item.id]} 
        style={{ height: 50, width: 50, borderWidth: 0, borderColor: '#000' }} 
        />

        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.count}>{item.count}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Good morning, Liz</Text>
            <TouchableOpacity onPress={handleLogout}>
              <MaterialIcons name="logout" size={32} color="#000" style={{paddingRight: 10}} />
            </TouchableOpacity>
        </View>

        <FlatList
            data={coffeeData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
        />

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {isCameraMode ? (
                <Camera 
                  style={{ width: 400, height: 400 }} 
                  ref={ref => {
                    setCameraRef(ref);
                  }}
                >
                  <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <Button title="Take Picture" onPress={takePicture} />
                  </View>
                </Camera>
            ) : (
                <BarCodeScanner
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                  style={{ height: 400, width: 400 }}
                />
            )}

            {isCameraMode && <Button title="Close Camera" onPress={() => setModalVisible(false)} />}
            {!isCameraMode && <Button title="Close Scanner" onPress={() => setModalVisible(false)} />}
          </View>
        </Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#F5E7D9',
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  toolbarTitle: {
    color: '#000',
    textAlign: 'left',
    marginLeft: 20,
    fontWeight: 'normal',
    flex: 1,
    fontSize: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    flex: 1, 
    marginLeft: 10,
    fontSize: 20,
    color: '#121212',
  },
  count: {
    width: 50,
    textAlign: 'right',
    fontSize: 20,
    fontWeight: 'normal',
    color: '#121212',
    marginRight: 8,
  },
});