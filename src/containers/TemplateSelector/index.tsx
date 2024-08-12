import BottomSheet from 'components/BottomSheet';
import TemplateCard from 'containers/TemplateSelector/TemplateCard';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useFrameCallback, useSharedValue} from 'react-native-reanimated';
import {TEMPLATE_SENTENCE as SENTENCE} from 'constants/index';

type TemplateSelectorType = {
  onClose: () => void;
};

const TemplateSelector = ({onClose}: TemplateSelectorType) => {
  const currentTime = useSharedValue(SENTENCE[0].start);

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
      <View style={styles.templateCardsWrapper}>
        <TemplateCard currentTime={currentTime} sentences={SENTENCE} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  templateCardsWrapper: {
    paddingVertical: 16,
  },
});

export default TemplateSelector;
