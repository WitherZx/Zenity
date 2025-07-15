import { useState, useEffect } from 'react';
import RevenueCatService from '../services/revenueCatService';

export const useRevenueCat = () => {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const revenueCatService = RevenueCatService.getInstance();

  const checkPremiumStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const isAvailable = await RevenueCatService.isServiceAvailable();
      if (!isAvailable) {
        setError('RevenueCat service unavailable');
        setIsPremium(null);
        return;
      }

      const status = await revenueCatService.checkPremiumStatus();
      setIsPremium(status);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setIsPremium(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  return { isPremium, isLoading, error, refresh: checkPremiumStatus };
}; 