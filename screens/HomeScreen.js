import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import { signOut, getAuth } from 'firebase/auth';

import imageLookup from '../utils/imageLookup';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

import { db } from '../config/firebase';  // Make sure 'db' is correctly exported from your config
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { StatusBar } from 'expo-status-bar';
import { BarCodeScanner } from 'expo-barcode-scanner';

export const HomeScreen = ({navigation}) => {
  const [coffeeData, setCoffeeData] = useState([]);
  const auth = getAuth();  // Initialize auth

  const [hasPermission, setHasPermission] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scanned, setScanned] = useState(false);

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
              // Handle your barcode scanning logic here
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
              // Handle your barcode scanning logic here
            }}
          />
        </View>
      ),
      setOptions: { title: 'CoffeeMe' },
    });
  }, [navigation]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

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
          <Text style={styles.toolbarTitle}>Hi Liz</Text>
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
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{ height: 400, width: 400 }}
            />
            <Button title="Close Scanner" onPress={() => setModalVisible(false)} />
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
    fontWeight: 'bold',
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