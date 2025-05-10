import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface CustomButtonProps {
  text: string;
  iconName: string;
  onPress: (event: GestureResponderEvent) => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({ text, iconName, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Icon name={iconName} size={20} color="#00A0B0" />
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#00A0B0',
  },
});

export default CustomButton;
