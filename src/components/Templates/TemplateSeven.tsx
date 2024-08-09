import React from 'react';
import {
  Paragraph,
  Skia,
  useFonts,
  TextAlign,
  SkParagraphStyle,
  SkTextStyle,
  PaintStyle,
  Group,
  Paint,
  Shadow,
  FontWeight,
  RoundedRect,
  Mask,
  Rect,
  rect,
} from '@shopify/react-native-skia';
import {fontSource} from 'constants/fonts';
import {
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {GeneratedSentence} from 'utils/sentencesBuilder';
import {useWindowDimensions} from 'react-native';

type CustomParagraphProps = {
  currentTime: SharedValue<number>;
  sentences: GeneratedSentence[];
  frameRate: number;
};

const EMPTY_SENTENCE = {
  text: '',
  words: [],
  start: 0,
  end: 0,
};

const TEMPLATE_DETAILS = {
  color: 'transparent',
  activeWord: {
    // background: '#5966EC',
    background: 'transparent',
    color: '#ffffff',
  },
  fontFamily: 'HandMarker',
  outlineColor: '#B82851',
};

const TemplateFive = ({currentTime, sentences}: CustomParagraphProps) => {
  const customFontMgr = useFonts(fontSource);

  const {height, width} = useWindowDimensions();
  const currentSentence = useSharedValue<GeneratedSentence>(EMPTY_SENTENCE);

  const animatedWidth = useSharedValue(0);

  const paragraph = useDerivedValue(() => {
    // Are the font loaded already?
    if (!customFontMgr) {
      return null;
    }
    const paragraphStyle: SkParagraphStyle = {
      textAlign: TextAlign.Center,
    };
    const textStyle: SkTextStyle = {
      color: Skia.Color('white'),
      fontFamilies: [TEMPLATE_DETAILS.fontFamily],
      fontSize: 48,
    };

    const paragraphBuilder = Skia.ParagraphBuilder.Make(
      paragraphStyle,
      customFontMgr,
    );

    currentSentence.value.words.forEach((word, _index) => {
      paragraphBuilder.pushStyle(
        {
          ...textStyle,
          color: Skia.Color(TEMPLATE_DETAILS.activeWord.color),
        },
        undefined,
        undefined,
      );

      paragraphBuilder.addText(word.text + ' '); // Add space after each word
      paragraphBuilder.pop();
    });

    const paragraph = paragraphBuilder.build();
    paragraph.layout(width - 32);
    return paragraph;
  }, [customFontMgr, currentSentence]);

  const outLine = useDerivedValue(() => {
    // Are the font loaded already?
    if (!customFontMgr) {
      return null;
    }
    const paragraphStyle: SkParagraphStyle = {
      textAlign: TextAlign.Center,
    };
    const textStyle: SkTextStyle = {
      color: Skia.Color(TEMPLATE_DETAILS.outlineColor),
      fontFamilies: [TEMPLATE_DETAILS.fontFamily],
      fontSize: 48,
      fontStyle: {
        weight: FontWeight.Bold,
      },
    };

    const paragraphBuilder = Skia.ParagraphBuilder.Make(
      paragraphStyle,
      customFontMgr,
    );

    const foregroundPaint = Skia.Paint();
    foregroundPaint.setStyle(PaintStyle.Stroke);
    foregroundPaint.setColor(Skia.Color(TEMPLATE_DETAILS.outlineColor));
    foregroundPaint.setStrokeWidth(5);

    currentSentence.value.words.forEach((word, _index) => {
      paragraphBuilder.pushStyle(
        {
          ...textStyle,
          color: Skia.Color(TEMPLATE_DETAILS.activeWord.color),
        },
        foregroundPaint,
        undefined,
      );

      paragraphBuilder.addText(word.text + ' '); // Add space after each word
      paragraphBuilder.pop();
    });

    const paragraph = paragraphBuilder.build();
    paragraph.layout(width - 32);
    return paragraph;
  }, [customFontMgr, currentSentence]);

  const paragraphDimension = useDerivedValue(() => {
    return paragraph.value?.getMaxIntrinsicWidth() || 0;
  }, [paragraph]);

  useAnimatedReaction(
    () => currentTime.value,
    _currentTime => {
      const activeSentence = sentences.find(
        sentence =>
          _currentTime >= sentence.start && _currentTime <= sentence.end,
      );

      if (activeSentence) {
        currentSentence.value = activeSentence;
      } else {
        currentSentence.value = EMPTY_SENTENCE;
      }
    },
    [currentTime, sentences],
  );

  useAnimatedReaction(
    () => currentSentence.value,
    _currentSentence => {
      if (_currentSentence) {
        const finalWidth = paragraphDimension.value + 16;
        animatedWidth.value = withTiming(finalWidth, {
          duration: _currentSentence.end - _currentSentence.start,
        });
      }
    },
    [currentSentence, paragraphDimension],
  );

  const MaskRectX = useDerivedValue(() => {
    return (width - 32) / 2 - paragraphDimension.value / 2 + 16;
  }, [paragraphDimension]);

  const paragraphWidth = useDerivedValue(() => {
    const maxWidthOutBreak = paragraph.value?.getMaxIntrinsicWidth() || 0;
    const maxLayoutWidth = paragraph.value?.getMaxWidth() || 0;

    const width =
      maxWidthOutBreak > maxLayoutWidth ? maxLayoutWidth : maxWidthOutBreak;

    return width || 0;
  }, [paragraph]);

  const paragraphHeight = useDerivedValue(() => {
    return paragraph.value?.getHeight() || 0;
  }, [paragraph]);

  const clipRect = useDerivedValue(() => {
    return rect(
      MaskRectX.value,
      height / 1.5 - 16,
      animatedWidth.value,
      paragraphHeight.value + 32,
    );
  }, [animatedWidth, paragraph]);

  return (
    <Group
      clip={clipRect}
      layer={
        <Paint>
          <Shadow
            blur={3}
            dx={0}
            dy={0}
            color={Skia.Color(TEMPLATE_DETAILS.outlineColor)}
          />
        </Paint>
      }>
      <Paragraph
        paragraph={outLine}
        x={16}
        y={height / 1.5}
        width={width - 32}
      />
      <Paragraph
        paragraph={paragraph}
        x={16}
        y={height / 1.5}
        width={width - 32}
      />
    </Group>
  );
};

export default TemplateFive;
