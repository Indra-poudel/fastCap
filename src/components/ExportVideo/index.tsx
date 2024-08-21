import BottomSheet from 'components/BottomSheet';
import React, {useEffect} from 'react';
import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useTheme} from 'theme/ThemeContext';
import * as Progress from 'react-native-progress';
import {ExportServiceProps, useExportService} from 'hooks/useExportService';
import Button from 'components/Button/Button';

type ExportVideoProps = {
  onCancel: () => void;
} & ExportServiceProps;

const ExportVideo = ({onCancel, ...exportServiceProps}: ExportVideoProps) => {
  const {theme} = useTheme();

  const {width} = useWindowDimensions();

  const {
    currentStep,
    stepProgress,
    overallStatus,
    generatedVideoInfo,
    startExportProcess,
  } = useExportService({
    ...exportServiceProps,
  });

  useEffect(() => {
    setTimeout(() => {
      console.log('Start process');
      startExportProcess();
    }, 200);
  }, []);

  return (
    <BottomSheet label="Let's Make It Viral!🚀🔥" initialHeightPercentage={50}>
      <Progress.Bar
        animated
        progress={stepProgress / 100}
        color={
          stepProgress === 100 ? theme.colors.success : theme.colors.primary
        }
        unfilledColor="rgba(29, 29, 29, 0.30))"
        height={6}
        borderRadius={12}
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
            {`${stepProgress.toFixed(0)}%`}
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
              ⚡ Almost there! Don't close the app or lock your screen! 🎬✨
            </Text>
          </View>
        </View>
        <Button label={'Cancel'} buttonType={'tertiary'} onPress={onCancel} />
      </View>
    </BottomSheet>
  );
};

const Style = StyleSheet.create({
  percentage: {
    marginTop: 12,
  },
  wrapperTextSection: {
    alignItems: 'center',
    gap: 12,
  },
  container: {
    gap: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    textAlign: 'center',
  },

  textCenter: {
    textAlign: 'center',
  },
});

export default ExportVideo;
