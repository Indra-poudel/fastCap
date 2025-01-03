import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInUp,
  FadeOutDown,
} from 'react-native-reanimated';
import {useTheme} from '@theme/ThemeContext';
import Button from 'components/Button/Button';
import {FLOATING_ACTION} from 'containers/FloatingActionButtonContainer';
import {scale, verticalScale} from 'react-native-size-matters/extend';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ButtonBottom = verticalScale(180);

type FloatingActionButtonViewProps = {
  onAction: (action: FLOATING_ACTION) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  isSelecting: boolean;
};

const FloatingActionButtonView = ({
  onAction,
  setOpen,
  open,
  isSelecting,
}: FloatingActionButtonViewProps) => {
  const {theme} = useTheme();
  const {width, height} = useWindowDimensions();

  const rotation = useSharedValue(0);
  const fabBorder = useSharedValue(0);
  const fabSize = useSharedValue(80);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${rotation.value}deg`}],
    };
  }, []);

  const fabButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderWidth: fabBorder.value,
      height: fabSize.value,
      width: fabSize.value,
      left: width / 2 - fabSize.value / 2,
      borderColor: theme.colors.transparent,
    };
  }, [width]);

  useEffect(() => {
    rotation.value = withTiming(open ? 45 : 0);
  }, [open, rotation]);

  const handlePress = () => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.effectClick, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });

    setOpen(prev => !prev);
  };

  const handlePressChooseVideo = () => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.effectHeavyClick, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    onAction(FLOATING_ACTION.GALLERY);
  };

  const handlePressRecord = () => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.effectHeavyClick, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    onAction(FLOATING_ACTION.RECORD);
  };

  return (
    <>
      {open && (
        <AnimatedPressable
          onPress={handlePress}
          entering={FadeInUp}
          exiting={FadeOutDown}
          style={[
            Style.backdoor,
            {
              width,
              height,
            },
          ]}>
          <Button
            onPress={handlePressChooseVideo}
            label={'Choose a video'}
            icon={
              <Icon
                name={'image-outline'}
                size={scale(24)}
                color={theme.colors.white}
              />
            }
            buttonType={'primary'}
            style={[
              Style.buttons,
              {
                left: width / 2 - scale(150),
                bottom: ButtonBottom + verticalScale(100),
              },
            ]}
          />
          <Button
            onPress={handlePressRecord}
            label={'Record'}
            icon={
              <Icon
                name={'video-outline'}
                size={scale(24)}
                color={theme.colors.white}
              />
            }
            buttonType={'tertiary'}
            style={[
              Style.buttons,
              {
                left: width / 2 - scale(150),
                bottom: ButtonBottom,
              },
            ]}
          />
        </AnimatedPressable>
      )}
      <AnimatedPressable
        style={[
          Style.container,
          fabButtonAnimatedStyle,
          {
            backgroundColor: open ? theme.colors.black4 : theme.colors.primary,
            borderColor: theme.colors.black1,
          },
        ]}
        onPress={handlePress}>
        <Animated.View style={iconAnimatedStyle}>
          <Icon name={'plus'} size={scale(42)} color={theme.colors.white} />
        </Animated.View>
      </AnimatedPressable>

      {isSelecting && (
        <View style={Style.flexCenter}>
          <ActivityIndicator
            shouldRasterizeIOS
            color={theme.colors.primary}
            size={'large'}
          />
        </View>
      )}
    </>
  );
};

const Style = StyleSheet.create({
  flexCenter: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignContent: 'center',
    width: '100%',
    height: '100%',
  },
  container: {
    borderRadius: 45,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: verticalScale(40),
  },
  backdoor: {
    position: 'absolute',
    backgroundColor: 'rgba(2,2,2,0.8)',
  },

  buttons: {
    position: 'absolute',
  },
});

export default FloatingActionButtonView;
