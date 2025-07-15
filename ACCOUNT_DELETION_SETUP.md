# Configuração da Funcionalidade de Deletar Conta

## Visão Geral

Esta funcionalidade permite que os usuários deletem suas contas diretamente no aplicativo, atendendo aos requisitos do Google Play Console.

## Como Funciona na Prática

### Processo de Deletar Conta
1. **Deleta dados do usuário** na tabela `users` do Supabase
2. **Marca a conta como deletada** adicionando `deleted_at` e alterando o email
3. **Deleta arquivos de imagem** do usuário no storage
4. **Faz logout** de todos os serviços (RevenueCat, Supabase)
5. **Limpa estado local** do app

### Proteções Implementadas
- **Verificação no login**: Usuários deletados não conseguem fazer login
- **Verificação no AuthContext**: Se detectar conta deletada, faz logout automático
- **Marcação no banco**: Campo `deleted_at` impede reutilização da conta

## Implementação Simplificada

### Funcionalidade Principal
- **Localização**: `src/screens/account/index.tsx`
- **Acesso**: Menu "Minha Conta" → Botão "Deletar sua conta"
- **Recursos**:
  - Botão simples de texto vermelho sublinhado
  - Popup de confirmação com avisos
  - Confirmação com senha
  - Verificação de assinaturas ativas
  - Limpeza completa de dados

### Função de Deletar Conta
- **Localização**: `src/contexts/AuthContext.tsx`
- **Recursos**:
  - Verificação de assinaturas ativas
  - Deletar dados do usuário no Supabase
  - Marcar conta como deletada (`deleted_at`)
  - Deletar arquivos de imagem
  - Logout do RevenueCat
  - Logout do Supabase

### Proteções de Segurança
- **Localização**: `src/screens/auth/login.tsx` e `src/contexts/AuthContext.tsx`
- **Recursos**:
  - Verifica `deleted_at` no login
  - Impede login de contas deletadas
  - Logout automático se detectar conta deletada

## Fluxo de Deletar Conta

1. **Usuário acessa**: Menu "Minha Conta"
2. **Clica em**: "Deletar sua conta" (texto vermelho sublinhado)
3. **Vê popup**: Com avisos sobre irreversibilidade
4. **Confirma**: Primeira confirmação
5. **Digita senha**: Para confirmar a ação
6. **Sistema executa**:
   - Verifica assinaturas ativas
   - Deleta dados do usuário
   - Marca conta como deletada
   - Deleta arquivos de imagem
   - Faz logout de todos os serviços
   - Redireciona para tela de login

## Configuração no Google Play Console

### 1. Acesse o Play Console
- Vá para [Google Play Console](https://play.google.com/console)
- Selecione seu app "Zenity"

### 2. Configure a URL de Deletar Conta
- Navegue para: **Política do app** → **Privacidade e segurança**
- Procure por: **"Deletar conta"** ou **"Account deletion"**
- Adicione a URL: `https://seu-dominio.com/delete-account`

### 3. Configuração Alternativa (se necessário)
Se o Google Play Console não aceitar a URL deep link, você pode:

#### Opção A: URL Web
- Criar uma página web simples: `https://zenity.app/delete-account`
- A página redireciona para o app usando: `zenity://delete-account`

#### Opção B: Email de Suporte
- Configurar email: `suporte@hnospps.com`
- Processo manual de deletar conta via email

## Implementação Técnica

### Estrutura de Arquivos
```
src/
├── contexts/
│   └── AuthContext.tsx              # Função deleteAccount + proteções
├── screens/account/
│   └── index.tsx                    # Tela principal + botão deletar
├── screens/auth/
│   └── login.tsx                    # Verificação de conta deletada
└── stacks/
    └── accountStack.tsx             # Navegação
```

### Dependências
- `@supabase/supabase-js` - Autenticação e banco de dados
- `react-native-purchases` - RevenueCat para assinaturas
- `@react-navigation/stack` - Navegação

### Segurança
- ✅ Verificação de senha
- ✅ Confirmação dupla
- ✅ Verificação de assinaturas ativas
- ✅ Limpeza completa de dados
- ✅ Marcação de conta como deletada
- ✅ Proteção contra re-login
- ✅ Logout automático de todos os serviços

## URLs para Configurar

### 1. Deep Link do App
```
zenity://delete-account
```

### 2. Página Web (se necessário)
```
https://zenity.app/delete-account
```

### 3. Email de Suporte
```
suporte@hnospps.com
```

## Testes Recomendados

### 1. Teste de Usuário Normal
- [ ] Criar conta
- [ ] Acessar "Minha Conta"
- [ ] Clicar em "Deletar sua conta"
- [ ] Verificar popup de confirmação
- [ ] Tentar deletar conta
- [ ] Verificar se dados foram removidos
- [ ] Tentar fazer login novamente (deve ser bloqueado)

### 2. Teste de Usuário Premium
- [ ] Criar conta premium
- [ ] Tentar deletar conta
- [ ] Verificar se bloqueia com assinatura ativa
- [ ] Cancelar assinatura
- [ ] Deletar conta com sucesso

### 3. Teste de Recuperação
- [ ] Deletar conta
- [ ] Tentar fazer login
- [ ] Verificar se não consegue acessar
- [ ] Verificar se aparece mensagem "Conta Deletada"

## Troubleshooting

### Problema: Erro ao deletar dados do usuário
**Solução**: Verificar permissões RLS no Supabase

### Problema: Assinatura não é detectada
**Solução**: Verificar configuração do RevenueCat

### Problema: Arquivos não são deletados
**Solução**: Verificar permissões do bucket de storage

### Problema: Usuário consegue fazer login após deletar
**Solução**: Verificar se o campo `deleted_at` está sendo preenchido corretamente

### Problema: Popup não aparece
**Solução**: Verificar se Alert está sendo importado corretamente

## Próximos Passos

1. **Testar** a funcionalidade em ambiente de desenvolvimento
2. **Configurar** URL no Play Console
3. **Criar** página web (se necessário)
4. **Configurar** email de suporte
5. **Publicar** nova versão do app
6. **Monitorar** uso da funcionalidade
7. **Coletar feedback** dos usuários

## Contato

Para dúvidas ou problemas:
- Email: suporte@hnospps.com
- Documentação: Este arquivo
- Código: Repositório do projeto 