import {
  LinearGradient,
  Mask,
  Rect,
  GradientProps as SkiaGradientProps,
} from '@shopify/react-native-skia';
import React from 'react';
import {GeneratedSentence} from 'utils/sentencesBuilder';

type GradientProps = {
  currentTime: number;
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  currentSentence: GeneratedSentence;
  strokeWidth: number;
} & SkiaGradientProps;

const OffScreenGradient = ({
  children,
  width,
  x,
  y,
  height,
  colors,
  positions,
  strokeWidth,
}: GradientProps) => {
  // Directly calculate start and end points
  const startPoint = {
    x: x + strokeWidth,
    y: y + strokeWidth,
  };

  const endPoint = {
    x: x + strokeWidth,
    y: y + height + strokeWidth,
  };

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

export default OffScreenGradient;
