import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { signOut, getAuth } from 'firebase/auth';

import imageLookup from '../utils/imageLookup';
import { Inventory } from '../components';

import { db } from '../config/firebase';  // Make sure 'db' is correctly exported from your config
import { collection, onSnapshot, getDocs } from 'firebase/firestore';

export const HomeScreen = () => {
  const [coffeeData, setCoffeeData] = useState([]);
  const auth = getAuth();  // Initialize auth

  const handleLogout = () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };

  useEffect(() => {
    let unsubscribe;
  
    try {
      const coffeeCollection = collection(db, 'original');
  
      unsubscribe = onSnapshot(coffeeCollection,
        (snapshot) => {
          console.log('Received snapshot: ', snapshot);
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

      <FlatList
          data={coffeeData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
      />

      <Button title='Sign Out' onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 19,
    color: '#121212',
  },
  count: {
    width: 50,
    textAlign: 'right',
    fontSize: 19,
    color: '#121212',
  },
});