import { createStackNavigator } from "@react-navigation/stack";
import { forSlide } from "./animations";
import Premium from "../premium";
import Player from "../player";

export type PremiumStackParamList = {
  premium: undefined;
  Player: { moduleId: string; contentId: string };
};

const Stack = createStackNavigator<PremiumStackParamList>();

export default function PremiumStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        presentation: 'modal'
      }}
    >
      <Stack.Screen name="premium" component={Premium} />
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