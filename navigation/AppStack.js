import * as React from 'react';
import { View, StyleSheet, Button, Text, FlatList, TouchableOpacity, Image} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '../config';

import { HomeScreen } from '../screens';

const Stack = createStackNavigator();

export const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
      name='Coffee Me' 
      component={HomeScreen}
      options={{
        headerStyle: {
          backgroundColor: Colors.black,
      },
      headerTitleStyle: {
        color: Colors.white,
    }}
  }
      />
    </Stack.Navigator>
  );
};
