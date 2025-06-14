import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PageModel2 from "../components/pageModel2";
import { useAuth } from '../contexts/AuthContext';
import IAPService from '../services/iapService';

interface User {
  is_premium: boolean;
  [key: string]: any;
}

export default function Premium() {
  const { user, updateUser } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initializeIAP();
    return () => {
      IAPService.endConnection();
    };
  }, []);

  const initializeIAP = async () => {
    try {
      setInitializing(true);
      const items = await IAPService.getProducts();
      setProducts(items);
    } catch (err) {
      Alert.alert(
        'Erro',
        'Não foi possível carregar os produtos. Verifique sua conexão ou tente novamente mais tarde.'
      );
    } finally {
      setInitializing(false);
    }
  };

  const handlePurchase = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await IAPService.purchasePremium();
      
      if (result.success) {
        // Update user premium status
        if (user && updateUser) {
          await updateUser({ ...user, is_premium: true });
        }
        Alert.alert('Sucesso', 'Sua assinatura premium foi ativada com sucesso!');
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível completar a compra.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro durante a compra. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const restored = await IAPService.restorePurchases();
      if (restored && user && updateUser) {
        await updateUser({ ...user, is_premium: true });
        Alert.alert('Sucesso', 'Sua assinatura premium foi restaurada com sucesso!');
      } else {
        Alert.alert('Informação', 'Nenhuma compra anterior foi encontrada.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível restaurar as compras. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <PageModel2 icon="diamond-outline" title="Plano Premium" subtitle="Assinatura">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A0B0" />
          <Text style={styles.loadingText}>Carregando produtos...</Text>
        </View>
      </PageModel2>
    );
  }

  return (
    <PageModel2 icon="diamond-outline" title="Plano Premium" subtitle="Assinatura">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Premium</Text>
        <Text style={styles.price}>R$9,90/Semana</Text>
        <View style={styles.divider} />
        <Text style={styles.feature}>Sem anúncios</Text>
        <Text style={styles.feature}>Melhor qualidade de áudio</Text>
      </View>

      {!user?.is_premium ? (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={handlePurchase}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#00A0B0" />
            ) : (
              <>
                <Ionicons name="diamond-outline" size={20} color="#00A0B0" />
                <Text style={styles.buttonText}>Assinar o premium</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.restoreButton]}
            onPress={handleRestorePurchases}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.restoreButtonText]}>
              Restaurar compras
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={[styles.button, { backgroundColor: '#24ABC2' }]}>
          <Ionicons name="diamond" size={20} color="#fff" />
          <Text style={[styles.buttonText, { color: '#fff' }]}>
            Você já é premium
          </Text>
        </View>
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
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#00A0B0",
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00A0B0',
  },
  restoreButtonText: {
    color: '#00A0B0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#00A0B0',
    fontSize: 16,
  },
});

   