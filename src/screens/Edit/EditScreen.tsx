import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Canvas,
  Fill,
  ImageShader,
  SkTypefaceFontProvider,
  Skia,
  fitbox,
  rect,
  useCanvasRef,
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
  ActivityIndicator,
  InteractionManager,
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
import {generateThumbnail} from 'utils/video';
import {
  GeneratedSentence,
  transformWordsToSentencesAsync,
} from 'utils/sentencesBuilder';
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

import {scale, verticalScale} from 'react-native-size-matters/extend';
import TimelineContainer from 'containers/TimelineContainer';
import usePrevious from 'hooks/usePrevious';
import RevenueCatUI, {PAYWALL_RESULT} from 'react-native-purchases-ui';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';
import {selectSubscriptionState} from 'store/subscription/selector';
import {setSubscribed} from 'store/subscription/slice';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type EditScreenProps = NativeStackScreenProps<
  RootStackParamList,
  SCREENS.EDIT
> & {customFontMgr: SkTypefaceFontProvider | null};

const TEMPLATE_PADDING = scale(16);
// scale is used in implmentaion
const SNAP = {
  v: verticalScale(16),
  h: scale(16),
};
const CANVAS_BUTTONS_FULL_OPACITY = 0.8;
const TIMELINE_HEIGHT = verticalScale(120);
const WITHOUT_TIMELINE_HEIGHT = verticalScale(85);

