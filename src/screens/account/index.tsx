import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomButton from '../../components/button1';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { AccountStackParamList } from '../../stacks/accountStack';

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
    return <AccountSkeleton />;
  }

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