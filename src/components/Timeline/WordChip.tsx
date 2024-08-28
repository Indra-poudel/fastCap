import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Animated, {
  SharedValue,
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  useSharedValue,
} from 'react-native-reanimated';
import {verticalScale} from 'react-native-size-matters/extend';
import {useTheme} from 'theme/ThemeContext';

type WordChipProps = {
  label: string;
  uuid: string;
  onPress: (uuid: string) => void;
  end: number;
  currentTime: SharedValue<number>;
  start: number;
  setWordTimelineX: SharedValue<number>;
  direction: SharedValue<number>;
};

const WordChip = ({
  uuid,
  label,
  currentTime,
  end,
  onPress,
  start,
  setWordTimelineX,
  direction,
}: WordChipProps) => {
  const {theme} = useTheme();
  const animatedRef = useAnimatedRef<Animated.View>();
  const isAlreadyShifted = useSharedValue(false);
  const isActive = useSharedValue(false);

  useAnimatedReaction(
    () => {
      return currentTime.value >= start && currentTime.value <= end;
    },
    active => {
      isActive.value = active;
    },
    [currentTime],
  );

  useAnimatedReaction(
    () =>
      currentTime.value > end &&
      !isAlreadyShifted.value &&
      direction.value === -1,
    shouldShift => {
      if (shouldShift) {
        const dimension = measure(animatedRef);
        isAlreadyShifted.value = true;
        setWordTimelineX.value -= (dimension?.width || 0) + 12;
      }
    },
    [currentTime, isAlreadyShifted, direction],
  );

  useAnimatedReaction(
    () =>
      currentTime.value <= end &&
      isAlreadyShifted.value &&
      direction.value === 1,
    shouldReset => {
      if (shouldReset) {
        isAlreadyShifted.value = false;
        const dimension = measure(animatedRef);
        setWordTimelineX.value += (dimension?.width || 0) + 12;
      }
    },
    [currentTime, isAlreadyShifted, direction],
  );

  const handlePress = () => {
    onPress(uuid);
  };

  return (
    <Animated.View
      ref={animatedRef}
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.colors.black4,
        },
      ]}>
      <Pressable onPress={handlePress}>
        <Text
          style={[
            theme.typography.subheader.small,
            {
              color: theme.colors.white,
            },
          ]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(4),
    paddingHorizontal: verticalScale(12),
    overflow: 'hidden',
    borderRadius: 4,
  },
});

export default WordChip;
