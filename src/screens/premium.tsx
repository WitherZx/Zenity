import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import PageModel2 from "../components/pageModel2";
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRevenueCat } from '../hooks/useRevenueCat';
import RevenueCatService from '../services/revenueCatService';
import { PurchasesPackage } from 'react-native-purchases';
import { REVENUECAT_CONFIG } from '../config/revenueCatConfig';
import { testPriceFormatting } from '../utils/priceTest';

export default function Premium() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { userData, updatePremiumStatus } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [weeklyPackage, setWeeklyPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);

  // USAR o hook useRevenueCat para melhor UX
  const { isPremium, isLoading, error, refresh } = useRevenueCat();

  const revenueCatService = RevenueCatService.getInstance();

  // Função para obter preço formatado
  const getFormattedPrice = () => {
    // Determinar região baseada no idioma
    const region = currentLanguage === 'en' ? 'usa' : 'brazil';
    const regionConfig = REVENUECAT_CONFIG.REGIONS[region];
    
    if (weeklyPackage?.product?.priceString) {
      // Se o preço já vem formatado do RevenueCat, usa ele
      const priceString = weeklyPackage.product.priceString;
      
      // Para inglês (EUA), sempre mostrar em dólar
      if (region === 'usa') {
        // Se o preço não estiver em dólar, usar fallback
        if (!priceString.includes('$')) {
          return regionConfig.fallbackPrice;
        }
        
        // Adiciona "/week" se não estiver incluído e for um plano semanal
        if (weeklyPackage.identifier.includes('weekly') && !priceString.toLowerCase().includes('week')) {
          return `${priceString}/${regionConfig.period}`;
        }
        
        return priceString;
      } else {
        // Para português (Brasil), manter lógica original
        if (weeklyPackage.identifier.includes('weekly') && !priceString.toLowerCase().includes('semana') && !priceString.toLowerCase().includes('week')) {
          return `${priceString}/${regionConfig.period}`;
        }
        
        return priceString;
      }
    }
    
    // Fallback baseado na região
    return regionConfig.fallbackPrice;
  };

  // ADICIONAR proteção no início do componente
  useEffect(() => {
    console.log('Premium: Checking user premium status:', userData?.is_premium);
    if (userData?.is_premium) {
      console.log('Premium: User is premium, redirecting to Home...');
      navigation.navigate('Home' as never);
      return;
    }
  }, [userData?.is_premium, navigation]);

  useEffect(() => {
    loadWeeklyPlan();
    
    // Teste de formatação de preços (remover em produção)
    testPriceFormatting();
  }, []);

  const loadWeeklyPlan = async () => {
    try {
      setLoading(true);
      const offering = await revenueCatService.getOfferings();
      if (offering && offering.availablePackages.length > 0) {
        const weekly = offering.availablePackages.find(pkg => 
          pkg.identifier.includes('weekly') || pkg.product.identifier.includes('weekly')
        );
        if (weekly) {
          console.log('Premium: Weekly package found:', weekly.product.identifier, 'Price:', weekly.product.priceString);
          setWeeklyPackage(weekly);
        } else {
          console.log('Premium: No weekly package found, using first available package');
          setWeeklyPackage(offering.availablePackages[0]);
        }
      } else {
        console.log('Premium: No packages available');
      }
    } catch (error) {
      console.log('Premium: Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!weeklyPackage) {
      Alert.alert(t('premium.error'), t('premium.weeklyPlanNotAvailable'));
      return;
    }
    if (!userData) {
      Alert.alert(t('premium.error'), t('premium.userNotAuthenticated'));
      return;
    }
    try {
      setPurchasing(true);
      const customerInfo = await revenueCatService.purchasePackage(weeklyPackage);
      const isPremium = revenueCatService.isPremium(customerInfo);
      if (isPremium) {
        await updatePremiumStatus(true);
        Alert.alert(t('premium.success'), t('premium.congratulationsPremium'));
        // Refresh do hook para atualizar status
        refresh();
      } else {
        Alert.alert(t('premium.error'), t('premium.purchaseError'));
      }
    } catch (error: any) {
      if (error.userCancelled) {
        return;
      }
      Alert.alert(t('premium.purchaseErrorTitle'), error.message ? error.message : t('premium.purchaseErrorMessage'));
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const customerInfo = await revenueCatService.restorePurchases();
      const isPremium = revenueCatService.isPremium(customerInfo);
      if (isPremium) {
        await updatePremiumStatus(true);
        Alert.alert(t('premium.success'), t('premium.restoreSuccess'));
        // Refresh do hook para atualizar status
        refresh();
      } else {
        Alert.alert(t('premium.noPurchasesFound'), t('premium.noPurchasesMessage'));
      }
    } catch (error) {
      Alert.alert(t('premium.error'), t('premium.restoreError'));
    }
  };

  function PremiumSkeleton() {
    return (
      <View style={styles.card}>
        <View style={[styles.skeleton, { width: 120, height: 28, marginBottom: 5 }]} />
        <View style={[styles.skeleton, { width: 120, height: 18, marginBottom: 10 }]} />
        <View style={styles.divider} />
        <View style={[styles.skeleton, { width: 140, height: 16, marginBottom: 5 }]} />
        <View style={[styles.skeleton, { width: 180, height: 16 }]} />
      </View>
    );
  }

  // Se o usuário é premium, não mostra a tela (proteção adicional)
  if (userData?.is_premium) {
    return null;
  }

  if (loading || isLoading) {
    return (
      <PageModel2 icon="diamond-outline" title={t('premium.title')} subtitle={t('premium.subtitle')}>
        <PremiumSkeleton />
      </PageModel2>
    );
  }

  return (
    <PageModel2 icon="diamond-outline" title={t('premium.title')} subtitle={t('premium.subtitle')}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('premium.planTitle')}</Text>
        <Text style={styles.price}>{getFormattedPrice()}</Text>
        <View style={styles.divider} />
        <Text style={styles.feature}>{t('premium.noAds')}</Text>
        <Text style={styles.feature}>{t('premium.betterAudio')}</Text>
      </View>
      {!userData?.is_premium ? (
        <TouchableOpacity 
          style={[styles.button, purchasing && styles.buttonDisabled]} 
          onPress={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator size="small" color="#00A0B0" />
          ) : (
            <Ionicons name={"diamond-outline"} size={20} color="#00A0B0" />
          )}
          <Text style={styles.buttonText}>
            {purchasing ? t('premium.processing') : t('premium.subscribePremium')}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.button, { backgroundColor: '#24ABC2' }]}> 
          <Ionicons name={"diamond"} size={20} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>{t('premium.alreadyPremium')}</Text>
        </View>
      )}
      {!userData?.is_premium && (
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestorePurchases}>
          <Text style={styles.restoreButtonText}>{t('premium.restorePurchases')}</Text>
        </TouchableOpacity>
      )}
      
      {error && (
        <Text style={styles.errorText}>
          {t('premium.error')}: {error}
        </Text>
      )}
    </PageModel2>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    width: "100%",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: "#555",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  },
  feature: {
    fontSize: 14,
    color: "#333",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#00A0B0",
  },
  restoreButton: {
    padding: 10,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#fff',
    textDecorationLine: 'underline',
  },
  skeleton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
