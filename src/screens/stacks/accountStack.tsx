import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { forSlide } from "./animations";
import MyAccount from "../account/index";
import Player from "../player";
import EditAccount from "../account/edit";
import Premium from "../premium";

export type AccountStackParamList = {
  AccountScreen: undefined;
  EditAccount: undefined;
  Premium: undefined;
  Player: { moduleId: string; contentId: string };
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
      <Stack.Screen name="AccountScreen" component={MyAccount} />
      <Stack.Screen 
        name="EditAccount" 
        component={EditAccount}
        options={{
          cardStyleInterpolator: forSlide,
          gestureDirection: 'vertical',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="Premium" 
        component={Premium}
        options={{
          cardStyleInterpolator: forSlide,
          gestureDirection: 'vertical',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="Player" 
        component={Player}
        options={{
          cardStyleInterpolator: forSlide,
          gestureDirection: 'vertical',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
} 