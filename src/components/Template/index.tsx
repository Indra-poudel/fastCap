import React from 'react';
import {
  Paragraph,
  Skia,
  TextAlign,
  SkParagraphStyle,
  FontWeight,
  RoundedRect,
  TextDirection,
  SkTextShadow,
  Group,
  Paint,
  Shadow,
  PaintStyle,
  SkTypefaceFontProvider,
  Color,
  SkPoint,
} from '@shopify/react-native-skia';
import {
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import {GeneratedSentence} from 'utils/sentencesBuilder';
import KaraokeEffect from 'components/Effects/KaraokeEffect';
import ClipEffect from 'components/Effects/ClipEffect';
import {useOption} from 'hooks/useOption';
import Gradient from 'components/Effects/Gradient';

const defaultColor = 'transparent';
const defaultShadow: SkTextShadow = {
  offset: {
    x: 0,
    y: 0,
  },
  blurRadius: 0,
  color: Skia.Color('transparent'),
};

// Utility type to conditionally require certain properties
type RequireIf<T, K extends keyof T, U extends keyof T> = T &
  (undefined extends T[K] ? {} : {[P in U]-?: NonNullable<T[P]>});

type BaseParagraphProps = {
  currentTime: SharedValue<number> | number;
  sentences: GeneratedSentence[];

  paragraphLayoutWidth: SharedValue<number>;
  x: SharedValue<number> | number;
  y: SharedValue<number> | number;

  setTemplateHeight?: SharedValue<number>;
  setTemplateWidth?: SharedValue<number>;
  setX?: SharedValue<number>;
  setY?: SharedValue<number>;

  notHideSentenceBetweenSentenceInterval?: boolean;

  // THEME
  color: string;
  colorBefore?: string;
  colorAfter?: string;
  activeColor?: string;

  backgroundColor?: string;
  backgroundColorBefore?: string;
  backgroundColorAfter?: string;
  activeBackgroundColor?: string;

  fontSize: number;
  fontSizeBefore?: number;
  fontSizeAfter?: number;
  activeFontSize?: number;

  fontFamily: string;

  weight?: FontWeight;
  fontWeightBefore?: FontWeight;
  fontWeightAfter?: FontWeight;
  activeFontWeight?: FontWeight;

  alignment?: TextAlign;
  textDirection?: TextDirection;

  sentenceBackgroundColor?: string;
  sentenceBackgroundPadding?: number;
  sentenceBackgroundOpacity?: number;
  sentenceBackgroundRadius?: number;

  shadow?: {
    color: string;
    offset?: SkPoint;
    blurRadius?: number;
  }[];
  shadowBefore?: {
    color: string;
    offset?: SkPoint;
    blurRadius?: number;
  }[];
  shadowAfter?: {
    color: string;
    offset?: SkPoint;
    blurRadius?: number;
  }[];
  activeShadow?: {
    color: string;
    offset?: SkPoint;
    blurRadius?: number;
  }[];

  sentenceShadow?: {
    dx: number;
    dy: number;
    color: string;
    blur: number;
  };

  strokeWidth?: number;
  strokeWidthBefore?: number;
  strokeWidthAfter?: number;
  activeStrokeWidth?: number;

  strokeColor?: string;
  strokeColorBefore?: string;
  strokeColorAfter?: string;
  activeStrokeColor?: string;

  effect?: 'karaoke fill' | 'karaoke clip';
  fillColor?: string;

  paused?: SharedValue<boolean>;
  id: string;

  customFontMgr: SkTypefaceFontProvider;

  scale: SharedValue<number> | number;

  rotation: SharedValue<number> | number;

  gradient?: {
    colors: Color[];
    positions?: number[];
  };

  letterSpacing?: number;
};

// Use the utility type to enforce essential dependencies only
export type CustomParagraphProps = RequireIf<
  RequireIf<BaseParagraphProps, 'strokeWidth', 'strokeColor'>,
  'effect',
  'fillColor'
>;

const EMPTY_SENTENCE = {
  text: '',
  words: [],
  start: 0,
  end: 0,
  uuid: '1',
};

const Template = ({
  currentTime: _currentTime,
  sentences,

  paragraphLayoutWidth,
  x: _x,
  y: _y,

  setTemplateHeight,
  setTemplateWidth,
  setX,
  setY,

  notHideSentenceBetweenSentenceInterval,

  // THEME
  color,
  colorBefore,
  colorAfter,
  activeColor,

  backgroundColor,
  backgroundColorBefore,
  backgroundColorAfter,
  activeBackgroundColor,

  fontSize,
  fontSizeBefore,
  fontSizeAfter,
  activeFontSize,

  fontFamily,

  weight,
  fontWeightBefore,
  fontWeightAfter,
  activeFontWeight,

  alignment,
  textDirection = TextDirection.LTR,

  sentenceBackgroundColor,
  sentenceBackgroundPadding = 0,
  sentenceBackgroundOpacity = 1,
  sentenceBackgroundRadius = 0,

  shadow: _shadow,
  shadowBefore: _shadowBefore,
  shadowAfter: _shadowAfter,
  activeShadow: _activeShadow,

  strokeWidth = 0,

  strokeColor,
  strokeColorBefore,
  strokeColorAfter,
  activeStrokeColor,

  sentenceShadow,

  effect,
  fillColor,

  paused,
  id,
  customFontMgr,

  scale: _scale,
  rotation: _rotation,
  gradient,
  letterSpacing = 0,
}: CustomParagraphProps) => {
  // Default logic implementation
  const activeColorValue = activeColor || color;
  const colorBeforeValue = colorBefore || color;
  const colorAfterValue = colorAfter || color;

  const activeBackgroundColorValue =
    activeBackgroundColor || backgroundColor || defaultColor;
  const backgroundColorBeforeValue =
    backgroundColorBefore || backgroundColor || defaultColor;
  const backgroundColorAfterValue =
    backgroundColorAfter || backgroundColor || defaultColor;

  const activeFontSizeValue = activeFontSize || fontSize;
  const fontSizeBeforeValue = fontSizeBefore || fontSize;
  const fontSizeAfterValue = fontSizeAfter || fontSize;

  const activeFontWeightValue = activeFontWeight || weight || FontWeight.Normal;
  const fontWeightBeforeValue = fontWeightBefore || weight || FontWeight.Normal;
  const fontWeightAfterValue = fontWeightAfter || weight || FontWeight.Normal;

  const activeStrokeColorValue =
    activeStrokeColor || strokeColor || defaultColor;
  const strokeColorBeforeValue =
    strokeColorBefore || strokeColor || defaultColor;
  const strokeColorAfterValue = strokeColorAfter || strokeColor || defaultColor;

  const activeShadow = _activeShadow?.map(value => ({
    ...value,
    color: Skia.Color(value.color),
  }));

  const shadowBefore = _shadowBefore?.map(value => ({
    ...value,
    color: Skia.Color(value.color),
  }));

  const shadowAfter = _shadowAfter?.map(value => ({
    ...value,
    color: Skia.Color(value.color),
  }));

  const shadow = _shadow?.map(value => ({
    ...value,
    color: Skia.Color(value.color),
  }));

  const activeShadowValue = activeShadow || shadow || [defaultShadow];
  const shadowBeforeValue = shadowBefore || shadow || [defaultShadow];
  const shadowAfterValue = shadowAfter || shadow || [defaultShadow];

  const currentSentence = useSharedValue<GeneratedSentence>(EMPTY_SENTENCE);

  const x = useOption(_x);

  const rotation = useOption(_rotation);

  const y = useOption(_y);

  const currentTime = useOption(_currentTime);

  const scale = useOption(_scale);

  const outlineParagraph = useDerivedValue(() => {
    // Are the font loaded already?
    if (!customFontMgr) {
      return null;
    }
    const paragraphStyle: SkParagraphStyle = {
      textAlign: alignment,
      textDirection: textDirection,
    };

    const paragraphBuilder = Skia.ParagraphBuilder.Make(
      paragraphStyle,
      customFontMgr,
    );

    const foregroundPaint = Skia.Paint();
    foregroundPaint.setStyle(PaintStyle.Stroke);
    foregroundPaint.setColor(Skia.Color(strokeColor || defaultColor));
    foregroundPaint.setStrokeWidth(strokeWidth);

    currentSentence.value.words.forEach((word, _index) => {
      const isActiveWord =
        currentTime.value >= word.start && currentTime.value <= word.end;
      const isBeforeWord = currentTime.value >= word.start;

      paragraphBuilder.pushStyle(
        {
          fontFamilies: [fontFamily],
          fontSize: isActiveWord
            ? activeFontSizeValue
            : isBeforeWord
            ? fontSizeBeforeValue
            : fontSizeAfterValue,

          color: isActiveWord
            ? Skia.Color(activeStrokeColorValue)
            : isBeforeWord
            ? Skia.Color(strokeColorBeforeValue)
            : Skia.Color(strokeColorAfterValue),

          fontStyle: {
            weight: isActiveWord
              ? activeFontWeightValue
              : isBeforeWord
              ? fontWeightBeforeValue
              : fontWeightAfterValue,
          },

          shadows: isActiveWord
            ? activeShadowValue
            : isBeforeWord
            ? shadowBeforeValue
            : shadowAfterValue,
          letterSpacing: letterSpacing,
        },
        foregroundPaint,
      );

      paragraphBuilder.addText(word.text + ' '); // Add space after each word
      paragraphBuilder.pop();
    });

    const paragraph = paragraphBuilder.build();
    paragraph.layout(paragraphLayoutWidth.value);

    return paragraph;
  }, [customFontMgr, currentSentence, id]);

  const paragraphHeight = useDerivedValue(() => {
    return outlineParagraph.value?.getHeight() || 0;
  }, [outlineParagraph]);

  const paragraph = useDerivedValue(() => {
    // Are the font loaded already?
    if (!customFontMgr) {
      return null;
    }
    const paragraphStyle: SkParagraphStyle = {
      textAlign: alignment,
      textDirection: textDirection,
    };

    const paragraphBuilder = Skia.ParagraphBuilder.Make(
      paragraphStyle,
      customFontMgr,
    );

    currentSentence.value.words.forEach((word, _index) => {
      const isActiveWord =
        currentTime.value >= word.start && currentTime.value <= word.end;
      const isBeforeWord = currentTime.value >= word.start;

      paragraphBuilder.pushStyle({
        color: isActiveWord
          ? Skia.Color(activeColorValue)
          : isBeforeWord
          ? Skia.Color(colorBeforeValue)
          : Skia.Color(colorAfterValue),
        fontFamilies: [fontFamily],
        fontSize: isActiveWord
          ? activeFontSizeValue
          : isBeforeWord
          ? fontSizeBeforeValue
          : fontSizeAfterValue,
        backgroundColor: isActiveWord
          ? Skia.Color(activeBackgroundColorValue)
          : isBeforeWord
          ? Skia.Color(backgroundColorBeforeValue)
          : Skia.Color(backgroundColorAfterValue),

        fontStyle: {
          weight: isActiveWord
            ? activeFontWeightValue
            : isBeforeWord
            ? fontWeightBeforeValue
            : fontWeightAfterValue,
        },
        shadows: isActiveWord
          ? activeShadowValue
          : isBeforeWord
          ? shadowBeforeValue
          : shadowAfterValue,

        letterSpacing: letterSpacing,
      });

      paragraphBuilder.addText(word.text + ' '); // Add space after each word
      paragraphBuilder.pop();
    });

    const paragraph = paragraphBuilder.build();
    paragraph.layout(paragraphLayoutWidth.value);

    return paragraph;
  }, [customFontMgr, currentSentence, id]);

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
        if (!notHideSentenceBetweenSentenceInterval) {
          currentSentence.value = EMPTY_SENTENCE;
        }
      }
    },
    [currentTime, sentences],
  );

  const paragraphWidth = useDerivedValue(() => {
    const maxWidthOutBreak =
      outlineParagraph.value?.getMaxIntrinsicWidth() || 0;
    const maxLayoutWidth = outlineParagraph.value?.getMaxWidth() || 0;

    const width =
      maxWidthOutBreak > maxLayoutWidth ? maxLayoutWidth : maxWidthOutBreak;

    return width || 0;
  }, [outlineParagraph]);

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
      return paragraphWidth.value + sentenceBackgroundPadding * 2;
    } else {
      return 0;
    }
  }, [paragraphWidth, sentenceBackgroundPadding]);

  const backgroundHeight = useDerivedValue(() => {
    return paragraphHeight.value + sentenceBackgroundPadding * 2;
  }, [paragraphHeight, sentenceBackgroundPadding]);

  const backgroundX = useDerivedValue(() => {
    if (alignment === TextAlign.Left) {
      return minX.value - sentenceBackgroundPadding;
    } else if (alignment === TextAlign.Center) {
      return (
        minX.value +
        (paragraphLayoutWidth.value - paragraphWidth.value) / 2 -
        sentenceBackgroundPadding
      );
    } else {
      return (
        minX.value +
        (paragraphLayoutWidth.value - paragraphWidth.value) -
        sentenceBackgroundPadding
      );
    }
  }, [minX, paragraphWidth, paragraphLayoutWidth, id]);

  const backgroundY = useDerivedValue(() => {
    return y.value;
  }, [y]);

  const minY = useDerivedValue(() => {
    return y.value + sentenceBackgroundPadding;
  }, [y, sentenceBackgroundPadding]);

  useAnimatedReaction(
    () => backgroundY.value,
    value => {
      if (setY) {
        setY.value = value;
      }
    },
    [backgroundY],
  );

  useAnimatedReaction(
    () => backgroundWidth.value,
    value => {
      if (setTemplateWidth) {
        setTemplateWidth.value = value;
      }
    },
    [backgroundWidth],
  );

  useAnimatedReaction(
    () => backgroundHeight.value,
    value => {
      if (setTemplateHeight) {
        setTemplateHeight.value = value;
      }
    },
    [backgroundHeight],
  );

  useAnimatedReaction(
    () => backgroundX.value,
    value => {
      if (setX) {
        setX.value = value;
      }
    },
    [backgroundX],
  );

  const derivedTransform = useDerivedValue(() => {
    const centerX = backgroundX.value + backgroundWidth.value / 2;
    const centerY = backgroundY.value + backgroundHeight.value / 2;
    const rotateInRadians = rotation.value;

    return [
      {translateX: centerX},
      {translateY: centerY},
      {scale: scale.value},
      {rotateZ: rotateInRadians},
      {translateX: -centerX},
      {translateY: -centerY},
    ];
  }, [backgroundWidth, backgroundHeight, rotation.value, scale.value]);

  if (effect === 'karaoke clip') {
    return (
      <Group transform={derivedTransform}>
        <ClipEffect
          currentTime={currentTime}
          currentSentence={currentSentence}
          paused={paused}
          x={backgroundX}
          y={backgroundY}
          width={backgroundWidth}
          height={backgroundHeight}>
          <>
            {sentenceBackgroundColor && (
              <RoundedRect
                x={backgroundX}
                y={backgroundY}
                width={backgroundWidth}
                height={backgroundHeight}
                r={sentenceBackgroundRadius}
                color={sentenceBackgroundColor}
                opacity={sentenceBackgroundOpacity}
                origin={{
                  x: 0,
                  y: 0,
                }}
              />
            )}
            <Group
              layer={
                <Paint>
                  {sentenceShadow && (
                    <Shadow
                      blur={sentenceShadow.blur}
                      dx={sentenceShadow.dx}
                      dy={sentenceShadow.dy}
                      color={Skia.Color(sentenceShadow.color)}
                    />
                  )}
                </Paint>
              }>
              {strokeWidth !== 0 && (
                <Paragraph
                  paragraph={outlineParagraph}
                  x={minX}
                  y={minY}
                  width={paragraphLayoutWidth}
                  style={'stroke'}
                  strokeWidth={strokeWidth}
                />
              )}
              <Paragraph
                paragraph={paragraph}
                x={minX}
                y={minY}
                width={paragraphLayoutWidth}
              />
            </Group>
          </>
        </ClipEffect>
      </Group>
    );
  }

  if (effect === 'karaoke fill' && fillColor) {
    return (
      <Group transform={derivedTransform}>
        {sentenceBackgroundColor && (
          <RoundedRect
            x={backgroundX}
            y={backgroundY}
            width={backgroundWidth}
            height={backgroundHeight}
            r={sentenceBackgroundRadius}
            color={sentenceBackgroundColor}
            opacity={sentenceBackgroundOpacity}
            origin={{
              x: 0,
              y: 0,
            }}
          />
        )}

        <KaraokeEffect
          x={backgroundX}
          y={backgroundY}
          width={backgroundWidth}
          height={backgroundHeight}
          fillColor={Skia.Color(fillColor)}
          currentTime={currentTime}
          currentSentence={currentSentence}
          paused={paused}>
          <Group
            layer={
              <Paint>
                {sentenceShadow && (
                  <Shadow
                    blur={sentenceShadow.blur}
                    dx={sentenceShadow.dx}
                    dy={sentenceShadow.dy}
                    color={Skia.Color(sentenceShadow.color)}
                  />
                )}
              </Paint>
            }>
            {strokeWidth !== 0 && (
              <Paragraph
                paragraph={outlineParagraph}
                x={minX}
                y={minY}
                width={paragraphLayoutWidth}
                style={'stroke'}
                strokeWidth={strokeWidth}
              />
            )}
            <Paragraph
              paragraph={paragraph}
              x={minX}
              y={minY}
              width={paragraphLayoutWidth}
            />
          </Group>
        </KaraokeEffect>
      </Group>
    );
  }

  return (
    <Group transform={derivedTransform}>
      {sentenceBackgroundColor && (
        <RoundedRect
          x={backgroundX}
          y={backgroundY}
          width={backgroundWidth}
          height={backgroundHeight}
          r={sentenceBackgroundRadius}
          color={sentenceBackgroundColor}
          opacity={sentenceBackgroundOpacity}
        />
      )}

      <Group
        layer={
          <Paint>
            {sentenceShadow && (
              <Shadow
                blur={sentenceShadow.blur}
                dx={sentenceShadow.dx}
                dy={sentenceShadow.dy}
                color={Skia.Color(sentenceShadow.color)}
              />
            )}
          </Paint>
        }>
        {gradient ? (
          <Gradient
            currentTime={currentTime}
            x={backgroundX}
            y={backgroundY}
            width={backgroundWidth}
            height={paragraphHeight}
            currentSentence={currentSentence}
            colors={gradient.colors}
            strokeWidth={strokeWidth}>
            <>
              {strokeWidth !== 0 && (
                <Paragraph
                  paragraph={outlineParagraph}
                  x={minX}
                  y={minY}
                  width={paragraphLayoutWidth}
                  style={'stroke'}
                  strokeWidth={strokeWidth}
                />
              )}

              <Paragraph
                paragraph={paragraph}
                x={minX}
                y={minY}
                width={paragraphLayoutWidth}
              />
            </>
          </Gradient>
        ) : (
          <>
            {strokeWidth !== 0 && (
              <Paragraph
                paragraph={outlineParagraph}
                x={minX}
                y={minY}
                width={paragraphLayoutWidth}
                style={'stroke'}
                strokeWidth={strokeWidth}
              />
            )}
            <Paragraph
              paragraph={paragraph}
              x={minX}
              y={minY}
              width={paragraphLayoutWidth}
            />
          </>
        )}
      </Group>
    </Group>
  );
};

export default Template;
