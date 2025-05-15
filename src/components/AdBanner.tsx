// import React from 'react';
// import { StyleSheet, View, Text } from 'react-native';
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// interface AdBannerProps {
//   size?: BannerAdSize;
//   unitId?: string;
//   testMode?: boolean;
// }

// export const AdBanner: React.FC<AdBannerProps> = ({ 
//   size = BannerAdSize.BANNER,
//   unitId = 'ca-app-pub-5233713899126724/7862480433',
//   testMode = true // Ative o modo de teste durante o desenvolvimento
// }) => {
//   const adUnitId = testMode ? TestIds.BANNER : unitId;
// 
//   return (
//     <View style={styles.container}>
//       <BannerAd
//         unitId={adUnitId}
//         size={size}
//         requestOptions={{
//           requestNonPersonalizedAdsOnly: true,
//         }}
//         onAdLoaded={() => console.log('Anúncio carregado com sucesso!')}
//         onAdFailedToLoad={(error) => console.log('Erro ao carregar anúncio:', error)}
//       />
//       {testMode && (
//         <Text style={styles.testModeText}>Modo de Teste</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 10,
//   },
//   testModeText: {
//     color: '#fff',
//     fontSize: 12,
//     marginTop: 5,
//   }
// });

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    marginVertical: 0,
  },
  testModeText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  }
}); 