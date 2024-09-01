import {
  LinearGradient,
  GradientProps as SkiaGradientProps,
  Mask,
  Rect,
} from '@shopify/react-native-skia';
import React from 'react';
import {SharedValue, useDerivedValue} from 'react-native-reanimated';
import {GeneratedSentence} from 'utils/sentencesBuilder';

type GradientProps = {
  currentTime: SharedValue<number>;
  children: React.ReactNode;
  x: SharedValue<number>;
  y: SharedValue<number>;
  width: SharedValue<number>;
  height: SharedValue<number>;
  effect?: 'karaoke clip';
  currentSentence: SharedValue<GeneratedSentence>;
  paused?: SharedValue<boolean>;
  strokeWidth: number;
} & SkiaGradientProps;

const Gradient = ({
  children,
  width,
  x,
  y,
  height,
  colors,
  positions,
  strokeWidth,
}: GradientProps) => {
  const startPoint = useDerivedValue(() => {
    return {
      x: x.value + strokeWidth,
      y: y.value + strokeWidth,
    };
  }, [x, y]);

  const endPoint = useDerivedValue(() => {
    return {
      x: x.value + strokeWidth,
      y: y.value + height.value + strokeWidth,
    };
  }, [x, y, height]);

  return (
    <>
      {children}
      <Mask mask={children} mode="luminance">
        <Rect x={x} y={y} width={width} height={height}>
          <LinearGradient
            start={startPoint}
            end={endPoint}
            colors={colors}
            positions={positions}
            mode={'clamp'}
          />
        </Rect>
      </Mask>
    </>
  );
};

export default Gradient;
