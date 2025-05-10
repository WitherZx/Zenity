import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomButton from '../../components/button1';
import { useAuth } from '../../contexts/AuthContext';

type RootStackParamList = {
  EditAccount: undefined;
  Premium: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MyAccount: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.imageWrapper}
        onPress={() => navigation.navigate('EditAccount')}
      >
        <Image 
          source={user?.photoURL ? { uri: user.photoURL } : require('../../../assets/images/defaultUser.png')} 
          style={styles.userImage} 
        />
      </TouchableOpacity>
      <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
      <View>
        <CustomButton 
          text="Editar dados" 
          iconName="user" 
          onPress={() => navigation.navigate('EditAccount')} 
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