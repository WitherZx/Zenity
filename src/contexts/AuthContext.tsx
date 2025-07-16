import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../config/supabase';
import RevenueCatService from '../services/revenueCatService';

interface AuthContextData {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
  updatePremiumStatus: (isPremium: boolean) => Promise<void>;
  refreshPremiumStatus: () => Promise<void>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  loading: true,
  signOut: async () => {},
  updatePremiumStatus: async () => {},
  refreshPremiumStatus: async () => {},
  deleteAccount: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const revenueCatService = RevenueCatService.getInstance();

  async function fetchUserProfile(authUser: any) {
    console.log('AuthContext: fetchUserProfile iniciado', authUser ? 'com usuário' : 'sem usuário');
    
    try {
      if (!authUser) {
        console.log('AuthContext: Nenhum usuário, definindo como null');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('AuthContext: Processando usuário ID:', authUser.id);

      // Inicializa o RevenueCat com o ID do usuário (com tratamento de erro)
      try {
        console.log('AuthContext: Inicializando RevenueCat...');
        await revenueCatService.initialize(authUser.id);
        console.log('AuthContext: RevenueCat inicializado com sucesso');
      } catch (rcError) {
        console.log('AuthContext: RevenueCat falhou, continuando sem:', rcError);
      }

      // Busca o perfil completo do Supabase com timeout
      console.log('AuthContext: Buscando perfil no Supabase...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.log('AuthContext: Erro ao buscar perfil, usando dados básicos:', error);
        setUser({ ...authUser, is_premium: false });
        setLoading(false);
        return;
      }

      console.log('AuthContext: Perfil encontrado:', data ? 'sim' : 'não');

      // Verifica se a conta foi deletada
      if (data && data.first_name === 'Conta Deletada') {
        console.log('AuthContext: Conta deletada detectada, fazendo logout');
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.log('AuthContext: Erro no logout:', signOutError);
        }
        setUser(null);
        setLoading(false);
        return;
      }

      // Verifica o status premium no RevenueCat (FONTE DA VERDADE)
      let isPremium = false;
      let shouldUpdateSupabase = false;
      
      // Primeiro verifica se o RevenueCat está disponível
      if (revenueCatService.isServiceAvailable()) {
        try {
          console.log('AuthContext: Verificando status premium no RevenueCat...');
          const customerInfo = await revenueCatService.getCustomerInfo();
          isPremium = revenueCatService.isPremium(customerInfo);
          console.log('AuthContext: Status premium do RevenueCat:', isPremium);
          
          // Verifica se precisa sincronizar com o Supabase
          const supabasePremiumStatus = data?.is_premium || false;
          if (isPremium !== supabasePremiumStatus) {
            console.log(`AuthContext: Status dessinc! RevenueCat: ${isPremium}, Supabase: ${supabasePremiumStatus}`);
            shouldUpdateSupabase = true;
          }
        } catch (rcError) {
          console.log('AuthContext: Erro no RevenueCat, usando fallback do Supabase:', rcError);
          isPremium = data?.is_premium || false;
        }
      } else {
        console.log('AuthContext: RevenueCat não disponível, usando status do Supabase');
        console.log('AuthContext: Motivo:', revenueCatService.getLastError());
        isPremium = data?.is_premium || false;
      }
      
      // Sincroniza o Supabase com o RevenueCat se necessário
      if (shouldUpdateSupabase) {
        try {
          console.log(`AuthContext: Sincronizando Supabase: ${isPremium}`);
          const { error: updateError } = await supabase
            .from('users')
            .update({ is_premium: isPremium })
            .eq('id', authUser.id);
          
          if (updateError) {
            console.log('AuthContext: Erro ao sincronizar Supabase:', updateError);
          } else {
            console.log('AuthContext: Supabase sincronizado com sucesso');
            // Atualiza os dados locais também
            data.is_premium = isPremium;
          }
        } catch (syncError) {
          console.log('AuthContext: Erro ao sincronizar com Supabase:', syncError);
        }
      }

      console.log('AuthContext: Definindo usuário final com premium:', isPremium);
      setUser({ ...authUser, ...data, is_premium: isPremium });
      setLoading(false);
    } catch (error) {
      console.error('AuthContext: Erro geral em fetchUserProfile:', error);
      // SEMPRE define um usuário e para o loading
      if (authUser) {
        setUser({ ...authUser, is_premium: false });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }

  const updatePremiumStatus = async (isPremium: boolean) => {
    if (!user) return;

    try {
      // Atualiza o status no Supabase
      const { error } = await supabase
        .from('users')
        .update({ is_premium: isPremium })
        .eq('id', user.id);

      if (error) throw error;

      // Atualiza o estado local
      setUser((prev: any) => ({ ...prev, is_premium: isPremium }));
    } catch (error) {
    }
  };

  // Método para forçar verificação do status premium no RevenueCat
  const refreshPremiumStatus = async () => {
    if (!user?.id) return;

    console.log('AuthContext: Forçando verificação do status premium...');
    
    if (revenueCatService.isServiceAvailable()) {
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        const isPremium = revenueCatService.isPremium(customerInfo);
        
        console.log('AuthContext: Status premium atual no RevenueCat:', isPremium);
        
        // Verifica se precisa atualizar
        if (isPremium !== user.is_premium) {
          console.log(`AuthContext: Atualizando status de ${user.is_premium} para ${isPremium}`);
          
          // Atualiza Supabase
          const { error } = await supabase
            .from('users')
            .update({ is_premium: isPremium })
            .eq('id', user.id);
          
          if (!error) {
            // Atualiza estado local
            setUser((prev: any) => ({ ...prev, is_premium: isPremium }));
            console.log('AuthContext: Status premium atualizado com sucesso');
          }
        }
      } catch (error) {
        console.log('AuthContext: Erro ao verificar status premium:', error);
      }
    }
  };

  useEffect(() => {
    // Timeout de segurança para garantir que loading nunca trave
    const timeoutId = setTimeout(() => {
      console.log('AuthContext: Timeout de segurança ativado - forçando loading = false');
      setLoading(false);
      setUser(null);
    }, 10000); // 10 segundos

    // Listener para mudanças automáticas no RevenueCat
    const handleCustomerInfoUpdate = async (customerInfo: any) => {
      console.log('AuthContext: Recebeu atualização automática do RevenueCat');
      if (user?.id) {
        const isPremium = revenueCatService.isPremium(customerInfo);
        console.log('AuthContext: Novo status premium:', isPremium);
        
        // Atualiza o Supabase com o novo status
        try {
          const { error } = await supabase
            .from('users')
            .update({ is_premium: isPremium })
            .eq('id', user.id);
          
          if (!error) {
            // Atualiza o estado do usuário
            setUser((prevUser: any) => ({ ...prevUser, is_premium: isPremium }));
            console.log('AuthContext: Status premium atualizado automaticamente');
          }
        } catch (error) {
          console.log('AuthContext: Erro ao atualizar status automático:', error);
        }
      }
    };

    // Adiciona o listener
    revenueCatService.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);

    // Listener para quando o app ganha foco (volta do background)
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && user?.id) {
        console.log('AuthContext: App ganhou foco, verificando status premium...');
        // Aguarda um pouco para garantir que o RevenueCat sincronizou
        setTimeout(() => {
          refreshPremiumStatus();
        }, 1000);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Checa o usuário atual ao iniciar
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Inicializando autenticação...');
        // Para Supabase v1.x usar session() em vez de getSession()
        const session = supabase.auth.session();
        
        console.log('AuthContext: Sessão obtida:', session ? 'com usuário' : 'sem usuário');
        clearTimeout(timeoutId);
        await fetchUserProfile(session?.user ?? null);
      } catch (error) {
        console.error('AuthContext: Erro crítico na inicialização:', error);
        clearTimeout(timeoutId);
        setUser(null);
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Listener para mudanças de autenticação
    let subscription: any = null;
    try {
      // Para Supabase v1.x, onAuthStateChange retorna diretamente a subscription
      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('AuthContext: Mudança de autenticação detectada:', _event);
        fetchUserProfile(session?.user ?? null);
      });
    } catch (error) {
      console.error('AuthContext: Erro ao configurar listener:', error);
    }

    return () => {
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
      // Remove o listener do RevenueCat
      revenueCatService.removeCustomerInfoUpdateListener(handleCustomerInfoUpdate);
      // Remove o listener do AppState
      appStateSubscription?.remove();
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
    setLoading(false);
  };

  const deleteAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('deleteAccount: Iniciando processo de deletar conta');
    
    if (!user) {
      console.log('deleteAccount: Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    console.log('deleteAccount: Usuário ID:', user.id);

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
        .eq('id', user.id);

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
            search: user.id
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
          .eq('id', user.id);
        
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
    <AuthContext.Provider value={{ user, loading, signOut, updatePremiumStatus, refreshPremiumStatus, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 