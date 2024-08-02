import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Canvas,
  Fill,
  ImageShader,
  Skia,
  useVideo,
} from '@shopify/react-native-skia';
import BottomSheet from 'components/BottomSheet';
import Button from 'components/Button/Button';
import CaptionServiceStatus from 'components/CaptionServiceStatus';
import LanguageSelector, {languageType} from 'components/LanguageSelector';
import {languages_best} from 'constants/languages';
import {RootStackParamList, SCREENS} from 'navigation/AppNavigator';
import React, {useEffect, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from 'theme/ThemeContext';
import {generateThumbnail} from 'utils/video';
import {GeneratedSentence} from 'utils/sentencesBuilder';
// import CustomParagraph from 'components/Skia/CustomParagraph';
// import MyParagraph from 'components/Skia/NewCustomParagraph';
import DuplicateTheme from 'components/Skia/DuplicateTheme';
import Timeline from 'components/Timeline/Timeline';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type EditScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.EDIT>;

const EditScreen = ({route}: EditScreenProps) => {
  const {theme} = useTheme();

  const videoURL = route.params.videoURL;

  const paused = useSharedValue(true);
  const opacity = useSharedValue(1);
  const seek = useSharedValue(0);

  const {width, height} = useWindowDimensions();
  const [isAddCaptionBottomSheetOpen, setAddCaptionBottomSheetOpen] =
    useState(false);
  const [isLanguageBottomSheetOpen, setLanguageBottomSheetOpen] =
    useState(false);
  const [isCaptionsGenerating, setCaptionsGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<languageType>(
    languages_best[0],
  );
  const [sentences, setSentences] = useState<GeneratedSentence[]>([]);

  const {currentFrame, currentTime, framerate, duration} = useVideo(videoURL, {
    paused: paused,
    volume: 1,
    looping: true,
    seek: seek,
  });

  const frameDurationMs = 1000 / framerate;

  const totalDuration = useDerivedValue(() => {
    return duration;
  }, [duration]);

  useAnimatedReaction(
    () => {
      return currentTime.value;
    },
    latestTime => {
      if (latestTime + frameDurationMs * 2 >= totalDuration.value) {
        paused.value = true;
        opacity.value = withTiming(1);
      }
    },
    [currentTime, totalDuration, framerate],
  );

  useEffect(() => {
    return () => {
      paused.value = true;
    };
  }, []);

  useEffect(() => {
    generateThumbnail(videoURL)
      .then(async url => {
        const data = await Skia.Data.fromURI(url);
        const image = Skia.Image.MakeImageFromEncoded(data);
        currentFrame.value = image;
      })
      .catch(error => {
        console.log(error);
      });
  }, [videoURL]);

  const handlePlayPause = () => {
    paused.value = !paused.value;
    const opacityNewValue = opacity.value === 1 ? 0 : 1;
    opacity.value = withTiming(opacityNewValue);
  };

  const handlePauseVideo = () => {
    paused.value = true;
    opacity.value = withTiming(1);
  };

  const playButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  }, []);

  const pausedButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSequence(
        withTiming(paused.value === false ? 0.6 : 0),
        withTiming(0),
      ),
    };
  }, [paused]);

  const handleBottomSheet = () => {
    setAddCaptionBottomSheetOpen(prev => !prev);
  };

  const handleAddCaption = () => {
    handlePauseVideo();
    handleBottomSheet();
  };

  const toggleLanguageSelector = () => {
    setLanguageBottomSheetOpen(prev => !prev);
  };

  const handleLanguageSelect = (props: languageType) => {
    setSelectedLanguage(props);
    toggleLanguageSelector();
  };

  const handleAddSpecificLanguageCaption = () => {
    setAddCaptionBottomSheetOpen(false);
    setCaptionsGenerating(true);
  };

  const handleCaptionServiceCancel = () => {
    setCaptionsGenerating(false);
  };

  const handleCaptionServiceSuccess = (data: GeneratedSentence[]) => {
    seek.value = 0;
    setSentences(data);
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
              fit={'contain'}
              rect={{x: 0, y: 0, width: width, height: height - 150}}
            />
          </Fill>

          {/* <MyParagraph
            currentTime={currentTime}
            sentences={sentences}
            frameRate={framerate}
          /> */}

          <DuplicateTheme
            currentTime={currentTime}
            sentences={sentences}
            frameRate={framerate}
          />
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
          <Icon name={'play'} size={52} color={theme.colors.primary} />
        </AnimatedPressable>
        <AnimatedPressable
          onPress={handlePlayPause}
          style={[
            Styles.playButton,
            pausedButtonAnimatedStyle,
            {
              backgroundColor: theme.colors.black4,
              left: width / 2 - 40,
              top: height / 2 - 40,
            },
          ]}>
          <Icon name={'pause'} size={52} color={theme.colors.primary} />
        </AnimatedPressable>
      </Pressable>

      {/* later optimized sentence to shared value and use display none or something like that */}
      {!!sentences.length && (
        <Timeline
          currentTime={currentTime}
          sentences={sentences}
          frameRate={framerate}
          totalDuration={totalDuration}
          seek={seek}
          height={150}
        />
      )}
      {!sentences.length && (
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
      )}
      {isAddCaptionBottomSheetOpen && (
        <BottomSheet
          onClose={handleBottomSheet}
          isDraggable={false}
          label="Add caption">
          <View style={[Styles.bottomSheetContent]}>
            <Button
              onPress={toggleLanguageSelector}
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
                    {selectedLanguage.short_label} (
                    {selectedLanguage.country_code})
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
              onPress={handleAddSpecificLanguageCaption}
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

      {isLanguageBottomSheetOpen && (
        <LanguageSelector
          onClose={toggleLanguageSelector}
          onSelect={handleLanguageSelect}
        />
      )}

      {isCaptionsGenerating && (
        <CaptionServiceStatus
          videoUrl={videoURL}
          onCancel={handleCaptionServiceCancel}
          onSuccess={handleCaptionServiceSuccess}
          language={selectedLanguage}
        />
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
  thumbnail: {flex: 1, resizeMode: 'cover'},
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
