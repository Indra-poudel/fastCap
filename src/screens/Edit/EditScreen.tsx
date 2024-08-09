import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Canvas,
  Fill,
  ImageShader,
  Skia,
  TextAlign,
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
  clamp,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from 'theme/ThemeContext';
import {generateThumbnail} from 'utils/video';
import {GeneratedSentence} from 'utils/sentencesBuilder';
import Timeline from 'components/Timeline/Timeline';
import {useAppDispatch} from 'hooks/useStore';
import {updateVideo} from 'store/videos/slice';
import {useSelector} from 'react-redux';
import {selectSelectedVideo} from 'store/videos/selector';
import {Video} from 'store/videos/type';
import Template from 'components/Template';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type EditScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.EDIT>;

const TEMPLATE_PADDING = 16;
const SNAP = 32;
const PLAY_BUTTON_FULL_OPACITY = 0.7;
const BACKGROUND_PADDING = 8;

const EditScreen = ({route, navigation}: EditScreenProps) => {
  const {theme} = useTheme();

  const {width, height} = useWindowDimensions();

  // Video
  const videoURL = route.params.videoURL;
  const paused = useSharedValue(true);
  const seek = useSharedValue(0);
  //

  const playButtonOpacity = useSharedValue(PLAY_BUTTON_FULL_OPACITY);

  // BottomSheet
  const [isAddCaptionBottomSheetOpen, setAddCaptionBottomSheetOpen] =
    useState(false);
  const [isLanguageBottomSheetOpen, setLanguageBottomSheetOpen] =
    useState(false);
  const [isCaptionsGenerating, setCaptionsGenerating] = useState(false);
  //

  const [selectedLanguage, setSelectedLanguage] = useState<languageType>(
    languages_best[0],
  );
  const [sentences, setSentences] = useState<GeneratedSentence[]>([]);
  const selectedVideo = useSelector(selectSelectedVideo);

  const templateCurrentHeight = useSharedValue(0);
  const templateCurrentWidth = useSharedValue(0);

  const dispatch = useAppDispatch();

  const {currentFrame, currentTime, framerate, duration, size} = useVideo(
    videoURL,
    {
      paused: paused,
      volume: 1,
      looping: true,
      seek: seek,
    },
  );

  const frameDurationMs = 1000 / framerate;

  const totalDuration = useDerivedValue(() => {
    return duration;
  }, [duration]);

  const isTopSnapLineActive = useSharedValue(false);
  const isBottomSnapLineActive = useSharedValue(false);
  const isLeftSnapLineActive = useSharedValue(false);
  const isRightSnapLineActive = useSharedValue(false);
  const isCenterSnapLineActive = useSharedValue(false);

  // drag
  const isDragTrigger = useSharedValue(false);

  useAnimatedReaction(
    () => {
      return currentTime.value;
    },
    latestTime => {
      if (latestTime + frameDurationMs * 2 >= totalDuration.value) {
        paused.value = true;
      }
    },
    [currentTime, totalDuration, framerate],
  );

  const assignThumbnailImageToCurrentFrame = (url: string) => {
    Skia.Data.fromURI(url).then(data => {
      const image = Skia.Image.MakeImageFromEncoded(data);
      currentFrame.value = image;
    });
  };

  useEffect(() => {
    return () => {
      paused.value = true;
    };
  }, []);

  useEffect(() => {
    if (selectedVideo && !selectedVideo?.thumbnailUrl) {
      generateThumbnail(videoURL, selectedVideo.id)
        .then(async url => {
          assignThumbnailImageToCurrentFrame(url);

          const updatedVideo: Video = {
            ...selectedVideo,
            thumbnailUrl: url,
          };
          updateVideoObjectToStore(updatedVideo);
        })
        .catch(error => {
          console.log(error);
        });
    } else if (selectedVideo && selectedVideo.thumbnailUrl) {
      assignThumbnailImageToCurrentFrame(selectedVideo.thumbnailUrl);
    }
  }, [selectedVideo]);

  const updateVideoObjectToStore = (video: Video) => {
    dispatch(updateVideo(video));
  };

  const handlePlayPause = () => {
    'worklet';
    paused.value = !paused.value;
  };

  const handlePauseVideo = () => {
    paused.value = true;
  };

  const playButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: playButtonOpacity.value,
    };
  }, []);

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

  useAnimatedReaction(
    () => {
      if (isDragTrigger.value) {
        return false;
      }
      return paused.value;
    },
    value => {
      if (value) {
        playButtonOpacity.value = withTiming(PLAY_BUTTON_FULL_OPACITY);
      } else {
        playButtonOpacity.value = withTiming(0);
      }
    },
    [paused, isDragTrigger],
  );

  const handleBack = () => {
    paused.value = true;
    navigation.goBack();
  };

  const imageShaderHeight = useDerivedValue(() => {
    return height - (sentences.length ? 150 : 85);
  }, [sentences, height]);

  const templateTotalAvailableWidth = useDerivedValue(() => {
    const occupiedWidth = calculateFrameOccupiedWidth(
      size.width,
      size.height,
      width,
      imageShaderHeight.value,
    );

    return occupiedWidth - TEMPLATE_PADDING * 2;
  }, [imageShaderHeight, width, size]);

  const horizontalOffset = useDerivedValue(() => {
    return (width - templateTotalAvailableWidth.value) / 2;
  }, [width, templateTotalAvailableWidth]);

  // Template
  const templateXpos = useSharedValue(0);
  const templateYpos = useSharedValue(height / 2);
  const dragDistanceX = useSharedValue(width / 2);
  const dragDistanceY = useSharedValue(imageShaderHeight.value / 1.5);

  const draggableStyle = useAnimatedStyle(() => {
    return {
      width: templateCurrentWidth.value,
      height: templateCurrentHeight.value,
      left: templateXpos.value,
      top: templateYpos.value,
      borderWidth: templateCurrentWidth.value ? 2 : 0,
      borderColor: isDragTrigger.value ? theme.colors.primary : 'transparent',
      position: 'absolute',
    };
  }, [
    templateXpos,
    templateYpos,
    templateCurrentHeight,
    templateCurrentWidth,
    isDragTrigger,
  ]);

  const snapTopHorizontalLine = useAnimatedStyle(() => {
    return {
      width: width,
      height: 1,
      left: 0,
      top: SNAP,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isTopSnapLineActive.value ? 1 : 0,
    };
  }, [isTopSnapLineActive]);

  const snapLeftVerticalLine = useAnimatedStyle(() => {
    return {
      width: 1,
      height: imageShaderHeight.value,
      left: SNAP + horizontalOffset.value,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isLeftSnapLineActive.value ? 1 : 0,
    };
  }, [isLeftSnapLineActive, horizontalOffset, imageShaderHeight]);

  const snapRightVerticalLine = useAnimatedStyle(() => {
    return {
      width: 1,
      height: imageShaderHeight.value,
      right: SNAP + horizontalOffset.value,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isRightSnapLineActive.value ? 1 : 0,
    };
  }, [isRightSnapLineActive, horizontalOffset, imageShaderHeight]);

  const snapBottomHorizontalLine = useAnimatedStyle(() => {
    return {
      width: width,
      height: 1,
      left: 0,
      top: imageShaderHeight.value - SNAP,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isBottomSnapLineActive.value ? 1 : 0,
    };
  }, [isBottomSnapLineActive, imageShaderHeight]);

  const snapCentralVerticalLine = useAnimatedStyle(() => {
    return {
      width: 1,
      height: imageShaderHeight.value,
      left: width / 2,
      backgroundColor: theme.colors.primary,
      position: 'absolute',
      opacity: isCenterSnapLineActive.value ? 1 : 0,
    };
  }, [isCenterSnapLineActive, horizontalOffset, imageShaderHeight]);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      isDragTrigger.value = true;
      paused.value = true;
    })
    .onChange(e => {
      isDragTrigger.value = true;

      dragDistanceX.value = clamp(
        dragDistanceX.value + e.changeX,
        0,
        templateTotalAvailableWidth.value,
      );
      dragDistanceY.value = clamp(
        dragDistanceY.value + e.changeY,
        0,
        imageShaderHeight.value - templateCurrentHeight.value,
      );

      // Top snap
      if (Math.abs(dragDistanceY.value + e.changeY - SNAP) <= 30) {
        isTopSnapLineActive.value = true;
      }

      if (Math.abs(dragDistanceY.value + e.changeY - SNAP) <= 5) {
        // dragDistanceY.value = withTiming(SNAP, {
        //   duration: 10,
        // });
      }
      if (Math.abs(dragDistanceY.value + e.changeY - SNAP) >= 30) {
        isTopSnapLineActive.value = false;
      }
      // end of top snap

      // left snap
      if (
        Math.abs(
          dragDistanceX.value -
            templateCurrentWidth.value / 2 +
            e.changeX -
            SNAP,
        ) <= 30
      ) {
        isLeftSnapLineActive.value = true;
      }

      if (
        Math.abs(
          dragDistanceX.value -
            templateCurrentWidth.value / 2 +
            e.changeX -
            SNAP,
        ) <= 5
      ) {
        dragDistanceX.value = withTiming(
          templateCurrentWidth.value / 2 + SNAP,
          {
            duration: 10,
          },
        );
      }
      if (
        Math.abs(
          dragDistanceX.value -
            templateCurrentWidth.value / 2 +
            e.changeX -
            SNAP,
        ) >= 30
      ) {
        isLeftSnapLineActive.value = false;
      }
      // end of top snap

      // left snap
      if (
        Math.abs(
          dragDistanceX.value -
            templateCurrentWidth.value / 2 +
            e.changeX -
            SNAP,
        ) <= 30
      ) {
        isLeftSnapLineActive.value = true;
      }

      if (
        Math.abs(
          dragDistanceX.value -
            templateCurrentWidth.value / 2 +
            e.changeX -
            SNAP,
        ) <= 5
      ) {
        dragDistanceX.value = withTiming(
          templateCurrentWidth.value / 2 + SNAP,
          {
            duration: 10,
          },
        );
      }
      if (
        Math.abs(
          dragDistanceX.value -
            templateCurrentWidth.value / 2 +
            e.changeX -
            SNAP,
        ) >= 30
      ) {
        isLeftSnapLineActive.value = false;
      }
      // end of left snap

      // right snap
      if (
        Math.abs(
          width -
            horizontalOffset.value -
            SNAP -
            (dragDistanceX.value + templateCurrentWidth.value / 2 + e.changeX),
        ) <= 30
      ) {
        isRightSnapLineActive.value = true;
      }

      if (
        Math.abs(
          width -
            horizontalOffset.value -
            SNAP -
            (dragDistanceX.value + templateCurrentWidth.value / 2 + e.changeX),
        ) <= 5
      ) {
        dragDistanceX.value = withTiming(
          width -
            horizontalOffset.value -
            SNAP -
            templateCurrentWidth.value / 2,
          {
            duration: 10,
          },
        );
      }
      if (
        Math.abs(
          dragDistanceX.value +
            templateCurrentWidth.value / 2 +
            e.changeX +
            SNAP,
        ) <=
        width - horizontalOffset.value - 30
      ) {
        isRightSnapLineActive.value = false;
      }
      // end of right snap

      // bottom snap
      if (
        Math.abs(
          imageShaderHeight.value -
            SNAP -
            (dragDistanceY.value + templateCurrentHeight.value + e.changeX),
        ) <= 30
      ) {
        isBottomSnapLineActive.value = true;
      }

      if (
        Math.abs(
          imageShaderHeight.value -
            SNAP -
            (dragDistanceY.value + templateCurrentHeight.value + e.changeX),
        ) <= 5
      ) {
        dragDistanceY.value = withTiming(
          imageShaderHeight.value - SNAP - templateCurrentHeight.value,
          {
            duration: 10,
          },
        );
      }
      if (
        Math.abs(
          imageShaderHeight.value -
            SNAP -
            (dragDistanceY.value + templateCurrentHeight.value + e.changeX),
        ) >= 30
      ) {
        isBottomSnapLineActive.value = false;
      }
      // end of bottom snap

      // central snap
      if (Math.abs(dragDistanceX.value + e.changeX - width / 2) <= 5) {
        isCenterSnapLineActive.value = true;
      }

      if (Math.abs(dragDistanceX.value + e.changeX - width / 2) <= 5) {
        // no snap in center
      }
      if (Math.abs(dragDistanceX.value + e.changeX - width / 2) >= 5) {
        isCenterSnapLineActive.value = false;
      }
      // end of central snap
    })
    .onEnd(() => {
      isDragTrigger.value = false;
      isTopSnapLineActive.value = false;
      isLeftSnapLineActive.value = false;
      isRightSnapLineActive.value = false;
      isBottomSnapLineActive.value = false;
      isCenterSnapLineActive.value = false;
    });

  const tapGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      isDragTrigger.value = true;
      paused.value = true;
    })
    .onEnd(() => {
      isDragTrigger.value = false;
    })
    .onFinalize(() => {
      isDragTrigger.value = false;
    });

  const composed = Gesture.Simultaneous(dragGesture, tapGesture);

  return (
    <SafeAreaView
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
              height={imageShaderHeight}
              width={width}
              origin={{
                x: 0,
                y: 0,
              }}
            />
          </Fill>

          <Template
            currentTime={currentTime}
            sentences={sentences}
            paragraphLayoutWidth={templateTotalAvailableWidth}
            backgroundPadding={BACKGROUND_PADDING}
            backgroundOpacity={0.5}
            x={dragDistanceX}
            y={dragDistanceY}
            setTemplateHeight={templateCurrentHeight}
            setTemplateWidth={templateCurrentWidth}
            setX={templateXpos}
            setY={templateYpos}
            alignment={TextAlign.Center}
          />
        </Canvas>

        <GestureDetector gesture={composed}>
          <Animated.View style={[draggableStyle]} />
        </GestureDetector>

        <Animated.View style={[snapTopHorizontalLine]} />
        <Animated.View style={[snapLeftVerticalLine]} />
        <Animated.View style={[snapRightVerticalLine]} />
        <Animated.View style={[snapBottomHorizontalLine]} />
        <Animated.View style={[snapCentralVerticalLine]} />

        <Pressable
          onPress={handleBack}
          style={[
            Styles.back,
            {
              backgroundColor: theme.colors.grey3,
            },
          ]}>
          <Icon name={'chevron-left'} size={24} color={theme.colors.white} />
        </Pressable>

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
      </Pressable>

      {/* later optimized sentence to shared value and use display none or something like that */}
      {!!sentences.length && (
        <Timeline
          currentTime={currentTime}
          sentences={sentences}
          frameRate={framerate}
          totalDuration={totalDuration}
          seek={seek}
          height={100}
        />
      )}

      {/* Move to separate component */}
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
    </SafeAreaView>
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

  back: {
    height: 32,
    width: 32,
    position: 'absolute',
    left: 16,
    top: 16,
    borderRadius: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
});

export default EditScreen;

function calculateFrameOccupiedWidth(
  imageWidth: number,
  imageHeight: number,
  rectWidth: number,
  rectHeight: number,
) {
  'worklet';
  const aspectRatio = imageWidth / imageHeight;
  let occupiedWidth, occupiedHeight;

  if (rectWidth / rectHeight > aspectRatio) {
    occupiedHeight = rectHeight;
    occupiedWidth = occupiedHeight * aspectRatio;
  } else {
    occupiedWidth = rectWidth;
    occupiedHeight = occupiedWidth / aspectRatio;
  }

  return occupiedWidth;
}
