import { useState, useEffect } from 'react';
import { fetchModules, Module } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@modules_cache';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hora

export const useModules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadModules = async () => {
    try {
      // Tenta carregar do cache primeiro
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setModules(data);
          setLoading(false);
          return;
        }
      }

      // Se não tem cache ou expirou, carrega do Firebase
      const data = await fetchModules();
      setModules(data);
      
      // Salva no cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (err) {
      setError('Erro ao carregar os módulos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  return { modules, loading, error };
}; 