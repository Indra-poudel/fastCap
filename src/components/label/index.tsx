import React from 'react';
import {GestureResponderEvent, Pressable, StyleSheet, Text} from 'react-native';
import {useTheme} from 'theme/ThemeContext';

type labelType = {
  text: string;
  onPress?: ((event: GestureResponderEvent) => void) | null | undefined;
};

const Label = ({text, onPress}: labelType) => {
  const {theme} = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <Text
        style={[
          theme.typography.body.small,
          {
            color: theme.colors.primary,
          },
        ]}>
        {text}
      </Text>
    </Pressable>
  );
};

const style = StyleSheet.create({
  wrapper: {},
});

export default Label;
