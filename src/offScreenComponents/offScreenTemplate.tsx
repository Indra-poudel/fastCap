import React from 'react';
import {
  SkTextShadow,
  TextDirection,
  Skia,
  FontWeight,
  SkParagraphStyle,
  TextAlign,
  PaintStyle,
  SkParagraph,
  Group,
  drawAsImage,
  Paragraph,
  Paint,
  Shadow,
  RoundedRect,
  SkImage,
} from '@shopify/react-native-skia';
import {GeneratedSentence} from 'utils/sentencesBuilder';
import OffScreenClipEffect from 'components/Effects/OffScreenClipEffect';
import {OffScreenProps} from 'types/types';
import {getTransformedBoundingBox} from 'utils/transform';
import OffScreenKaraokeEffect from 'components/Effects/OffScreenKaraokeEffect';
import OffScreenGradient from 'components/Effects/OffScreenGradient';

const EMPTY_SENTENCE = {
  text: '',
  words: [],
  start: 0,
  end: 0,
  uuid: '1',
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
  scaleFactorX: number,
  scaleFactorY: number,
  {
    currentTime,
    sentences,

    paragraphLayoutWidth,
    x,
    y,

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

    gradient,

    customFontMgr,
    scale,
    rotation,
  }: OffScreenProps,
): {
  image: SkImage;
  x: number;
  y: number;
  width: number;
  height: number;
} => {
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
    offset: value?.offset
      ? {
          x: value?.offset?.x + scaleFactorX,
          y: value?.offset?.y + scaleFactorY,
        }
      : undefined,
  }));

  const shadowBefore = _shadowBefore?.map(value => ({
    ...value,
    color: Skia.Color(value.color),
    offset: value?.offset
      ? {
          x: value?.offset?.x * scaleFactorX,
          y: value?.offset?.y * scaleFactorY,
        }
      : undefined,
  }));

  const shadowAfter = _shadowAfter?.map(value => ({
    ...value,
    color: Skia.Color(value.color),
    offset: value?.offset
      ? {
          x: value?.offset?.x * scaleFactorX,
          y: value?.offset?.y * scaleFactorY,
        }
      : undefined,
  }));

  const shadow = _shadow?.map(value => ({
    ...value,
    color: Skia.Color(value.color),
    offset: value?.offset
      ? {
          x: value?.offset?.x * scaleFactorX,
          y: value?.offset?.y * scaleFactorY,
        }
      : undefined,
  }));

  const activeShadowValue = activeShadow || shadow || [defaultShadow];
  const shadowBeforeValue = shadowBefore || shadow || [defaultShadow];
  const shadowAfterValue = shadowAfter || shadow || [defaultShadow];

  let currentSentence: GeneratedSentence = EMPTY_SENTENCE;

  let outlineParagraph: SkParagraph | null = null;

  const sentenceBackgroundColor = _sentenceBackgroundColor
    ? Skia.Color(_sentenceBackgroundColor)
    : Skia.Color('transparent');

  const activeSentence = sentences.find(
    sentence => currentTime >= sentence.start && currentTime <= sentence.end,
  );

  if (activeSentence) {
    currentSentence = activeSentence;
  } else {
    currentSentence = EMPTY_SENTENCE;
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
    foregroundPaint.setStyle(PaintStyle.Stroke);
    foregroundPaint.setColor(Skia.Color(strokeColor || defaultColor));
    foregroundPaint.setStrokeWidth(strokeWidth * scaleFactorX);

    currentSentence.words.forEach((word, _index) => {
      const isActiveWord = currentTime >= word.start && currentTime <= word.end;
      const isBeforeWord = currentTime >= word.start;

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
    const isActiveWord = currentTime >= word.start && currentTime <= word.end;
    const isBeforeWord = currentTime >= word.start;

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
        return x - this.paragraphWidth / 2;
      }
      if (alignment === TextAlign.Center) {
        return (
          x -
          this.paragraphWidth / 2 -
          (paragraphLayoutWidth.value - this.paragraphWidth) / 2
        );
      } else {
        return (
          x -
          this.paragraphWidth / 2 -
          (paragraphLayoutWidth.value - this.paragraphWidth)
        );
      }
    },

    get minY() {
      return y + sentenceBackgroundPadding;
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
      return y;
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

    get derivedTransform() {
      const centerX = layoutData.backgroundX + layoutData.backgroundWidth / 2;
      const centerY = layoutData.backgroundY + layoutData.backgroundHeight / 2;
      const rotateInRadians = rotation.value;

      return [
        {translateX: centerX},
        {translateY: centerY},
        {scale: scale.value},
        {rotateZ: rotateInRadians}, // Skia expects rotation in radians
        {translateX: -centerX},
        {translateY: -centerY},
      ];
    },

    get newDimensionAfterScaleAndRotation() {
      const {newY, newX, newHeight, newWidth} = getTransformedBoundingBox(
        layoutData.backgroundX || 0,
        layoutData.backgroundY || 0,
        layoutData.backgroundWidth || 10,
        layoutData.backgroundHeight || 10,
        scale.value,
        rotation.value,
      );

      return {newY, newX, newHeight, newWidth};
    },
  };

  const image = drawAsImage(
    effect === 'karaoke clip' ? (
      <Group transform={layoutData.derivedTransform}>
        <OffScreenClipEffect
          currentTime={currentTime}
          currentSentence={currentSentence}
          x={layoutData.newDimensionAfterScaleAndRotation.newX}
          y={layoutData.newDimensionAfterScaleAndRotation.newY}
          width={layoutData.newDimensionAfterScaleAndRotation.newWidth}
          height={layoutData.newDimensionAfterScaleAndRotation.newHeight}>
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
                      dx={sentenceShadow.dx * scaleFactorX}
                      dy={sentenceShadow.dy * scaleFactorY}
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
                  strokeWidth={strokeWidth * scaleFactorX}
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
          </>
        </OffScreenClipEffect>
      </Group>
    ) : effect === 'karaoke fill' && fillColor ? (
      <Group transform={layoutData.derivedTransform}>
        {sentenceBackgroundColor && (
          <RoundedRect
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

        <OffScreenKaraokeEffect
          x={layoutData.backgroundX}
          y={layoutData.backgroundY}
          width={layoutData.backgroundWidth}
          height={layoutData.backgroundHeight}
          fillColor={Skia.Color(fillColor)}
          currentTime={currentTime}
          currentSentence={currentSentence}>
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
                x={layoutData.minX}
                y={layoutData.minY}
                width={paragraphLayoutWidth.value}
                style={'stroke'}
                strokeWidth={strokeWidth}
              />
            )}
            <Paragraph
              paragraph={paragraph}
              x={layoutData.minX}
              y={layoutData.minY}
              width={paragraphLayoutWidth.value}
            />
          </Group>
        </OffScreenKaraokeEffect>
      </Group>
    ) : (
      <Group transform={layoutData.derivedTransform}>
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
                  dx={sentenceShadow.dx * scaleFactorX}
                  dy={sentenceShadow.dy * scaleFactorY}
                  color={Skia.Color(sentenceShadow.color)}
                />
              )}
            </Paint>
          }>
          {gradient ? (
            <OffScreenGradient
              currentTime={currentTime}
              x={layoutData.backgroundX}
              y={layoutData.backgroundY}
              width={layoutData.backgroundWidth}
              height={layoutData.paragraphHeight}
              currentSentence={currentSentence}
              colors={gradient.colors}
              strokeWidth={strokeWidth}>
              <>
                {strokeWidth !== 0 && (
                  <Paragraph
                    paragraph={outlineParagraph}
                    x={layoutData.minX}
                    y={layoutData.minY}
                    width={paragraphLayoutWidth.value}
                    style={'stroke'}
                    strokeWidth={strokeWidth}
                  />
                )}

                <Paragraph
                  paragraph={paragraph}
                  x={layoutData.minX}
                  y={layoutData.minY}
                  width={paragraphLayoutWidth.value}
                />
              </>
            </OffScreenGradient>
          ) : (
            <>
              {strokeWidth !== 0 && (
                <Paragraph
                  paragraph={outlineParagraph}
                  x={layoutData.minX}
                  y={layoutData.minY}
                  width={paragraphLayoutWidth.value}
                  style={'stroke'}
                  strokeWidth={strokeWidth}
                />
              )}
              <Paragraph
                paragraph={paragraph}
                x={layoutData.minX}
                y={layoutData.minY}
                width={paragraphLayoutWidth.value}
              />
            </>
          )}
        </Group>
      </Group>
    ),
    {
      width: width,
      height: height,
    },
  );

  return {
    image,
    x: layoutData.backgroundX || 0,
    y: layoutData.backgroundY || 0,
    width: layoutData.backgroundWidth || 10,
    height: layoutData.backgroundHeight || 10,
  };
};
