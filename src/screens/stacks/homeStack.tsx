import { createStackNavigator } from "@react-navigation/stack";
import { forSlide } from "./animations";
import Home from "../home";
import Player from "../player";
import ModuleDetails from "../moduleDetails";

export type HomeStackParamList = {
  home: undefined;
  ModuleDetails: { moduleId: string };
  Player: { moduleId: string; contentId: string };
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        presentation: 'modal'
      }}
    >
      <Stack.Screen name="home" component={Home} />
      <Stack.Screen 
        name="ModuleDetails" 
        component={ModuleDetails}
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
