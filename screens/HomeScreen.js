import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Alert } from 'react-native';

//inventory components
import { Inventory }  from '../components/inventory/Inventory';
import { BarcodeModal } from '../components/modals/BarcodeModal';
import { InferenceModal } from '../components/modals/InferenceModal';

//need for hasPermission on line 31
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as MediaLibrary from 'expo-media-library';

//firestore
import { signOut, getAuth } from 'firebase/auth';
import { query, where, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';  // Make sure 'db' is correctly exported from your config
import { collection, onSnapshot} from 'firebase/firestore';

//UI eleements
import { Colors } from '../config';
import imageLookup from '../utils/imageLookup';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';


export const HomeScreen = ({navigation}) => {
  const auth = getAuth();  
  const [coffeeData, setCoffeeData] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [isCameraMode, setIsCameraMode] = useState(false);
  const [scanned, setScanned] = useState(false);

  //const cameraRef = useRef(null);
  const [cameraRef, setCameraRef] = useState(null);

 //get coffee data
  useEffect(() => {

    let unsubscribe;
  
    try {
      const coffeeCollection = collection(db, 'original');
  
      unsubscribe = onSnapshot(coffeeCollection,
        (snapshot) => {
          const coffeeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const inStockCoffee = coffeeData.filter(item => item.count >= 1);
  
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

  //Get camera permissions
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

  React.useLayoutEffect(() => {   //coffee icon left of Title
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
      headerRight: () => ( //barcode icon right of Title
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
    //console.log('Scanning barcode...');
    //console.log('Camera Ref:', cameraRef);
    setScanned(true);
    setModalVisible(false);
    await updateCoffeeCount(data);  
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
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
  
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Good morning, Liz</Text>
            <TouchableOpacity onPress={handleLogout}>
              <MaterialIcons name="logout" size={32} color="#000" style={{paddingRight: 10}} />
            </TouchableOpacity>
        </View>

        <Inventory data={coffeeData} imageLookup={imageLookup} />

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
        >
          <View style={styles.modal}>
            {isCameraMode ? (
              <InferenceModal 
                setModalVisible={setModalVisible} 
                cameraRef={cameraRef}
                takePicture={takePicture}
                coffeeData={coffeeData}
              />
            ) : (
              <BarcodeModal 
                setModalVisible={setModalVisible}
                handleBarCodeScanned={handleBarCodeScanned}
              />
            )}
          </View>
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#F5E7D9',
    paddingVertical: 10,
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 7,
    maxHeight: 60,
  },
  toolbarTitle: {
    color: '#4f2200',
    textAlign: 'left',
    marginHorizontal: 10,
    lineHeight: 30,
    flex: 1,
    fontSize: 20,
  },
    modal: {
      flex: 1,
      paddingTop: 50,
      backgroundColor: Colors.coffee,
    },
    button: {
      width: '90%',
      marginTop: 20,
      alignSelf: 'center',
      backgroundColor: Colors.caramel,
      color: Colors.white,
      padding: 15,
      borderRadius: 8
    },
    buttonText: {
      fontSize: 20,
      color: Colors.white,
      fontWeight: '700',
      textAlign: 'center',
    },
    loadingIndicator: {
      width: 150,
      height: 150,
    },


});