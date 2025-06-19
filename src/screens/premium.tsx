import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PageModel2 from "../components/pageModel2";
import { useAuth } from '../contexts/AuthContext';
import RevenueCatService from '../services/revenueCatService';
import { PurchasesPackage } from 'react-native-purchases';

export default function Premium() {
  const { user, updatePremiumStatus } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [weeklyPackage, setWeeklyPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);

  const revenueCatService = RevenueCatService.getInstance();

  useEffect(() => {
    loadWeeklyPlan();
  }, []);

  const loadWeeklyPlan = async () => {
    try {
      setLoading(true);
      const offering = await revenueCatService.getOfferings();
      
      if (offering && offering.availablePackages.length > 0) {
        // Procura pelo pacote semanal
        const weekly = offering.availablePackages.find(pkg => 
          pkg.identifier.includes('weekly') || pkg.product.identifier.includes('weekly')
        );
        
        if (weekly) {
          setWeeklyPackage(weekly);
        } else {
          // Se não encontrar específico, usa o primeiro
          setWeeklyPackage(offering.availablePackages[0]);
        }
      }
    } catch (error) {
      console.error('Error loading weekly plan:', error);
      // Não falha o app se não conseguir carregar os planos
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!weeklyPackage) {
      Alert.alert('Erro', 'Plano semanal não disponível.');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    try {
      setPurchasing(true);
      
      // Realiza a compra
      const customerInfo = await revenueCatService.purchasePackage(weeklyPackage);
      
      // Verifica se o usuário agora é premium
      const isPremium = revenueCatService.isPremium(customerInfo);
      
      if (isPremium) {
        // Atualiza o status no Supabase
        await updatePremiumStatus(true);
        Alert.alert('Sucesso!', 'Parabéns! Você agora é um usuário premium.');
      } else {
        Alert.alert('Erro', 'A compra foi concluída, mas o status premium não foi ativado.');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      if (error.userCancelled) {
        // Usuário cancelou a compra - não mostrar erro
        return;
      }
      
      Alert.alert('Erro na Compra', error.message || 'Ocorreu um erro durante a compra. Tente novamente.');
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
      } else {
        Alert.alert('Nenhuma Compra Encontrada', 'Não foi encontrada nenhuma compra para restaurar.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Erro', 'Não foi possível restaurar as compras.');
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

  if (loading) {
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
        <Text style={styles.price}>R$19,90/semana</Text>
        <View style={styles.divider} />
        <Text style={styles.feature}>Sem anúncios</Text>
        <Text style={styles.feature}>Melhor qualidade de áudio</Text>
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
            {purchasing ? 'Processando...' : 'Assinar o premium'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.button, { backgroundColor: '#24ABC2' }]}> 
          <Ionicons name={"diamond"} size={20} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>Você já é premium</Text>
        </View>
      )}
      
      {!user?.is_premium && (
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestorePurchases}>
          <Text style={styles.restoreButtonText}>Restaurar Compras</Text>
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
