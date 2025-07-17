import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from '../stacks/homeStack';
import AccountStack from '../stacks/accountStack';
import FloatingPlayer from '../../components/FloatingPlayer';
import { useNavigationState } from '@react-navigation/native';
import SearchStack from '../stacks/searchStack';
import { tabScreenOptions } from '../stacks/animations';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsNav() {
  const Tabs = createBottomTabNavigator();
  const navigationState = useNavigationState(state => state);
  const { user } = useAuth();
  const [userPremiumStatus, setUserPremiumStatus] = useState(user?.is_premium);

  // Atualiza o status premium local quando o usuário muda
  useEffect(() => {
    setUserPremiumStatus(user?.is_premium);
  }, [user?.is_premium]);

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

  // Navegador para usuários premium (sem aba Premium)
  if (userPremiumStatus) {
    return (
      <View style={{ flex: 1 }}>
        <Tabs.Navigator
          id={undefined}
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

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'My Account') {
                iconName = focused ? 'person' : 'person-outline';
              } else if (route.name === 'Search') {
                iconName = focused ? 'search' : 'search-outline';
              } else {
                iconName = 'help-circle-outline';
              }

              return <Ionicons name={iconName as any} size={25} color={color} />;
            },
            tabBarActiveTintColor: '#0097B2',
            tabBarInactiveTintColor: '#91D2DE',
          })}
          initialRouteName='Home'
        >
          <Tabs.Screen name="Home" component={HomeStack} />
          <Tabs.Screen name="My Account" component={AccountStack} />
          <Tabs.Screen name="Search" component={SearchStack} />
        </Tabs.Navigator>
        <FloatingPlayer />
      </View>
    );
  }

  // Navegador para usuários não-premium (sem aba Premium)
  return (
    <View style={{ flex: 1 }}>
      <Tabs.Navigator
        id={undefined}
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

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'My Account') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else {
              iconName = 'help-circle-outline';
            }

            return <Ionicons name={iconName as any} size={25} color={color} />;
          },
          tabBarActiveTintColor: '#0097B2',
          tabBarInactiveTintColor: '#91D2DE',
        })}
        initialRouteName='Home'
      >
        <Tabs.Screen name="Home" component={HomeStack} />
        <Tabs.Screen name="My Account" component={AccountStack} />
        <Tabs.Screen name="Search" component={SearchStack} />
      </Tabs.Navigator>
      <FloatingPlayer />
    </View>
  );
}
