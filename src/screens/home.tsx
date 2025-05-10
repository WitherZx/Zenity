import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import ModulesGrid from "../components/modulesGrid";
import { useAuth } from "../contexts/AuthContext";
import { fonts } from "../theme/fonts";

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
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.adContainer}>
                <Text style={styles.adText}>Anúncio</Text>
            </View>
            <View style={styles.helloContainer}>
                <Text style={styles.helloText}>
                    Olá, <Text style={styles.helloName}>{formatUserName(user?.firstName, user?.lastName)}</Text>
                </Text>
                {user?.isPremium ? (
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