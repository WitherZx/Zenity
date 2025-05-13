import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { forSlide } from "./animations";
import Search from "../search";
import Player from "../player";

export type SearchStackParamList = {
  search: undefined;
  Player: { moduleId: string; contentId: string };
};

const Stack = createStackNavigator<SearchStackParamList>();

export default function SearchStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        presentation: 'modal'
      }}
    >
      <Stack.Screen name="search" component={Search} />
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