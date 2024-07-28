import {
  SkPaint,
  SkParagraphStyle,
  SkTextStyle,
  Skia,
  TextAlign,
  useFonts,
} from '@shopify/react-native-skia';
import {fontSource} from 'constants/fonts';
import {useMemo} from 'react';
import {useWindowDimensions} from 'react-native';

type ParagraphProps = {
  label: string;
  textStyle: SkTextStyle;
  foregroundPaint?: SkPaint | undefined;
  backgroundPaint?: SkPaint | undefined;
  paragraphStyle?: SkParagraphStyle;
  canvasPadding: number;
};

export const useWord = ({
  label,
  textStyle,
  foregroundPaint,
  backgroundPaint,
  paragraphStyle,
  canvasPadding,
}: ParagraphProps) => {
  const fontMgr = useFonts(fontSource);
  const {width: totalWidth} = useWindowDimensions();
  const totalAvailableWidthForWord = totalWidth - canvasPadding * 2;

  const text = useMemo(() => {
    // Are the font loaded already?
    if (!fontMgr) {
      return {
        paragraph: null,
        height: 0,
        width: 0,
        totalAvailableWidthForWord,
      };
    }
    const _paragraphStyle: SkParagraphStyle = {
      textAlign: TextAlign.Left,
      ...paragraphStyle,
    };

    const paraBuilder = Skia.ParagraphBuilder.Make(_paragraphStyle, fontMgr);
    paraBuilder.pushStyle(
      {
        ...textStyle,
      },
      foregroundPaint,
      backgroundPaint,
    );
    paraBuilder.addText(label);

    const para = paraBuilder.build();

    para.layout(totalAvailableWidthForWord);

    const height = para.getHeight();
    const width = para.getMaxWidth();

    console.log('Use word', label, width);

    return {
      paragraph: para,
      height,
      width,
      totalAvailableWidthForWord,
    };
  }, [
    backgroundPaint,
    fontMgr,
    foregroundPaint,
    label,
    paragraphStyle,
    textStyle,
    totalAvailableWidthForWord,
  ]);

  return {
    height: text?.height,
    width: text?.width,
    text: text?.paragraph,
    fontMgr,
    totalAvailableWidthForWord,
  };
};
