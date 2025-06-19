import { Platform } from 'react-native';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { REVENUECAT_CONFIG } from '../config/revenueCatConfig';

// Configuração do RevenueCat
const REVENUECAT_API_KEYS = {
  ios: 'appl_CzCErIYUnlBRRIXomVESYkUSyPw',
  android: 'goog_ptnToAbQbitmjJEpeCjMqmsSxtS',
};

class RevenueCatService {
  private static instance: RevenueCatService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configura o RevenueCat com as chaves da API
      await Purchases.configure({
        apiKey: Platform.OS === 'ios' ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android,
        appUserID: userId,
      });

      // Configura o log level para debug (remova em produção)
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      // Não marca como inicializado se falhou
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.isInitialized) {
      console.warn('RevenueCat not initialized, attempting to initialize...');
      try {
        await this.initialize();
      } catch (error) {
        console.error('Failed to initialize RevenueCat for offerings:', error);
        return null;
      }
    }

    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return null;
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      console.warn('RevenueCat not initialized, attempting to initialize...');
      try {
        await this.initialize();
      } catch (error) {
        console.error('Failed to initialize RevenueCat for purchase:', error);
        throw new Error('RevenueCat not available');
      }
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    } catch (error) {
      console.error('Failed to purchase package:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      console.warn('RevenueCat not initialized, attempting to initialize...');
      try {
        await this.initialize();
      } catch (error) {
        console.error('Failed to initialize RevenueCat for restore:', error);
        throw new Error('RevenueCat not available');
      }
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      console.warn('RevenueCat not initialized, attempting to initialize...');
      try {
        await this.initialize();
      } catch (error) {
        console.error('Failed to initialize RevenueCat for customer info:', error);
        throw new Error('RevenueCat not available');
      }
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Failed to get customer info:', error);
      throw error;
    }
  }

  async setUserID(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
      throw error;
    }
  }

  isPremium(customerInfo: CustomerInfo): boolean {
    return customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID] !== undefined;
  }

  getPremiumExpirationDate(customerInfo: CustomerInfo): Date | null {
    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    if (entitlement && entitlement.expirationDate) {
      return new Date(entitlement.expirationDate);
    }
    return null;
  }

  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  }

  // Método para verificar se há uma assinatura ativa
  hasActiveSubscription(customerInfo: CustomerInfo): boolean {
    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    if (!entitlement) return false;
    
    // Se não há data de expiração, é uma compra vitalícia
    if (!entitlement.expirationDate) return true;
    
    // Verifica se a assinatura não expirou
    const expirationDate = new Date(entitlement.expirationDate);
    return expirationDate > new Date();
  }
}

export default RevenueCatService; 