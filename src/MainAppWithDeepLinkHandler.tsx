import React, { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { getSupabaseClient } from './config/supabase';
import { useAuth } from './contexts/AuthContext';
import Navigation from './navigation';

export default function MainAppWithDeepLinkHandler() {
  const { forceRefreshUser } = useAuth();

  useEffect(() => {
    const subscription = Linking.addEventListener('url', async (event) => {
      console.log('[APP] Deep link recebido:', event.url);
      try {
        const url = event.url;
        // Extrai parâmetros do hash (após #)
        const paramsString = url.split('#')[1];
        if (paramsString) {
          const paramPairs = paramsString.split('&').map(p => p.split('='));
          const paramObj = Object.fromEntries(paramPairs);
          console.log('[APP] Parâmetros do deep link:', paramObj);
          const access_token = paramObj['access_token'];
          const refresh_token = paramObj['refresh_token'];
          if (access_token && refresh_token) {
            // Seta a sessão manualmente no Supabase
            await getSupabaseClient().auth.setSession({
              access_token,
              refresh_token,
            });
            console.log('[APP] Sessão restaurada manualmente!');
            // Força atualização do contexto de autenticação
            if (typeof forceRefreshUser === 'function') {
              await forceRefreshUser();
              console.log('[APP] Contexto de usuário forçado!');
            }
          } else {
            console.log('[APP] Tokens não encontrados no deep link.');
          }
        } else {
          console.log('[APP] Deep link não contém parâmetros.');
        }
      } catch (e) {
        console.log('[APP] Erro ao processar parâmetros do deep link:', e);
      }
      // Verificar se é um callback do OAuth
      if (event.url.includes('zenity://')) {
        console.log('[APP] Callback OAuth detectado:', event.url);
        // Forçar restauração da sessão do Supabase
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        console.log('[APP] Sessão após deep link:', data.session);
      }
    });
    return () => subscription.remove();
  }, [forceRefreshUser]);

  return <Navigation />;
} 