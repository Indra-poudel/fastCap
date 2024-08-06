import BottomSheet from 'components/BottomSheet';
import Button from 'components/Button/Button';
import {
  OverallProcessStatus,
  useTranscriptionService,
} from 'hooks/useTranscriptionService';
import React, {useEffect} from 'react';
import * as Progress from 'react-native-progress';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from 'theme/ThemeContext';
import {languageType} from 'components/LanguageSelector';
import {GeneratedSentence} from 'utils/sentencesBuilder';

type CaptionServiceStatusProps = {
  videoUrl: string;
  onCancel: () => void;
  onSuccess: (data: GeneratedSentence[]) => void;
  language: languageType;
};

const CaptionServiceStatus = ({
  videoUrl,
  onCancel,
  onSuccess,
  language,
}: CaptionServiceStatusProps) => {
  const {
    currentStep,
    stepProgress,
    overallStatus,
    sentences,
    error,
    startTranscriptionProcess,
  } = useTranscriptionService({
    isMock: true,
  });

  const {theme} = useTheme();

  useEffect(() => {
    if (videoUrl && language) {
      startTranscriptionProcess(videoUrl, language);
    }
  }, [videoUrl, startTranscriptionProcess, language]);

  console.log(overallStatus);

  useEffect(() => {
    if (overallStatus === OverallProcessStatus.COMPLETED) {
      sentences && onSuccess(sentences);
      onCancel();
    }
  }, [onSuccess, overallStatus, sentences, onCancel]);

  return (
    <BottomSheet label="Generating Captions" initialHeightPercentage={50}>
      <View style={[Style.wrapper]}>
        <View
          style={[
            Style.ccWrapper,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}>
          <Text
            style={[
              theme.typography.header.medium,
              {
                color: theme.colors.white,
              },
            ]}>
            CC
          </Text>
          <Progress.Bar
            animated
            progress={stepProgress / 100}
            color={theme.colors.white}
            unfilledColor="rgba(29, 29, 29, 0.30))"
            height={6}
            borderRadius={12}
            borderWidth={0}
            width={60}
            useNativeDriver={true}
          />
        </View>
        <View style={[Style.textWrapper]}>
          <Text
            style={[
              theme.typography.header.medium,
              {
                color: theme.colors.white,
              },
            ]}>
            {currentStep}
          </Text>
          <Text
            style={[
              theme.typography.body.medium,
              {
                color: theme.colors.grey3,
              },
            ]}>
            ⏳ Hang tight! We're adding captions to your video. Please keep the
            app open and your screen unlocked. 📱💬
          </Text>
        </View>
        <Button label={'Cancel'} buttonType={'primary'} onPress={onCancel} />
      </View>
    </BottomSheet>
  );
};

const Style = StyleSheet.create({
  wrapper: {
    padding: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  textWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  ccWrapper: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    width: 84,
    height: 68,
  },
});

export default CaptionServiceStatus;
