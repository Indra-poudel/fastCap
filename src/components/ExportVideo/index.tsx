import BottomSheet from 'components/BottomSheet';
import React, {useEffect} from 'react';
import {StyleSheet, Text, View, useWindowDimensions, Alert} from 'react-native';
import {useTheme} from 'theme/ThemeContext';
import * as Progress from 'react-native-progress';
import {
  EXPORT_STEPS,
  ExportServiceProps,
  useExportService,
} from 'hooks/useExportService';
import Button from 'components/Button/Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';

import {verticalScale, scale} from 'react-native-size-matters/extend';

type ExportVideoProps = {
  onCancel: () => void;
  navigateToHome: () => void;
} & ExportServiceProps;

const ExportVideo = ({
  onCancel,
  navigateToHome,
  ...exportServiceProps
}: ExportVideoProps) => {
  const {theme} = useTheme();

  const {width} = useWindowDimensions();

  const {currentStep, stepProgress, generatedVideoPath, startExportProcess} =
    useExportService({
      ...exportServiceProps,
    });

  useEffect(() => {
    setTimeout(() => {
      console.log('Start process');
      startExportProcess();
    }, 200);
  }, []);

  const handleShare = async () => {
    if (!generatedVideoPath) {
      Alert.alert('Error', 'No video found to share.');
      return;
    }

    try {
      await Share.open({
        url: generatedVideoPath,
        title: 'Check out this video!',
        type: 'video/mp4',
      });

      console.log('Shared');
    } catch (error) {
      console.log('Error sharing video:', error);
    }
  };

  const handleCancel = () => {
    navigateToHome();
  };

  return (
    <BottomSheet
      onClose={handleCancel}
      showCloseIcon={true}
      label="Let's Make It Viral!🚀🔥"
      initialHeightPercentage={verticalScale(45)}>
      <Progress.Bar
        animated
        progress={stepProgress / 100}
        color={
          stepProgress === 100 ? theme.colors.success : theme.colors.primary
        }
        unfilledColor="rgba(29, 29, 29, 0.30))"
        height={verticalScale(6)}
        borderRadius={scale(12)}
        borderWidth={0}
        width={width}
        useNativeDriver={true}
      />

      <View style={[Style.container]}>
        <View style={[Style.wrapperTextSection]}>
          <Text
            style={[
              theme.typography.header.medium,
              {
                color: theme.colors.white,
              },
              Style.percentage,
            ]}>
            {`${stepProgress.toFixed(2)}%`}
          </Text>

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
                Style.textCenter,
              ]}>
              {currentStep === EXPORT_STEPS.COMPLETE
                ? 'Export complete! Time to go viral! 🚀🔥'
                : " ⚡ Almost there! Don't close the app or lock your screen! 🎬✨"}
            </Text>
          </View>
        </View>
        {currentStep !== EXPORT_STEPS.COMPLETE && (
          <Button label={'Cancel'} buttonType={'tertiary'} onPress={onCancel} />
        )}

        {currentStep === EXPORT_STEPS.COMPLETE && (
          <View style={Style.buttonWrapper}>
            <Button
              style={Style.smallButton}
              icon={
                <Icon
                  name={'share'}
                  size={scale(24)}
                  color={theme.colors.white}
                />
              }
              label={'Share'}
              buttonType={'tertiary'}
              onPress={handleShare}
            />
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

const Style = StyleSheet.create({
  percentage: {
    marginTop: verticalScale(12),
  },
  wrapperTextSection: {
    alignItems: 'center',
    gap: verticalScale(12),
  },
  container: {
    gap: verticalScale(24),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(12),
    textAlign: 'center',
  },

  textCenter: {
    textAlign: 'center',
  },

  buttonWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: scale(40),
    marginTop: verticalScale(10),
  },

  smallButton: {
    width: scale(150),
    paddingVertical: verticalScale(10),
  },
});

export default ExportVideo;
