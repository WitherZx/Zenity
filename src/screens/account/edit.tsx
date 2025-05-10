import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AccountStackParamList } from '../../stacks/accountStack';
import { useAuth } from '../../contexts/AuthContext';
import PageModel2 from '../../components/pageModel2';
import { fonts } from '../../theme/fonts';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<AccountStackParamList>;

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function EditAccount() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth() as { user: { photoURL?: string | null; firstName: string; lastName: string; email: string; id: string } | null };
  const [loading, setLoading] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(user && user.photoURL ? user.photoURL : null);
  const [formData, setFormData] = useState<FormData>({
    firstName: user && user.firstName ? user.firstName : '',
    lastName: user && user.lastName ? user.lastName : '',
    email: user && user.email ? user.email : '',
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setLoading(true);
      try {
        Alert.alert('Atenção', 'Funcionalidade de alterar foto desativada nesta versão.');
      } catch (error: any) {
        Alert.alert('Erro', error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      Alert.alert('Atenção', 'Funcionalidade de editar perfil desativada nesta versão.');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageModel2 
      icon="person-outline" 
      title="conta" 
      subtitle={`${user?.firstName} ${user?.lastName}`}
    >
      <View style={Styles.container}>
        <TouchableOpacity 
          style={Styles.imageContainer}
          onPress={pickImage}
          onPressIn={() => setImageHover(true)}
          onPressOut={() => setImageHover(false)}
          disabled={loading}
        >
          <Image 
            source={userImage ? { uri: userImage } : require('../../../assets/images/defaultUser.png')} 
            style={Styles.image} 
          />
          {imageHover && !loading && (
            <View style={Styles.imageOverlay}>
              <Ionicons name="camera" size={30} color="#fff" />
              <Text style={Styles.overlayText}>Alterar foto</Text>
            </View>
          )}
          {loading && (
            <View style={Styles.imageOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <View style={Styles.form}>
          <View style={Styles.formItem}>
            <Text style={Styles.label}>Nome</Text>
            <TextInput 
              placeholder="Nome" 
              style={Styles.input}
              value={formData.firstName}
              onChangeText={(value) => handleChange('firstName', value)}
              editable={!loading}
            />
          </View>
          <View style={Styles.formItem}>
            <Text style={Styles.label}>Sobrenome</Text>
            <TextInput 
              placeholder="Sobrenome" 
              style={Styles.input}
              value={formData.lastName}
              onChangeText={(value) => handleChange('lastName', value)}
              editable={!loading}
            />
          </View>
          <View style={Styles.formItem}>
            <Text style={Styles.label}>Email</Text>
            <TextInput 
              placeholder="Email" 
              style={[Styles.input, { opacity: 0.5 }]}
              value={formData.email}
              editable={false}
            />
          </View>
          <View style={Styles.buttonContainer}>
            <TouchableOpacity 
              style={[Styles.button, loading && Styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={Styles.buttonText}>Salvar alterações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </PageModel2>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 30,
    alignItems: 'center',
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  form: {
    width: '100%',
    gap: 20,
  },
  formItem: {
    gap: 5,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    fontFamily: fonts.bold,
    marginLeft: 10,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontFamily: fonts.regular,
  },
  buttonContainer: {
    gap: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#0097B2',
    fontFamily: fonts.bold,
  },
}); 