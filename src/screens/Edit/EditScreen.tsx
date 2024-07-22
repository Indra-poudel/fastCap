import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Canvas, Fill, ImageShader, useVideo} from '@shopify/react-native-skia';
import BottomSheet from 'components/BottomSheet';
import Button from 'components/Button/Button';
import {RootStackParamList, SCREENS} from 'navigation/AppNavigator';
import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from 'theme/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type EditScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.EDIT>;

const EditScreen = ({route}: EditScreenProps) => {
  const {theme} = useTheme();
  const videoURL = route.params.videoURL;
  const videoWidth = route.params.width;
  const videoHeight = route.params.height;
  const [paused, setPaused] = useState(true);
  const opacity = useSharedValue(1);
  const {width, height} = useWindowDimensions();
  const [isAddCaptionBottomSheetOpen, setAddCaptionBottomSheetOpen] =
    useState(false);

  const isPortrait = videoHeight > videoWidth;

  const derivedPaused = useDerivedValue(() => {
    return paused;
  }, [paused]);

  const {currentFrame} = useVideo(videoURL, {
    paused: derivedPaused,
    volume: 1,
  });

  const handlePlayPause = () => {
    setPaused(prev => !prev);
    const opacityNewValue = opacity.value === 1 ? 0 : 1;
    opacity.value = withTiming(opacityNewValue);
  };

  const handlePauseVideo = () => {
    setPaused(true);
    const opacityNewValue = 1;
    opacity.value = withTiming(opacityNewValue);
  };

  const playButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  }, []);

  const handleBottomSheet = () => {
    setAddCaptionBottomSheetOpen(prev => !prev);
  };

  const handleAddCaption = () => {
    handlePauseVideo();
    handleBottomSheet();
  };

  return (
    <View
      style={[
        Styles.container,
        {
          backgroundColor: theme.colors.black2,
        },
      ]}>
      <Pressable onPress={handlePlayPause} style={[Styles.playerWrapper]}>
        <Canvas style={[Styles.canvas]}>
          <Fill>
            <ImageShader
              image={currentFrame}
              width={width}
              height={height}
              x={0}
              y={0}
              fit={isPortrait ? 'cover' : 'contain'}
            />
          </Fill>
        </Canvas>
        <AnimatedPressable
          onPress={handlePlayPause}
          style={[
            Styles.playButton,
            playButtonAnimatedStyle,
            {
              backgroundColor: theme.colors.black4,
              left: width / 2 - 40,
              top: height / 2 - 40,
            },
          ]}>
          <Icon
            name={paused ? 'play' : 'pause'}
            size={52}
            color={theme.colors.primary}
          />
        </AnimatedPressable>
      </Pressable>

      <Button
        onPress={handleAddCaption}
        style={[Styles.button]}
        label="Add caption"
        buttonType={'primary'}
        icon={
          <Icon
            name={'closed-caption-outline'}
            size={24}
            color={theme.colors.white}
          />
        }
      />
      {isAddCaptionBottomSheetOpen && (
        <BottomSheet
          onClose={handleBottomSheet}
          isDraggable={false}
          label="Add caption">
          <View style={[Styles.bottomSheetContent]}>
            <Button
              style={Styles.languageButton}
              justifyContent="space-between"
              label="Language"
              buttonType={'secondary'}
              icon={
                <Icon name={'translate'} size={24} color={theme.colors.white} />
              }
              rightSlot={
                <View style={[Styles.iconLabelContainer]}>
                  <Text
                    style={[
                      theme.typography.body.medium,
                      {
                        color: theme.colors.white,
                      },
                    ]}>
                    English (US)
                  </Text>

                  <Icon
                    name={'chevron-right'}
                    size={24}
                    color={theme.colors.white}
                  />
                </View>
              }
            />
            <Button
              label="Add English captions"
              buttonType={'primary'}
              icon={
                <Icon
                  name={'closed-caption-outline'}
                  size={24}
                  color={theme.colors.white}
                />
              }
            />
          </View>
        </BottomSheet>
      )}
    </View>
  );
};

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  playerWrapper: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  button: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  bottomSheetContent: {
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  iconLabelContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  languageButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
});

export default EditScreen;
