import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Animated, Alert, TextInput, Modal } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/button1';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { AccountStackParamList } from '../../stacks/accountStack';
import Icon from 'react-native-vector-icons/Ionicons';

type NavigationProp = StackNavigationProp<AccountStackParamList>;
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
  const { t } = useTranslation();
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
        if (isMountedRef.current) {
          setUserData(null);
          setLoading(false);
        }
        return;
      }
      
      if (isMountedRef.current) {
        setUserData(data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setUserData(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (!authUser?.id) return;
    fetchProfile();
  }, [authUser?.id, fetchProfile]);

  useEffect(() => {
    if (!authUser) {
      if (isMountedRef.current) {
        setUserData(null);
        setLoading(false);
      }
    }
  }, [authUser]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (authUser?.id) {
        fetchProfile();
      }
    });
    return unsubscribe;
  }, [navigation, authUser?.id, fetchProfile]);

  const handleDeleteAccount = () => {
    Alert.alert(
      t('account.deleteAccountTitle'),
      t('account.deleteAccountMessage'),
      [
        {
          text: t('account.cancel'),
          style: 'cancel',
          onPress: () => console.log('handleDeleteAccount: Usuário cancelou primeira confirmação'),
        },
        {
          text: t('account.confirmDelete'),
          style: 'destructive',
          onPress: () => {
            setShowPasswordModal(true);
          }
        }
      ]
    );
  };

  const handleConfirmDelete = async () => {
    if (!password || password.trim() === '') {
      Alert.alert(t('common.error'), t('account.passwordRequired'));
      return;
    }
    
    setDeleting(true);
    
    try {
      const result = await deleteAccount(password);
      
      if (result.success) {
        setShowPasswordModal(false);
        setPassword('');
        Alert.alert(
          t('account.accountDeletedTitle'),
          t('account.accountDeletedMessage'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
              }
            }
          ]
        );
      } else {
        Alert.alert(t('common.error'), result.error || t('account.deleteError'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), t('account.unexpectedDeleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowPasswordModal(false);
    setPassword('');
  };

  // Se não há usuário autenticado, mostra loading
  if (!authUser) {
    return <AccountSkeleton />;
  }

  // Se está carregando ou não há dados do usuário, mostra skeleton
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
          <Text style={{ color: '#fff', fontWeight: 'bold', marginRight: 6 }}>{t('account.premiumUser')}</Text>
          <Icon name="diamond" color={'#fff'} size={18}/>
        </View>
      )}
      <Text style={styles.name}>{userData?.first_name ?? ''} {userData?.last_name ?? ''}</Text>
      </View>
      <View>
        <CustomButton 
          text={t('common.edit')} 
          iconName="user" 
          onPress={() => navigation.navigate('EditAccount', { currentUserData: userData })} 
        />
        <CustomButton 
          text={t('account.premium')} 
          iconName="diamond" 
          onPress={() => navigation.navigate('Premium' as any)} 
        />
        <CustomButton 
          text={t('account.logout')} 
          iconName="sign-out" 
          onPress={signOut} 
        />
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>{t('account.deleteAccount')}</Text>
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
            <Text style={styles.modalTitle}>{t('account.confirmDeletion')}</Text>
            <Text style={styles.modalSubtitle}>
              {t('account.enterPasswordToConfirm')}
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('account.yourPassword')}
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
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteModalButton, deleting && styles.disabledButton]}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                <Text style={styles.deleteModalButtonText}>
                  {deleting ? t('account.deleting') : t('account.delete')}
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