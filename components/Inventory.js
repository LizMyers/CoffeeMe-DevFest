import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

import { useAuthenticatedUser } from '../providers';
import { map } from 'lodash';

export const Inventory = () => {

    const { user } = useAuthenticatedUser();
    const data = [
        {
            id: 1,
            name: 'Arpeggio',
            image: 'https://www.nespresso.com/ncp/res/uploads/recipes/nespresso-recipes-Arpeggio.jpg',
            qty: 10,
        },
        {
            id: 2,
            name: 'Ristretto',
            image: 'https://www.nespresso.com/ncp/res/uploads/recipes/nespresso-recipes-Ristretto.jpg',
            qty: 10,
        },
        {
            id: 3,
            name: 'Roma',
            image: 'https://www.nespresso.com/ncp/res/uploads/recipes/nespresso-recipes-Roma.jpg',
            qty: 10,
        },
    ];

    <View style={styles.container}>
        <Text style={styles.title}>Inventory</Text>

        <FlatList
            data={data}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.item}>
                    <Thumbnail source={{ uri: item.image }} style={styles.image} />
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.qty}>{item.qty}</Text>
                </TouchableOpacity>
            )}
        />
    </View>

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F57C00',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    qty: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
});