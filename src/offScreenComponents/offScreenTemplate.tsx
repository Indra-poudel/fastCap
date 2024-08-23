/* eslint-disable react/react-in-jsx-scope */
import {
  SkTextShadow,
  TextDirection,
  Skia,
  FontWeight,
  SkParagraphStyle,
  TextAlign,
  PaintStyle,
  SkParagraph,
  StrokeCap,
  StrokeJoin,
  Group,
  drawAsImage,
  Paragraph,
  Paint,
  Shadow,
  RoundedRect,
} from '@shopify/react-native-skia';
import {CustomParagraphProps} from 'components/Template';
import {isSharedValue} from 'react-native-reanimated';
import {GeneratedSentence} from 'utils/sentencesBuilder';

const EMPTY_SENTENCE = {
  text: '',
  words: [],
  start: 0,
  end: 0,
};
const defaultColor = 'transparent';
const defaultShadow: SkTextShadow = {
  offset: {
    x: 0,
    y: 0,
  },
  blurRadius: 0,
  color: Skia.Color('transparent'),
};

export const renderOffScreenTemplate = (
  width: number,
  height: number,
  {
    currentTime: _currentTime,
    sentences,

    paragraphLayoutWidth,
    x: _x,
    y: _y,

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

    sentenceBackgroundColor: _sentenceBackgroundColor,
    sentenceBackgroundPadding = 0,
    sentenceBackgroundOpacity = 1,
    sentenceBackgroundRadius = 0,

    shadow,
    shadowBefore,
    shadowAfter,
    activeShadow,

    strokeWidth = 0,

    strokeColor,
    strokeColorBefore,
    strokeColorAfter,
    activeStrokeColor,

    sentenceShadow,

    effect,
    fillColor,

    customFontMgr,
  }: CustomParagraphProps,
) => {
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

  const activeShadowValue = activeShadow || shadow || [defaultShadow];
  const shadowBeforeValue = shadowBefore || shadow || [defaultShadow];
  const shadowAfterValue = shadowAfter || shadow || [defaultShadow];

  const x = isSharedValue(_x)
    ? _x
    : {
        value: _x,
      };

  const y = isSharedValue(_y)
    ? _y
    : {
        value: _y,
      };

  const currentTime = isSharedValue(_currentTime)
    ? _currentTime
    : {
        value: _currentTime,
      };

  let currentSentence: GeneratedSentence = EMPTY_SENTENCE;

  let outlineParagraph: SkParagraph | null = null;

  const sentenceBackgroundColor = _sentenceBackgroundColor
    ? Skia.Color(_sentenceBackgroundColor)
    : Skia.Color('transparent');

  const activeSentence = sentences.find(
    sentence =>
      currentTime.value >= sentence.start && currentTime.value <= sentence.end,
  );

  if (activeSentence) {
    currentSentence = activeSentence;
  } else {
    currentSentence = EMPTY_SENTENCE;
  }

  if (!customFontMgr) {
    return null;
  }

  const paragraphStyle: SkParagraphStyle = {
    textAlign: alignment,
    textDirection: textDirection,
  };

  // outline paragraph ======>

  if (strokeWidth !== 0) {
    const outlineParagraphBuilder = Skia.ParagraphBuilder.Make(
      paragraphStyle,
      customFontMgr,
    );

    const foregroundPaint = Skia.Paint();
    foregroundPaint.setAntiAlias(true);
    foregroundPaint.setDither(true);
    foregroundPaint.setStrokeCap(StrokeCap.Round); // Ensures smooth stroke ends
    foregroundPaint.setStrokeJoin(StrokeJoin.Round);
    foregroundPaint.setColor(Skia.Color(strokeColor || defaultColor));
    foregroundPaint.setStrokeWidth(5);
    foregroundPaint.setStyle(PaintStyle.Stroke);

    currentSentence.words.forEach((word, _index) => {
      const isActiveWord =
        currentTime.value >= word.start && currentTime.value <= word.end;
      const isBeforeWord = currentTime.value >= word.start;

      outlineParagraphBuilder.pushStyle(
        {
          fontFamilies: [fontFamily],
          fontSize: isActiveWord
            ? activeFontSizeValue
            : isBeforeWord
            ? fontSizeBeforeValue
            : fontSizeAfterValue,

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
        },
        foregroundPaint,
      );

      outlineParagraphBuilder.addText(word.text + ' '); // Add space after each word
      outlineParagraphBuilder.pop();
    });

    outlineParagraph = outlineParagraphBuilder.build();
    outlineParagraph.layout(paragraphLayoutWidth.value);
  }

  // ====outline paragraph end

  // ====== main paragraph

  const paragraphBuilder = Skia.ParagraphBuilder.Make(
    paragraphStyle,
    customFontMgr,
  );

  currentSentence.words.forEach((word, _index) => {
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
    });

    paragraphBuilder.addText(word.text + ' '); // Add space after each word
    paragraphBuilder.pop();
  });

  const paragraph = paragraphBuilder.build();
  paragraph.layout(paragraphLayoutWidth.value);

  const layoutData = {
    get paragraphWidth() {
      const maxWidthOutBreak = outlineParagraph
        ? outlineParagraph?.getMaxIntrinsicWidth()
        : paragraph.getMaxIntrinsicWidth() || 0;
      const maxLayoutWidth = outlineParagraph
        ? outlineParagraph.getMaxWidth()
        : paragraph?.getMaxWidth() || 0;

      const width =
        maxWidthOutBreak > maxLayoutWidth ? maxLayoutWidth : maxWidthOutBreak;

      return width || 0;
    },

    get minX() {
      if (alignment === TextAlign.Left) {
        return x.value - this.paragraphWidth / 2;
      }
      if (alignment === TextAlign.Center) {
        return (
          x.value -
          this.paragraphWidth / 2 -
          (paragraphLayoutWidth.value - this.paragraphWidth) / 2
        );
      } else {
        return (
          x.value -
          this.paragraphWidth / 2 -
          (paragraphLayoutWidth.value - this.paragraphWidth)
        );
      }
    },

    get minY() {
      return y.value + sentenceBackgroundPadding;
    },

    get backgroundX() {
      if (alignment === TextAlign.Left) {
        return this.minX - sentenceBackgroundPadding;
      } else if (alignment === TextAlign.Center) {
        return (
          this.minX +
          (paragraphLayoutWidth.value - this.paragraphWidth) / 2 -
          sentenceBackgroundPadding
        );
      } else {
        return (
          this.minX +
          (paragraphLayoutWidth.value - this.paragraphWidth) -
          sentenceBackgroundPadding
        );
      }
    },

    get backgroundY() {
      return y.value;
    },

    get backgroundWidth() {
      if (this.paragraphWidth) {
        return this.paragraphWidth + sentenceBackgroundPadding * 2;
      } else {
        return 0;
      }
    },

    get paragraphHeight() {
      return outlineParagraph
        ? outlineParagraph?.getHeight()
        : paragraph?.getHeight();
    },

    get backgroundHeight() {
      return this.paragraphHeight + sentenceBackgroundPadding * 2;
    },
  };

  const image = drawAsImage(
    <>
      {sentenceBackgroundColor && (
        <RoundedRect
          antiAlias={true}
          dither={true}
          x={layoutData.backgroundX}
          y={layoutData.backgroundY}
          width={layoutData.backgroundWidth}
          height={layoutData.backgroundHeight}
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
        antiAlias={true}
        layer={
          <Paint antiAlias={true} dither={true}>
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
            x={layoutData.minX}
            y={layoutData.minY}
            width={paragraphLayoutWidth.value}
            style={'stroke'}
            strokeWidth={strokeWidth}
            antiAlias={true}
            dither={true}
          />
        )}
        <Paragraph
          paragraph={paragraph}
          x={layoutData.minX}
          y={layoutData.minY}
          width={paragraphLayoutWidth.value}
          antiAlias={true}
          dither={true}
        />
      </Group>
    </>,
    {
      // x: 0,
      // y: 0,
      width: width,
      height: height,
    },
  );

  return image;
};
