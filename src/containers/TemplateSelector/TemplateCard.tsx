import {Canvas, FontWeight, TextAlign} from '@shopify/react-native-skia';
import Template from 'components/Template';
import React from 'react';
import {Pressable, StyleSheet, useWindowDimensions} from 'react-native';
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import {TEMPLATE_DETAILS} from 'screens/Edit/EditScreen';
import {useTheme} from 'theme/ThemeContext';
import {GeneratedSentence} from 'utils/sentencesBuilder';

const PADDING = 16;
const HEIGHT = 100;

type TemplateCard = {
  currentTime: SharedValue<number>;
  sentences: GeneratedSentence[];
};

const TemplateCard = ({currentTime, sentences}: TemplateCard) => {
  const {theme} = useTheme();
  const {width} = useWindowDimensions();
  const x = useSharedValue(width / 2 - PADDING);
  const paragraphLayoutWidth = useSharedValue(width - PADDING * 4);
  const paragraphHeight = useSharedValue(0);

  const derivedY = useDerivedValue(() => {
    return HEIGHT / 2 - paragraphHeight.value / 2;
  }, [paragraphHeight]);
  return (
    <Pressable
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.colors.grey2,
          width: width - PADDING * 2,
        },
      ]}>
      <Canvas
        style={{
          height: HEIGHT,
          width: width - PADDING * 2,
        }}>
        <Template
          currentTime={currentTime}
          sentences={sentences}
          paragraphLayoutWidth={paragraphLayoutWidth}
          x={x}
          y={derivedY}
          alignment={TextAlign.Center}
          setTemplateHeight={paragraphHeight}
          notHideSentenceBetweenSentenceInterval={true}
          color={TEMPLATE_DETAILS.color}
          fontSize={24}
          fontFamily={TEMPLATE_DETAILS.fontFamily}
          weight={FontWeight.Bold}
          activeColor={TEMPLATE_DETAILS.activeWord.color}
          sentenceBackgroundColor={'black'}
          sentenceBackgroundOpacity={0.5}
          sentenceBackgroundPadding={8}
        />
      </Canvas>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    height: HEIGHT,
    margin: 'auto',
  },
});

export default TemplateCard;
