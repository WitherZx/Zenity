import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomButton from '../../components/button1';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { AccountStackParamList } from '../../stacks/accountStack';
import Icon from 'react-native-vector-icons/Ionicons';

type NavigationProp = StackNavigationProp<AccountStackParamList, 'AccountScreen'>;
type RouteProps = RouteProp<AccountStackParamList, 'AccountScreen'>;

function AccountSkeleton() {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Animated.View style={[styles.skeletonAvatar, { opacity }]} />
      </View>
      <Animated.View style={[styles.skeletonName, { opacity }]} />
      <View>
        {[1, 2, 3].map((i) => (
          <Animated.View key={i} style={[styles.skeletonButton, { opacity }]} />
        ))}
      </View>
    </View>
  );
}

const MyAccount: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { user: authUser, signOut } = useAuth();
  if (!authUser) {
    console.log('MyAccount: sem authUser, retornando null');
    return null;
  }
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Flag para evitar setState após desmontagem
  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!authUser?.id) {
      if (isMountedRef.current) setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (isMountedRef.current) setUserData(data);
      console.log('fetchProfile: setUserData', data);
    } catch (error) {
      console.error('fetchProfile: erro', error);
    } finally {
      if (isMountedRef.current) setLoading(false);
      console.log('fetchProfile: setLoading(false)');
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (!authUser?.id) return;
    console.log('useEffect[authUser?.id, fetchProfile]: chamando fetchProfile');
    fetchProfile();
  }, [authUser?.id, fetchProfile]);

  useEffect(() => {
    if (!authUser) {
      console.log('useEffect[authUser]: deslogou, limpando userData e loading');
      if (isMountedRef.current) setUserData(null);
      if (isMountedRef.current) setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (authUser?.id) {
        console.log('navigation focus: chamando fetchProfile');
        fetchProfile();
      }
    });
    return unsubscribe;
  }, [navigation, authUser?.id, fetchProfile]);

  if (loading || !userData) {
    console.log('MyAccount: loading ou !userData, renderizando AccountSkeleton');
    return <AccountSkeleton />;
  }
  console.log('MyAccount: renderizando dados do usuário', userData);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.imageWrapper}
        onPress={() => navigation.navigate('EditAccount', { currentUserData: userData })}
      >
        <Image 
          source={userData?.profile_url ? { uri: userData.profile_url } : { uri: 'https://ui-avatars.com/api/?name=User' }} 
          style={styles.userImage} 
        />
      </TouchableOpacity>
      <View>
      {userData?.is_premium && (
        <View style={{
          backgroundColor: '#24ABC2',
          borderRadius: 10,
          padding: 10,
          marginVertical: 10,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', marginRight: 6 }}>Usuário Premium</Text>
          <Icon name="diamond" color={'#fff'} size={18}/>
        </View>
      )}
      <Text style={styles.name}>{userData?.first_name ?? ''} {userData?.last_name ?? ''}</Text>
      </View>
      <View>
        <CustomButton 
          text="Editar dados" 
          iconName="user" 
          onPress={() => navigation.navigate('EditAccount', { currentUserData: userData })} 
        />
        {!userData?.is_premium && (
          <CustomButton 
            text="Assinar Premium" 
            iconName="diamond" 
            onPress={() => navigation.navigate('Premium')} 
          />
        )}
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
    backgroundColor: '#24ABC2',
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
  skeletonAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginBottom: 20,
  },
  skeletonName: {
    height: 22,
    width: '60%',
    backgroundColor: '#fff',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 30,
  },
  skeletonButton: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
  },
});

export default MyAccount; 