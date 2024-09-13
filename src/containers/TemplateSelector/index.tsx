import BottomSheet from 'components/BottomSheet';
import TemplateCard from 'containers/TemplateSelector/TemplateCard';
import React from 'react';
import {Pressable, StyleSheet, View, useWindowDimensions} from 'react-native';
import Animated, {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import {useAppSelector} from 'hooks/useStore';
import {selectAllTemplates} from 'store/templates/selector';
import {Template} from 'store/templates/type';
import {Canvas, SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {scale, verticalScale} from 'react-native-size-matters/extend';

type TemplateSelectorType = {
  onClose: () => void;
  selectedTemplateId: string;
  onSelect: (template: Template) => void;
  customFontMgr: SkTypefaceFontProvider;
};

const PADDING = scale(16);
const HEIGHT = verticalScale(120);

const TemplateSelector = ({
  onClose,
  selectedTemplateId,
  onSelect,
  customFontMgr,
}: TemplateSelectorType) => {
  const {width} = useWindowDimensions();
  const currentTime = useSharedValue(720);
  const paragraphHeight = useSharedValue(0);

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

  const derivedY = useDerivedValue(() => {
    return HEIGHT / 2 - paragraphHeight.value / 2;
  }, [paragraphHeight]);

  const backgroundY = useDerivedValue(() => {
    return PADDING;
  }, []);

  const x = useSharedValue(width / 2 - PADDING);

  return (
    <BottomSheet label="Style Your Subs 🎨" onClose={onClose}>
      <Animated.ScrollView
        showsVerticalScrollIndicator
        style={[
          styles.relative,
          {
            flexGrow: 1,
          },
        ]}>
        <Canvas
          style={{
            height:
              HEIGHT * templates.length + PADDING + PADDING * templates.length,
            width: width - PADDING * 2,
          }}>
          {templates.map((template, index) => {
            return (
              <TemplateCard
                {...template}
                customFontMgr={customFontMgr}
                key={template.name}
                currentTime={currentTime}
                setTemplateHeight={paragraphHeight}
                y={derivedY.value + index * (HEIGHT + PADDING)}
                x={x}
                backgroundY={backgroundY.value + index * (HEIGHT + PADDING)}
                selectedTemplateId={selectedTemplateId}
              />
            );
          })}
        </Canvas>

        <View
          style={[
            {
              height: HEIGHT * templates.length,
              width: width - PADDING * 2,
              marginTop: PADDING,
            },
            styles.absolute,
          ]}>
          {templates.map(template => {
            return (
              <Pressable
                style={{
                  height: HEIGHT,
                  marginBottom: PADDING,
                  width: width - PADDING * 2,
                }}
                key={template.id}
                onPress={() => {
                  onSelect(template);
                }}
              />
            );
          })}
        </View>
      </Animated.ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },

  relative: {
    position: 'relative',
  },
});

export default TemplateSelector;
