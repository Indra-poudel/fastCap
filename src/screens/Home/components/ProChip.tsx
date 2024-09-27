import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from 'theme/ThemeContext';
import {scale, verticalScale} from 'react-native-size-matters/extend';

type ProChipProps = {
  onClick: () => void;
};

const ProChip = ({onClick}: ProChipProps) => {
  const {theme} = useTheme();
  return (
    <Pressable style={[styles.wrapper]} onPress={onClick}>
      <Icon name={'diamond'} size={16} color={theme.colors.black1} />
      <Text style={[theme.typography.subheader.small]}>Try Pro</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(14),
    gap: verticalScale(8),
    backgroundColor: '#FCDB33',
    borderRadius: scale(8),
  },
});

export default ProChip;
