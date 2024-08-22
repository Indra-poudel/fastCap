import BottomSheet from 'components/BottomSheet';
import TemplateCard from 'containers/TemplateSelector/TemplateCard';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useFrameCallback, useSharedValue} from 'react-native-reanimated';
import {TEMPLATE_SENTENCE as SENTENCE} from 'constants/index';
import {useAppSelector} from 'hooks/useStore';
import {selectAllTemplates} from 'store/templates/selector';
import {Template} from 'store/templates/type';
import {SkTypefaceFontProvider} from '@shopify/react-native-skia';

type TemplateSelectorType = {
  onClose: () => void;
  selectedTemplateId: string;
  onSelect: (template: Template) => void;
  customFontMgr: SkTypefaceFontProvider | null;
};

const TemplateSelector = ({
  onClose,
  selectedTemplateId,
  onSelect,
  customFontMgr,
}: TemplateSelectorType) => {
  const currentTime = useSharedValue(SENTENCE[0].start);

  const templates = useAppSelector(selectAllTemplates);

  const sentenceEndTime = SENTENCE[0].end;

  // Update the currentTime based on the clock
  useFrameCallback(frameInfo => {
    const {timeSincePreviousFrame} = frameInfo;
    if (currentTime.value < sentenceEndTime) {
      if (timeSincePreviousFrame) {
        currentTime.value += timeSincePreviousFrame;
      }
    } else {
      currentTime.value = SENTENCE[0].start;
    }
  }, []);

  return (
    <BottomSheet label="Style Your Subs 🎨" onClose={onClose}>
      <View style={[styles.templateCardsWrapper]}>
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
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  templateCardsWrapper: {
    paddingVertical: 16,
    gap: 12,
  },
});

export default TemplateSelector;
