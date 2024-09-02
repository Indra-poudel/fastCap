import BottomSheet from 'components/BottomSheet';
import TemplateCard from 'containers/TemplateSelector/TemplateCard';
import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import {TEMPLATE_SENTENCE as SENTENCE} from 'constants/index';
import {useAppSelector} from 'hooks/useStore';
import {selectAllTemplates} from 'store/templates/selector';
import {Template} from 'store/templates/type';
import {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {verticalScale} from 'react-native-size-matters/extend';
import {transformWordsToSentences} from 'utils/sentencesBuilder';

type TemplateSelectorType = {
  onClose: () => void;
  selectedTemplateId: string;
  onSelect: (template: Template) => void;
  customFontMgr: SkTypefaceFontProvider;
};

const TemplateSelector = ({
  onClose,
  selectedTemplateId,
  onSelect,
  customFontMgr,
}: TemplateSelectorType) => {
  const currentTime = useSharedValue(720);

  const templates = useAppSelector(selectAllTemplates);

  const sentenceEndTime = 3366;

  // Update the currentTime based on the clock
  useFrameCallback(frameInfo => {
    const {timeSincePreviousFrame} = frameInfo;
    if (currentTime.value < sentenceEndTime) {
      if (timeSincePreviousFrame) {
        currentTime.value += timeSincePreviousFrame;
      }
    } else {
      currentTime.value = 720;
    }
  }, []);

  const getSentences = useCallback((maxWords: number) => {
    const words = SENTENCE.flatMap(sentence => sentence.words);
    const _maxWords = maxWords < 4 ? maxWords : 4;

    const finalSentences = transformWordsToSentences(words, [], _maxWords);

    return finalSentences;
  }, []);

  return (
    <BottomSheet label="Style Your Subs 🎨" onClose={onClose}>
      <Animated.ScrollView
        alwaysBounceVertical
        contentContainerStyle={styles.templateCardsWrapper}>
        {templates.map(template => {
          return (
            <TemplateCard
              customFontMgr={customFontMgr}
              key={template.id}
              onPress={onSelect}
              currentTime={currentTime}
              sentences={SENTENCE}
              {...template}
              selectedTemplateId={selectedTemplateId}
            />
          );
        })}
      </Animated.ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  templateCardsWrapper: {
    paddingVertical: verticalScale(16),
    gap: verticalScale(12),
    flexGrow: 1,
  },
});

export default TemplateSelector;
