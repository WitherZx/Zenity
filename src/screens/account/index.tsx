import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomButton from '../../components/button1';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { AccountStackParamList } from '../../stacks/accountStack';

type NavigationProp = StackNavigationProp<AccountStackParamList, 'AccountScreen'>;
type RouteProps = RouteProp<AccountStackParamList, 'AccountScreen'>;

const MyAccount: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { user: authUser, signOut } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (authUser?.id) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      setUserData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [authUser]);

  // Adiciona um listener para quando a tela receber foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (authUser?.id) {
        setLoading(true);
        fetchProfile();
      }
    });

    return unsubscribe;
  }, [navigation, authUser]);

  if (loading || !userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.imageWrapper}
        onPress={() => navigation.navigate('EditAccount', { currentUserData: userData })}
      >
        <Image 
          source={userData?.profile_url ? { uri: userData.profile_url } : require('../../../assets/images/defaultUser.png')} 
          style={styles.userImage} 
        />
      </TouchableOpacity>
      <Text style={styles.name}>{userData?.first_name ?? ''} {userData?.last_name ?? ''}</Text>
      <View>
        <CustomButton 
          text="Editar dados" 
          iconName="user" 
          onPress={() => navigation.navigate('EditAccount', { currentUserData: userData })} 
        />
        <CustomButton 
          text="Assinar Premium" 
          iconName="diamond" 
          onPress={() => navigation.navigate('Premium')} 
        />
        <CustomButton 
          text="Sair/Trocar de conta" 
          iconName="sign-out" 
          onPress={signOut} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 50,
    backgroundColor: '#0097B2',
    flex: 1,
    flexDirection: 'column',
    gap: 30,
  },
  imageWrapper: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    position: 'relative',
  },
  userImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  name: {
    fontWeight: '700',
    fontSize: 22,
    textAlign: 'center',
    color: '#fff',
  },
});

export default MyAccount; 