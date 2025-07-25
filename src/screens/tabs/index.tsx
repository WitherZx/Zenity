import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import HomeStack from '../stacks/homeStack';
import SearchStack from '../stacks/searchStack';
import AccountStack from '../stacks/accountStack';
import PremiumStack from '../stacks/premiumStack';
import FloatingPlayer from '../../components/FloatingPlayer';
import { useAuth } from '../../contexts/AuthContext';
import { tabScreenOptions } from '../stacks/animations';

const Tab = createBottomTabNavigator();

// COMPONENTE PRINCIPAL
export default function TabNavigator() {
  const navigationState = useNavigationState(state => state);
  const { userData } = useAuth();
  const { t } = useTranslation();
  
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

          if (route.name === t('tabs.home')) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === t('tabs.search')) {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === t('tabs.premium') && Platform.OS === 'android') {
            iconName = focused ? 'diamond' : 'diamond-outline';
          } else if (route.name === t('tabs.account')) {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName as any} size={25} color={color} />;
        },
          tabBarActiveTintColor: '#0097B2',
          tabBarInactiveTintColor: '#91D2DE',
        })}
        initialRouteName={t('tabs.home')}
      >
        <Tab.Screen name={t('tabs.home')} component={HomeStack} />
        <Tab.Screen name={t('tabs.search')} component={SearchStack} />
        <Tab.Screen name={t('tabs.account')} component={AccountStack} />
        {Platform.OS === 'android' && (
          <Tab.Screen name={t('tabs.premium')} component={PremiumStack} />
        )}
      </Tab.Navigator>
      <FloatingPlayer />
    </View>
  );
}
