import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Credenciais do Brasil (atual)
const BRASIL_SUPABASE_URL = 'https://cueqhaexkoojemvewdki.supabase.co';
const BRASIL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZXFoYWV4a29vamVtdmV3ZGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NjI4MDgsImV4cCI6MjA2MjQzODgwOH0.L69J1V49vFNE8j3HnopHLqf4MWBQ9AlRu7VBoIlBlcE';

// Credenciais dos EUA (reais)
const USA_SUPABASE_URL = 'https://ouxrcqjejncpmlaehonk.supabase.co';
const USA_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91eHJjcWplam5jcG1sYWVob25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5MjMsImV4cCI6MjA2NDYyNTkyM30.WFXH4Y4wS8-5rR3jA56Goa_bbbOJ4Ky26cH43fd_5UI';

// Configuração de regiões
export const SUPABASE_CONFIGS = {
  brazil: {
    url: BRASIL_SUPABASE_URL,
    anonKey: BRASIL_SUPABASE_ANON_KEY,
  },
  usa: {
    url: USA_SUPABASE_URL,
    anonKey: USA_SUPABASE_ANON_KEY,
  },
};

// Função para obter configuração baseada na região
export const getSupabaseConfig = async () => {
  try {
    const savedRegion = await AsyncStorage.getItem('selectedRegion');
    const region = (savedRegion as 'brazil' | 'usa') || 'brazil';
    const config = SUPABASE_CONFIGS[region];
    return config;
  } catch (error) {
    console.error('Erro ao obter configuração do Supabase:', error);
    // Em caso de erro, usar Brasil como padrão
    return SUPABASE_CONFIGS.brazil;
  }
};

// Cliente Supabase inicial (será reconfigurado baseado na região)
let supabase = createClient(BRASIL_SUPABASE_URL, BRASIL_SUPABASE_ANON_KEY, {
  localStorage: AsyncStorage,
});

// Função para reconfigurar Supabase baseado na região
export const reconfigureSupabase = async () => {
  try {
    const config = await getSupabaseConfig();
    
    // Criar novo cliente com configuração limpa
    supabase = createClient(config.url, config.anonKey, {
      localStorage: AsyncStorage,
    });
    
    return supabase;
  } catch (error) {
    console.error('Erro ao reconfigurar Supabase:', error);
    throw error;
  }
};

// Função para obter cliente atual
export const getSupabaseClient = () => {
  return supabase;
};

// Export do cliente padrão para compatibilidade
export { supabase };

// Função para testar qual região está sendo usada
export const testCurrentRegion = async () => {
  try {
    const config = await getSupabaseConfig();
    const supabase = getSupabaseClient();
    
    // Testar uma consulta simples
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    return {
      region: config.url.includes('cueqhaex') ? 'brazil' : 'usa',
      url: config.url,
      testSuccess: !error,
      error: error?.message
    };
  } catch (error: any) {
    console.error('🧪 Erro no teste de região:', error);
    return { error: error.message };
  }
};