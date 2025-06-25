import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import RevenueCatService from '../services/revenueCatService';

interface AuthContextData {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
  updatePremiumStatus: (isPremium: boolean) => Promise<void>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  loading: true,
  signOut: async () => {},
  updatePremiumStatus: async () => {},
  deleteAccount: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const revenueCatService = RevenueCatService.getInstance();

  async function fetchUserProfile(authUser: any) {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Inicializa o RevenueCat com o ID do usuário (com tratamento de erro)
      try {
        await revenueCatService.initialize(authUser.id);
      } catch (rcError) {
        // Continua sem o RevenueCat
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
        setLoading(false);
        return;
      }

      // Verifica o status premium no RevenueCat (com tratamento de erro)
      let isPremium = false;
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        isPremium = revenueCatService.isPremium(customerInfo);
      } catch (rcError) {
        // Usa o status do Supabase como fallback
        isPremium = data?.is_premium || false;
      }

      setUser({ ...authUser, ...data, is_premium: isPremium });
      setLoading(false);
    } catch (error) {
      // Em caso de erro, ainda define o usuário básico
      setUser({ ...authUser, is_premium: false });
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
    <AuthContext.Provider value={{ user, loading, signOut, updatePremiumStatus, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 