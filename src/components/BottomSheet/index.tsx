import React, {ReactNode} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Text,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SlideInDown,
  SlideOutDown,
  runOnJS,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useTheme} from 'theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {scale, verticalScale} from 'react-native-size-matters/extend';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface BottomSheetProps {
  initialHeightPercentage?: number;
  isDraggable?: boolean;
  onClose?: () => void;
  children: ReactNode;
  label?: string;
  contentWrapperStyle?: StyleProp<ViewStyle>;
  isFullSize?: boolean;
  onTouch?: () => void;
  showCloseIcon?: boolean;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  initialHeightPercentage = 40, // Default to 40% of the screen height
  isDraggable = true, // Default to draggable
  onClose, // Callback when the bottom sheet is closed
  children, // Allowing custom children to be passed
  label,
  contentWrapperStyle,
  isFullSize,
  onTouch,
  showCloseIcon,
}) => {
  const {theme} = useTheme();
  const MAX_TOP = SCREEN_HEIGHT * 0.1; // Maximum top position (20% of screen height)
  const INITIAL_TOP = isFullSize
    ? MAX_TOP
    : SCREEN_HEIGHT * (1 - initialHeightPercentage / 100); // Calculate initial top position
  const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT - INITIAL_TOP; // Height of the bottom sheet

  const RUBBER_BAND_EFFECT_DIVISOR = 2; // Fraction of the translation for a rubber band effect
  const DRAG_CLOSE_THRESHOLD = 0.65; // 65% of the bottom sheet's height
  const SNAP_BACK_ANIMATION_DURATION = 150; // Duration of the snap back animation

  const top = useSharedValue(INITIAL_TOP); // Initially at the specified height
  const startY = useSharedValue(0); // Keep track of the initial touch position

  const singleTap = Gesture.Tap().onStart(() => {
    onTouch && runOnJS(onTouch)();
    return;
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = top.value; // Set startY to the current top value when gesture starts
    })
    .onUpdate(e => {
      // Update top position based on the initial touch position and translationY
      if (isDraggable) {
        top.value = startY.value + e.translationY;
        if (top.value > INITIAL_TOP && !onClose) {
          top.value = INITIAL_TOP; // Prevent dragging down further than initial position
        } else if (top.value < MAX_TOP) {
          top.value = MAX_TOP; // Prevent dragging up further than max position
        }
      } else {
        // Implement rubber band effect when not draggable
        top.value = startY.value + e.translationY / RUBBER_BAND_EFFECT_DIVISOR;
      }
    })
    .onEnd(() => {
      if (
        onClose &&
        top.value > INITIAL_TOP + BOTTOM_SHEET_HEIGHT * DRAG_CLOSE_THRESHOLD
      ) {
        top.value = withTiming(SCREEN_HEIGHT, undefined, () => {
          runOnJS(onClose)();
        });
        // If dragged more than the threshold of the bottom sheet's height, close the bottom sheet
        return;
      } else if (isDraggable) {
        // Snap to initial position if released near it, otherwise snap to MAX_TOP
        if (top.value > (INITIAL_TOP + MAX_TOP) / 2) {
          top.value = withTiming(INITIAL_TOP, {
            duration: SNAP_BACK_ANIMATION_DURATION,
          });
        } else {
          top.value = withTiming(MAX_TOP, {
            duration: SNAP_BACK_ANIMATION_DURATION,
          });
        }
      } else {
        // Snap back to initial position with a spring effect
        top.value = withTiming(INITIAL_TOP, {
          duration: SNAP_BACK_ANIMATION_DURATION,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: top.value,
      height: SCREEN_HEIGHT - top.value,
    };
  });

  const handleClose = () => {
    if (onClose) {
      top.value = withTiming(SCREEN_HEIGHT, undefined, () => {
        runOnJS(onClose)();
      });
    }
  };

  const composed = Gesture.Race(panGesture, singleTap);

  return (
    <>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.touchableArea} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.bottomSheet,
          animatedStyle,
          {
            backgroundColor: theme.colors.black3,
          },
        ]}
        entering={SlideInDown}
        exiting={SlideOutDown}>
        <GestureDetector gesture={composed}>
          <View>
            <View style={styles.handle} />
            <View
              style={[
                styles.header,
                {
                  borderColor: theme.colors.grey2,
                },
              ]}>
              {isFullSize && (
                <Pressable style={[styles.headerIcon]} onPress={handleClose}>
                  <Icon
                    name={'chevron-left'}
                    size={28}
                    color={theme.colors.white}
                  />
                </Pressable>
              )}

              <Text
                style={[
                  theme.typography.header.small,
                  {
                    color: theme.colors.white,
                  },
                ]}>
                {label}
              </Text>

              {showCloseIcon && (
                <Pressable style={[styles.closeIcon]} onPress={handleClose}>
                  <Icon
                    name={'close-circle'}
                    size={24}
                    color={theme.colors.white}
                  />
                </Pressable>
              )}
            </View>
          </View>
        </GestureDetector>

        <Animated.ScrollView
          contentContainerStyle={[styles.content, contentWrapperStyle]}>
          {children}
        </Animated.ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  touchableArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.5,
  },
  bottomSheet: {
    height: SCREEN_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: SCREEN_HEIGHT, // Start at the bottom of the screen
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    shadowColor: '#ccc',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: 6,
  },
  handle: {
    height: verticalScale(5),
    width: scale(40),
    backgroundColor: '#ccc',
    borderRadius: scale(2.5),
    alignSelf: 'center',
    marginVertical: verticalScale(10),
  },
  content: {
    alignItems: 'center',
    flexGrow: 1,
  },

  header: {
    padding: scale(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    position: 'relative',
  },

  headerIcon: {
    alignSelf: 'flex-start',
    position: 'absolute',
    left: scale(10),
    bottom: verticalScale(10),
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  },

  closeIcon: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: scale(10),
    bottom: verticalScale(20),
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  },
});

export default BottomSheet;
