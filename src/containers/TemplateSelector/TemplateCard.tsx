import {RoundedRect, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import Template from 'components/Template';
import React, {useMemo} from 'react';
import {useWindowDimensions} from 'react-native';
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import {Template as TemplateState} from 'store/templates/type';
import {
  GeneratedSentence,
  transformWordsToSentences,
} from 'utils/sentencesBuilder';
import {scale, verticalScale} from 'react-native-size-matters/extend';
import {TEMPLATE_SENTENCE} from 'constants/index';

const PADDING = scale(16);
const HEIGHT = verticalScale(120);

type TemplateCard = {
  currentTime: SharedValue<number>;
  customFontMgr: SkTypefaceFontProvider;
  setTemplateHeight?: SharedValue<number>;
  x: SharedValue<number> | number;
  y: SharedValue<number> | number;
  backgroundY: SharedValue<number> | number;
  selectedTemplateId: string;
} & TemplateState;

const TemplateCard = ({
  currentTime,
  customFontMgr,
  x,
  y,
  backgroundY,
  setTemplateHeight,
  selectedTemplateId,
  ...templateState
}: TemplateCard) => {
  const {width} = useWindowDimensions();
  const paragraphLayoutWidth = useSharedValue(width - PADDING * 4);

  const _sentences = useMemo(() => {
    const words = TEMPLATE_SENTENCE.flatMap(sentence => sentence.words);

    const finalSentences = transformWordsToSentences(
      words,
      [],
      templateState.maxWords,
    );

    return finalSentences as unknown as GeneratedSentence[];
  }, [templateState.maxWords]);

  const isSelected = useDerivedValue(() => {
    return selectedTemplateId === templateState.id ? '#3377FF' : '#4F4F4F';
  }, [selectedTemplateId]);

  return (
    <>
      <RoundedRect
        x={0}
        y={backgroundY}
        width={width - PADDING * 2}
        height={HEIGHT}
        r={scale(12)}
        color={isSelected}
        opacity={1}
      />

      <Template
        scale={1}
        rotation={0}
        customFontMgr={customFontMgr}
        currentTime={currentTime}
        sentences={_sentences}
        paragraphLayoutWidth={paragraphLayoutWidth}
        x={x}
        y={y}
        setTemplateHeight={setTemplateHeight}
        notHideSentenceBetweenSentenceInterval={true}
        {...templateState}
      />
    </>
  );
};

export default TemplateCard;
