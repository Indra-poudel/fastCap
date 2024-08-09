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
  Easing,
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSpring,
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

const TemplateOne = ({currentTime, sentences}: CustomParagraphProps) => {
  const customFontMgr = useFonts(fontSource);

  const {height, width} = useWindowDimensions();
  const currentSentence = useSharedValue<GeneratedSentence>(EMPTY_SENTENCE);

  const animatedY = useSharedValue<number>(height / 1.75);

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
    paragraph.layout(width - 32);
    return paragraph;
  }, [customFontMgr, currentSentence]);

  useAnimatedReaction(
    () => currentTime.value,
    _currentTime => {
      const activeSentence = sentences.find(
        sentence =>
          _currentTime >= sentence.start && _currentTime <= sentence.end,
      );

      if (activeSentence) {
        animatedY.value = withSpring(height / 1.5, {
          duration: 1000,
        });
        currentSentence.value = activeSentence;
      } else {
        animatedY.value = height / 1.75;
        currentSentence.value = EMPTY_SENTENCE;
      }
    },
    [currentTime, sentences],
  );

  const paragraphHeight = useDerivedValue(() => {
    return paragraph.value?.getHeight() || 0;
  }, [paragraph]);

  const paragraphWidth = useDerivedValue(() => {
    return paragraph.value?.getMaxIntrinsicWidth() || 0;
  }, [paragraph]);

  const paragraphXpos = useDerivedValue(() => {
    return width / 2 - paragraphWidth.value / 2;
  }, [paragraphWidth]);

  return (
    <>
      <RoundedRect
        x={paragraphXpos}
        y={animatedY}
        width={paragraphWidth}
        height={paragraphHeight}
        r={0}
        color="black"
        opacity={0.5}
      />
      <Paragraph
        paragraph={paragraph}
        x={16}
        y={animatedY}
        width={width - 32}
      />
    </>
  );
};

export default TemplateOne;
