import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import PageModel2 from "../components/pageModel2";
import { useAuth } from '../contexts/AuthContext';
import { useRevenueCat } from '../hooks/useRevenueCat';
import RevenueCatService from '../services/revenueCatService';
import { PurchasesPackage } from 'react-native-purchases';

export default function Premium() {
  const navigation = useNavigation();
  const { userData, updatePremiumStatus } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [weeklyPackage, setWeeklyPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);

  // USAR o hook useRevenueCat para melhor UX
  const { isPremium, isLoading, error, refresh } = useRevenueCat();

  const revenueCatService = RevenueCatService.getInstance();

  // Função para obter preço formatado
  const getFormattedPrice = () => {
    if (weeklyPackage?.product?.priceString) {
      // Se o preço já vem formatado do RevenueCat, usa ele
      const priceString = weeklyPackage.product.priceString;
      
      // Adiciona "/semana" se não estiver incluído e for um plano semanal
      if (weeklyPackage.identifier.includes('weekly') && !priceString.toLowerCase().includes('semana') && !priceString.toLowerCase().includes('week')) {
        return `${priceString}/semana`;
      }
      
      return priceString;
    }
    return 'R$ 19,90/semana'; // Fallback
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
      Alert.alert('Erro', 'Plano semanal não disponível.');
      return;
    }
    if (!userData) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }
    try {
      setPurchasing(true);
      const customerInfo = await revenueCatService.purchasePackage(weeklyPackage);
      const isPremium = revenueCatService.isPremium(customerInfo);
      if (isPremium) {
        await updatePremiumStatus(true);
        Alert.alert('Sucesso!', 'Parabéns! Você agora é um usuário premium.');
        // Refresh do hook para atualizar status
        refresh();
      } else {
        Alert.alert('Erro', 'A compra foi concluída, mas o status premium não foi ativado.');
      }
    } catch (error: any) {
      if (error.userCancelled) {
        return;
      }
      Alert.alert('Erro na Compra', error.message ? error.message : 'Ocorreu um erro durante a compra. Tente novamente.');
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
        Alert.alert('Sucesso!', 'Suas compras foram restauradas com sucesso.');
        // Refresh do hook para atualizar status
        refresh();
      } else {
        Alert.alert('Nenhuma Compra Encontrada', 'Não foi encontrada nenhuma compra para restaurar.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível restaurar as compras.');
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
      <PageModel2 icon="diamond-outline" title="Plano Premium" subtitle="Assinatura">
        <PremiumSkeleton />
      </PageModel2>
    );
  }

  return (
    <PageModel2 icon="diamond-outline" title="Plano Premium" subtitle="Assinatura">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Premium</Text>
        <Text style={styles.price}>{getFormattedPrice()}</Text>
        <View style={styles.divider} />
        <Text style={styles.feature}>Sem anúncios</Text>
        <Text style={styles.feature}>Melhor qualidade de áudio</Text>
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
            {purchasing ? 'Processando...' : 'Assinar o premium'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.button, { backgroundColor: '#24ABC2' }]}> 
          <Ionicons name={"diamond"} size={20} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>Você já é premium</Text>
        </View>
      )}
      {!userData?.is_premium && (
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestorePurchases}>
          <Text style={styles.restoreButtonText}>Restaurar Compras</Text>
        </TouchableOpacity>
      )}
      
      {error && (
        <Text style={styles.errorText}>
          Erro: {error}
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