const EditScreen = ({route, navigation, customFontMgr}: EditScreenProps) => {
  const {theme} = useTheme();

  const {width, height} = useWindowDimensions();

  const inset = useSafeAreaInsets();

  const ref = useCanvasRef();
  const canvasSize = useSharedValue({width: 0, height: 0});

  const [isThumbnailGenerating, setThumbnailGenerate] = useState(true);

  const {isSubscribed} = useSelector(selectSubscriptionState);

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

  const selectedTemplate = useAppSelector(selectTemplateForSelectedVideo);

  const [selectedLanguage, setSelectedLanguage] = useState<languageType>(
    languages_best[0],
  );
  const selectedVideo = useSelector(selectSelectedVideo);

  const templateCurrentHeight = useSharedValue(0);
  const templateCurrentWidth = useSharedValue(0);

  const templateScale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const dispatch = useAppDispatch();

  const {currentFrame, currentTime, framerate, duration} = useVideo(videoURL, {
    paused: paused,
    volume: volume,
    looping: true,
    seek: seek,
  });

  const frameDurationMs = 1000 / framerate;

  const handleNavigateToHome = () => {
    handleCancelVideoExport();
    // setTimeout(() => {
    //   navigation.navigate('home');
    // }, 200);
  };

  // const isTopSnapLineActive = useSharedValue(false);
  // const isBottomSnapLineActive = useSharedValue(false);
  // const isLeftSnapLineActive = useSharedValue(false);
  // const isRightSnapLineActive = useSharedValue(false);
  // const isCenterSnapLineActive = useSharedValue(false);

  // drag
  const isDragTrigger = useSharedValue(false);

  const [renderTimeLine, setRenderTimeline] = useState(false);

  const [isTemplateSelectorOpen, setTemplateSelector] = useState(false);

  const previousSelectedTemplateId = usePrevious(selectedTemplate?.id);

  const [isTemplateSelecting, setTemplateSelecting] = useState(false);

  useEffect(() => {
    return () => {
      paused.value = true;
    };
  }, [paused]);

  useEffect(() => {
    if (selectedVideo && !selectedVideo?.thumbnailUrl) {
      generateThumbnail(videoURL, selectedVideo.id)
        .then(async thumbnailInfo => {
          assignThumbnailImageToCurrentFrame(thumbnailInfo.thumbnailURL);

          const updatedVideo: Video = {
            ...selectedVideo,
            thumbnailUrl: thumbnailInfo.thumbnailURL,
            rotation: thumbnailInfo.videoInfo.rotation,
          };
          updateVideoObjectToStore(updatedVideo);
          setThumbnailGenerate(false);
        })
        .catch(error => {
          console.log(error);
        });
    } else if (selectedVideo && selectedVideo.thumbnailUrl) {
      assignThumbnailImageToCurrentFrame(selectedVideo.thumbnailUrl);
      setThumbnailGenerate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideo?.thumbnailUrl, videoURL]);

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

  const assignThumbnailImageToCurrentFrame = (url: string) => {
    Skia.Data.fromURI(url).then(data => {
      const image = Skia.Image.MakeImageFromEncoded(data);

      currentFrame.value = image;
    });
  };

  const updateVideoObjectToStore = (_video: Video) => {
    dispatch(updateVideo(_video));
  };

  const handlePlay = () => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });

    ('worklet');
    if (!isAlreadyPlayedAfterScreenMount.value) {
      seek.value = 0;
    }
    paused.value = false;
    isAlreadyPlayedAfterScreenMount.value = true;
  };

  const handlePauseVideo = () => {
    if (!paused.value) {
      ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }
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
      pointerEvents: playButtonOpacity.value === 0 ? 'none' : 'auto',
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

  useEffect(() => {
    if (
      previousSelectedTemplateId !== selectedTemplate?.id &&
      selectedVideo &&
      selectedTemplate
    ) {
      const allWords = selectedVideo.sentences.flatMap(value => value.words);
      InteractionManager.runAfterInteractions(() => {
        transformWordsToSentencesAsync(
          allWords,
          [],
          selectedTemplate.maxWords,
        ).then(newGeneratedSentences => {
          const _videoObjectWithNewTemplateId: Video = {
            ...selectedVideo,
            sentences: newGeneratedSentences,
          };
          dispatch(updateVideo(_videoObjectWithNewTemplateId));
          setTemplateSelecting(false);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, previousSelectedTemplateId]);

  const handleSelectTemplate = (template: TemplateState) => {
    if (selectedVideo) {
      setTemplateSelecting(template.id !== previousSelectedTemplateId);
      const videoObjectWithNewTemplateId: Video = {
        ...selectedVideo,
        templateId: template.id,
      };

      dispatch(updateVideo(videoObjectWithNewTemplateId));
    }
  };

  const handleBack = () => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    paused.value = true;
    navigation.goBack();
  };

  const heightOtherThanCanvas = useDerivedValue(() => {
    if (selectedVideo && selectedVideo?.sentences?.length > 0) {
      return TIMELINE_HEIGHT + inset.top + inset.bottom;
    }
    return WITHOUT_TIMELINE_HEIGHT + inset.top + inset.bottom;
  }, [inset, selectedVideo?.sentences]);

  const imageShaderHeight = useDerivedValue(() => {
    return height - heightOtherThanCanvas.value;
  }, [heightOtherThanCanvas, height]);

  const normalizedRotation = useDerivedValue(() => {
    return (((selectedVideo?.rotation || 0) % 360) + 360) % 360;
  }, [selectedVideo?.rotation]);

  const originalWidth = useDerivedValue(() => {
    const isRotated =
      normalizedRotation.value === 90 || normalizedRotation.value === 270;
    return isRotated ? route.params.height : route.params.width;
  }, [normalizedRotation]);

  const originalHeight = useDerivedValue(() => {
    const isRotated =
      normalizedRotation.value === 90 || normalizedRotation.value === 270;
    return isRotated ? route.params.width : route.params.height;
  }, [normalizedRotation]);

  const scaleFactorOfWidth = useDerivedValue(() => {
    const targetWidth = width;
    const _scaleWidth = targetWidth / originalWidth.value;

    return _scaleWidth;
  }, [width, originalWidth]);

  const scaleFactorOfHeight = useDerivedValue(() => {
    const targetHeight = imageShaderHeight.value;
    const _scaleHeight = targetHeight / originalHeight.value;

    return _scaleHeight;
  }, [imageShaderHeight, originalHeight]);

  const scaleFactor = useDerivedValue(() => {
    return Math.min(scaleFactorOfWidth.value, scaleFactorOfHeight.value);
  }, [scaleFactorOfHeight, scaleFactorOfWidth]);

  const widthAfterScale = useDerivedValue(() => {
    return originalWidth.value * scaleFactor.value;
  }, [scaleFactor, originalWidth]);

  const heightAfterScale = useDerivedValue(() => {
    return originalHeight.value * scaleFactor.value;
  }, [scaleFactor, originalHeight]);

  const offsetX = useDerivedValue(() => {
    return (width - widthAfterScale.value) / 2;
  }, [width, widthAfterScale]);

  const offsetY = useDerivedValue(() => {
    return (imageShaderHeight.value - heightAfterScale.value) / 2;
  }, [imageShaderHeight, heightAfterScale]);

  const paragraphLayoutWidth = useDerivedValue(() => {
    return widthAfterScale.value - TEMPLATE_PADDING * 2;
  }, [widthAfterScale]);

  const imageOccupiedWidthRange = useDerivedValue(() => {
    return [offsetX.value, offsetX.value + widthAfterScale.value];
  }, [offsetX, widthAfterScale]);

  const imageOccupiedHeightRange = useDerivedValue(() => {
    return [offsetY.value, offsetY.value + heightAfterScale.value];
  }, [scaleFactor, offsetY]);

  const dragDistanceX = useSharedValue(width / 2);
  const dragDistanceY = useSharedValue(imageShaderHeight.value / 1.5);

  const dragDistancePercentageX = useDerivedValue(() => {
    const distanceFromCanvas = dragDistanceX.value - offsetX.value;
    const occupiedWidth = originalWidth.value * scaleFactor.value;

    const distanceFromEdgeOfCanvas = (distanceFromCanvas / occupiedWidth) * 100;

    return distanceFromEdgeOfCanvas;
  }, [dragDistanceX, offsetX, originalWidth]);

  const dragDistancePercentageY = useDerivedValue(() => {
    const distanceFromCanvas = dragDistanceY.value - offsetY.value;
    const occupiedHeight = originalHeight.value * scaleFactor.value;

    const distanceFromEdgeOfCanvas =
      (distanceFromCanvas / occupiedHeight) * 100;

    return distanceFromEdgeOfCanvas;
  }, [dragDistanceY, offsetY, originalHeight]);

  // Template
  const templateXpos = useSharedValue(0);
  const templateYpos = useSharedValue(0);

  const draggableStyle = useAnimatedStyle(() => {
    return {
      width: templateCurrentWidth.value,
      height: templateCurrentHeight.value,
      left: templateXpos.value,
      top: templateYpos.value,
      borderWidth: templateCurrentWidth.value ? 2 : 0,
      borderColor: isDragTrigger.value ? theme.colors.primary : 'transparent',
      position: 'absolute',
      transform: [
        {
          scale: templateScale.value,
        },
        {rotateZ: `${rotation.value}rad`},
      ],
    };
  });

  const snapTopHorizontalLine = useAnimatedStyle(() => {
    return {
      width: width,
      height: 1,
      left: 0,
      top: SNAP.v + offsetY.value,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isDragTrigger.value ? 1 : 0,
    };
  }, []);

  const snapLeftVerticalLine = useAnimatedStyle(() => {
    return {
      width: 1,
      height: imageShaderHeight.value,
      left: SNAP.h + offsetX.value,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isDragTrigger.value ? 1 : 0,
    };
  }, []);

  const snapRightVerticalLine = useAnimatedStyle(() => {
    return {
      width: 1,
      height: imageShaderHeight.value,
      right: SNAP.h + offsetX.value,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isDragTrigger.value ? 1 : 0,
    };
  }, []);

  const snapBottomHorizontalLine = useAnimatedStyle(() => {
    return {
      width: width,
      height: 1,
      left: 0,
      top: imageShaderHeight.value + offsetY.value - SNAP.v,
      backgroundColor: theme.colors.secondary,
      position: 'absolute',
      opacity: isDragTrigger.value ? 1 : 0,
    };
  }, []);

  const snapCentralVerticalLine = useAnimatedStyle(() => {
    return {
      width: 1,
      height: imageShaderHeight.value,
      left: width / 2,
      backgroundColor: theme.colors.primary,
      position: 'absolute',
      opacity: isDragTrigger.value ? 1 : 0,
    };
  }, []);

  const triggerHapticFeedback = () => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.selection, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      if (!isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
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

      // // Top snap
      // if (Math.abs(dragDistanceY.value + e.changeY - SNAP.v) <= 30) {
      //   isTopSnapLineActive.value = true;
      // }

      // if (Math.abs(dragDistanceY.value + e.changeY - SNAP.v) <= 5) {
      //   // dragDistanceY.value = withTiming(SNAP, {
      //   //   duration: 10,
      //   // });
      // }
      // if (Math.abs(dragDistanceY.value + e.changeY - SNAP.v) >= 30) {
      //   isTopSnapLineActive.value = false;
      // }
      // // end of top snap

      // // left snap
      // if (
      //   Math.abs(
      //     dragDistanceX.value -
      //       templateCurrentWidth.value / 2 +
      //       e.changeX -
      //       SNAP.h,
      //   ) <= 30
      // ) {
      //   isLeftSnapLineActive.value = true;
      // }

      // if (
      //   Math.abs(
      //     dragDistanceX.value -
      //       templateCurrentWidth.value / 2 +
      //       e.changeX -
      //       SNAP.h,
      //   ) <= 5
      // ) {
      //   dragDistanceX.value = withTiming(
      //     templateCurrentWidth.value / 2 + SNAP.h,
      //     {
      //       duration: 10,
      //     },
      //   );
      // }
      // if (
      //   Math.abs(
      //     dragDistanceX.value -
      //       templateCurrentWidth.value / 2 +
      //       e.changeX -
      //       SNAP.h,
      //   ) >= 30
      // ) {
      //   isLeftSnapLineActive.value = false;
      // }
      // // end of top snap

      // // left snap
      // if (
      //   Math.abs(
      //     dragDistanceX.value -
      //       templateCurrentWidth.value / 2 +
      //       e.changeX -
      //       SNAP.h,
      //   ) <= 30
      // ) {
      //   isLeftSnapLineActive.value = true;
      // }

      // if (
      //   Math.abs(
      //     dragDistanceX.value -
      //       templateCurrentWidth.value / 2 +
      //       e.changeX -
      //       SNAP.h,
      //   ) <= 5
      // ) {
      //   dragDistanceX.value = withTiming(
      //     templateCurrentWidth.value / 2 + SNAP.h,
      //     {
      //       duration: 10,
      //     },
      //   );
      // }
      // if (
      //   Math.abs(
      //     dragDistanceX.value -
      //       templateCurrentWidth.value / 2 +
      //       e.changeX -
      //       SNAP.h,
      //   ) >= 30
      // ) {
      //   isLeftSnapLineActive.value = false;
      // }
      // // end of left snap

      // // right snap
      // if (
      //   Math.abs(
      //     width -
      //       offsetX.value -
      //       SNAP.h -
      //       (dragDistanceX.value + templateCurrentWidth.value / 2 + e.changeX),
      //   ) <= 30
      // ) {
      //   isRightSnapLineActive.value = true;
      // }

      // if (
      //   Math.abs(
      //     width -
      //       offsetX.value -
      //       SNAP.h -
      //       (dragDistanceX.value + templateCurrentWidth.value / 2 + e.changeX),
      //   ) <= 5
      // ) {
      //   dragDistanceX.value = withTiming(
      //     width - offsetX.value - SNAP.h - templateCurrentWidth.value / 2,
      //     {
      //       duration: 10,
      //     },
      //   );
      // }
      // if (
      //   Math.abs(
      //     dragDistanceX.value +
      //       templateCurrentWidth.value / 2 +
      //       e.changeX +
      //       SNAP.h,
      //   ) <=
      //   width - offsetX.value - 30
      // ) {
      //   isRightSnapLineActive.value = false;
      // }
      // // end of right snap

      // // bottom snap
      // if (
      //   Math.abs(
      //     imageShaderHeight.value -
      //       SNAP.v -
      //       (dragDistanceY.value + templateCurrentHeight.value + e.changeX),
      //   ) <= 30
      // ) {
      //   isBottomSnapLineActive.value = true;
      // }

      // if (
      //   Math.abs(
      //     imageShaderHeight.value -
      //       SNAP.v -
      //       (dragDistanceY.value + templateCurrentHeight.value + e.changeX),
      //   ) <= 5
      // ) {
      //   dragDistanceY.value = withTiming(
      //     imageShaderHeight.value - SNAP.v - templateCurrentHeight.value,
      //     {
      //       duration: 10,
      //     },
      //   );
      // }
      // if (
      //   Math.abs(
      //     imageShaderHeight.value -
      //       SNAP.v -
      //       (dragDistanceY.value + templateCurrentHeight.value + e.changeX),
      //   ) >= 30
      // ) {
      //   isBottomSnapLineActive.value = false;
      // }
      // // end of bottom snap

      // // central snap
      // if (Math.abs(dragDistanceX.value + e.changeX - width / 2) <= 5) {
      //   isCenterSnapLineActive.value = true;
      // }

      // if (Math.abs(dragDistanceX.value + e.changeX - width / 2) <= 5) {
      //   // no snap in center
      // }
      // if (Math.abs(dragDistanceX.value + e.changeX - width / 2) >= 5) {
      //   isCenterSnapLineActive.value = false;
      // }
      // end of central snap
    })
    .onEnd(() => {
      if (isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      isDragTrigger.value = false;
      // isTopSnapLineActive.value = false;
      // isLeftSnapLineActive.value = false;
      // isRightSnapLineActive.value = false;
      // isBottomSnapLineActive.value = false;
      // isCenterSnapLineActive.value = false;
    });

  const tapGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      if (!isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      isDragTrigger.value = true;
      paused.value = true;
    })
    .onEnd(() => {
      isDragTrigger.value = false;
    })
    .onFinalize(() => {
      if (isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      isDragTrigger.value = false;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      if (!isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      isDragTrigger.value = true;
      paused.value = true;
    })
    .onUpdate(e => {
      templateScale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      savedScale.value = templateScale.value;
      isDragTrigger.value = false;
    });

  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      if (!isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      isDragTrigger.value = true;
      paused.value = true;
    })
    .onUpdate(e => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      if (isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      savedRotation.value = rotation.value;
      isDragTrigger.value = false;
    });

  const canvasPinchGesture = Gesture.Pinch()
    .onStart(() => {
      if (!isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      isDragTrigger.value = true;
      paused.value = true;
    })
    .onUpdate(e => {
      templateScale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      savedScale.value = templateScale.value;
      isDragTrigger.value = false;
    });

  const canvasRotationGesture = Gesture.Rotation()
    .onStart(() => {
      if (!isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      isDragTrigger.value = true;
      paused.value = true;
    })
    .onUpdate(e => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      if (isDragTrigger.value) {
        runOnJS(triggerHapticFeedback)();
      }
      savedRotation.value = rotation.value;
      isDragTrigger.value = false;
    });

  const composed = Gesture.Simultaneous(
    rotationGesture,
    pinchGesture,
    dragGesture,
    tapGesture,
  );

  const canvasComposed = Gesture.Simultaneous(
    canvasPinchGesture,
    canvasRotationGesture,
  );

  useEffect(() => {
    if (duration !== 0 && renderTimeLine === false) {
      setRenderTimeline(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const toggleTemplateSelector = () => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    paused.value = true;
    setTemplateSelector(prev => !prev);
  };

  const handleCloseTemplateSelector = () => {
    setTemplateSelector(false);
  };

  const getIsSubscription = (paywall: PAYWALL_RESULT) => {
    switch (paywall) {
      case PAYWALL_RESULT.NOT_PRESENTED:
        return true;
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
        return false;
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      default:
        return false;
    }
  };

  const onClickExport = async () => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.effectClick, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    paused.value = true;

    // if (isSubscribed) {
    setExporting(true);
    // } else {
    //   RevenueCatUI.presentPaywall().then(paywall => {
    //     const _isSubscribed = getIsSubscription(paywall);
    //     dispatch(setSubscribed(_isSubscribed));
    //   });
    // }
  };

  const handleCancelVideoExport = () => {
    setExporting(false);
  };

  const offScreenParagraphLayoutWidth = useDerivedValue(() => {
    return originalWidth.value - TEMPLATE_PADDING * 2;
  }, [originalWidth.value]);

  const transform = useDerivedValue(() => {
    const src = rect(0, 0, route.params.width, route.params.height);
    const dst = rect(
      offsetX.value,
      offsetY.value,
      widthAfterScale.value,
      heightAfterScale.value,
    );

    const rotation =
      !!selectedVideo && selectedVideo.rotation ? -selectedVideo.rotation : 0;

    // @ts-ignore
    return fitbox('contain', src, dst, rotation);
  }, [widthAfterScale, heightAfterScale, selectedVideo?.rotation]);

  return (
    <SafeAreaView
      style={[
        Styles.container,
        {
          backgroundColor: theme.colors.black2,
        },
      ]}>
      <Pressable onPress={handlePauseVideo} style={[Styles.playerWrapper]}>
        <GestureDetector gesture={canvasComposed}>
          <Canvas style={[Styles.canvas]} ref={ref} onSize={canvasSize}>
            <Fill>
              <ImageShader
                image={currentFrame}
                transform={transform}
                // transform={imageShaderTransform}
                height={route.params.height}
                width={route.params.width}
              />
            </Fill>

            {selectedTemplate && customFontMgr && (
              <Template
                rotation={rotation}
                scale={templateScale}
                currentTime={currentTime}
                sentences={selectedVideo?.sentences || []}
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

        <GestureDetector gesture={composed}>
          <Animated.View style={[draggableStyle]} />
        </GestureDetector>
      </Pressable>

      {!isThumbnailGenerating && (
        <AnimatedPressable
          onPress={handlePlay}
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
      )}

      {/* later optimized sentence to shared value and use display none or something like that */}
      {!!selectedVideo?.sentences.length && renderTimeLine && (
        <TimelineContainer
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
              label={`Add ${selectedLanguage.short_label} captions`}
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

      {isTemplateSelectorOpen && selectedVideo && customFontMgr && (
        <TemplateSelector
          customFontMgr={customFontMgr}
          onSelect={handleSelectTemplate}
          onClose={handleCloseTemplateSelector}
          selectedTemplateId={selectedVideo.templateId}
        />
      )}

      {isExporting &&
        selectedTemplate &&
        selectedVideo?.audioUrl &&
        customFontMgr && (
          <ExportVideo
            rotation={rotation}
            scale={templateScale}
            duration={duration}
            frameRate={framerate}
            onCancel={handleCancelVideoExport}
            width={originalWidth.value}
            height={originalHeight.value}
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
            videoId={selectedVideo.id}
            navigateToHome={handleNavigateToHome}
          />
        )}

      {isThumbnailGenerating && (
        <View style={Styles.flexCenter}>
          <ActivityIndicator
            shouldRasterizeIOS
            color={theme.colors.primary}
            size={'large'}
          />
        </View>
      )}

      {isTemplateSelecting && (
        <View style={[Styles.flexCenter]}>
          <View
            style={[
              Styles.loadingContainer,
              {
                backgroundColor: theme.colors.black1,
              },
            ]}>
            <ActivityIndicator
              shouldRasterizeIOS
              color={theme.colors.primary}
              size={'large'}
            />
            <Text
              style={[
                theme.typography.subheader.small,
                {
                  color: theme.colors.primary,
                },
              ]}>
              Applying template style...
            </Text>
          </View>
        </View>
      )}

      {!customFontMgr && (
        <View
          style={[
            Styles.backDrop,
            {
              height: height,
            },
          ]}>
          <ActivityIndicator
            shouldRasterizeIOS
            color={theme.colors.primary}
            size={'large'}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const Styles = StyleSheet.create({
  flexCenter: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  backDrop: {
    flex: 1,
    position: 'absolute',
    padding: verticalScale(48),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
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

  loadingContainer: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
  },
});

export default EditScreen;
