import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import RevenueCatService from '../services/revenueCatService';

interface AuthContextData {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
  updatePremiumStatus: (isPremium: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  loading: true,
  signOut: async () => {},
  updatePremiumStatus: async () => {},
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
        console.error('Failed to initialize RevenueCat for user:', rcError);
        // Continua sem o RevenueCat
      }

      // Busca o perfil completo do Supabase
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Verifica o status premium no RevenueCat (com tratamento de erro)
      let isPremium = false;
      try {
        const customerInfo = await revenueCatService.getCustomerInfo();
        isPremium = revenueCatService.isPremium(customerInfo);
      } catch (rcError) {
        console.error('Failed to get customer info:', rcError);
        // Usa o status do Supabase como fallback
        isPremium = data?.is_premium || false;
      }

      setUser({ ...authUser, ...data, is_premium: isPremium });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
      console.error('Error updating premium status:', error);
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
      console.error('Error logging out from RevenueCat:', error);
      // Continua mesmo se o logout do RevenueCat falhar
    }
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, updatePremiumStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 