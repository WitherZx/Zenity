import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Product IDs
const PRODUCT_IDS = {
  PREMIUM_WEEKLY: 'premium_service_IOS',
};

// Storage keys
const STORAGE_KEYS = {
  PURCHASE_TOKEN: '@zenity:purchase_token',
  PURCHASE_DATE: '@zenity:purchase_date',
};

export interface PurchaseResult {
  success: boolean;
  error?: string;
  purchase?: RNIap.ProductPurchase;
}

class IAPService {
  private static instance: IAPService;
  private initialized = false;
  private purchaseUpdateSubscription: any;
  private purchaseErrorSubscription: any;

  private constructor() {}

  static getInstance(): IAPService {
    if (!IAPService.instance) {
      IAPService.instance = new IAPService();
    }
    return IAPService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await RNIap.initConnection();
      this.initialized = true;

      // Set up purchase listener
      this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: RNIap.ProductPurchase) => {
        if (purchase.transactionReceipt) {
          await this.handleSuccessfulPurchase(purchase);
        }
      });

      // Set up error listener
      this.purchaseErrorSubscription = RNIap.purchaseErrorListener((error: RNIap.PurchaseError) => {
        console.error('Purchase error:', error);
      });

    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      this.initialized = false;
      throw error;
    }
  }

  async getProducts(): Promise<RNIap.Product[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      const products = await RNIap.getProducts({ skus: [PRODUCT_IDS.PREMIUM_WEEKLY] });
      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      throw error;
    }
  }

  async purchasePremium(): Promise<PurchaseResult> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      const purchase = await RNIap.requestPurchase({
        sku: PRODUCT_IDS.PREMIUM_WEEKLY,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      }) as RNIap.ProductPurchase;

      if (purchase.transactionReceipt) {
        await this.handleSuccessfulPurchase(purchase);
        return { success: true, purchase };
      }

      return { success: false, error: 'Purchase failed' };
    } catch (error: any) {
      console.error('Purchase error:', error);
      return {
        success: false,
        error: error.message || 'Failed to complete purchase',
      };
    }
  }

  private async handleSuccessfulPurchase(purchase: RNIap.ProductPurchase): Promise<void> {
    try {
      // Store purchase information
      await AsyncStorage.setItem(STORAGE_KEYS.PURCHASE_TOKEN, purchase.transactionReceipt);
      await AsyncStorage.setItem(STORAGE_KEYS.PURCHASE_DATE, new Date().toISOString());

      // Finish the transaction
      if (Platform.OS === 'ios') {
        await RNIap.finishTransaction({ purchase, isConsumable: false });
      }
    } catch (error) {
      console.error('Error handling successful purchase:', error);
      throw error;
    }
  }

  async verifyPurchase(): Promise<boolean> {
    try {
      const purchaseToken = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASE_TOKEN);
      const purchaseDate = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASE_DATE);

      if (!purchaseToken || !purchaseDate) {
        return false;
      }

      // For iOS, we can verify the receipt with Apple's servers
      if (Platform.OS === 'ios') {
        try {
          const receipt = await RNIap.getReceiptIOS({ forceRefresh: true });
          if (receipt) {
            return true;
          }
        } catch (error) {
          console.error('Error verifying iOS receipt:', error);
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error verifying purchase:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      if (Platform.OS === 'ios') {
        const purchases = await RNIap.getAvailablePurchases();
        if (purchases.length > 0) {
          const latestPurchase = purchases[0];
          await this.handleSuccessfulPurchase(latestPurchase);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }

  async endConnection(): Promise<void> {
    if (this.initialized) {
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
      }
      await RNIap.endConnection();
      this.initialized = false;
    }
  }
}

export default IAPService.getInstance(); 