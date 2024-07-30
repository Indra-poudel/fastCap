import React from 'react';
import {
  Paragraph,
  Skia,
  useFonts,
  TextAlign,
  Mask,
  Rect,
  SkParagraphStyle,
  SkTextStyle,
  PaintStyle,
  Group,
  Paint,
  Shadow,
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

const MyParagraph = ({currentTime, sentences}: CustomParagraphProps) => {
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
      fontFamilies: ['Inter'],
      fontSize: 32,
    };

    const paragraphBuilder = Skia.ParagraphBuilder.Make(
      paragraphStyle,
      customFontMgr,
    );

    currentSentence.value.words.forEach((word, _index) => {
      paragraphBuilder.pushStyle(
        {
          ...textStyle,
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
      color: Skia.Color('white'),
      fontFamilies: ['Inter'],
      fontSize: 32,
    };

    const paragraphBuilder = Skia.ParagraphBuilder.Make(
      paragraphStyle,
      customFontMgr,
    );

    const foregroundPaint = Skia.Paint();
    foregroundPaint.setStyle(PaintStyle.Stroke);
    foregroundPaint.setColor(Skia.Color('black'));
    foregroundPaint.setStrokeWidth(5);

    currentSentence.value.words.forEach((word, _index) => {
      paragraphBuilder.pushStyle(
        {
          ...textStyle,
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
    [paragraphDimension, currentTime, sentences],
  );

  useAnimatedReaction(
    () => currentSentence.value,
    _currentSentence => {
      if (_currentSentence) {
        animatedWidth.value = withTiming(paragraphDimension.value, {
          duration: _currentSentence.end - _currentSentence.start,
        });
      }
    },
    [currentSentence, paragraphDimension],
  );

  const MaskRectX = useDerivedValue(() => {
    return (width - 32) / 2 - paragraphDimension.value / 2 + 16;
  }, [paragraphDimension]);

  return (
    <>
      <Group
        layer={
          <Paint>
            <Shadow blur={0} dx={0} dy={4} color={Skia.Color('Black')} />
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
      <Mask
        mask={
          <Group
            layer={
              <Paint>
                <Shadow blur={0} dx={0} dy={4} color={Skia.Color('Black')} />
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
        }
        mode="luminance">
        <Rect
          width={animatedWidth}
          x={MaskRectX}
          y={height / 1.5}
          height={height}
          color={Skia.Color('orange')}
        />
      </Mask>
    </>
  );
};

export default MyParagraph;
