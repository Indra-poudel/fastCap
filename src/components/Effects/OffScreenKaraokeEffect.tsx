import {Mask, Rect, SkColor} from '@shopify/react-native-skia';
import React from 'react';
import {GeneratedSentence} from 'utils/sentencesBuilder';

type KaraokeTextProps = {
  x: number;
  y: number;
  fillColor: SkColor;
  width: number;
  height: number;
  children: React.ReactNode;
  currentTime: number;
  currentSentence: GeneratedSentence;
};

const OffScreenKaraokeEffect = ({
  fillColor,
  x,
  y,
  width,
  height,
  children,
  currentTime,
  currentSentence,
}: KaraokeTextProps) => {
  const totalDuration = currentSentence.end - currentSentence.start;

  const elapsedTime = Math.max(
    0,
    Math.min(currentTime - currentSentence.start, totalDuration),
  );
  const fillWidth = (elapsedTime / totalDuration) * width;

  return (
    <>
      {children}
      <Mask mask={children} mode="luminance">
        <Rect width={fillWidth} x={x} y={y} height={height} color={fillColor} />
      </Mask>
    </>
  );
};

export default OffScreenKaraokeEffect;
