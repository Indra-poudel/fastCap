import React, {useEffect} from 'react';
import {Pressable, StyleSheet, useWindowDimensions} from 'react-native';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ButtonBottom = 180;

type FloatingActionButtonViewProps = {
  onAction: (action: FLOATING_ACTION) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
};

const FloatingActionButtonView = ({
  onAction,
  setOpen,
  open,
}: FloatingActionButtonViewProps) => {
  const {theme} = useTheme();
  const {width, height} = useWindowDimensions();

  const rotation = useSharedValue(0);
  const fabBorder = useSharedValue(10);
  const fabSize = useSharedValue(90);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${rotation.value}deg`}],
    };
  });

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
    if (!open && rotation.value === 45) {
      rotation.value = withTiming(0);
    }
  }, [open, rotation]);

  const handlePress = () => {
    const newValue = rotation.value === 0 ? 45 : 0;
    rotation.value = withTiming(newValue);
    setOpen(prev => !prev);
  };

  const handlePressChooseVideo = () => {
    onAction(FLOATING_ACTION.GALLERY);
  };

  const handlePressRecord = () => {
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
            rightSlot={undefined}
            icon={
              <Icon
                name={'image-outline'}
                size={24}
                color={theme.colors.white}
              />
            }
            buttonType={'primary'}
            style={[
              Style.buttons,
              {
                left: width / 2 - 150,
                bottom: ButtonBottom + 100,
              },
            ]}
          />
          <Button
            onPress={handlePressRecord}
            label={'Record'}
            rightSlot={undefined}
            icon={
              <Icon
                name={'video-outline'}
                size={24}
                color={theme.colors.white}
              />
            }
            buttonType={'tertiary'}
            style={[
              Style.buttons,
              {
                left: width / 2 - 150,
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
          <Icon name={'plus'} size={42} color={theme.colors.white} />
        </Animated.View>
      </AnimatedPressable>
    </>
  );
};

const Style = StyleSheet.create({
  container: {
    height: 90,
    width: 90,
    borderRadius: 45,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
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
