import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Account from '../screens/account/index';
import EditAccount from '../screens/account/edit';

export type AccountStackParamList = {
  Account: undefined;
  EditAccount: undefined;
};

const Stack = createStackNavigator<AccountStackParamList>();

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen 
        name="EditAccount" 
        component={EditAccount}
        options={{
          presentation: 'modal',
          gestureDirection: 'vertical',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
} 