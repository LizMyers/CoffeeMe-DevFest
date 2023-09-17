import * as React from 'react';
import { View, StyleSheet, Button, Text, FlatList, TouchableOpacity, Image} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

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
          backgroundColor: '#6B4423',
      },
      headerTitleStyle: {
        color: '#F5E7D9',
    }}
  }
      />
    </Stack.Navigator>
  );
};
