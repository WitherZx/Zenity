import React from 'react';
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

const Tab = createBottomTabNavigator();

// CRIAR DOIS NAVEGADORES SEPARADOS
const PremiumTabNavigator = () => {
  const navigationState = useNavigationState(state => state);

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
    <Tab.Navigator
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
      <Tab.Screen name="Inicio" component={HomeStack} />
      <Tab.Screen name="Busca" component={SearchStack} />
      <Tab.Screen name="Minha Conta" component={AccountStack} />
    </Tab.Navigator>
  );
};

const NonPremiumTabNavigator = () => {
  const navigationState = useNavigationState(state => state);

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
    <Tab.Navigator
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
       <Tab.Screen name="Inicio" component={HomeStack} />
       <Tab.Screen name="Busca" component={SearchStack} />
       <Tab.Screen name="Minha Conta" component={AccountStack} />
     </Tab.Navigator>
  );
};

// COMPONENTE PRINCIPAL
export default function TabNavigator() {
  const navigationState = useNavigationState(state => state);
  const { userData } = useAuth();
  
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

  // Navegador para usuários não-premium (sem aba Premium)
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
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
        <Tab.Screen name="Inicio" component={HomeStack} />
        <Tab.Screen name="Minha Conta" component={AccountStack} />
        <Tab.Screen name="Busca" component={SearchStack} />
      </Tab.Navigator>
      <FloatingPlayer />
    </View>
  );
}
