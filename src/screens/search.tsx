import React from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import ContentGrid from "../components/contentGrid";
import { Content } from "../components/contentGrid";
import ContentGridSkeleton from "../components/ContentGridSkeleton";
import { getModules } from "../data/modulesData";

export default function Search() {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResults, setSearchResults] = useState<{ contents: Content[] }>({ contents: [] });
    const [modules, setModules] = useState<any[]>([]);
    const [modulesLoading, setModulesLoading] = useState(true);

    React.useEffect(() => {
        async function fetchModules() {
            try {
                const data = await getModules();
                setModules(data || []);
            } catch (e) {
                setModules([]);
            }
            setModulesLoading(false);
        }
        fetchModules();
    }, []);

    const handleSearch = () => {
        setHasSearched(true);
        
        if (!searchText.trim()) {
            setSearchResults({ contents: [] });
            return;
        }

        setIsLoading(true);

        // Simulando um delay de busca
        setTimeout(() => {
            const searchLower = searchText.toLowerCase();
            let results: typeof searchResults.contents = [];

            if (modules && Array.isArray(modules)) {
                modules.forEach(module => {
                    const matchingContents = module.contents
                        .filter((content: any) => content.name.toLowerCase().includes(searchLower))
                        .map((content: any) => ({
                            ...content,
                            moduleId: module.id,
                            image: content.image
                        }));

                    results = [...results, ...matchingContents];
                });
            }

            setSearchResults({ contents: results });
            setIsLoading(false);
        }, 500);
    };

    const handleChangeText = (text: string) => {
        setSearchText(text);
        if (hasSearched) setHasSearched(false);
    };

    const renderContent = () => {
        if (isLoading) {
            return <ContentGridSkeleton />;
        }

        if (hasSearched && searchResults.contents.length === 0) {
            return (
                <View style={styles.noResultsContainer}>
                    <Ionicons name="search-outline" size={50} color="#fff" />
                    <Text style={styles.noResultsText}>{t('search.noContentFound')}</Text>
                </View>
            );
        }

        return <ContentGrid contents={searchResults.contents} />;
    };

    if (modulesLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0097B2" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('search.title')}</Text>
            <View style={styles.searchContainer}>
                <TouchableOpacity onPress={handleSearch}>
                    <Ionicons name="search" size={24} color="#0097B2" style={styles.icon} />
                </TouchableOpacity>
                <TextInput
                    style={styles.search}
                    placeholder={t('search.searchPlaceholder')}
                    placeholderTextColor="#0097B2"
                    value={searchText}
                    onChangeText={handleChangeText}
                    onSubmitEditing={handleSearch}
                />
                {isLoading && (
                    <ActivityIndicator 
                        size="small" 
                        color="#0097B2" 
                        style={styles.loader}
                    />
                )}
            </View>
            
            {renderContent()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 50,
        backgroundColor: '#0097B2',
        flex: 1,
        flexDirection: 'column',
        gap: 30
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 40,
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    icon: {
        padding: 5
    },
    search: {
        fontSize: 16,
        color: '#0097B2',
        flex: 1,
        marginLeft: 10,
    },
    loader: {
        marginLeft: 10,
        marginRight: 5
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    noResultsText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
});
