import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from 'theme/ThemeContext';

const ProChip = () => {
  const {theme} = useTheme();
  return (
    <View style={[styles.wrapper]}>
      <Icon name={'diamond'} size={16} color={theme.colors.black1} />
      <Text style={[theme.typography.subheader.small]}>Try Pro</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
    backgroundColor: '#FCDB33',
    borderRadius: 8,
  },
});

export default ProChip;
