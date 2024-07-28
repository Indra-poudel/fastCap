import {useMemo} from 'react';
import {useWindowDimensions} from 'react-native';
import {
  Skia,
  useFonts,
  SkParagraphStyle,
  TextAlign,
} from '@shopify/react-native-skia';
import {fontSource} from 'constants/fonts';

type ParagraphProps = {
  words: string[];
  canvasPadding: number;
  paragraphStyle?: SkParagraphStyle;
  x: number;
  y: number;
};

export const useParagraphDimensions = ({
  words,
  canvasPadding,
  paragraphStyle,
  x,
  y,
}: ParagraphProps) => {
  const fontMgr = useFonts(fontSource);
  const {width: totalWidth} = useWindowDimensions();
  const totalAvailableWidth = totalWidth - canvasPadding * 2;

  const memoizedParagraphStyle = useMemo(() => {
    return {
      textAlign: TextAlign.Left,
      ...paragraphStyle,
      textStyle: {
        ...paragraphStyle?.textStyle,
      },
    };
  }, [paragraphStyle]);

  const {wordDimensions, width, height, numberOfLines} = useMemo(() => {
    if (!fontMgr) {
      return {
        wordDimensions: words.map(() => ({
          width: 0,
          height: 0,
          x: 0,
          y: 0,
        })),
        width: 0,
        height: 0,
        numberOfLines: 0,
      };
    }

    // Calculate the width of a space character
    const spaceBuilder = Skia.ParagraphBuilder.Make(
      memoizedParagraphStyle,
      fontMgr,
    );
    spaceBuilder.addText(' ');
    const spaceParagraph = spaceBuilder.build();
    spaceParagraph.layout(totalAvailableWidth);
    const spaceWidth = spaceParagraph.getMaxIntrinsicWidth();

    // Calculate dimensions for each word
    const wordDimensions = words.map(word => {
      const paraBuilder = Skia.ParagraphBuilder.Make(
        memoizedParagraphStyle,
        fontMgr,
      );
      paraBuilder.addText(word);

      const para = paraBuilder.build();
      para.layout(totalAvailableWidth);

      const width = para.getMaxIntrinsicWidth();
      const height = para.getHeight();

      return {width, height, x: 0, y: 0};
    });

    // Calculate dimensions for the whole sentence
    const paraBuilder = Skia.ParagraphBuilder.Make(
      memoizedParagraphStyle,
      fontMgr,
    );
    const fullSentence = words.join(' ');
    paraBuilder.addText(fullSentence);
    const para = paraBuilder.build();
    para.layout(totalAvailableWidth);

    const width = para.getMaxIntrinsicWidth();
    const height = para.getHeight();

    // Calculate positions for each word
    let currentLineWidth = 0;
    let currentLineHeight = 0;
    let currentY = y;
    let numberOfLines = 1;
    let currentX = x + canvasPadding;

    const positions = words.map((word, index) => {
      const {width: wordWidth, height: wordHeight} = wordDimensions[index];
      const wordWidthWithSpace =
        wordWidth + (index < words.length - 1 ? spaceWidth : 0);

      if (currentLineWidth + wordWidthWithSpace > totalAvailableWidth) {
        currentLineWidth = wordWidthWithSpace;
        currentY += currentLineHeight;
        currentLineHeight = wordHeight;
        numberOfLines++;
        currentX = x + canvasPadding; // Reset X position for new line
      } else {
        currentLineWidth += wordWidthWithSpace;
        currentLineHeight = Math.max(currentLineHeight, wordHeight);
      }

      const wordX = currentX;
      const wordY = currentY + canvasPadding;

      currentX += wordWidthWithSpace; // Update X position for the next word

      return {
        width: wordWidth,
        height: wordHeight,
        x: wordX,
        y: wordY,
      };
    });

    return {
      wordDimensions: positions,
      width,
      height,
      numberOfLines,
    };
  }, [
    canvasPadding,
    fontMgr,
    memoizedParagraphStyle,
    totalAvailableWidth,
    words,
    x,
    y,
  ]);

  return {wordDimensions, totalAvailableWidth, width, height, numberOfLines};
};
