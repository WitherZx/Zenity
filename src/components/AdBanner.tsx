import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface AdBannerProps {
  size?: BannerAdSize;
  unitId?: string;
  testMode?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  size = BannerAdSize.ADAPTIVE_BANNER,
  unitId = Platform.OS === 'ios'
    ? 'ca-app-pub-5233713899126724/7013667699'
    : 'ca-app-pub-5233713899126724/7862480433',
  testMode = false
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
}); 