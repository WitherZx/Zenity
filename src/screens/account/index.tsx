import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Animated, Alert, TextInput, Modal } from 'react-native';
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
  const { user: authUser, signOut, deleteAccount } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

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
      if (isMountedRef.current) {
        setLoading(false);
        setUserData(null);
      }
      return;
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error('fetchProfile: erro na consulta', error);
        if (isMountedRef.current) {
          setUserData(null);
          setLoading(false);
        }
        return;
      }
      
      if (isMountedRef.current) {
        setUserData(data);
        console.log('fetchProfile: setUserData', data);
      }
    } catch (error) {
      console.error('fetchProfile: erro', error);
      if (isMountedRef.current) {
        setUserData(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        console.log('fetchProfile: setLoading(false)');
      }
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
      if (isMountedRef.current) {
        setUserData(null);
        setLoading(false);
      }
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

  const handleDeleteAccount = () => {
    console.log('handleDeleteAccount: Iniciando processo de deletar conta');
    
    Alert.alert(
      'Deletar Conta',
      'Esta ação é irreversível. Todos os seus dados serão permanentemente removidos, incluindo:\n\n• Seu perfil e informações pessoais\n• Suas fotos de perfil\n• Histórico de uso do app\n• Todas as configurações salvas\n\nSe você possui uma assinatura ativa, será necessário cancelá-la antes de deletar a conta.\n\nTem certeza que deseja continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => console.log('handleDeleteAccount: Usuário cancelou primeira confirmação'),
        },
        {
          text: 'Deletar Conta',
          style: 'destructive',
          onPress: () => {
            console.log('handleDeleteAccount: Usuário confirmou primeira vez, abrindo modal de senha');
            setShowPasswordModal(true);
          }
        }
      ]
    );
  };

  const handleConfirmDelete = async () => {
    console.log('handleConfirmDelete: Senha fornecida, iniciando exclusão');
    
    if (!password || password.trim() === '') {
      console.log('handleConfirmDelete: Senha vazia');
      Alert.alert('Erro', 'Por favor, digite sua senha para confirmar.');
      return;
    }
    
    setDeleting(true);
    
    try {
      console.log('handleConfirmDelete: Chamando deleteAccount...');
      const result = await deleteAccount(password);
      console.log('handleConfirmDelete: Resultado:', result);
      
      if (result.success) {
        console.log('handleConfirmDelete: Conta deletada com sucesso');
        setShowPasswordModal(false);
        setPassword('');
        Alert.alert(
          'Conta Deletada',
          'Sua conta foi deletada com sucesso.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('handleConfirmDelete: Usuário confirmou sucesso');
                // O usuário já foi deslogado automaticamente
              }
            }
          ]
        );
      } else {
        console.log('handleConfirmDelete: Erro ao deletar conta:', result.error);
        Alert.alert('Erro', result.error || 'Erro ao deletar conta');
      }
    } catch (error: any) {
      console.error('handleConfirmDelete: Erro inesperado:', error);
      Alert.alert('Erro', 'Erro inesperado ao deletar conta');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    console.log('handleCancelDelete: Usuário cancelou segunda confirmação');
    setShowPasswordModal(false);
    setPassword('');
  };

  // Se não há usuário autenticado, mostra loading
  if (!authUser) {
    console.log('MyAccount: sem authUser, renderizando AccountSkeleton');
    return <AccountSkeleton />;
  }

  // Se está carregando ou não há dados do usuário, mostra skeleton
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
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Deletar sua conta</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para digitar senha */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.modalSubtitle}>
              Digite sua senha para confirmar a exclusão da conta:
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Sua senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!deleting}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelDelete}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteModalButton, deleting && styles.disabledButton]}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                <Text style={styles.deleteModalButtonText}>
                  {deleting ? 'Deletando...' : 'Deletar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  deleteButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalButton: {
    backgroundColor: '#dc3545',
  },
  deleteModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
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