import { useState, useEffect } from 'react';
import RevenueCatService from '../services/revenueCatService';
import { PurchasesOffering } from 'react-native-purchases';

interface UseRevenueCatResult {
  isAvailable: boolean;
  isLoading: boolean;
  offering: PurchasesOffering | null;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useRevenueCat = (): UseRevenueCatResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const revenueCatService = RevenueCatService.getInstance();
  
  const loadOfferings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verifica se o serviço está disponível
      if (!revenueCatService.isServiceAvailable()) {
        setError(revenueCatService.getLastError());
        setOffering(null);
        return;
      }
      
      const currentOffering = await revenueCatService.getOfferings();
      setOffering(currentOffering);
      
      if (!currentOffering) {
        setError('Nenhuma oferta disponível');
      }
    } catch (err: any) {
      console.log('useRevenueCat: Erro ao carregar offerings:', err);
      setError(err.message || 'Erro ao carregar ofertas');
      setOffering(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadOfferings();
  }, []);
  
  return {
    isAvailable: revenueCatService.isServiceAvailable(),
    isLoading,
    offering,
    error,
    refresh: loadOfferings,
  };
};

// Hook para verificar status premium
export const useRevenueCatPremiumStatus = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const revenueCatService = RevenueCatService.getInstance();
  
  const checkPremiumStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!revenueCatService.isServiceAvailable()) {
        setError(revenueCatService.getLastError());
        setIsPremium(false);
        return;
      }
      
      const customerInfo = await revenueCatService.getCustomerInfo();
      const premium = revenueCatService.isPremium(customerInfo);
      setIsPremium(premium);
    } catch (err: any) {
      console.log('useRevenueCatPremiumStatus: Erro:', err);
      setError(err.message || 'Erro ao verificar status premium');
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    checkPremiumStatus();
  }, []);
  
  return {
    isPremium,
    isLoading,
    error,
    refresh: checkPremiumStatus,
  };
}; 