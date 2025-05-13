import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "./CustomText";

type RootStackParamList = {
    Player: { moduleId: string; contentId: string };
};

type NavigationProps = StackNavigationProp<RootStackParamList, "Player">;

interface Props {
    contentId: string;
    moduleId: string;
    image: any;
    text: string;
    duration: number;
}

export default function ItemGrid({ contentId, moduleId, image, text, duration }: Props) {
    const navigation = useNavigation<NavigationProps>();

    const handlePress = () => {
        console.log("ItemGrid: Navegando para Player com:", { moduleId, contentId });
        if (!moduleId) {
            console.error("ItemGrid: moduleId está undefined!");
            return;
        }
        navigation.navigate("Player", { moduleId, contentId });
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <Image source={typeof image === 'string' ? { uri: image } : image} style={styles.image} />
            <View style={styles.textContainer}>
                <CustomText style={styles.text}>{text}</CustomText>
                <CustomText style={styles.time}>{duration} Minutos</CustomText>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#fff',
    },
    image: {
        width: 80,
        height: 60,
        resizeMode: 'cover',
        borderRadius: 10,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        gap: 5,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    time: {
        color: '#fff',
        fontSize: 14,
    }
});
