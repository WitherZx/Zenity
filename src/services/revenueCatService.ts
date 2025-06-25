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
      await Purchases.configure({
        apiKey: Platform.OS === 'ios' ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android,
        appUserID: userId,
      });
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      this.isInitialized = true;
    } catch (error) {
      this.isInitialized = false;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        return null;
      }
    }
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      return null;
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        throw new Error('RevenueCat not available');
      }
    }
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    } catch (error) {
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        throw new Error('RevenueCat not available');
      }
    }
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        throw new Error('RevenueCat not available');
      }
    }
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      throw error;
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
    } catch (error) {}
  }

  isPremium(customerInfo: CustomerInfo): boolean {
    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    return entitlement !== undefined;
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
      throw error;
    }
  }

  // Método para verificar se há uma assinatura ativa
  hasActiveSubscription(customerInfo: CustomerInfo): boolean {
    const entitlement = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID];
    if (!entitlement) return false;
    if (!entitlement.expirationDate) return true;
    return new Date(entitlement.expirationDate) > new Date();
  }
}

export default RevenueCatService; 