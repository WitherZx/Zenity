// Configuração dos produtos e entitlements do RevenueCat

export const REVENUECAT_CONFIG = {
  // Nome do entitlement que será verificado para status premium
  ENTITLEMENT_ID: 'premium',
  
  // IDs dos produtos (apenas semanal)
  PRODUCT_IDS: {
    PREMIUM_WEEKLY: 'premium_weekly',
  },
  
  // Nome do offering principal
  OFFERING_ID: 'default',
  
  // Configurações por região
  REGIONS: {
    brazil: {
      currency: 'BRL',
      symbol: 'R$',
      fallbackPrice: 'R$ 19,90/semana',
      period: 'semana'
    },
    usa: {
      currency: 'USD',
      symbol: '$',
      fallbackPrice: '$4.99/week',
      period: 'week'
    }
  }
};

// Função para verificar se um produto é de assinatura
export const isSubscriptionProduct = (productId: string): boolean => {
  return productId.includes('weekly');
};

// Função para obter o tipo de assinatura baseado no ID do produto
export const getSubscriptionType = (productId: string): string => {
  if (productId.includes('weekly')) return 'Semanal';
  return 'Premium';
};

// Função para obter a descrição do produto
export const getProductDescription = (productId: string): string => {
  switch (productId) {
    case REVENUECAT_CONFIG.PRODUCT_IDS.PREMIUM_WEEKLY:
      return 'Assinatura semanal do Zenity Premium';
    default:
      return 'Zenity Premium';
  }
}; 