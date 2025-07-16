# Configuração do RevenueCat - Zenity

## ✅ O que já foi implementado

- ✅ Integração com RevenueCat SDK
- ✅ Tela premium com seleção de planos
- ✅ Sistema de compras e restauração
- ✅ Sincronização com Supabase
- ✅ Tratamento de erros e loading states

## 🔧 Configuração no RevenueCat Dashboard

### 1. Acesse o RevenueCat Dashboard
- Vá para [app.revenuecat.com](https://app.revenuecat.com/)
- Faça login ou crie uma conta

### 2. Crie um novo projeto
- Clique em "New Project"
- Nome: "Zenity"
- Platform: iOS & Android

### 3. Configure o Entitlement
- Vá em "Entitlements"
- Crie um novo entitlement:
  - **ID**: `premium`
  - **Display Name**: "Premium Access"
  - **Description**: "Access to premium features"

### 4. Configure os Produtos

#### iOS (App Store Connect)
1. Vá em "Products" → "Add Product"
2. Crie os seguintes produtos:
   - **ID**: `premium_monthly`
   - **Type**: Auto-Renewable Subscription
   - **Price**: R$ 9,90/mês
   
   - **ID**: `premium_yearly`
   - **Type**: Auto-Renewable Subscription
   - **Price**: R$ 99,90/ano
   
   - **ID**: `premium_weekly`
   - **Type**: Auto-Renewable Subscription
   - **Price**: R$ 2,90/semana

#### Android (Google Play Console)
1. Vá em "Products" → "Add Product"
2. Crie os mesmos produtos com os mesmos IDs

### 5. Configure o Offering
- Vá em "Offerings"
- Crie um novo offering:
  - **ID**: `default`
  - **Display Name**: "Premium Plans"
- Adicione os pacotes:
  - **Package ID**: `monthly`
  - **Product**: `premium_monthly`
  
  - **Package ID**: `yearly`
  - **Product**: `premium_yearly`
  
  - **Package ID**: `weekly`
  - **Product**: `premium_weekly`

### 6. Configure as lojas

#### App Store Connect
1. Vá em "App Store Connect" → "My Apps" → "Zenity"
2. "Features" → "In-App Purchases"
3. Crie os produtos com os mesmos IDs do RevenueCat
4. Configure os preços e descrições

#### Google Play Console
1. Vá em "Google Play Console" → "Zenity"
2. "Monetize" → "Products" → "Subscriptions"
3. Crie os produtos com os mesmos IDs

## 🚀 Testando

### 1. Build do app
```bash
# Para iOS
npx expo run:ios

# Para Android
npx expo run:android
```

### 2. Teste de Sandbox
- Use contas de teste das lojas
- iOS: Use Sandbox Testers do App Store Connect
- Android: Use contas de teste do Google Play

### 3. Verificações
- ✅ Os planos aparecem na tela premium
- ✅ É possível selecionar um plano
- ✅ A compra é processada
- ✅ O status premium é atualizado
- ✅ A restauração de compras funciona

## 📱 Funcionalidades implementadas

### Tela Premium
- **Carregamento dinâmico** dos planos do RevenueCat
- **Seleção visual** de planos
- **Botão de compra** com loading state
- **Restauração de compras**
- **Status premium** em tempo real
- **Tratamento de erros** completo

### Integração com Supabase
- **Sincronização automática** do status premium
- **Atualização em tempo real** no banco de dados
- **Persistência** do status entre sessões

### RevenueCat Service
- **Singleton pattern** para gerenciamento centralizado
- **Inicialização automática** no app
- **Verificação de assinaturas ativas**
- **Logout automático** ao sair do app

## 🔍 Troubleshooting

### Erro: "No offerings available"
- Verifique se o offering `default` foi criado no RevenueCat
- Confirme se os produtos estão associados aos pacotes

### Erro: "Product not found"
- Verifique se os IDs dos produtos estão corretos
- Confirme se os produtos foram aprovados nas lojas

### Erro: "Purchase failed"
- Verifique se está usando uma conta de teste
- Confirme se o app está configurado corretamente nas lojas

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console
2. Confirme a configuração no RevenueCat Dashboard
3. Teste com contas de sandbox
4. Verifique se os produtos estão aprovados nas lojas 