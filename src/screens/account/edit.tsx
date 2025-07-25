import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { AccountStackParamList } from '../../stacks/accountStack';
import { useAuth } from '../../contexts/AuthContext';
import PageModel2 from '../../components/pageModel2';
import { fonts } from '../../theme/fonts';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { getSupabaseClient } from '../../config/supabase';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

type NavigationProp = StackNavigationProp<AccountStackParamList, 'EditAccount'>;
type RouteProps = RouteProp<AccountStackParamList, 'EditAccount'>;

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
};

const SUPABASE_URL = 'https://cueqhaexkoojemvewdki.supabase.co';

// Adiciona função utilitária para converter base64 em Blob
function base64ToBlob(base64: string, contentType = '', sliceSize = 512): Blob {
  const byteCharacters = Buffer.from(base64, 'base64');
  return new Blob([byteCharacters], { type: contentType });
}

export default function EditAccount() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [userData, setUserData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (authUser?.id) {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setUserData(data);
        setUserImage(data?.profile_url ?? null);
        setFormData({
          firstName: data?.first_name ?? '',
          lastName: data?.last_name ?? '',
          email: authUser.email ?? '',
        });
      }
      setProfileLoading(false);
    }
    fetchProfile();
  }, [authUser]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
    if (!authUser) {
      Alert.alert(t('editAccount.error'), t('editAccount.authError'));
      return;
    }

    try {
      const supabase = getSupabaseClient();
      // Verifica permissão primeiro
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      
      let finalStatus = existingStatus;
      
      // Se não tem permissão, solicita
      if (existingStatus !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = status;
      }
      
      // Se ainda não tem permissão após solicitar
      if (finalStatus !== 'granted') {
        Alert.alert(
          t('editAccount.permissionNeeded'), 
          t('editAccount.permissionMessage'),
          [
            { text: t('editAccount.cancel'), style: 'cancel' }
          ]
        );
        return;
      }

      // Agora abre o picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8, // Reduzindo qualidade para melhor performance
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        
        const fileUri = result.assets[0].uri;
        const fileName = `${authUser.id}_${Date.now()}.jpg`;
        const fileType = 'image/jpeg';
        
        // Obtém o token de acesso do usuário
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token || '';
        if (!accessToken) {
          Alert.alert(t('editAccount.error'), t('editAccount.tokenError'));
          return;
        }
        // Monta a URL de upload
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/user-images/${fileName}`;
        // Faz upload usando FileSystem.uploadAsync
        const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
          httpMethod: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': fileType,
          },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        });
        if (uploadResult.status !== 200 && uploadResult.status !== 201) {
          throw new Error(t('editAccount.uploadError'));
        }
        
        // Obtém a URL pública
        const { data: publicUrlData, error: publicUrlError } = supabase.storage
          .from('user-images')
          .getPublicUrl(fileName);
          
        if (publicUrlError) {
          throw publicUrlError;
        }
        
        const publicUrl = publicUrlData?.publicURL ?? '';
        
        // Verifica se o usuário existe
        const { data: userExists, error: userExistsError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authUser.id)
          .single();
          
        if (userExistsError || !userExists) {
          Alert.alert(t('editAccount.error'), t('editAccount.userNotFound'));
          return;
        }
        
        // Atualiza o perfil
        const { data: updateResult, error } = await supabase
          .from('users')
          .update({ profile_url: publicUrl })
          .eq('id', authUser.id);
          
        if (error) throw error;
        
        // Força refresh da imagem adicionando query param único
        const refreshedUrl = publicUrl ? `${publicUrl}?t=${Date.now()}` : '';
        setUserImage(refreshedUrl);
        setUserData((prev: any) => ({ ...prev, profile_url: refreshedUrl }));
        Alert.alert(t('common.ok'), t('editAccount.photoUpdated'));
      }
    } catch (error: any) {
      console.error('Erro no pickImage:', error);
      Alert.alert(
        t('editAccount.error'), 
        error.message || t('editAccount.imageError')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!authUser) return;
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert(t('editAccount.error'), t('editAccount.fillAllFields'));
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim()
        })
        .eq('id', authUser.id)
        .select();

      if (error) {
        throw error;
      }

      Alert.alert(t('common.ok'), t('editAccount.dataUpdated'));
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('editAccount.error'), t('editAccount.updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <View style={Styles.container}>
        <Text style={Styles.label}>{t('editAccount.loading')}</Text>
      </View>
    );
  }

  return (
    <PageModel2 
      icon="person-outline" 
      title={t('editAccount.title')} 
      subtitle={`${formData.firstName} ${formData.lastName}`}
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
            source={userImage ? { uri: userImage } : { uri: 'https://ui-avatars.com/api/?name=User' }} 
            style={Styles.image} 
          />
          {imageHover && !loading && (
            <View style={Styles.imageOverlay}>
              <Ionicons name="camera" size={30} color="#fff" />
              <Text style={Styles.overlayText}>{t('editAccount.changePhoto')}</Text>
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
            <Text style={Styles.label}>{t('editAccount.firstName')}</Text>
            <TextInput 
              placeholder={t('editAccount.firstName')} 
              style={Styles.input}
              value={formData.firstName}
              onChangeText={(value) => handleChange('firstName', value)}
              editable={!loading}
            />
          </View>
          <View style={Styles.formItem}>
            <Text style={Styles.label}>{t('editAccount.lastName')}</Text>
            <TextInput 
              placeholder={t('editAccount.lastName')} 
              style={Styles.input}
              value={formData.lastName}
              onChangeText={(value) => handleChange('lastName', value)}
              editable={!loading}
            />
          </View>
          <View style={Styles.formItem}>
            <Text style={Styles.label}>{t('editAccount.email')}</Text>
            <TextInput 
              placeholder={t('editAccount.email')} 
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
              <Text style={Styles.buttonText}>{t('editAccount.saveChanges')}</Text>
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
    backgroundColor: '#24ABC2',
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