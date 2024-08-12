import {Mask, Rect, SkColor} from '@shopify/react-native-skia';
import React from 'react';
import {
  SharedValue,
  cancelAnimation,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {GeneratedSentence} from 'utils/sentencesBuilder';

type KaraokeTextProps = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  fillColor: SkColor;
  width: SharedValue<number>;
  height: SharedValue<number>;
  children: React.ReactNode;
  currentTime: SharedValue<number>;
  currentSentence: SharedValue<GeneratedSentence>;
  paused?: SharedValue<boolean>;
};

const KaraokeEffect = ({
  fillColor,
  x,
  y,
  width,
  height,
  children,
  currentTime,
  currentSentence,
  paused,
}: KaraokeTextProps) => {
  const animatedFillWidth = useSharedValue(0);

  useAnimatedReaction(
    () => currentTime.value,
    latestTime => {
      if (
        latestTime >= currentSentence.value.start &&
        latestTime <= currentSentence.value.end
      ) {
        if (paused && paused.value) {
          cancelAnimation(animatedFillWidth);
        } else {
          animatedFillWidth.value = withTiming(width.value, {
            duration: currentSentence.value.end - currentSentence.value.start,
          });
        }
      }
    },
    [paused, currentSentence],
  );

  useAnimatedReaction(
    () => animatedFillWidth.value,
    value => {
      if (value === width.value) {
        animatedFillWidth.value = 0;
      }
    },
    [animatedFillWidth],
  );

  return (
    <>
      {children}
      <Mask mask={children} mode="luminance">
        <Rect
          width={animatedFillWidth}
          x={x}
          y={y}
          height={height}
          color={fillColor}
        />
      </Mask>
    </>
  );
};

export default KaraokeEffect;
