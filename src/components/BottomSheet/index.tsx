import React, {ReactNode} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Text,
  ViewStyle,
  StyleProp,
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

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface BottomSheetProps {
  initialHeightPercentage?: number;
  isDraggable?: boolean;
  onClose?: () => void;
  children: ReactNode;
  label?: string;
  contentWrapperStyle?: StyleProp<ViewStyle>;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  initialHeightPercentage = 40, // Default to 40% of the screen height
  isDraggable = true, // Default to draggable
  onClose, // Callback when the bottom sheet is closed
  children, // Allowing custom children to be passed
  label,
  contentWrapperStyle,
}) => {
  const {theme} = useTheme();
  const INITIAL_TOP = SCREEN_HEIGHT * (1 - initialHeightPercentage / 100); // Calculate initial top position
  const MAX_TOP = SCREEN_HEIGHT * 0.2; // Maximum top position (20% of screen height)
  const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT - INITIAL_TOP; // Height of the bottom sheet

  const RUBBER_BAND_EFFECT_DIVISOR = 2; // Fraction of the translation for a rubber band effect
  const DRAG_CLOSE_THRESHOLD = 0.65; // 65% of the bottom sheet's height
  const SNAP_BACK_ANIMATION_DURATION = 150; // Duration of the snap back animation
  const ENTER_ANIMATION_DURATION = 300; // Duration of the enter animation
  const EXIT_ANIMATION_DURATION = 300; // Duration of the exit animation

  const top = useSharedValue(INITIAL_TOP); // Initially at the specified height
  const startY = useSharedValue(0); // Keep track of the initial touch position

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

      if (
        onClose &&
        top.value > INITIAL_TOP + BOTTOM_SHEET_HEIGHT * DRAG_CLOSE_THRESHOLD
      ) {
        runOnJS(onClose)();
      }
    })
    .onEnd(() => {
      if (
        onClose &&
        top.value > INITIAL_TOP + BOTTOM_SHEET_HEIGHT * DRAG_CLOSE_THRESHOLD
      ) {
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
    };
  });

  const handleOutsidePress = () => {
    if (onClose) {
      top.value = withTiming(SCREEN_HEIGHT, {
        duration: SNAP_BACK_ANIMATION_DURATION,
      }); // Move bottom sheet off screen
      onClose();
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.touchableArea} />
      </TouchableWithoutFeedback>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.bottomSheet,
            animatedStyle,
            {
              backgroundColor: theme.colors.black3,
            },
          ]}
          entering={SlideInDown.duration(ENTER_ANIMATION_DURATION)}
          exiting={SlideOutDown.duration(EXIT_ANIMATION_DURATION)}>
          <View style={styles.handle} />
          <View
            style={[
              styles.header,
              {
                borderColor: theme.colors.grey2,
              },
            ]}>
            <Text
              style={[
                theme.typography.header.small,
                {
                  color: theme.colors.white,
                },
              ]}>
              {label}
            </Text>
          </View>
          <View style={[styles.content, contentWrapperStyle]}>{children}</View>
        </Animated.View>
      </GestureDetector>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#ccc',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 6,
  },
  handle: {
    height: 5,
    width: 40,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },

  header: {
    padding: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
});

export default BottomSheet;
