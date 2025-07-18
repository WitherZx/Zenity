import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIGS } from '../config/supabase';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_url?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: any;
  expires_at?: number | string;
}

export class CrossRegionAuthService {
  private static instance: CrossRegionAuthService;

  static getInstance(): CrossRegionAuthService {
    if (!CrossRegionAuthService.instance) {
      CrossRegionAuthService.instance = new CrossRegionAuthService();
    }
    return CrossRegionAuthService.instance;
  }

  /**
   * Salva sessão de autenticação por região
   */
  async saveRegionSession(region: 'brazil' | 'usa', session: AuthSession): Promise<void> {
    try {
      const key = `auth_session_${region}`;
      await AsyncStorage.setItem(key, JSON.stringify(session));
      console.log(`💾 Sessão salva para região: ${region}`);
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
    }
  }

  /**
   * Recupera sessão de autenticação por região
   */
  async getRegionSession(region: 'brazil' | 'usa'): Promise<AuthSession | null> {
    try {
      const key = `auth_session_${region}`;
      const sessionData = await AsyncStorage.getItem(key);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        console.log(`🔑 Sessão recuperada para região: ${region}`);
        return session;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao recuperar sessão:', error);
      return null;
    }
  }

  /**
   * Verifica se usuário existe na região de destino
   */
  async checkUserExistsInRegion(email: string, targetRegion: 'brazil' | 'usa'): Promise<UserData | null> {
    try {
      console.log(`🔍 Verificando se usuário ${email} existe na região: ${targetRegion}`);
      
      const config = SUPABASE_CONFIGS[targetRegion];
      const supabase = createClient(config.url, config.anonKey);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Erro ao verificar usuário:', error);
        return null;
      }

      if (data) {
        console.log(`✅ Usuário encontrado na região ${targetRegion}`);
        return data as UserData;
      } else {
        console.log(`❌ Usuário NÃO encontrado na região ${targetRegion}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar usuário:', error);
      return null;
    }
  }

  /**
   * Cria conta automaticamente na região de destino
   */
  async createAccountInRegion(
    email: string, 
    password: string,
    userData: UserData, 
    targetRegion: 'brazil' | 'usa'
  ): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    try {
      console.log(`🆕 Criando conta para ${email} na região: ${targetRegion}`);
      
      const config = SUPABASE_CONFIGS[targetRegion];
      const supabase = createClient(config.url, config.anonKey);

      // 1. Criar conta no Authentication
      const { user: authUser, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Erro ao criar auth:', authError);
        return { success: false, error: authError.message };
      }

      if (!authUser) {
        return { success: false, error: 'Falha ao criar usuário' };
      }

      // 2. Criar registro na tabela users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          profile_url: userData.profile_url,
          is_premium: userData.is_premium,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (userError) {
        console.error('❌ Erro ao criar user record:', userError);
        return { success: false, error: userError.message };
      }

      // 3. Fazer login automático
      const { session: loginSession, user: loginUser, error: loginError } = await supabase.auth.signIn({
        email,
        password,
      });

      if (loginError || !loginSession) {
        console.error('❌ Erro ao fazer login:', loginError);
        return { success: false, error: loginError?.message || 'Falha no login' };
      }

      const session: AuthSession = {
        access_token: loginSession.access_token || '',
        refresh_token: loginSession.refresh_token || '',
        user: loginUser,
        expires_at: loginSession.expires_at,
      };

      console.log(`✅ Conta criada com sucesso na região ${targetRegion}!`);
      return { success: true, session };

    } catch (error) {
      console.error('❌ Erro geral ao criar conta:', error);
      return { success: false, error: 'Erro inesperado' };
    }
  }

  /**
   * Obtém dados do usuário da região atual
   */
  async getCurrentUserData(currentRegion: 'brazil' | 'usa'): Promise<UserData | null> {
    try {
      const config = SUPABASE_CONFIGS[currentRegion];
      const supabase = createClient(config.url, config.anonKey);

      const user = supabase.auth.user();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar dados do usuário:', error);
        return null;
      }

      return data as UserData;
    } catch (error) {
      console.error('❌ Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  /**
   * Restaura sessão na região de destino
   */
  async restoreSessionInRegion(session: AuthSession, targetRegion: 'brazil' | 'usa'): Promise<boolean> {
    try {
      console.log(`🔄 Restaurando sessão na região: ${targetRegion}`);
      
      const config = SUPABASE_CONFIGS[targetRegion];
      const supabase = createClient(config.url, config.anonKey);

      const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      if (error) {
        console.error('❌ Erro ao restaurar sessão:', error);
        return false;
      }

      console.log(`✅ Sessão restaurada na região ${targetRegion}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao restaurar sessão:', error);
      return false;
    }
  }

  /**
   * Limpa todas as sessões salvas
   */
  async clearAllSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_session_brazil');
      await AsyncStorage.removeItem('auth_session_usa');
      console.log('🧹 Todas as sessões foram limpas');
    } catch (error) {
      console.error('❌ Erro ao limpar sessões:', error);
    }
  }
} 