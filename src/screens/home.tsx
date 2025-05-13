import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons as Icon } from '@expo/vector-icons';
import ModulesGrid from "../components/modulesGrid";
import { useAuth } from "../contexts/AuthContext";
import { fonts } from "../theme/fonts";
import { supabase } from '../config/supabase';

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
    const { user: authUser } = useAuth();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            if (authUser?.id) {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();
                setUserData(data);
            }
            setLoading(false);
        }
        fetchProfile();
    }, [authUser]);

    if (loading || !userData) {
        return (
            <View style={styles.container}>
                <Text style={styles.adText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.adContainer}>
                <Text style={styles.adText}>Anúncio</Text>
            </View>
            <View style={styles.helloContainer}>
                <Text style={styles.helloText}>
                    Olá, <Text style={styles.helloName}>{formatUserName(userData?.first_name ?? '', userData?.last_name ?? '')}</Text>
                </Text>
                {userData?.is_premium ? (
                    <Icon name="diamond" color={'#fff'} size={20}/>
                ) : (
                    <TouchableOpacity>
                        <Icon name="diamond-outline" color={'#fff'} size={20}/>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.title}>Módulos</Text>
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
    adContainer: {
        borderRadius: 10,
        padding: 30,
        backgroundColor: '#24ABC2'
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
        fontFamily: fonts.regular,
        fontWeight: 'bold'
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