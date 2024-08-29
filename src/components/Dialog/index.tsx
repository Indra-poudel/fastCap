import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useTheme} from 'theme/ThemeContext';

import {scale, verticalScale} from 'react-native-size-matters/extend';

type DialogProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onAction: () => void;
  primaryActionLabel: string;
  primaryActionColor: string;
  disabled?: boolean;
};

const Dialog = ({
  onClose,
  children,
  primaryActionLabel,
  title,
  primaryActionColor,
  onAction,
  disabled,
}: DialogProps) => {
  const {height, width} = useWindowDimensions();
  const {theme} = useTheme();

  // Function to stop event propagation
  const handleChildPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
  };

  return (
    <Pressable
      onPress={onClose}
      style={[
        styles.backDrop,
        {
          height,
          width,
        },
      ]}>
      <View
        onStartShouldSetResponder={() => true} // Ensure the child View handles touch events
        onTouchEnd={handleChildPress} // Stop propagation when touched
        style={[
          styles.dialog,
          {
            backgroundColor: theme.colors.grey1,
          },
        ]}>
        <View style={styles.header}>
          <Text
            style={[
              theme.typography.header.small,
              {
                color: theme.colors.white,
              },
            ]}>
            {title}
          </Text>
        </View>
        <View
          style={[
            styles.line,
            {
              backgroundColor: theme.colors.grey4,
            },
          ]}
        />
        <View style={styles.body}>{children}</View>
        <View
          style={[
            styles.line,
            {
              backgroundColor: theme.colors.grey4,
            },
          ]}
        />
        <View style={styles.footer}>
          <Pressable style={styles.button} onPress={onClose}>
            <Text
              style={[
                theme.typography.body.medium,
                {
                  color: theme.colors.white,
                },
              ]}>
              Cancel
            </Text>
          </Pressable>
          <View
            style={[
              styles.verticalLine,
              {
                backgroundColor: theme.colors.grey4,
              },
            ]}
          />
          <Pressable
            style={styles.button}
            onPress={disabled ? () => {} : onAction}
            disabled={!!disabled}>
            <Text
              style={[
                disabled && {opacity: 0.5},
                theme.typography.subheader.small,
                {
                  color: primaryActionColor || theme.colors.white,
                },
              ]}>
              {primaryActionLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  backDrop: {
    flex: 1,
    position: 'absolute',
    padding: verticalScale(48),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(8),
    maxWidth: scale(350),
    minWidth: scale(310),

    shadowColor: 'rgba(0, 0, 0)',
    shadowOpacity: 0.18,
    shadowRadius: scale(36),
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    elevation: 5,
    opacity: 0.9,
  },
  header: {
    padding: scale(16),
  },
  body: {
    padding: scale(24),
  },

  line: {
    height: verticalScale(0.5),
  },

  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: scale(8),
  },

  button: {
    display: 'flex',
    flexGrow: 1,
    padding: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },

  verticalLine: {
    width: scale(0.5),
  },
});

export default Dialog;
