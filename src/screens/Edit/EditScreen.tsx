import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Canvas,
  Fill,
  ImageShader,
  SkImage,
  Skia,
  useCanvasRef,
  useVideo,
} from '@shopify/react-native-skia';
import BottomSheet from 'components/BottomSheet';
import Button from 'components/Button/Button';
import CaptionServiceStatus from 'components/CaptionServiceStatus';
import LanguageSelector, {languageType} from 'components/LanguageSelector';
import {languages_best} from 'constants/languages';
import {RootStackParamList, SCREENS} from 'navigation/AppNavigator';
import React, {useEffect, useRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from 'theme/ThemeContext';
import {
  generateThumbnail,
  generateVideoFromFrames,
  saveFrames,
} from 'utils/video';
import {
  GeneratedSentence,
  transformWordsToSentences,
} from 'utils/sentencesBuilder';
import Timeline from 'components/Timeline/Timeline';
import {useAppDispatch, useAppSelector} from 'hooks/useStore';
import {updateVideo} from 'store/videos/slice';
import {useSelector} from 'react-redux';
import {selectSelectedVideo} from 'store/videos/selector';
import {Video} from 'store/videos/type';
import Template from 'components/Template';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import TemplateSelector from 'containers/TemplateSelector';
import {selectTemplateForSelectedVideo} from 'store/templates/selector';
import {Template as TemplateState} from 'store/templates/type';
import {DEFAULT_MAX_WORDS} from 'constants/index';
import RNFetchBlob from 'rn-fetch-blob';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import ExportVideo from 'components/ExportVideo';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type EditScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.EDIT>;

const TEMPLATE_PADDING = 16;
const SNAP = 32;
const CANVAS_BUTTONS_FULL_OPACITY = 0.8;

const EditScreen = ({route, navigation}: EditScreenProps) => {
  const {theme} = useTheme();

  const {width, height} = useWindowDimensions();

  const ref = useCanvasRef();
  const canvasSize = useSharedValue({width: 0, height: 0});

  // Video
  const videoURL = route.params.videoURL;
  const paused = useSharedValue(true);
  const seek = useSharedValue(0);
  const volume = useSharedValue(0);
  const isAlreadyPlayedAfterScreenMount = useSharedValue(false);
  //

  // Export
  const [isExporting, setExporting] = useState(false);
  const allFrames = useRef<Promise<SkImage>[]>([]);
  const progress = useSharedValue<number>(0);
  const isAllFramePushed = useSharedValue<boolean>(false);

  const canvasButtonOpacity = useSharedValue(CANVAS_BUTTONS_FULL_OPACITY);
  const playButtonOpacity = useSharedValue(CANVAS_BUTTONS_FULL_OPACITY);

  // BottomSheet
  const [isAddCaptionBottomSheetOpen, setAddCaptionBottomSheetOpen] =
    useState(false);
  const [isLanguageBottomSheetOpen, setLanguageBottomSheetOpen] =
    useState(false);
  const [isCaptionsGenerating, setCaptionsGenerating] = useState(false);
  //

  const selectedTemplate = useAppSelector(selectTemplateForSelectedVideo);

  const [selectedLanguage, setSelectedLanguage] = useState<languageType>(
    languages_best[0],
  );
  const selectedVideo = useSelector(selectSelectedVideo);

  const templateCurrentHeight = useSharedValue(0);
  const templateCurrentWidth = useSharedValue(0);

  const dispatch = useAppDispatch();

  const {currentFrame, currentTime, framerate, duration, size} = useVideo(
    videoURL,
    {
      paused: paused,
      volume: volume,
      looping: true,
      seek: seek,
    },
  );

  const frameDurationMs = 1000 / framerate;

  const isTopSnapLineActive = useSharedValue(false);
  const isBottomSnapLineActive = useSharedValue(false);
  const isLeftSnapLineActive = useSharedValue(false);
  const isRightSnapLineActive = useSharedValue(false);
  const isCenterSnapLineActive = useSharedValue(false);

  // drag
  const isDragTrigger = useSharedValue(false);

  const [renderTimeLine, setRenderTimeline] = useState(false);

  const [isTemplateSelectorOpen, setTemplateSelector] = useState(false);

  useAnimatedReaction(
    () => {
      return currentTime.value;
    },
    latestTime => {
      if (latestTime + frameDurationMs * 2 >= duration) {
        paused.value = true;

        if (isExporting) {
          isAllFramePushed.value = true;
        }
      }
    },
    [currentTime, duration, framerate, isExporting],
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
    if (!isAlreadyPlayedAfterScreenMount.value) {
      seek.value = 0;
    }
    paused.value = !paused.value;
    isAlreadyPlayedAfterScreenMount.value = true;
  };

  const handlePauseVideo = () => {
    paused.value = true;
  };

  const canvasButtonsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: canvasButtonOpacity.value,
    };
  }, []);

  const playButtonsAnimatedStyle = useAnimatedStyle(() => {
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

    if (selectedVideo) {
      const videoObjectWithSentences: Video = {
        ...selectedVideo,
        sentences: data,
      };

      dispatch(updateVideo(videoObjectWithSentences));
    }
  };

  const handleSelectTemplate = (template: TemplateState) => {
    if (selectedVideo) {
      const allWords = selectedVideo.sentences.flatMap(value => value.words);
      const newGeneratedSentences = transformWordsToSentences(
        allWords,
        [],
        template.maxWords,
      );

      const videoObjectWithNewTemplateId: Video = {
        ...selectedVideo,
        templateId: template.id,
        sentences: newGeneratedSentences,
      };

      dispatch(updateVideo(videoObjectWithNewTemplateId));
    }
  };

  useAnimatedReaction(
    () => {
      return paused.value;
    },
    value => {
      if (value) {
        volume.value = 0;
        playButtonOpacity.value = withTiming(CANVAS_BUTTONS_FULL_OPACITY);
      } else {
        if (isExporting) {
          volume.value = 0;
        } else {
          volume.value = 1;
        }
        playButtonOpacity.value = withTiming(0);
      }
    },
    [paused, isExporting],
  );

  useAnimatedReaction(
    () => {
      return isDragTrigger.value;
    },
    value => {
      if (value) {
        canvasButtonOpacity.value = withTiming(0);
        playButtonOpacity.value = withTiming(0);
      } else {
        canvasButtonOpacity.value = withTiming(CANVAS_BUTTONS_FULL_OPACITY);
        playButtonOpacity.value = withTiming(CANVAS_BUTTONS_FULL_OPACITY);
      }
    },
    [isDragTrigger],
  );

  const handleBack = () => {
    paused.value = true;
    navigation.goBack();
  };

  const imageShaderHeight = useDerivedValue(() => {
    return height - (selectedVideo?.sentences.length ? 150 : 85);
  }, [selectedVideo, height]);

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

  useEffect(() => {
    if (duration !== 0 && renderTimeLine === false) {
      setRenderTimeline(true);
    }
  }, [duration]);

  const toggleTemplateSelector = () => {
    setTemplateSelector(prev => !prev);
  };

  const handleCloseTemplateSelector = () => {
    setTemplateSelector(false);
  };

  const renderVideo = async () => {
    if (selectedVideo) {
      console.log('inside renderVideo');
      saveFrames(allFrames.current)
        .then(value => {
          console.log(value);
          generateVideoFromFrames(
            selectedVideo?.audioUrl,
            duration,
            selectedVideo.id,
          )
            .then(url => {
              CameraRoll.saveAsset(url, {type: 'video'})
                .then(() => {
                  console.log('finally saved');
                })
                .catch(() => {
                  console.log('camera roll error');
                });
            })
            .catch(() => {
              console.error('error while generating video from frames');
            });
        })
        .catch(() => {
          console.error('error while saving frames');
        });
    }
  };

  const handleCaptureSnapShotOfCanvas = async () => {
    const promiseImage = ref.current?.makeImageSnapshotAsync();

    if (promiseImage) {
      allFrames.current.push(promiseImage);
      console.log('pushing frame', allFrames.current.length);
    }
  };

  useAnimatedReaction(
    () => currentFrame.value,
    (_currentFrame, _prevFrame) => {
      if (_currentFrame !== null && isExporting) {
        runOnJS(handleCaptureSnapShotOfCanvas)();
      }
    },
    [isExporting],
  );

  const onClickExport = () => {
    seek.value = 0;
    volume.value = 0;
    paused.value = false;
    setExporting(true);
  };

  const handleCancelVideoExport = () => {
    setExporting(false);
    allFrames.current = [];
    paused.value = true;
    volume.value = 1;
  };

  useAnimatedReaction(
    () => {
      return isAllFramePushed.value;
    },
    value => {
      if (value) {
        isAllFramePushed.value = false;
        console.log('exporting started');
        runOnJS(renderVideo)();
      }
    },
    [isAllFramePushed, selectedVideo],
  );

  console.log(selectedVideo?.audioUrl);

  return (
    <SafeAreaView
      style={[
        Styles.container,
        {
          backgroundColor: theme.colors.black2,
        },
      ]}>
      <Pressable onPress={handlePlayPause} style={[Styles.playerWrapper]}>
        <Canvas style={[Styles.canvas]} ref={ref} onSize={canvasSize}>
          <Fill>
            <ImageShader
              image={currentFrame}
              fit={'contain'}
              height={imageShaderHeight}
              width={width}
            />
          </Fill>

          {selectedVideo?.sentences && selectedTemplate && (
            <Template
              currentTime={currentTime}
              sentences={selectedVideo?.sentences}
              paragraphLayoutWidth={templateTotalAvailableWidth}
              x={dragDistanceX}
              y={dragDistanceY}
              setTemplateHeight={templateCurrentHeight}
              setTemplateWidth={templateCurrentWidth}
              setX={templateXpos}
              setY={templateYpos}
              {...selectedTemplate}
            />
          )}
        </Canvas>

        <GestureDetector gesture={composed}>
          <Animated.View style={[draggableStyle]} />
        </GestureDetector>

        <Animated.View style={[snapTopHorizontalLine]} />
        <Animated.View style={[snapLeftVerticalLine]} />
        <Animated.View style={[snapRightVerticalLine]} />
        <Animated.View style={[snapBottomHorizontalLine]} />
        <Animated.View style={[snapCentralVerticalLine]} />

        <View style={[Styles.toolBar]}>
          <Pressable
            onPress={handleBack}
            style={[
              Styles.back,
              {
                backgroundColor: theme.colors.grey2,
              },
            ]}>
            <Icon name={'chevron-left'} size={24} color={theme.colors.white} />
          </Pressable>

          {selectedVideo && selectedVideo?.sentences?.length > 0 && (
            <View style={[Styles.rightIconsWrapperToolBar]}>
              <AnimatedPressable
                onPress={onClickExport}
                style={[
                  Styles.exportWrapper,
                  canvasButtonsAnimatedStyle,
                  {
                    backgroundColor: theme.colors.grey2,
                  },
                ]}>
                <Icon name={'upload'} size={24} color={theme.colors.white} />
                <Text
                  style={[
                    theme.typography.subheader.small,
                    {
                      color: theme.colors.white,
                    },
                  ]}>
                  Export
                </Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={toggleTemplateSelector}
                style={[
                  Styles.templateIconWrapper,
                  canvasButtonsAnimatedStyle,
                  {
                    backgroundColor: theme.colors.grey2,
                  },
                ]}>
                <MaterialIcon
                  name={'style'}
                  size={24}
                  color={theme.colors.white}
                />
              </AnimatedPressable>
            </View>
          )}
        </View>

        <AnimatedPressable
          onPress={handlePlayPause}
          style={[
            Styles.playButton,
            playButtonsAnimatedStyle,
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
      {!!selectedVideo?.sentences.length && renderTimeLine && (
        <Timeline
          currentTime={currentTime}
          sentences={selectedVideo.sentences}
          frameRate={framerate}
          totalDuration={duration}
          seek={seek}
          height={100}
        />
      )}

      {/* Move to separate component */}
      {!selectedVideo?.sentences.length && (
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
          duration={duration}
          onCancel={handleCaptionServiceCancel}
          onSuccess={handleCaptionServiceSuccess}
          language={selectedLanguage}
          maxWords={selectedTemplate?.maxWords || DEFAULT_MAX_WORDS}
        />
      )}

      {isTemplateSelectorOpen && selectedVideo && (
        <TemplateSelector
          onSelect={handleSelectTemplate}
          onClose={handleCloseTemplateSelector}
          selectedTemplateId={selectedVideo.templateId}
        />
      )}

      {isExporting && (
        <ExportVideo onCancel={handleCancelVideoExport} percentage={progress} />
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
    borderRadius: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  templateIconWrapper: {
    height: 48,
    width: 48,
    borderRadius: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  exportWrapper: {
    borderRadius: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },

  toolBar: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-start',
    padding: 16,
    flexDirection: 'row',
  },

  rightIconsWrapperToolBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 24,
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
