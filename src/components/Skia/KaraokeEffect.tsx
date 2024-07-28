import {Mask, Rect, SkColor} from '@shopify/react-native-skia';
import React, {useEffect, useState} from 'react';
import {
  SharedValue,
  runOnJS,
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
  const [isActive, setIsActive] = useState(false);

  useAnimatedReaction(
    () => currentTime.value,
    latestTime => {
      if (latestTime >= start && latestTime <= end) {
        runOnJS(setIsActive)(true);
      } else {
        runOnJS(setIsActive)(false);
      }
    },
  );

  useEffect(() => {
    if (isActive) {
      animatedFillWidth.value = withTiming(width, {
        duration: duration,
      });
    }
  }, [animatedFillWidth, duration, isActive, width]);

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
