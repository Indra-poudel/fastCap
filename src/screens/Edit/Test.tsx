import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Canvas,
  Fill,
  ImageShader,
  useImage,
  useVideo,
  Text as SkiaText,
  useFonts,
  matchFont,
  RoundedRect,
  SkFont,
} from '@shopify/react-native-skia';
import {
  SentencesResponse,
  TranscriptSentence,
  TranscriptWord,
} from 'assemblyai';
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
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from 'theme/ThemeContext';
import generateThumbnail from 'utils/video';
import sentencesMock from 'mocks/sentences.json';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type EditScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.EDIT>;

const EditScreen = ({route}: EditScreenProps) => {
  const {theme} = useTheme();
  const videoURL = route.params.videoURL;
  const [paused, setPaused] = useState(true);
  const opacity = useSharedValue(1);
  const {width, height} = useWindowDimensions();
  const [isAddCaptionBottomSheetOpen, setAddCaptionBottomSheetOpen] =
    useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const [isLanguageBottomSheetOpen, setLanguageBottomSheetOpen] =
    useState(false);

  const [sentences, setSentences] = useState<SentencesResponse>(sentencesMock);

  const [isCaptionsGenerating, setCaptionsGenerating] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState<languageType>(
    languages_best[0],
  );

  const derivedPaused = useDerivedValue(() => {
    return paused;
  }, [paused]);

  const {currentFrame, currentTime} = useVideo(videoURL, {
    paused: derivedPaused,
    volume: 1,
  });

  const [allWords, setAllWords] = useState<TranscriptWord[]>([]);
  const [currentWord, setCurrentWord] = useState<TranscriptWord | undefined>(
    undefined,
  );

  useEffect(() => {
    generateThumbnail(videoURL)
      .then(url => {
        console.log(url);
        setThumbnailUrl(url);
      })
      .catch(error => {
        console.log(error);
      });
  }, [videoURL]);

  useEffect(() => {
    if (sentences) {
      const words = accumulateWords(sentences.sentences);

      setAllWords(words);
    }
  }, [sentences]);

  const handlePlayPause = () => {
    if (thumbnailUrl) {
      setThumbnailUrl('');
    }
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

  const thumbnail = useImage(thumbnailUrl);

  const handleCaptionServiceCancel = () => {
    setCaptionsGenerating(false);
  };

  const handleCaptionServiceSuccess = (data: SentencesResponse) => {
    setSentences(data);
  };

  const fontMgr = useFonts({
    Inter: [
      require('../../assets/fonts/Inter-Medium.ttf'),
      require('../../assets/fonts/Inter-Black.ttf'),
      require('../../assets/fonts/Inter-Bold.ttf'),
      require('../../assets/fonts/Inter-ExtraBold.ttf'),
      require('../../assets/fonts/Inter-ExtraLight.ttf'),
      require('../../assets/fonts/Inter-Light.ttf'),
      require('../../assets/fonts/Inter-Regular.ttf'),
      require('../../assets/fonts/Inter-SemiBold.ttf'),
      require('../../assets/fonts/Inter-Thin.ttf'),
    ],
  });

  useAnimatedReaction(
    () => currentTime.value,
    latestTime => {
      if (allWords) {
        const activeWord = allWords.find(
          word => latestTime >= word.start && latestTime <= word.end,
        );
        if (activeWord) {
          runOnJS(setCurrentWord)(activeWord);
        } else {
          runOnJS(setCurrentWord)(undefined);
        }
      }
    },
    [allWords],
  );

  if (!fontMgr) {
    return null;
  }

  const font: SkFont = matchFont(
    {
      fontFamily: 'Inter',
      fontWeight: 'bold',
      fontSize: 32,
    },
    fontMgr,
  );

  const textRect = font.measureText(currentWord?.text || '');

  const padding = 12;
  const rectX = width / 2 - (textRect.width + padding * 2) / 2;
  const rectY = height / 1.5;

  return (
    <View
      style={[
        Styles.container,
        {
          backgroundColor: theme.colors.black2,
        },
      ]}>
      <Pressable onPress={handlePlayPause} style={[Styles.playerWrapper]}>
        <Canvas style={Styles.canvas}>
          <Fill>
            <ImageShader
              image={thumbnail || currentFrame}
              rect={{x: 0, y: 0, width: width, height: height}}
              fit={'contain'}
            />
          </Fill>

          {currentWord?.text && (
            <>
              <RoundedRect
                x={rectX}
                y={rectY}
                width={textRect.width + padding * 2}
                height={textRect.height + padding * 2}
                r={12}
                color={theme.colors.primary}
              />
              <SkiaText
                x={rectX + padding}
                y={
                  rectY -
                  textRect.height +
                  (textRect.height - textRect.y) +
                  padding
                }
                color={'white'}
                text={currentWord?.text}
                font={font}
              />

              <SkiaText
                x={10}
                y={50}
                text={currentWord?.text}
                color={({x}) =>
                  x < currentIndex / textLength ? 'red' : 'black'
                }
                font={font}
              />
            </>
          )}
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
              label={`Add ${selectedLanguage.short_label} captions`}
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

const accumulateWords = (sentences: TranscriptSentence[]) => {
  let allWords: TranscriptWord[] = [];
  sentences.forEach(sentence => {
    allWords = [...allWords, ...sentence.words];
  });
  return allWords;
};

const splitWordsIntoChunks = (words: TranscriptWord[], chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }
  return chunks;
};
