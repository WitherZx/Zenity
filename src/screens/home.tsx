import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons as Icon } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ModulesGrid from "../components/modulesGrid";
import { useAuth } from "../contexts/AuthContext";
import { fonts } from "../theme/fonts";
import { AdBanner } from '../components/AdBanner';
import { BannerAdSize } from 'react-native-google-mobile-ads';

const formatUserName = (firstName?: string, lastName?: string) => {
    if (!firstName) return '';
    
    const fullName = `${firstName} ${lastName || ''}`.trim();
    const names = fullName.split(' ');
    
    // Se só tiver uma palavra, retorna ela
    if (names.length === 1) return names[0];
    
    // Retorna primeira e última palavra
    return `${names[0]} ${names[names.length - 1]}`;
};

export default function Home() {
    const { t } = useTranslation();
    const { userData, loading } = useAuth();

    if (loading || !userData) {
        return (
            <View style={styles.container}>
                <Text style={styles.adText}>{t('home.loading')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!userData?.is_premium && (
                <View>
                    <AdBanner 
                        size={BannerAdSize.ADAPTIVE_BANNER}
                        unitId={Platform.OS === 'ios' 
                          ? 'ca-app-pub-5233713899126724/7013667699' 
                          : 'ca-app-pub-5233713899126724/7862480433'}
                        testMode={false}
                    />
                </View>
            )}
            <View style={styles.helloContainer}>
                <Text style={styles.helloText}>
                    {t('home.hello')}, <Text style={styles.helloName}>{formatUserName(userData?.first_name ?? '', userData?.last_name ?? '')}</Text>
                </Text>
                {userData?.is_premium ? (
                    <Icon name="diamond" color={'#fff'} size={20}/>
                ) : (
                    <TouchableOpacity>
                        <Icon name="diamond-outline" color={'#fff'} size={20}/>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.title}>{t('home.modules')}</Text>
            <ModulesGrid/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 50,
        backgroundColor: '#0CC0DF',
        flex: 1,
        flexDirection: 'column',
        gap: 30
    },
    adText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 20,
        fontFamily: fonts.regular
    },

    helloContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    helloText: {
        fontSize: 16,
        color: '#fff',
        fontFamily: fonts.regular
    },
    helloName: {
        fontFamily: fonts.bold,
    },
    modulesContainer: {
        flexDirection: 'column',
        gap: 20
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontFamily: fonts.bold,
        fontWeight: 'bold'
    }
});