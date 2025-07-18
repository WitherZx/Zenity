import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { REVENUECAT_CONFIG } from '../config/revenueCatConfig';
import { Platform } from 'react-native';

// Configuração do RevenueCat
const REVENUECAT_API_KEYS = {
  ios: 'appl_CzCErIYUnlBRRIXomVESYkUSyPw',
  android: 'goog_ptnToAbQbitmjJEpeCjMqmsSxtS',
};

class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;
  private static lastError: string | null = null;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  // Verificar se serviço está disponível
  static async isServiceAvailable(): Promise<boolean> {
    try {
      console.log('RevenueCat: Checking service availability...');
      await Purchases.getCustomerInfo();
      console.log('RevenueCat: Service is available');
      this.lastError = null;
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.log('RevenueCat service not available:', errorMsg);
      this.lastError = errorMsg;
      return false;
    }
  }

  // Obter último erro
  static getLastError(): string | null {
    return this.lastError;
  }

  async initialize(userId?: string, region?: 'brazil' | 'usa'): Promise<void> {
    try {
      console.log('RevenueCat: Initializing with userId:', userId || 'anonymous', 'region:', region);
      
      // Verificar se já está inicializado e é o mesmo usuário
      if (this.isInitialized && userId) {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          if (customerInfo.originalAppUserId === userId) {
            console.log('RevenueCat: Already initialized with same user');
            return;
          }
        } catch (error) {
          // Se não conseguir verificar, continuar com a inicialização
        }
      }
      
      // Configurar RevenueCat
      const config: any = {
        apiKey: Platform.OS === 'ios' ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android,
        appUserID: userId,
      };
      
      // Se uma região específica foi fornecida, configurar
      if (region) {
        config.observerMode = false;
        // RevenueCat usa a região da App Store/Google Play, mas podemos forçar algumas configurações
        console.log('RevenueCat: Configuring for region:', region);
      }
      
      await Purchases.configure(config);
      
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      this.isInitialized = true;
      RevenueCatService.lastError = null;
      console.log('RevenueCat: Successfully initialized');
    } catch (error) {
      this.isInitialized = false;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      RevenueCatService.lastError = errorMsg;
      console.error('RevenueCat: Initialization failed:', errorMsg);
      throw error;
    }
  }

  // Método para reinicializar (útil quando troca de região)
  async reinitialize(region?: 'brazil' | 'usa'): Promise<void> {
    try {
      console.log('RevenueCat: Reinitializing for region:', region);
      
      // Primeiro, fazer logout se necessário
      try {
        await Purchases.logOut();
      } catch (error) {
        // Ignorar erros de logout (usuário anônimo)
      }
      
      // Aguardar um pouco antes de reconfigurar
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Marcar como não inicializado
      this.isInitialized = false;
      
      // Reconfigurar com região específica
      await this.initialize(undefined, region);
      
      console.log('RevenueCat: Reinitialization completed');
    } catch (error) {
      console.error('RevenueCat: Reinitialization failed:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.isInitialized) {
      try {
        console.log('RevenueCat: Not initialized, attempting to initialize...');
        await this.initialize();
      } catch (error) {
        console.error('RevenueCat: Failed to initialize in getOfferings');
        return null;
      }
    }
    try {
      console.log('RevenueCat: Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('RevenueCat: Successfully fetched offerings:', offerings.current?.identifier || 'no current offering');
      RevenueCatService.lastError = null;
      return offerings.current;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('RevenueCat: Failed to get offerings:', errorMsg);
      RevenueCatService.lastError = errorMsg;
      return null;
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      try {
        console.log('RevenueCat: Not initialized, attempting to initialize...');
        await this.initialize();
      } catch (error) {
        console.error('RevenueCat: Failed to initialize in purchasePackage');
        throw new Error('RevenueCat not available');
      }
    }
    try {
      console.log('RevenueCat: Starting purchase for package:', packageToPurchase.identifier);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      console.log('RevenueCat: Purchase successful for package:', packageToPurchase.identifier);
      RevenueCatService.lastError = null;
      return customerInfo;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('RevenueCat: Purchase failed:', errorMsg);
      RevenueCatService.lastError = errorMsg;
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      try {
        console.log('RevenueCat: Not initialized, attempting to initialize...');
        await this.initialize();
      } catch (error) {
        console.error('RevenueCat: Failed to initialize in restorePurchases');
        throw new Error('RevenueCat not available');
      }
    }
    try {
      console.log('RevenueCat: Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      console.log('RevenueCat: Successfully restored purchases');
      RevenueCatService.lastError = null;
      return customerInfo;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('RevenueCat: Failed to restore purchases:', errorMsg);
      RevenueCatService.lastError = errorMsg;
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      try {
        console.log('RevenueCat: Not initialized, attempting to initialize...');
        await this.initialize();
      } catch (error) {
        console.error('RevenueCat: Failed to initialize in getCustomerInfo');
        throw new Error('RevenueCat not available');
      }
    }
    try {
      console.log('RevenueCat: Fetching customer info...');
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('RevenueCat: Successfully fetched customer info');
      RevenueCatService.lastError = null;
      return customerInfo;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('RevenueCat: Failed to get customer info:', errorMsg);
      RevenueCatService.lastError = errorMsg;
      throw error;
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      console.log('RevenueCat: Setting user ID:', userId);
      await Purchases.logIn(userId);
      console.log('RevenueCat: Successfully set user ID');
      RevenueCatService.lastError = null;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('RevenueCat: Failed to set user ID:', errorMsg);
      RevenueCatService.lastError = errorMsg;
    }
  }

  isPremium(customerInfo: CustomerInfo): boolean {
    try {
      console.log('RevenueCat: Checking premium status...');
      const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
      const isPremium = entitlement !== undefined;
      console.log('RevenueCat: Premium status:', isPremium);
      return isPremium;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('RevenueCat: Failed to check premium status:', errorMsg);
      RevenueCatService.lastError = errorMsg;
      return false;
    }
  }

  getPremiumExpirationDate(customerInfo: CustomerInfo): Date | null {
    try {
      console.log('RevenueCat: Getting premium expiration date...');
      const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
      if (entitlement && entitlement.expirationDate) {
        const expirationDate = new Date(entitlement.expirationDate);
        console.log('RevenueCat: Premium expires on:', expirationDate);
        return expirationDate;
      }
      console.log('RevenueCat: No expiration date found');
      return null;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('RevenueCat: Failed to get expiration date:', errorMsg);
      RevenueCatService.lastError = errorMsg;
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('RevenueCat: Logging out...');
      
      // Verificar se o usuário atual é anônimo antes de tentar logout
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        if (customerInfo.originalAppUserId === '$RCAnonymousID:') {
          console.log('RevenueCat: User is already anonymous, skipping logout');
          return;
        }
      } catch (error) {
        console.log('RevenueCat: Could not check user status, proceeding with logout');
      }
      
      await Purchases.logOut();
      console.log('RevenueCat: Successfully logged out');
      RevenueCatService.lastError = null;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Se o erro for sobre usuário anônimo, não é um erro real
      if (errorMsg.includes('anonymous') || errorMsg.includes('Anonymous') || errorMsg.includes('logOut but the current user is anonymous')) {
        console.log('RevenueCat: User is anonymous, logout not needed');
        RevenueCatService.lastError = null;
        return;
      }
      
      console.error('RevenueCat: Failed to logout:', errorMsg);
      RevenueCatService.lastError = errorMsg;
      // Não throw error para não quebrar o fluxo
    }
  }

  // Método para verificar se há uma assinatura ativa
  hasActiveSubscription(customerInfo: CustomerInfo): boolean {
    try {
      console.log('RevenueCat: Checking active subscription...');
      const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
      if (!entitlement) {
        console.log('RevenueCat: No active entitlement found');
        return false;
      }
      if (!entitlement.expirationDate) {
        console.log('RevenueCat: Entitlement has no expiration date (lifetime)');
        return true;
      }
      const isActive = new Date(entitlement.expirationDate) > new Date();
      console.log('RevenueCat: Subscription active status:', isActive);
      return isActive;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('RevenueCat: Failed to check active subscription:', errorMsg);
      RevenueCatService.lastError = errorMsg;
      return false;
    }
  }

  // Método para adicionar listener de mudanças no customer info
  addCustomerInfoUpdateListener(listener: () => void) {
    try {
      console.log('RevenueCat: Adding customer info update listener');
      return Purchases.addCustomerInfoUpdateListener(listener);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('RevenueCat: Failed to add customer info listener:', errorMsg);
      RevenueCatService.lastError = errorMsg;
      return null;
    }
  }

  // Método para verificar status premium facilmente
  async checkPremiumStatus(): Promise<boolean> {
    try {
      console.log('RevenueCat: Checking premium status...');
      const customerInfo = await this.getCustomerInfo();
      const isPremium = this.isPremium(customerInfo);
      console.log('RevenueCat: Premium status result:', isPremium);
      return isPremium;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Se o erro for sobre usuário anônimo, retornar false sem erro
      if (errorMsg.includes('anonymous') || errorMsg.includes('Anonymous')) {
        console.log('RevenueCat: User is anonymous, premium status is false');
        RevenueCatService.lastError = null;
        return false;
      }
      
      console.error('RevenueCat: Failed to check premium status:', errorMsg);
      RevenueCatService.lastError = errorMsg;
      return false;
    }
  }
}

export default RevenueCatService; 