import {Group, rect} from '@shopify/react-native-skia';
import React from 'react';
import {
  SharedValue,
  cancelAnimation,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {GeneratedSentence} from 'utils/sentencesBuilder';

type ClipEffectProps = {
  children: React.ReactNode;
  currentTime: SharedValue<number>;
  currentSentence: SharedValue<GeneratedSentence>;
  paused?: SharedValue<boolean>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  width: SharedValue<number>;
  height: SharedValue<number>;
};

const ClipEffect = ({
  children,
  currentTime,
  currentSentence,
  paused,
  x,
  y,
  width,
  height,
}: ClipEffectProps) => {
  const animatedWidth = useSharedValue(0);

  useAnimatedReaction(
    () => currentTime.value,
    latestTime => {
      if (
        latestTime >= currentSentence.value.start &&
        latestTime <= currentSentence.value.end
      ) {
        const duration =
          currentSentence.value.end - currentSentence.value.start;
        animatedWidth.value = withTiming(width.value, {
          duration,
        });
      } else {
        cancelAnimation(animatedWidth);
        animatedWidth.modify(() => 0, true);
      }
    },
    [paused, currentTime, width],
  );

  const clipRect = useDerivedValue(() => {
    return rect(x.value, y.value, animatedWidth.value, height.value);
  }, [animatedWidth]);

  return <Group clip={clipRect}>{children}</Group>;
};

export default ClipEffect;
