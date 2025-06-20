import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from '../stacks/homeStack';
import AccountStack from '../stacks/accountStack';
import PremiumStack from '../stacks/premiumStack';
import FloatingPlayer from '../../components/FloatingPlayer';
import { useNavigationState } from '@react-navigation/native';
import SearchStack from '../stacks/searchStack';
import { tabScreenOptions } from '../stacks/animations';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsNav() {
  const Tabs = createBottomTabNavigator();
  const navigationState = useNavigationState(state => state);
  const { user } = useAuth();

  // Função para verificar se está na Player
  const isInPlayer = () => {
    if (!navigationState?.routes) return false;
    
    // Verifica recursivamente nas rotas se alguma é Player
    const checkRoutes = (routes: any[]): boolean => {
      return routes.some(route => {
        if (route.name === 'Player') return true;
        if (route.state?.routes) return checkRoutes(route.state.routes);
        return false;
      });
    };

    return checkRoutes(navigationState.routes);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          ...tabScreenOptions,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 40,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            display: isInPlayer() ? 'none' : 'flex',
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName: string = '';

            if (route.name === 'Inicio') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Minha Conta') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Busca') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Premium') {
              iconName = focused ? 'diamond' : 'diamond-outline';
            } else {
              iconName = 'help-circle-outline';
            }

            return <Ionicons name={iconName as any} size={25} color={color} />;
          },
          tabBarActiveTintColor: '#0097B2',
          tabBarInactiveTintColor: '#91D2DE',
        })}
        initialRouteName='Inicio'
      >
        <Tabs.Screen name="Inicio" component={HomeStack} />
        <Tabs.Screen name="Minha Conta" component={AccountStack} />
        <Tabs.Screen name="Busca" component={SearchStack} />
        {!user?.is_premium && <Tabs.Screen name="Premium" component={PremiumStack} />}
      </Tabs.Navigator>
      <FloatingPlayer />
    </View>
  );
}
