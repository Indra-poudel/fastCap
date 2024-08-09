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

type CustomParagraphProps = {
  currentTime: SharedValue<number>;
  sentences: GeneratedSentence[];
  paragraphLayoutWidth: SharedValue<number>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  backgroundPadding: number;
  backgroundOpacity: number;
  setTemplateHeight: SharedValue<number>;
  setTemplateWidth: SharedValue<number>;
  setX: SharedValue<number>;
  setY: SharedValue<number>;
  alignment: TextAlign;
  backgroundRadius: number;
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

const Template = ({
  currentTime,
  sentences,
  paragraphLayoutWidth,
  backgroundPadding,
  backgroundOpacity,
  x,
  y,
  setX,
  setY,
  setTemplateHeight,
  setTemplateWidth,
  alignment,
}: CustomParagraphProps) => {
  const customFontMgr = useFonts(fontSource);

  const currentSentence = useSharedValue<GeneratedSentence>(EMPTY_SENTENCE);

  const paragraph = useDerivedValue(() => {
    // Are the font loaded already?
    if (!customFontMgr) {
      return null;
    }
    const paragraphStyle: SkParagraphStyle = {
      textAlign: alignment,
    };
    const textStyle: SkTextStyle = {
      color: Skia.Color('white'),
      fontFamilies: [TEMPLATE_DETAILS.fontFamily],
      fontSize: 24,
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
    if (alignment === TextAlign.Left) {
      return x.value - paragraphWidth.value / 2;
    }
    if (alignment === TextAlign.Center) {
      return (
        x.value -
        paragraphWidth.value / 2 -
        (paragraphLayoutWidth.value - paragraphWidth.value) / 2
      );
    } else {
      return (
        x.value -
        paragraphWidth.value / 2 -
        (paragraphLayoutWidth.value - paragraphWidth.value)
      );
    }
  }, [paragraphLayoutWidth, x, paragraphWidth]);

  const backgroundWidth = useDerivedValue(() => {
    if (paragraphWidth.value) {
      return paragraphWidth.value + backgroundPadding * 2;
    } else {
      return 0;
    }
  }, [paragraphWidth]);

  const backgroundHeight = useDerivedValue(() => {
    return paragraphHeight.value + backgroundPadding * 2;
  }, [paragraphHeight]);

  const backgroundX = useDerivedValue(() => {
    if (alignment === TextAlign.Left) {
      return minX.value - backgroundPadding;
    } else if (alignment === TextAlign.Center) {
      return (
        minX.value +
        (paragraphLayoutWidth.value - paragraphWidth.value) / 2 -
        backgroundPadding
      );
    } else {
      return (
        minX.value +
        (paragraphLayoutWidth.value - paragraphWidth.value) -
        backgroundPadding
      );
    }
  }, [minX, paragraphWidth, paragraphLayoutWidth]);

  const backgroundY = useDerivedValue(() => {
    return y.value;
  }, [y, backgroundPadding]);

  const minY = useDerivedValue(() => {
    return y.value + backgroundPadding;
  }, [y]);

  useAnimatedReaction(
    () => backgroundY.value,
    value => {
      setY.value = value;
    },
    [backgroundY],
  );

  useAnimatedReaction(
    () => backgroundWidth.value,
    value => {
      setTemplateWidth.value = value;
    },
    [backgroundWidth],
  );

  useAnimatedReaction(
    () => backgroundHeight.value,
    value => {
      setTemplateHeight.value = value;
    },
    [backgroundHeight],
  );

  useAnimatedReaction(
    () => backgroundX.value,
    value => {
      setX.value = value;
    },
    [backgroundX],
  );

  return (
    <>
      <RoundedRect
        x={backgroundX}
        y={backgroundY}
        width={backgroundWidth}
        height={backgroundHeight}
        r={0}
        color="black"
        opacity={backgroundOpacity}
        origin={{
          x: 0,
          y: 0,
        }}
      />
      <Paragraph
        paragraph={paragraph}
        x={minX}
        y={minY}
        width={paragraphLayoutWidth}
      />
    </>
  );
};

export default Template;
