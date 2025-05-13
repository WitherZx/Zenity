import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Account from '../screens/account/index';
import EditAccount from '../screens/account/edit';
import Premium from '../screens/premium';
import Player from '../screens/player';

export type AccountStackParamList = {
  AccountScreen: { updatedUserData?: any };
  EditAccount: { currentUserData?: any };
  Premium: undefined;
  Player: undefined;
};

const Stack = createStackNavigator<AccountStackParamList>();

export default function AccountStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        presentation: 'modal'
      }}
    >
      <Stack.Screen name="AccountScreen" component={Account} />
      <Stack.Screen 
        name="EditAccount" 
        component={EditAccount}
        options={{
          gestureDirection: 'vertical',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="Premium" 
        component={Premium}
        options={{
          gestureDirection: 'vertical',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="Player" 
        component={Player}
        options={{
          gestureDirection: 'vertical',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
} 