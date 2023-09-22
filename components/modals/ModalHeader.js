import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../config';

const ModalHeader = ({ title, setModalVisible }) => {
  return (
    <View style={styles.modalHeader}>
      <Text style={styles.modalHeaderTitle}>{title}</Text>
      <TouchableOpacity onPress={() => setModalVisible(false)}>
        <Ionicons name="close" size={32} color="#F5E7D9" />
      </TouchableOpacity>
    </View>
  );
};

export default ModalHeader;

const styles = StyleSheet.create({
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: Colors.coffee,
      padding: 16,
      width: '100%',
      alignItems: 'center',
    },
    modalHeaderTitle: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      textAlign: 'center',
      marginLeft: 30,
      color: '#F5E7D9',
      fontSize: 19,
    },
  });