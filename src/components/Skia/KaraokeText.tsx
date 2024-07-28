import {
  Mask,
  Paragraph,
  Rect,
  SkColor,
  SkTextStyle,
} from '@shopify/react-native-skia';
import {useWord} from 'hooks/useWord';
import React, {useEffect, useState} from 'react';
import {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type KaraokeTextProps = {
  label: string;
  size: number;
  fontFamily: string;
  color: SkColor;
  x: number;
  y: number;
  textStyle?: SkTextStyle;
  fillColor: SkColor;
  currentTime: SharedValue<number>;
  end: number;
  start: number;
};

const KaraokeText = ({
  label,
  size,
  color,
  fillColor,
  x,
  y,
  currentTime,
  end,
  start,
}: KaraokeTextProps) => {
  const {height, width, text} = useWord({
    canvasPadding: 16,
    label,
    textStyle: {
      color,
      fontSize: size,
    },
  });

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
        duration: end - start,
      });
    }
  }, [isActive, width, animatedFillWidth, end, start]);

  return (
    <>
      <Paragraph paragraph={text} x={x} y={y} width={width} />
      <Mask mask={<Paragraph paragraph={text} x={x} y={y} width={width} />}>
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

// Custom comparison function for React.memo
const arePropsEqual = (
  prevProps: KaraokeTextProps,
  nextProps: KaraokeTextProps,
) => {
  return (
    prevProps.label === nextProps.label &&
    prevProps.size === nextProps.size &&
    prevProps.color === nextProps.color &&
    prevProps.fillColor === nextProps.fillColor &&
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.end === nextProps.end &&
    prevProps.start === nextProps.start
  );
};

export default React.memo(KaraokeText, arePropsEqual);
