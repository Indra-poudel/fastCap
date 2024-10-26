import {Group, rect} from '@shopify/react-native-skia';
import React from 'react';
import {GeneratedSentence} from 'utils/sentencesBuilder';

type ClipEffectProps = {
  children: React.ReactNode;
  currentTime: number;
  currentSentence: GeneratedSentence;
  x: number;
  y: number;
  width: number;
  height: number;
};

const OffScreenClipEffect = ({
  children,
  currentTime,
  currentSentence,
  x,
  y,
  width,
  height,
}: ClipEffectProps) => {
  // Calculate the total duration of the sentence
  const totalDurationOfSentence = currentSentence.end - currentSentence.start;

  // Calculate how much of the sentence duration has passed based on currentTime
  const elapsedTime = currentTime - currentSentence.start;

  // Ensure elapsedTime is within bounds to avoid negative or overextending width
  const clampedElapsedTime = Math.max(
    0,
    Math.min(elapsedTime, totalDurationOfSentence),
  );

  // Calculate the occupied width proportionally to the elapsed time
  const occupiedWidth = (clampedElapsedTime / totalDurationOfSentence) * width;

  // Define the clipping rectangle using the calculated width
  const clipRect = rect(x || 0, y || 0, occupiedWidth || 0, height);

  return <Group clip={clipRect}>{children}</Group>;
};

export default OffScreenClipEffect;
