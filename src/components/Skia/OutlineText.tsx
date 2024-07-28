import {
  Group,
  PaintStyle,
  Paragraph,
  SkColor,
  SkTextStyle,
  Skia,
} from '@shopify/react-native-skia';
import KaraokeEffect from 'components/Skia/KaraokeEffect';
import {useWord} from 'hooks/useWord';
import React from 'react';
import {SharedValue} from 'react-native-reanimated';

type OutlineTextProps = {
  label: string;
  size: number;
  fontFamily: string;
  color: SkColor;
  x: number;
  y: number;
  textStyle?: SkTextStyle;
  strokeColor: SkColor;
  strokeWidth: number;
  currentTime: SharedValue<number>;
  end: number;
  start: number;
};

const OutlineText = ({
  label,
  size,
  color,
  strokeColor,
  strokeWidth,
  x,
  y,
  textStyle,
  currentTime,
  end,
  start,
}: OutlineTextProps) => {
  const foregroundPaint = Skia.Paint();
  foregroundPaint.setStyle(PaintStyle.Stroke);
  foregroundPaint.setColor(strokeColor);
  foregroundPaint.setStrokeWidth(strokeWidth);
  const {
    height,
    width,
    text: outlineText,
  } = useWord({
    label,
    textStyle: {
      color,
      fontSize: size,
      ...textStyle,
    },
    canvasPadding: 16,
    foregroundPaint,
  });

  const {text} = useWord({
    label,
    textStyle: {
      color,
      fontSize: size,
      ...textStyle,
    },
    canvasPadding: 16,
  });

  return (
    <KaraokeEffect
      x={x}
      y={y}
      fillColor={Skia.Color('orange')}
      duration={end - start}
      width={width}
      height={height}
      currentTime={currentTime}
      end={end}
      start={start}>
      <Group>
        <Paragraph paragraph={outlineText} x={x} y={y} width={width} />
        <Paragraph paragraph={text} x={x} y={y} width={width} />
      </Group>
    </KaraokeEffect>
  );
};

export default OutlineText;
