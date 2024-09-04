import {Canvas, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import Template from 'components/Template';
import React, {useMemo} from 'react';
import {Pressable, StyleSheet, useWindowDimensions} from 'react-native';
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import {Template as TemplateState} from 'store/templates/type';
import {useTheme} from 'theme/ThemeContext';
import {
  GeneratedSentence,
  transformWordsToSentences,
} from 'utils/sentencesBuilder';
import {scale, verticalScale} from 'react-native-size-matters/extend';

const PADDING = scale(16);
const HEIGHT = verticalScale(120);

type TemplateCard = {
  currentTime: SharedValue<number>;
  sentences: GeneratedSentence[];
  selectedTemplateId: string;
  onPress: (template: TemplateState) => void;
  customFontMgr: SkTypefaceFontProvider;
} & TemplateState;

const TemplateCard = ({
  currentTime,
  sentences,
  selectedTemplateId,
  onPress,
  customFontMgr,
  ...templateState
}: TemplateCard) => {
  const {theme} = useTheme();
  const {width} = useWindowDimensions();
  const x = useSharedValue(width / 2 - PADDING);
  const paragraphLayoutWidth = useSharedValue(width - PADDING * 4);
  const paragraphHeight = useSharedValue(0);

  const _sentences = useMemo(() => {
    const words = sentences.flatMap(sentence => sentence.words);
    const _maxWords = templateState.maxWords < 4 ? templateState.maxWords : 4;

    const finalSentences = transformWordsToSentences(words, [], _maxWords);

    return finalSentences as unknown as GeneratedSentence[];
  }, [sentences, templateState.maxWords]);

  const derivedY = useDerivedValue(() => {
    return HEIGHT / 2 - paragraphHeight.value / 2;
  }, [paragraphHeight]);

  const handlePress = () => {
    onPress(templateState);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({pressed}) => [
        styles.wrapper,
        {
          backgroundColor: theme.colors.grey2,
          width: width - PADDING * 2,
          opacity: pressed ? 0.7 : 1,
          borderWidth: selectedTemplateId === templateState.id ? 2 : 0,
          borderColor:
            selectedTemplateId === templateState.id
              ? theme.colors.primary
              : 'transparent',
        },
      ]}>
      <Canvas
        style={{
          height: HEIGHT,
          width: width - PADDING * 2,
        }}>
        <Template
          scale={1}
          rotation={0}
          customFontMgr={customFontMgr}
          currentTime={currentTime}
          sentences={_sentences}
          paragraphLayoutWidth={paragraphLayoutWidth}
          x={x}
          y={derivedY}
          setTemplateHeight={paragraphHeight}
          notHideSentenceBetweenSentenceInterval={true}
          // stylish state
          {...templateState}
        />
      </Canvas>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: scale(12),
    height: HEIGHT,
    margin: 'auto',
  },
});

export default TemplateCard;
