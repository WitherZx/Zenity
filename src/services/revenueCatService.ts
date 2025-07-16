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
  private isAvailable = true;
  private lastError: string | null = null;
  private customerInfoUpdateListeners: ((customerInfo: any) => void)[] = [];

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  // Método para verificar se o RevenueCat está disponível
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  // Método para obter o último erro
  getLastError(): string | null {
    return this.lastError;
  }

  // Adiciona listener para mudanças no customer info
  addCustomerInfoUpdateListener(listener: (customerInfo: any) => void): void {
    this.customerInfoUpdateListeners.push(listener);
  }

  // Remove listener
  removeCustomerInfoUpdateListener(listener: (customerInfo: any) => void): void {
    const index = this.customerInfoUpdateListeners.indexOf(listener);
    if (index > -1) {
      this.customerInfoUpdateListeners.splice(index, 1);
    }
  }

  // Notifica todos os listeners sobre mudanças
  private notifyCustomerInfoUpdateListeners(customerInfo: any): void {
    this.customerInfoUpdateListeners.forEach(listener => {
      try {
        listener(customerInfo);
      } catch (error) {
        console.log('RevenueCat: Erro ao notificar listener:', error);
      }
    });
  }

  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('RevenueCat: Tentando inicializar...');
      await Purchases.configure({
        apiKey: Platform.OS === 'ios' ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android,
        appUserID: userId,
      });
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      
      // Configura listener para mudanças automáticas no status de compra
      Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        console.log('RevenueCat: Customer info atualizado automaticamente');
        this.notifyCustomerInfoUpdateListeners(customerInfo);
      });
      
      this.isInitialized = true;
      this.isAvailable = true;
      this.lastError = null;
      console.log('RevenueCat: Inicializado com sucesso');
    } catch (error: any) {
      this.isInitialized = false;
      console.log('RevenueCat: Erro na inicialização:', error);
      
      // Detecta tipos específicos de erro
      if (error.message && error.message.includes('Billing is not available')) {
        this.isAvailable = false;
        this.lastError = 'Google Play Billing não disponível neste dispositivo';
      } else if (error.message && error.message.includes('network')) {
        this.isAvailable = false;
        this.lastError = 'Erro de conexão de rede';
      } else {
        this.isAvailable = false;
        this.lastError = error.message || 'Erro desconhecido na inicialização';
      }
      
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!this.isAvailable) {
      console.log('RevenueCat: Serviço não disponível para getOfferings');
      return null;
    }

    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        console.log('RevenueCat: Falha na inicialização para getOfferings');
        return null;
      }
    }
    
    try {
      console.log('RevenueCat: Buscando offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('RevenueCat: Offerings obtidos com sucesso');
      return offerings.current;
    } catch (error: any) {
      console.log('RevenueCat: Erro ao buscar offerings:', error);
      
      if (error.message && error.message.includes('Billing is not available')) {
        this.isAvailable = false;
        this.lastError = 'Google Play Billing não disponível';
      }
      
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
    if (!this.isAvailable) {
      throw new Error(`RevenueCat not available: ${this.lastError}`);
    }

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
    } catch (error: any) {
      console.log('RevenueCat: Erro ao buscar customerInfo:', error);
      
      if (error.message && error.message.includes('Billing is not available')) {
        this.isAvailable = false;
        this.lastError = 'Google Play Billing não disponível';
      }
      
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