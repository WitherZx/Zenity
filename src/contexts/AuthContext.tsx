import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../config/supabase';
import RevenueCatService from '../services/revenueCatService';

interface AuthContextData {
  user: any;
  userData: any;
  loading: boolean;
  signOut: () => Promise<void>;
  updatePremiumStatus: (isPremium: boolean) => Promise<void>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshPremiumStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  userData: null,
  loading: true,
  signOut: async () => {},
  updatePremiumStatus: async () => {},
  deleteAccount: async () => ({ success: false }),
  refreshPremiumStatus: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revenueCatPremium, setRevenueCatPremium] = useState<boolean | null>(null);
  const [revenueCatLoading, setRevenueCatLoading] = useState(true);
  const revenueCatService = RevenueCatService.getInstance();

  // MÉTODO PARA SINCRONIZAR STATUS
  const refreshPremiumStatus = async () => {
    console.log('AuthContext: Starting refreshPremiumStatus...');
    try {
      const isAvailable = await RevenueCatService.isServiceAvailable();
      if (isAvailable) {
        console.log('AuthContext: RevenueCat is available, checking status...');
        const rcStatus = await revenueCatService.checkPremiumStatus();
        console.log('AuthContext: RevenueCat premium status:', rcStatus);
        setRevenueCatPremium(rcStatus);
        
        // Sincronizar com Supabase se diferente
        if (userData && rcStatus !== userData.is_premium) {
          console.log('AuthContext: Syncing status with Supabase...');
          await supabase
            .from('users')
            .update({ is_premium: rcStatus })
            .eq('id', userData.id);
          
          setUserData((prev: any) => prev ? { ...prev, is_premium: rcStatus } : null);
          console.log('AuthContext: Status synchronized with Supabase');
        }
      } else {
        console.log('AuthContext: RevenueCat not available, keeping current status');
        setRevenueCatPremium(null);
      }
    } catch (error) {
      console.log('AuthContext: Failed to refresh premium status:', error);
      setRevenueCatPremium(null);
    } finally {
      setRevenueCatLoading(false);
    }
  };

  async function fetchUserProfile(authUser: any) {
    if (!authUser) {
      setUser(null);
      setUserData(null);
      setRevenueCatPremium(null);
      setLoading(false);
      return;
    }

    try {
      // Inicializa o RevenueCat com o ID do usuário (com tratamento de erro)
      try {
        await revenueCatService.initialize(authUser.id);
      } catch (rcError) {
        console.log('AuthContext: RevenueCat initialization failed, continuing without it');
      }

      // Busca o perfil completo do Supabase
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Verifica se a conta foi deletada
      if (data && data.first_name === 'Conta Deletada') {
        await supabase.auth.signOut();
        setUser(null);
        setUserData(null);
        setRevenueCatPremium(null);
        setLoading(false);
        return;
      }

      // Define dados do usuário primeiro
      setUser(authUser);
      setUserData(data);

      setLoading(false);
    } catch (error) {
      // Em caso de erro, ainda define o usuário básico
      setUser(authUser);
      setUserData({ ...authUser, is_premium: false });
      setLoading(false);
    }
  }

  // USEEFFECT PARA LISTENERS
  useEffect(() => {
    if (userData) {
      console.log('AuthContext: Setting up RevenueCat listeners for user:', userData.id);
      refreshPremiumStatus();

      // Listener para mudanças no RevenueCat
      const customerInfoListener = revenueCatService.addCustomerInfoUpdateListener(
        () => {
          console.log('AuthContext: RevenueCat customer info updated, refreshing status...');
          refreshPremiumStatus();
        }
      );

      // Listener para AppState
      const appStateListener = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          console.log('AuthContext: App became active, refreshing premium status...');
          refreshPremiumStatus();
        }
      });

      return () => {
        console.log('AuthContext: Cleaning up listeners...');
        try {
          if (customerInfoListener) {
            (customerInfoListener as any)?.remove?.();
          }
          appStateListener?.remove();
        } catch (error) {
          console.log('AuthContext: Error cleaning up listeners:', error);
        }
      };
    }
  }, [userData?.id]);

  // Criar userData enhanced com lógica hierárquica
  const finalIsPremium = revenueCatPremium ?? userData?.is_premium ?? false;
  const enhancedUserData = userData ? {
    ...userData,
    is_premium: finalIsPremium
  } : null;

  const updatePremiumStatus = async (isPremium: boolean) => {
    if (!userData) return;

    try {
      console.log('AuthContext: Updating premium status to:', isPremium);
      // Atualiza o status no Supabase
      const { error } = await supabase
        .from('users')
        .update({ is_premium: isPremium })
        .eq('id', userData.id);

      if (error) throw error;

      // Atualiza o estado local
      setUserData((prev: any) => ({ ...prev, is_premium: isPremium }));
      console.log('AuthContext: Premium status updated successfully');
    } catch (error) {
      console.error('AuthContext: Failed to update premium status:', error);
    }
  };

  useEffect(() => {
    // Checa o usuário atual ao iniciar
    const session = supabase.auth.session();
    fetchUserProfile(session?.user ?? null);

    // Listener para mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserProfile(session?.user ?? null);
    });

    return () => {
      listener?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await revenueCatService.logout();
    } catch (error) {
      // Continua mesmo se o logout do RevenueCat falhar
    }
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    setRevenueCatPremium(null);
    setLoading(false);
  };

  const deleteAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('deleteAccount: Iniciando processo de deletar conta');
    
    if (!userData) {
      console.log('deleteAccount: Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    console.log('deleteAccount: Usuário ID:', userData.id);

    try {
      // 1. Verificar se o usuário tem assinatura ativa no RevenueCat
      console.log('deleteAccount: Verificando assinatura ativa...');
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        if (revenueCatService.hasActiveSubscription(customerInfo)) {
          console.log('deleteAccount: Usuário tem assinatura ativa, bloqueando exclusão');
          return { 
            success: false, 
            error: 'Você possui uma assinatura ativa. Cancele a assinatura antes de deletar sua conta.' 
          };
        }
        console.log('deleteAccount: Nenhuma assinatura ativa encontrada');
      } catch (rcError) {
        // Continua mesmo se não conseguir verificar
      }

      // 2. Tentar deletar dados do usuário no Supabase (pode falhar por RLS)
      console.log('deleteAccount: Tentando deletar dados do usuário no Supabase...');
      const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', userData.id);

      if (deleteUserError) {
        console.log('deleteAccount: Continuando mesmo com erro na deleção de dados');
      } else {
        console.log('deleteAccount: Dados do usuário deletados com sucesso');
      }

      // 3. Tentar deletar arquivos de imagem do usuário (se existirem)
      console.log('deleteAccount: Verificando arquivos de imagem...');
      try {
        const { data: files } = await supabase.storage
          .from('user-images')
          .list('', {
            search: userData.id
          });

        if (files && files.length > 0) {
          console.log('deleteAccount: Deletando', files.length, 'arquivos de imagem');
          const fileNames = files.map(file => file.name);
          const { error: removeError } = await supabase.storage
            .from('user-images')
            .remove(fileNames);
          
          if (removeError) {
          } else {
            console.log('deleteAccount: Arquivos de imagem deletados com sucesso');
          }
        } else {
          console.log('deleteAccount: Nenhum arquivo de imagem encontrado');
        }
      } catch (storageError) {
        // Continua mesmo se não conseguir deletar arquivos
      }

      // 4. Fazer logout do RevenueCat
      console.log('deleteAccount: Fazendo logout do RevenueCat...');
      try {
        await revenueCatService.logout();
        console.log('deleteAccount: Logout do RevenueCat realizado');
      } catch (rcError: any) {
        // Se o erro for porque o usuário é anônimo, isso é normal
        if (rcError.message && rcError.message.includes('anonymous')) {
          console.log('deleteAccount: Usuário já é anônimo no RevenueCat, continuando...');
        } else {
        }
        // Continua mesmo se falhar
      }

      // 5. Marcar conta como deletada no banco de dados
      console.log('deleteAccount: Marcando conta como deletada no banco de dados...');
      try {
        // Marcar a conta como deletada modificando os dados do usuário
        const { error: markError } = await supabase
          .from('users')
          .update({ 
            first_name: 'Conta Deletada',
            last_name: 'Usuário',
            profile_url: null
          })
          .eq('id', userData.id);
        
        if (markError) {
        } else {
          console.log('deleteAccount: Conta marcada como deletada no banco');
        }
      } catch (authError) {
      }

      // 6. Fazer logout do Supabase
      console.log('deleteAccount: Fazendo logout do Supabase...');
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
      } else {
        console.log('deleteAccount: Logout do Supabase realizado');
      }

      // 7. Limpar estado local
      console.log('deleteAccount: Limpando estado local...');
      setUser(null);
      setUserData(null);
      setRevenueCatPremium(null);
      setLoading(false);
      console.log('deleteAccount: Estado local limpo');

      console.log('deleteAccount: Processo concluído com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('deleteAccount: Erro geral ao deletar conta:', error);
      return { 
        success: false, 
        error: error.message || 'Erro inesperado ao deletar conta' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData: enhancedUserData, 
      loading, 
      signOut, 
      updatePremiumStatus, 
      deleteAccount,
      refreshPremiumStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 