import { getSupabaseClient, testCurrentRegion } from '../config/supabase';

// Função para testar conectividade do Supabase
export const testSupabaseConnection = async () => {
  console.log('🧪 Testando conectividade do Supabase...');
  
  try {
    const supabase = getSupabaseClient();
    
    // Teste 1: Verificar se o cliente está funcionando
    console.log('📡 Teste 1: Verificando cliente Supabase...');
    const { data: healthData, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Erro na conectividade:', healthError);
      return { success: false, error: healthError.message };
    }
    
    console.log('✅ Cliente Supabase funcionando');
    
    // Teste 2: Verificar região atual
    console.log('🌍 Teste 2: Verificando região atual...');
    const regionTest = await testCurrentRegion();
    console.log('📍 Região atual:', regionTest);
    
    // Teste 3: Verificar autenticação
    console.log('🔐 Teste 3: Verificando autenticação...');
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    if (session) {
      console.log('✅ Autenticação funcionando');
      console.log('👤 Usuário logado:', session.user?.email || 'sem email');
    } else {
      console.log('✅ Autenticação funcionando');
      console.log('👤 Nenhum usuário logado');
    }
    
    return { 
      success: true, 
      region: regionTest,
      session: session ? 'active' : 'none'
    };
    
  } catch (error: any) {
    console.error('❌ Erro geral no teste:', error);
    return { success: false, error: error.message };
  }
};

// Função para testar login específico
export const testLoginFlow = async (email: string, password: string) => {
  console.log('🧪 Testando fluxo de login...');
  
  try {
    const supabase = getSupabaseClient();
    
    // Teste de login
    const { user, session, error } = await supabase.auth.signIn({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: error.message };
    }
    
    if (user) {
      console.log('✅ Login bem-sucedido');
      console.log('👤 Usuário:', user.email);
      console.log('🆔 ID:', user.id);
      
      // Teste de busca de perfil
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
      } else {
        console.log('✅ Perfil encontrado:', userData);
      }
      
      // Fazer logout para limpar
      await supabase.auth.signOut();
      console.log('🚪 Logout realizado');
      
      return { success: true, user, profile: userData };
    }
    
    return { success: false, error: 'Usuário não retornado' };
    
  } catch (error: any) {
    console.error('❌ Erro no teste de login:', error);
    return { success: false, error: error.message };
  }
}; 

// Função para testar o listener de autenticação
export const testAuthListener = async () => {
  console.log('🧪 Testando listener de autenticação...');
  
  try {
    const supabase = getSupabaseClient();
    
    // Testar se o listener está funcionando
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 AuthStateChange disparado:', event, 'user:', session?.user?.id || 'null');
    });
    
    // Aguardar um pouco para ver se há mudanças
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Limpar listener
    subscription.unsubscribe();
    
    return { success: true, message: 'Listener configurado' };
  } catch (error: any) {
    console.error('❌ Erro no teste do listener:', error);
    return { success: false, error: error.message };
  }
}; 