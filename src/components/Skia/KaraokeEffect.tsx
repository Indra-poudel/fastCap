import {Mask, Rect, SkColor} from '@shopify/react-native-skia';
import React from 'react';
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type KaraokeTextProps = {
  x: number;
  y: number;
  fillColor: SkColor;
  duration: number;
  width: number;
  height: number;
  children: React.ReactNode;
  currentTime: SharedValue<number>;
  end: number;
  start: number;
};

const KaraokeEffect = ({
  fillColor,
  x,
  y,
  duration,
  width,
  height,
  children,
  currentTime,
  start,
  end,
}: KaraokeTextProps) => {
  const animatedFillWidth = useSharedValue(0);
  const hasAnimated = useSharedValue(false);

  useAnimatedReaction(
    () => currentTime.value,
    latestTime => {
      if (
        latestTime >= start &&
        latestTime <= end &&
        hasAnimated.value === false
      ) {
        animatedFillWidth.value = withTiming(width, {
          duration: duration,
        });
        hasAnimated.value = true;
      } else {
        hasAnimated.value = false;
      }
    },
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
