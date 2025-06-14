import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface AdBannerProps {
  size?: BannerAdSize;
  unitId?: string;
  testMode?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  size = BannerAdSize.ADAPTIVE_BANNER,
  unitId = 'ca-app-pub-5233713899126724/7862480433',
  testMode = true
}) => {
  const adUnitId = testMode ? TestIds.BANNER : unitId;
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width: width }]}> 
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => console.log('Anúncio carregado com sucesso!')}
        onAdFailedToLoad={(error: Error) => console.log('Erro ao carregar anúncio:', error)}
      />
      {testMode && (
        <View style={styles.testModeBadge}>
        <Text style={styles.testModeText}>Modo de Teste</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#24ABC2',
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 10,
    // Sem overflow, sem altura fixa
  },
  testModeBadge: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'center',
    opacity: 0.7,
  },
  testModeText: {
    color: '#fff',
    fontSize: 11,
  }
}); 