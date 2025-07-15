import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/auth/login";
import AuthHub from "../screens/auth/authHub";
import SignUp from "../screens/auth/signUp";

export type LoginStackParamList = {
  Login: undefined;
  AuthHub: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
  VerifyEmail: { email: string };
  ResetPassword: { email: string; code: string };
};

const Stack = createStackNavigator<LoginStackParamList>();

export default function LoginStack() {
  return (
    <Stack.Navigator
      initialRouteName="AuthHub"
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        gestureDirection: 'vertical',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="AuthHub" component={AuthHub} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Login" component={Login} />

    </Stack.Navigator>
  );
} 