import React from 'react';
import {
  Paragraph,
  Skia,
  useFonts,
  TextAlign,
  SkParagraphStyle,
  SkTextStyle,
  FontWeight,
  RoundedRect,
} from '@shopify/react-native-skia';
import {fontSource} from 'constants/fonts';
import {
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import {GeneratedSentence} from 'utils/sentencesBuilder';
import {useWindowDimensions} from 'react-native';

type CustomParagraphProps = {
  currentTime: SharedValue<number>;
  sentences: GeneratedSentence[];
  frameRate: number;
  paragraphLayoutWidth: SharedValue<number>;
  x?: SharedValue<number>;
  y?: SharedValue<number>;
  backgroundPadding: number;
  canvasHeight: SharedValue<number>;
  backgroundOpacity: number;
};

const EMPTY_SENTENCE = {
  text: '',
  words: [],
  start: 0,
  end: 0,
};

const TEMPLATE_DETAILS = {
  color: '#ffffff',
  activeWord: {
    // background: '#5966EC',
    //color: '#5966EC
    // inactive: '#708090'

    // '#FF69B4' '#FFB6C1'
    background: 'transparent',
    color: '#c6fd78',
  },
  fontFamily: 'EuclidCircularA',
};

const TemplateOne = ({
  currentTime,
  sentences,
  paragraphLayoutWidth,
  backgroundPadding,
  canvasHeight,
  backgroundOpacity,
}: CustomParagraphProps) => {
  const customFontMgr = useFonts(fontSource);

  const {height, width} = useWindowDimensions();
  const currentSentence = useSharedValue<GeneratedSentence>(EMPTY_SENTENCE);

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
      fontSize: 32,
      fontStyle: {
        weight: FontWeight.Bold,
      },
    };

    const paragraphBuilder = Skia.ParagraphBuilder.Make(
      paragraphStyle,
      customFontMgr,
    );

    currentSentence.value.words.forEach((word, _index) => {
      const isActiveWord =
        currentTime.value >= word.start && currentTime.value <= word.end;

      paragraphBuilder.pushStyle({
        ...textStyle,
        backgroundColor: isActiveWord
          ? Skia.Color(TEMPLATE_DETAILS.activeWord.background)
          : Skia.Color('transparent'),
        color: isActiveWord
          ? Skia.Color(TEMPLATE_DETAILS.activeWord.color)
          : Skia.Color(TEMPLATE_DETAILS.color),
      });

      paragraphBuilder.addText(word.text + ' '); // Add space after each word
      paragraphBuilder.pop();
    });

    const paragraph = paragraphBuilder.build();
    paragraph.layout(paragraphLayoutWidth.value);

    return paragraph;
  }, [customFontMgr, currentSentence, paragraphLayoutWidth]);

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

  const paragraphHeight = useDerivedValue(() => {
    return paragraph.value?.getHeight() || 0;
  }, [paragraph]);

  const paragraphWidth = useDerivedValue(() => {
    const maxWidthOutBreak = paragraph.value?.getMaxIntrinsicWidth() || 0;
    const maxLayoutWidth = paragraph.value?.getMaxWidth() || 0;

    const width =
      maxWidthOutBreak > maxLayoutWidth ? maxLayoutWidth : maxWidthOutBreak;

    return width || 0;
  }, [paragraph]);

  const minX = useDerivedValue(() => {
    return (
      paragraphLayoutWidth.value / 2 -
      paragraphWidth.value / 2 +
      // adding black space
      (width - paragraphLayoutWidth.value) / 2
    );
  }, [width, paragraphLayoutWidth, paragraphWidth]);

  const backgroundWidth = useDerivedValue(() => {
    if (paragraphWidth.value) {
      return paragraphWidth.value + backgroundPadding * 2;
    } else {
      return 0;
    }
  }, [paragraphWidth]);

  const backgroundX = useDerivedValue(() => {
    return minX.value - backgroundPadding;
  }, [minX]);

  const posY = useDerivedValue(() => {
    return canvasHeight.value / 1 - paragraphHeight.value;
  }, [paragraphHeight, canvasHeight]);

  return (
    <>
      <RoundedRect
        x={backgroundX}
        y={posY}
        width={backgroundWidth}
        height={paragraphHeight}
        r={0}
        color="black"
        opacity={backgroundOpacity}
      />
      <Paragraph
        paragraph={paragraph}
        x={minX}
        y={posY}
        width={paragraphWidth}
      />
    </>
  );
};

export default TemplateOne;
