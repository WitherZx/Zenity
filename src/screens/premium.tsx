import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import PageModel2 from "../components/pageModel2";
import { useAuth } from '../contexts/AuthContext';
import RevenueCatService from '../services/revenueCatService';
import { PurchasesPackage } from 'react-native-purchases';
import { useRevenueCat } from '../hooks/useRevenueCat';

export default function Premium() {
  const { user, updatePremiumStatus, refreshPremiumStatus } = useAuth();
  const navigation = useNavigation();
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  
  const { isAvailable, isLoading, offering, error, refresh } = useRevenueCat();
  const revenueCatService = RevenueCatService.getInstance();

  // Proteção: redireciona usuários premium para a home
  useEffect(() => {
    if (user?.is_premium) {
      Alert.alert(
        'Already Premium',
        'You are already a premium user! Enjoy your benefits.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  }, [user?.is_premium, navigation]);

  useEffect(() => {
    // Quando as offerings são carregadas, procura pelo melhor pacote disponível
    if (offering && offering.availablePackages.length > 0) {
      // Prioriza: semanal > mensal > anual > primeiro disponível
      const weekly = offering.availablePackages.find(pkg => 
        pkg.identifier.toLowerCase().includes('weekly') || 
        pkg.product.identifier.toLowerCase().includes('weekly') ||
        pkg.identifier.toLowerCase().includes('week') || 
        pkg.product.identifier.toLowerCase().includes('week')
      );
      
      const monthly = offering.availablePackages.find(pkg => 
        pkg.identifier.toLowerCase().includes('monthly') || 
        pkg.product.identifier.toLowerCase().includes('monthly') ||
        pkg.identifier.toLowerCase().includes('month') || 
        pkg.product.identifier.toLowerCase().includes('month')
      );
      
      const yearly = offering.availablePackages.find(pkg => 
        pkg.identifier.toLowerCase().includes('yearly') || 
        pkg.product.identifier.toLowerCase().includes('yearly') ||
        pkg.identifier.toLowerCase().includes('year') || 
        pkg.product.identifier.toLowerCase().includes('year')
      );
      
      // Seleciona o primeiro disponível na ordem de prioridade
      if (weekly) {
        setSelectedPackage(weekly);
      } else if (monthly) {
        setSelectedPackage(monthly);
      } else if (yearly) {
        setSelectedPackage(yearly);
      } else {
        setSelectedPackage(offering.availablePackages[0]);
      }
    }
  }, [offering]);

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
    
    // Se não há package disponível (modo fallback/desenvolvimento)
    if (!selectedPackage) {
      let alertMessage = 'Subscription service is currently unavailable.';
      
      if (!isAvailable && error) {
        alertMessage = `Subscription service is not available:\n\n${error}`;
      } else if (error) {
        alertMessage = `Error loading subscription plans:\n\n${error}`;
      }
      
      alertMessage += '\n\nThis may be due to:\n• Device without Google Play Store configured\n• Network connectivity issues\n• RevenueCat configuration';
      
      // Cria as opções do alert
      const alertOptions = [
        { text: 'Try Again', style: 'default' as const, onPress: refresh },
        { text: 'Cancel', style: 'cancel' as const }
      ];
      
      // Só adiciona a opção de teste em modo de desenvolvimento
      if (__DEV__) {
        alertOptions.splice(1, 0, { 
          text: 'Test Premium (Dev)', 
          style: 'default' as const,
          onPress: async () => {
            await updatePremiumStatus(true);
            Alert.alert('Success!', 'Premium status activated for testing.');
          }
        });
      }
      
      Alert.alert(
        'Subscription Service', 
        alertMessage,
        alertOptions
      );
      return;
    }
    
    try {
      setPurchasing(true);
      const customerInfo = await revenueCatService.purchasePackage(selectedPackage);
      const isPremium = revenueCatService.isPremium(customerInfo);
      if (isPremium) {
        await updatePremiumStatus(true);
        // Força uma verificação completa do status premium
        await refreshPremiumStatus();
        Alert.alert('Success!', 'Congratulations! You are now a premium user.');
      } else {
        Alert.alert('Error', 'Purchase completed, but premium status was not activated.');
      }
    } catch (error: any) {
      if (error.userCancelled) {
        return;
      }
      Alert.alert('Purchase Error', error.message ? error.message : 'An error occurred during the purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  // Função para obter o preço formatado sempre em USD
  const getFormattedPrice = () => {
    if (isLoading) {
      return "Loading price...";
    }
    
    if (selectedPackage) {
      const identifier = selectedPackage.product.identifier.toLowerCase();
      
      // Mapear preços em USD baseado no produto
      let priceUSD = "$19.90";
      let period = "/week";
      
      // Determina preço e período baseado no identificador do produto
      if (identifier.includes('weekly') || identifier.includes('week')) {
        priceUSD = "$19.90";
        period = "/week";
      } else if (identifier.includes('monthly') || identifier.includes('month')) {
        priceUSD = "$49.90";
        period = "/month";
      } else if (identifier.includes('yearly') || identifier.includes('year')) {
        priceUSD = "$199.90";
        period = "/year";
      } else {
        // Para produtos customizados, tenta extrair valor numérico do preço local
        const priceString = selectedPackage.product.priceString;
        const numericValue = parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.'));
        
        if (!isNaN(numericValue)) {
          // Conversão aproximada de Real para Dólar (R$ 5,00 = $1,00)
          const usdValue = (numericValue / 5.0).toFixed(2);
          priceUSD = `$${usdValue}`;
        }
        
        if (identifier.includes('monthly') || identifier.includes('month')) {
          period = "/month";
        } else if (identifier.includes('yearly') || identifier.includes('year')) {
          period = "/year";
        } else {
          period = "/week";
        }
      }
      
      return `${priceUSD}${period}`;
    }
    
    // Fallback para preço padrão se não conseguir carregar
    return "$19.90/week";
  };

  const handleRestorePurchases = async () => {
    try {
      const customerInfo = await revenueCatService.restorePurchases();
      const isPremium = revenueCatService.isPremium(customerInfo);
      if (isPremium) {
        await updatePremiumStatus(true);
        // Força uma verificação completa do status premium
        await refreshPremiumStatus();
        Alert.alert('Success!', 'Your purchases have been successfully restored.');
      } else {
        Alert.alert('No Purchases Found', 'No purchases were found to restore.');
      }
    } catch (error: any) {
      console.log('Premium: Erro ao restaurar compras:', error);
      if (error.message && error.message.includes('Billing is not available')) {
        Alert.alert(
          'Service Unavailable', 
          'The subscription service is not available on this device. Please ensure you have:\n\n• Google Play Store configured\n• Valid Google account signed in\n• Internet connection\n\nTry again later.'
        );
      } else {
        Alert.alert('Error', 'Could not restore purchases. Please try again later.');
      }
    }
  };

  function PremiumSkeleton() {
    return (
      <View style={styles.card}>
        <View style={[styles.skeleton, { width: 120, height: 28, marginBottom: 5 }]} />
        <View style={[styles.skeleton, { width: 80, height: 18, marginBottom: 10 }]} />
        <View style={styles.divider} />
        <View style={[styles.skeleton, { width: 140, height: 16, marginBottom: 5 }]} />
        <View style={[styles.skeleton, { width: 180, height: 16 }]} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <PageModel2 icon="diamond-outline" title="Premium Plan" subtitle="Subscription">
        <PremiumSkeleton />
      </PageModel2>
    );
  }

  return (
    <PageModel2 icon="diamond-outline" title="Premium Plan" subtitle="Subscription">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Premium</Text>
        <Text style={styles.price}>{getFormattedPrice()}</Text>
        <View style={styles.divider} />
        <Text style={styles.feature}>No ads</Text>
        <Text style={styles.feature}>Better audio quality</Text>
      </View>
      {!user?.is_premium ? (
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
            {purchasing ? 'Processing...' : 'Subscribe to premium'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.button, { backgroundColor: '#24ABC2' }]}> 
          <Ionicons name={"diamond"} size={20} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>You are already premium</Text>
        </View>
      )}
      {!user?.is_premium && (
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestorePurchases}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
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
});
