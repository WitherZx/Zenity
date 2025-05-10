import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import ContentGrid from "../components/contentGrid";
import ContentGridSkeleton from "../components/ContentGridSkeleton";
import { modules } from "../data/modulesData";

export default function Search() {
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResults, setSearchResults] = useState<{
        contents: Array<{
            id: string;
            moduleId: string;
            name: string;
            thumbnail: any;
            file: any;
            duration: number;
        }>;
    }>({ contents: [] });

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

            modules.forEach(module => {
                const matchingContents = module.contents
                    .filter(content => content.name.toLowerCase().includes(searchLower))
                    .map(content => ({
                        ...content,
                        moduleId: module.id
                    }));

                results = [...results, ...matchingContents];
            });

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
                    <Text style={styles.noResultsText}>Nenhum conteúdo foi encontrado</Text>
                </View>
            );
        }

        return <ContentGrid contents={searchResults.contents} />;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pesquisar</Text>
            <View style={styles.searchContainer}>
                <TouchableOpacity onPress={handleSearch}>
                    <Ionicons name="search" size={24} color="#0097B2" style={styles.icon} />
                </TouchableOpacity>
                <TextInput
                    style={styles.search}
                    placeholder="Digite..."
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
