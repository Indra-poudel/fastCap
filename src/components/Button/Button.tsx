import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {useTheme} from '@theme/ThemeContext';
import {scale, verticalScale} from 'react-native-size-matters/extend';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

type ButtonProps = {
  icon?: React.ReactNode;
  label: string;
  rightSlot?: React.ReactNode;
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';

  buttonType: 'primary' | 'secondary' | 'tertiary';
  style?: StyleProp<ViewStyle>;
  onPress?: ((event: GestureResponderEvent) => void) | null | undefined;
  color?: string;
};

const Button = ({
  icon,
  label,
  rightSlot,
  justifyContent = 'center',
  buttonType,
  style,
  onPress,
  color,
}: ButtonProps) => {
  const {theme} = useTheme();
  const handleOnPress = (event: GestureResponderEvent) => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    onPress && onPress(event);
  };
  return (
    <Pressable
      onPress={handleOnPress}
      style={({pressed}) => [
        style,
        Style.buttonContainer,
        {
          justifyContent,
          backgroundColor:
            buttonType === 'primary'
              ? theme.colors.primary
              : buttonType === 'secondary'
              ? theme.colors.transparent
              : 'rgba(47, 128, 237, 0.14))',

          borderColor: color || theme.colors.primary,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <View style={[Style.iconLabelContainer]}>
        {icon && <View>{icon}</View>}

        <Text
          style={[
            theme.typography.header.small,
            {
              color: color || theme.colors.white,
            },
            Style.label,
          ]}>
          {label}
        </Text>
      </View>

      {rightSlot && rightSlot}
    </Pressable>
  );
};

const Style = StyleSheet.create({
  buttonContainer: {
    width: scale(300),
    paddingVertical: verticalScale(20),
    display: 'flex',
    alignItems: 'center',
    borderRadius: scale(12),
    borderWidth: 1,
  },

  label: {},

  iconLabelContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: verticalScale(10),
    alignItems: 'center',
  },
});

export default Button;
