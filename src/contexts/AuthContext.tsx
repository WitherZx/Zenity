import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { getSupabaseClient } from '../config/supabase';
import RevenueCatService from '../services/revenueCatService';
import { useTranslation } from 'react-i18next';

interface AuthContextData {
  user: any;
  userData: any;
  loading: boolean;
  signOut: () => Promise<void>;
  clearAuthState: () => Promise<void>;
  updatePremiumStatus: (isPremium: boolean) => Promise<void>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshPremiumStatus: () => Promise<void>;
  forceRefreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  userData: null,
  loading: true,
  signOut: async () => {},
  clearAuthState: async () => {},
  updatePremiumStatus: async () => {},
  deleteAccount: async () => ({ success: false }),
  refreshPremiumStatus: async () => {},
  forceRefreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revenueCatPremium, setRevenueCatPremium] = useState<boolean | null>(null);
  const [revenueCatLoading, setRevenueCatLoading] = useState(true);
  const revenueCatService = RevenueCatService.getInstance();
  const { t } = useTranslation();

  // MÉTODO PARA SINCRONIZAR STATUS
  const refreshPremiumStatus = async () => {
    try {
      const supabase = getSupabaseClient();
      const isAvailable = await RevenueCatService.isServiceAvailable();
      if (isAvailable) {
        const rcStatus = await revenueCatService.checkPremiumStatus();
        setRevenueCatPremium(rcStatus);
        
        // Sincronizar com Supabase se diferente
        if (userData && rcStatus !== userData.is_premium) {
          await supabase
            .from('users')
            .update({ is_premium: rcStatus })
            .eq('id', userData.id);
          
          setUserData((prev: any) => prev ? { ...prev, is_premium: rcStatus } : null);
        }
      } else {
        setRevenueCatPremium(null);
      }
    } catch (error) {
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

    // Timeout de segurança para liberar o loading
    const loadingTimeout = setTimeout(() => {
      console.log('[AUTH] Timeout de segurança - liberando loading');
      setLoading(false);
    }, 10000); // 10 segundos

    try {
      const supabase = getSupabaseClient();
      console.log('[AUTH] Buscando perfil do usuário:', authUser.id);
      
      // Inicializa o RevenueCat com o ID do usuário (com tratamento de erro)
      try {
        await revenueCatService.initialize(authUser.id);
        console.log('[AUTH] RevenueCat inicializado para:', authUser.id);
      } catch (rcError) {
        console.log('[AUTH] RevenueCat initialization failed, continuing without it');
      }

      // Busca o perfil completo do Supabase
      let { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      console.log('[AUTH] Dados do perfil carregados:', data);

      // Se não existe registro na tabela users, cria um
      if (!data) {
        console.log('[AUTH] Usuário não encontrado na tabela users, criando...');
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([
            {
              id: authUser.id,
              email: authUser.email,
              first_name: authUser.user_metadata?.full_name?.split(' ')[0] || 'Usuário',
              last_name: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
              is_premium: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();
        
        if (error) {
          console.error('[AUTH] Erro ao criar usuário:', error);
        } else {
          data = newUser;
          console.log('[AUTH] Usuário criado com sucesso:', data);
        }
      }

      // Verifica se a conta foi deletada
      if (data && data.first_name === 'Conta Deletada') {
        await supabase.auth.signOut();
        setUser(null);
        setUserData(null);
        setRevenueCatPremium(null);
        setLoading(false);
        clearTimeout(loadingTimeout);
        return;
      }

      // Define dados do usuário primeiro
      setUser(authUser);
      setUserData(data);
      // Só libera o loading após tudo
      setLoading(false);
      clearTimeout(loadingTimeout);
      console.log('[AUTH] Perfil e estado definidos, loading liberado');
    } catch (error) {
      console.error('[AUTH] Erro ao buscar perfil:', error);
      // Em caso de erro, ainda define o usuário básico
      setUser(authUser);
      setUserData({ ...authUser, is_premium: false });
      setLoading(false);
      clearTimeout(loadingTimeout);
    }
  }

  // USEEFFECT PARA LISTENERS
  useEffect(() => {
    if (userData) {
      refreshPremiumStatus();

      // Listener para mudanças no RevenueCat
      const customerInfoListener = revenueCatService.addCustomerInfoUpdateListener(
        () => {
          refreshPremiumStatus();
        }
      );

      // Listener para AppState
      const appStateListener = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          refreshPremiumStatus();
        }
      });

      return () => {
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
      const supabase = getSupabaseClient();
      // Atualiza o status no Supabase
      const { error } = await supabase
        .from('users')
        .update({ is_premium: isPremium })
        .eq('id', userData.id);

      if (error) throw error;

      // Atualiza o estado local
      setUserData((prev: any) => ({ ...prev, is_premium: isPremium }));
    } catch (error) {
      console.error('AuthContext: Failed to update premium status:', error);
    }
  };

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
        console.log('[AUTH] Sessão inicial:', session?.user?.id || 'null');
    fetchUserProfile(session?.user ?? null);
      } catch (error) {
        console.error('[AUTH] Erro ao obter sessão inicial:', error);
        fetchUserProfile(null);
      }
    };
    
    getInitialSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AUTH] AuthStateChange event:', event, 'user:', session?.user?.id || 'null');
      
      // Forçar atualização imediata do estado
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[AUTH] Usuário logado, atualizando estado...');
        fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('[AUTH] Usuário deslogado, limpando estado...');
        setUser(null);
        setUserData(null);
        setRevenueCatPremium(null);
        setLoading(false);
      } else {
      fetchUserProfile(session?.user ?? null);
      }
    });
    subscription.unsubscribe();

    return () => {
      console.log('[AUTH] Cleanup listener');
      subscription.unsubscribe();
    };
  }, []);

  const clearAuthState = async () => {
    try {
      console.log('[AUTH] Iniciando limpeza do estado...');
      
      // Limpar RevenueCat PRIMEIRO (antes do usuário se tornar anônimo)
      try {
        console.log('[AUTH] Fazendo logout do RevenueCat...');
      await revenueCatService.logout();
        console.log('[AUTH] Logout do RevenueCat realizado');
        
        // Aguardar um pouco antes de reinicializar
        await new Promise(resolve => setTimeout(resolve, 200));
        await revenueCatService.reinitialize();
        console.log('[AUTH] RevenueCat reinicializado');
      } catch (error) {
        console.log('[AUTH] RevenueCat cleanup failed, continuing...', error);
      }
      
      // Limpar Supabase DEPOIS
      console.log('[AUTH] Fazendo logout do Supabase...');
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      console.log('[AUTH] Logout do Supabase realizado');
      
      // Limpar estado local por último
      console.log('[AUTH] Limpando estado local...');
      setUser(null);
      setUserData(null);
      setRevenueCatPremium(null);
      setLoading(false);
      console.log('[AUTH] Estado limpo com sucesso');
      
    } catch (error) {
      console.error('[AUTH] Erro ao limpar estado:', error);
      // Mesmo com erro, limpar o estado
    setUser(null);
    setUserData(null);
    setRevenueCatPremium(null);
    setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await clearAuthState();
  };

  const deleteAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('deleteAccount: Iniciando processo de deletar conta');
    
    if (!userData) {
      console.log('deleteAccount: Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    console.log('deleteAccount: Usuário ID:', userData.id);

    try {
      const supabase = getSupabaseClient();
      // 1. Verificar se o usuário tem assinatura ativa no RevenueCat
      console.log('deleteAccount: Verificando assinatura ativa...');
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        if (revenueCatService.hasActiveSubscription(customerInfo)) {
          console.log('deleteAccount: Usuário tem assinatura ativa, bloqueando exclusão');
          return { 
            success: false, 
            error: t('account.activeSubscriptionError') 
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
          const fileNames = files.map((file: any) => file.name);
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

      // 4. Fazer logout do RevenueCat PRIMEIRO
      console.log('deleteAccount: Fazendo logout do RevenueCat...');
      try {
        await revenueCatService.logout();
        console.log('deleteAccount: Logout do RevenueCat realizado');
      } catch (rcError: any) {
        // Se o erro for porque o usuário é anônimo, isso é normal
        if (rcError.message && rcError.message.includes('anonymous')) {
          console.log('deleteAccount: Usuário já é anônimo no RevenueCat, continuando...');
        } else {
          console.log('deleteAccount: Erro no logout do RevenueCat:', rcError);
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
          console.log('deleteAccount: Erro ao marcar conta como deletada:', markError);
        } else {
          console.log('deleteAccount: Conta marcada como deletada no banco');
        }
      } catch (authError) {
        console.log('deleteAccount: Erro ao marcar conta como deletada:', authError);
      }

      // 6. Fazer logout do Supabase DEPOIS
      console.log('deleteAccount: Fazendo logout do Supabase...');
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.log('deleteAccount: Erro no logout do Supabase:', signOutError);
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

  const forceRefreshUser = async () => {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session?.user) {
      fetchUserProfile(session.user);
    } else {
      setUser(null);
      setUserData(null);
      setRevenueCatPremium(null);
      setLoading(false);
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
      refreshPremiumStatus,
      clearAuthState,
      forceRefreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 