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
import {useAppDispatch, useAppSelector} from 'hooks/useStore';
import {selectSelectedVideo} from 'store/videos/selector';
import {updateVideo} from 'store/videos/slice';
import {scale, verticalScale} from 'react-native-size-matters/extend';

type CaptionServiceStatusProps = {
  videoUrl: string;
  onCancel: () => void;
  onSuccess: (data: GeneratedSentence[]) => void;
  language: languageType;
  maxWords: number;
  duration: number;
};

const CaptionServiceStatus = ({
  videoUrl,
  onCancel,
  onSuccess,
  maxWords,
  language,
  duration,
}: CaptionServiceStatusProps) => {
  const {
    currentStep,
    stepProgress,
    overallStatus,
    sentences,
    error,
    audioUrl,
    startTranscriptionProcess,
  } = useTranscriptionService({
    isMock: false,
    maxWords,
  });

  const {theme} = useTheme();
  const selectedVideo = useAppSelector(selectSelectedVideo);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (videoUrl && language && duration) {
      startTranscriptionProcess(videoUrl, language, duration);
    }
  }, [videoUrl, startTranscriptionProcess, language, duration]);

  useEffect(() => {
    if (audioUrl && selectedVideo && !selectedVideo.audioUrl) {
      const newVideoObjectWithAudioURL = {
        ...selectedVideo,
        audioUrl: audioUrl,
      };

      dispatch(updateVideo(newVideoObjectWithAudioURL));
    }
  }, [audioUrl, dispatch, selectedVideo]);

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
            height={verticalScale(6)}
            borderRadius={scale(12)}
            borderWidth={0}
            width={scale(60)}
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
            ⏳ Hold up! We're dropping captions on your vid. Keep the app open
            and the screen unlocked, fam! 📱💬
          </Text>
        </View>
        <Button label={'Cancel'} buttonType={'primary'} onPress={onCancel} />
      </View>
    </BottomSheet>
  );
};

const Style = StyleSheet.create({
  wrapper: {
    padding: scale(24),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(32),
  },
  textWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(12),
  },
  ccWrapper: {
    padding: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(8),
    borderRadius: scale(8),
    width: scale(84),
    height: verticalScale(68),
  },
});

export default CaptionServiceStatus;
