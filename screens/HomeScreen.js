import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { Button } from '../components';

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

//camera
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

//toast
import Toast from 'react-native-root-toast';

//lottie
import LottieView from 'lottie-react-native';



export const HomeScreen = ({navigation}) => {
  const [coffeeData, setCoffeeData] = useState([]);
  const auth = getAuth();  
  const [hasPermission, setHasPermission] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [scanned, setScanned] = useState(false);

 //get coffee data
  useEffect(() => {

    let unsubscribe;
  
    try {
      const coffeeCollection = collection(db, 'original');
  
      unsubscribe = onSnapshot(coffeeCollection,
        (snapshot) => {
          const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const inStockCoffee = allData.filter(item => item.count >= 1);
  
          allData.forEach(coffee => {
            if (coffee.count <= 5) {
              Toast.show(`${coffee.name} - only ${coffee.count} left.`, {
                position: Toast.positions.CENTER, // This puts the toast in the middle
                duration: 5000 // This sets the duration to 5 seconds
              });
            }
          });
  
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
        style={{ height: 50, width: 50}} 
        />
          <View style={styles.nameGroup}>
            {item.name === 'Pumpkin Spice Cake' || item.name === 'Cioccolatino' ? 
             <Text style={[styles.name, {marginTop: 20, fontWeight: 'normal'}]}>{item.name}</Text>
             :
             <Text style={styles.name}>{item.name}</Text> 
             }
            <Image source={imageLookup[item.strength]} style={styles.strength} />
          </View>
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
            ItemSeparatorComponent={() => <View style={{ height: .3, backgroundColor: Colors.white }} />}
        />

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              {
              isCameraMode ? 
              <Text style={styles.modalHeaderTitle}>Image Classification</Text>
              : 
              <Text style={styles.modalHeaderTitle}>Barcode Scanner</Text>
              }
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={32} color="#F5E7D9" style={{paddingRight: 10}} />
            </TouchableOpacity>
          </View>
            {isCameraMode ? (
              <>
                <Camera 
                  style={{height: 300, width: '100%', alignSelf: 'center'}} 
                  ref={ref => {
                    setCameraRef(ref);
                  }}
                >
                </Camera>

                <View style={{width: 150, height: 150, alignSelf: 'center'}}>
                  <LottieView style={{width: 150, height: 150}} source={require('../assets/loading.json')} autoPlay loop />
               </View>
  
                <Button style={styles.button} onPress={takePicture}>
                  <Text style={styles.buttonText}>Take Picture</Text>
                </Button>
              </>
            ) : (
                <BarCodeScanner
                  style={{height: 300, width: '100%', alignSelf: 'center'}} 
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                >
               </BarCodeScanner>
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: .25,
    borderStyle: 'solid',
    borderBottomColor: Colors.caramel,
    marginLeft: 4,
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
    color: '#4f2200'
  },
  count: {
    width: 50,
    textAlign: 'right',
    fontSize: 20,
    fontWeight: 'normal',
    color: '#4f2200',
    marginRight: 15,
  },
  nameGroup:{
    flexDirection: 'row',
    alignItems: 'left',
    maxWidth: 260,
    marginTop: -20,
  },
  strength: {
    width: 170,
    maxHeight: 10,
    opacity: .4,
    position: 'absolute',
    top: 30,
    left: 10,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  modalHeader: {
    backgroundColor: '#4f2200',
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',  
    height: 120,
  },
  modalHeaderTitle: {
    color: '#F5E7D9',
    marginLeft: 20,
    fontSize: 20,
    borderWidth: 0,
    borderColor: '#fff',
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