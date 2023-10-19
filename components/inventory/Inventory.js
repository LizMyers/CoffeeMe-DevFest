import React from 'react';
import { FlatList, View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../../config'; 

export const Inventory = ({ data, imageLookup }) => {
  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Image 
        source={imageLookup[item.id]} 
        style={{ height: 50, width: 50}} 
        />
          <View style={styles.nameGroup}>
            {item.name === 'Pumpkin Spice Cake' || item.name === 'Cioccolato' ? 
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
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: .3, backgroundColor: Colors.white }} />}
    />
  );
};

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: .25,
        borderStyle: 'solid',
        borderBottomColor: Colors.green,
        marginLeft: 4,
      },
      thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 25,
      },
      nameGroup:{
        flexDirection: 'row',
        alignItems: 'left',
        maxWidth: 260,
        marginTop: -20,
      },
      name: {
        flex: 1, 
        marginLeft: 10,
        fontSize: 20,
        fontWeight: 800,
        color: Colors.black
      },
      strength: {
        width: 170,
        maxHeight: 10,
        opacity: .25,
        position: 'absolute',
        top: 30,
        left: 10,
      },
      count: {
        width: 50,
        textAlign: 'right',
        fontSize: 20,
        fontWeight: 'normal',
        color: '#4f2200',
        marginRight: 15,
      },
  });