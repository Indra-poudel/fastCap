import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Canvas,
  Fill,
  ImageShader,
  Skia,
  useCanvasRef,
  useFonts,
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
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from 'theme/ThemeContext';
import {generateThumbnail} from 'utils/video';
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
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import TemplateSelector from 'containers/TemplateSelector';
import {selectTemplateForSelectedVideo} from 'store/templates/selector';
import {Template as TemplateState} from 'store/templates/type';
import {DEFAULT_MAX_WORDS} from 'constants/index';
import ExportVideo from 'components/ExportVideo';
import {fontSource} from 'constants/fonts';

import {scale, verticalScale} from 'react-native-size-matters/extend';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type EditScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.EDIT>;

const TEMPLATE_PADDING = scale(16);
// scale is used in implmentaion
const SNAP = {
  v: verticalScale(16),
  h: scale(16),
};
const CANVAS_BUTTONS_FULL_OPACITY = 0.8;
const TIMELINE_HEIGHT = verticalScale(100);
const WITHOUT_TIMELINE_HEIGHT = verticalScale(85);

const EditScreen = ({route, navigation}: EditScreenProps) => {
  const {theme} = useTheme();

  const customFontMgr = useFonts(fontSource);

  const {width, height} = useWindowDimensions();

  const inset = useSafeAreaInsets();

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

  const {currentFrame, currentTime, framerate, duration, video} = useVideo(
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
  }, [paused]);

  const updateVideoObjectToStore = (_video: Video) => {
    dispatch(updateVideo(_video));
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideo, videoURL]);

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

  const heightOtherThanCanvas = useDerivedValue(() => {
    if (selectedVideo && selectedVideo?.sentences?.length > 0) {
      return TIMELINE_HEIGHT + inset.top + inset.bottom;
    }
    return WITHOUT_TIMELINE_HEIGHT + inset.top + inset.bottom;
  }, [inset, selectedVideo]);

  const imageShaderHeight = useDerivedValue(() => {
    return height - heightOtherThanCanvas.value;
  }, [heightOtherThanCanvas, height]);

  const scaleWidth = useDerivedValue(() => {
    const targetWidth = width;
    const originalWidth = route.params.width;

    const _scaleWidth = targetWidth / originalWidth;

    return _scaleWidth;
  }, [isExporting]);

  const scaleHeight = useDerivedValue(() => {
    const targetHeight = imageShaderHeight.value;
    const originalHeight = route.params.height;

    const _scaleHeight = targetHeight / originalHeight;

    return _scaleHeight;
  }, [imageShaderHeight]);

  const scaleFactor = useDerivedValue(() => {
    return Math.min(scaleWidth.value, scaleHeight.value);
  }, [scaleHeight, scaleWidth]);

  const newWidth = useDerivedValue(() => {
    return route.params.width * scaleFactor.value;
  }, [route.params.width, scaleFactor]);

  const newHeight = useDerivedValue(() => {
    return route.params.height * scaleFactor.value;
  }, [route.params.height, scaleFactor]);

  const offsetX = useDerivedValue(() => {
    return (width - newWidth.value) / 2;
  }, [width, newWidth]);

  const offsetY = useDerivedValue(() => {
    return (imageShaderHeight.value - newHeight.value) / 2;
  }, [imageShaderHeight, newHeight]);

  const imageShaderTransform = useDerivedValue(() => {
    return [
      {translateX: offsetX.value},
      {translateY: offsetY.value},
      {scaleX: scaleFactor.value},
      {scaleY: scaleFactor.value},
    ];
  }, [scaleFactor]);

  const paragraphLayoutWidth = useDerivedValue(() => {
    const occupiedWidth = route.params.width * scaleFactor.value;

    return occupiedWidth - TEMPLATE_PADDING * 2;
  }, [scaleFactor]);

  const imageOccupiedWidthRange = useDerivedValue(() => {
    const occupiedWidth = route.params.width * scaleFactor.value;

    return [offsetX.value, offsetX.value + occupiedWidth];
  }, [scaleFactor, offsetX]);

  const imageOccupiedHeightRange = useDerivedValue(() => {
    const occupiedHeight = route.params.height * scaleFactor.value;

    return [offsetY.value, offsetY.value + occupiedHeight];
  }, [scaleFactor, offsetY]);

  const dragDistanceX = useSharedValue(width / 2);
  const dragDistanceY = useSharedValue(imageShaderHeight.value / 1.5);

  const dragDistancePercentageX = useDerivedValue(() => {
    const distanceFromCanvas = dragDistanceX.value - offsetX.value;
    const occupiedWidth = route.params.width * scaleFactor.value;

    const distanceFromEdgeOfCanvas = (distanceFromCanvas / occupiedWidth) * 100;

    return distanceFromEdgeOfCanvas;
  }, [dragDistanceX, offsetX]);

  const dragDistancePercentageY = useDerivedValue(() => {
    const distanceFromCanvas = dragDistanceY.value - offsetY.value;
    const occupiedHeight = route.params.height * scaleFactor.value;

    const distanceFromEdgeOfCanvas =
      (distanceFromCanvas / occupiedHeight) * 100;

    return distanceFromEdgeOfCanvas;
  }, [dragDistanceY, offsetY]);

  // Template
  const templateXpos = useSharedValue(0);
  const templateYpos = useSharedValue(height / 2);
  // const dragDistanceX = useSharedValue(width / 2);
  // const dragDistanceY = useSharedValue(imageShaderHeight.value / 1.5);

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
      top: SNAP.v + offsetY.value,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isTopSnapLineActive.value ? 1 : 0,
    };
  }, [isTopSnapLineActive]);

  const snapLeftVerticalLine = useAnimatedStyle(() => {
    return {
      width: 1,
      height: imageShaderHeight.value,
      left: SNAP.h + offsetX.value,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isLeftSnapLineActive.value ? 1 : 0,
    };
  }, [isLeftSnapLineActive, offsetX, imageShaderHeight]);

  const snapRightVerticalLine = useAnimatedStyle(() => {
    return {
      width: 1,
      height: imageShaderHeight.value,
      right: SNAP.h + offsetX.value,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isRightSnapLineActive.value ? 1 : 0,
    };
  }, [isRightSnapLineActive, offsetX, imageShaderHeight]);

  const snapBottomHorizontalLine = useAnimatedStyle(() => {
    return {
      width: width,
      height: 1,
      left: 0,
      top: imageShaderHeight.value + offsetY.value - SNAP.v,
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
  }, [isCenterSnapLineActive, offsetX, imageShaderHeight]);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      isDragTrigger.value = true;
      paused.value = true;
    })
    .onChange(e => {
      isDragTrigger.value = true;

      dragDistanceX.value = clamp(
        dragDistanceX.value + e.changeX,
        imageOccupiedWidthRange.value[0],
        imageOccupiedWidthRange.value[1],
      );
      dragDistanceY.value = clamp(
        dragDistanceY.value + e.changeY,
        imageOccupiedHeightRange.value[0],
        imageOccupiedHeightRange.value[1] - templateCurrentHeight.value,
      );

      // Top snap
      if (Math.abs(dragDistanceY.value + e.changeY - SNAP.v) <= 30) {
        isTopSnapLineActive.value = true;
      }

      if (Math.abs(dragDistanceY.value + e.changeY - SNAP.v) <= 5) {
        // dragDistanceY.value = withTiming(SNAP, {
        //   duration: 10,
        // });
      }
      if (Math.abs(dragDistanceY.value + e.changeY - SNAP.v) >= 30) {
        isTopSnapLineActive.value = false;
      }
      // end of top snap

      // left snap
      if (
        Math.abs(
          dragDistanceX.value -
            templateCurrentWidth.value / 2 +
            e.changeX -
            SNAP.h,
        ) <= 30
      ) {
        isLeftSnapLineActive.value = true;
      }

      if (
        Math.abs(
          dragDistanceX.value -
            templateCurrentWidth.value / 2 +
            e.changeX -
            SNAP.h,
        ) <= 5
      ) {
        dragDistanceX.value = withTiming(
          templateCurrentWidth.value / 2 + SNAP.h,
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
            SNAP.h,
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
            SNAP.h,
        ) <= 30
      ) {
        isLeftSnapLineActive.value = true;
      }

      if (
        Math.abs(
          dragDistanceX.value -
            templateCurrentWidth.value / 2 +
            e.changeX -
            SNAP.h,
        ) <= 5
      ) {
        dragDistanceX.value = withTiming(
          templateCurrentWidth.value / 2 + SNAP.h,
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
            SNAP.h,
        ) >= 30
      ) {
        isLeftSnapLineActive.value = false;
      }
      // end of left snap

      // right snap
      if (
        Math.abs(
          width -
            offsetX.value -
            SNAP.h -
            (dragDistanceX.value + templateCurrentWidth.value / 2 + e.changeX),
        ) <= 30
      ) {
        isRightSnapLineActive.value = true;
      }

      if (
        Math.abs(
          width -
            offsetX.value -
            SNAP.h -
            (dragDistanceX.value + templateCurrentWidth.value / 2 + e.changeX),
        ) <= 5
      ) {
        dragDistanceX.value = withTiming(
          width - offsetX.value - SNAP.h - templateCurrentWidth.value / 2,
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
            SNAP.h,
        ) <=
        width - offsetX.value - 30
      ) {
        isRightSnapLineActive.value = false;
      }
      // end of right snap

      // bottom snap
      if (
        Math.abs(
          imageShaderHeight.value -
            SNAP.v -
            (dragDistanceY.value + templateCurrentHeight.value + e.changeX),
        ) <= 30
      ) {
        isBottomSnapLineActive.value = true;
      }

      if (
        Math.abs(
          imageShaderHeight.value -
            SNAP.v -
            (dragDistanceY.value + templateCurrentHeight.value + e.changeX),
        ) <= 5
      ) {
        dragDistanceY.value = withTiming(
          imageShaderHeight.value - SNAP.v - templateCurrentHeight.value,
          {
            duration: 10,
          },
        );
      }
      if (
        Math.abs(
          imageShaderHeight.value -
            SNAP.v -
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const toggleTemplateSelector = () => {
    setTemplateSelector(prev => !prev);
  };

  const handleCloseTemplateSelector = () => {
    setTemplateSelector(false);
  };

  const onClickExport = async () => {
    paused.value = true;
    setExporting(true);
  };
  const handleCancelVideoExport = () => {
    setExporting(false);
  };

  const offScreenParagraphLayoutWidth = useDerivedValue(() => {
    return route.params.width - TEMPLATE_PADDING * 2;
  }, [route.params.width]);

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
              transform={imageShaderTransform}
              height={route.params.height}
              width={route.params.width}
            />
          </Fill>

          {selectedVideo?.sentences && selectedTemplate && (
            <Template
              currentTime={currentTime}
              sentences={selectedVideo?.sentences}
              paragraphLayoutWidth={paragraphLayoutWidth}
              x={dragDistanceX}
              y={dragDistanceY}
              setTemplateHeight={templateCurrentHeight}
              setTemplateWidth={templateCurrentWidth}
              setX={templateXpos}
              setY={templateYpos}
              customFontMgr={customFontMgr}
              {...selectedTemplate}
            />
          )}
        </Canvas>

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
            <Icon
              name={'chevron-left'}
              size={scale(24)}
              color={theme.colors.white}
            />
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
                <Icon
                  name={'upload'}
                  size={scale(24)}
                  color={theme.colors.white}
                />
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
                  size={scale(24)}
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
              left: width / 2 - scale(40),
              top: height / 2 - verticalScale(40),
            },
          ]}>
          <Icon name={'play'} size={scale(52)} color={theme.colors.primary} />
        </AnimatedPressable>

        <GestureDetector gesture={composed}>
          <Animated.View style={[draggableStyle]} />
        </GestureDetector>
      </Pressable>

      {/* later optimized sentence to shared value and use display none or something like that */}
      {!!selectedVideo?.sentences.length && renderTimeLine && (
        <Timeline
          currentTime={currentTime}
          sentences={selectedVideo.sentences}
          frameRate={framerate}
          totalDuration={duration}
          seek={seek}
          height={TIMELINE_HEIGHT}
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
              size={scale(24)}
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
                <Icon
                  name={'translate'}
                  size={scale(24)}
                  color={theme.colors.white}
                />
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
                    size={scale(24)}
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
                  size={scale(24)}
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
          customFontMgr={customFontMgr}
          onSelect={handleSelectTemplate}
          onClose={handleCloseTemplateSelector}
          selectedTemplateId={selectedVideo.templateId}
        />
      )}

      {isExporting && selectedTemplate && selectedVideo?.audioUrl && (
        <ExportVideo
          duration={duration}
          frameRate={framerate}
          onCancel={handleCancelVideoExport}
          width={route.params.width}
          height={route.params.height}
          audioURL={selectedVideo?.audioUrl}
          template={selectedTemplate}
          paragraphLayoutWidth={offScreenParagraphLayoutWidth}
          sentences={selectedVideo?.sentences || []}
          dragPercentageX={dragDistancePercentageX.value}
          dragPercentageY={dragDistancePercentageY.value}
          customFontManager={customFontMgr}
          scaleFactor={scaleFactor}
          quality={selectedVideo.exportQuality}
          videoURL={route.params.videoURL}
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
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
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
    marginVertical: verticalScale(8),
  },
  bottomSheetContent: {
    padding: scale(24),
    display: 'flex',
    flexDirection: 'column',
    gap: verticalScale(24),
  },
  iconLabelContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: verticalScale(10),
    alignItems: 'center',
  },
  languageButton: {
    flexDirection: 'row',
    paddingHorizontal: scale(12),
  },

  back: {
    height: scale(32),
    width: scale(32),
    borderRadius: scale(16),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  templateIconWrapper: {
    height: scale(48),
    width: scale(48),
    borderRadius: scale(24),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  exportWrapper: {
    borderRadius: scale(12),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    gap: verticalScale(8),
  },

  toolBar: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-start',
    padding: scale(16),
    flexDirection: 'row',
  },

  rightIconsWrapperToolBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: verticalScale(24),
  },
});

export default EditScreen;
