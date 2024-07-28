import {Skia} from '@shopify/react-native-skia';
import KaraokeText from 'components/Skia/KaraokeText';
import OutlineText from 'components/Skia/OutlineText';
import {useParagraphDimensions} from 'hooks/useParagraphDimensions';
import React, {useMemo, memo, useState} from 'react';
import {useWindowDimensions} from 'react-native';
import {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import {GeneratedSentence} from 'utils/sentencesBuilder';

type CustomParagraphProps = {
  currentTime: SharedValue<number>;
  sentences: GeneratedSentence[];
  frameRate: number;
};

const EMPTY_SENTENCE = {
  text: '',
  words: [],
  start: 0,
  end: 0,
};

const CustomParagraph: React.FC<CustomParagraphProps> = ({
  currentTime,
  sentences,
  frameRate,
}) => {
  const [currentSentence, setCurrentSentence] =
    useState<GeneratedSentence>(EMPTY_SENTENCE);

  const {height} = useWindowDimensions();

  const allWords = useMemo(() => {
    return currentSentence.words.map(word => word.text);
  }, [currentSentence]);

  const isWithinInterval = useSharedValue(false);

  useAnimatedReaction(
    () => {
      return currentTime.value;
    },
    latestTime => {
      const activeSentence = sentences.find(
        sentence => latestTime >= sentence.start && latestTime <= sentence.end,
      );

      if (activeSentence) {
        if (!isWithinInterval.value) {
          console.log('Current time', currentTime.value);
          console.log('Current frame', frameRate);
          runOnJS(setCurrentSentence)(activeSentence);
          isWithinInterval.value = true;
        }
      } else {
        if (isWithinInterval.value) {
          runOnJS(setCurrentSentence)(EMPTY_SENTENCE);
          isWithinInterval.value = false;
        }
      }
    },
  );

  const {wordDimensions} = useParagraphDimensions({
    words: allWords,
    canvasPadding: 16,
    x: 16,
    y: height / 1.3,
    paragraphStyle: {
      textStyle: {
        fontSize: 32,
        color: Skia.Color('white'),
      },
    },
  });

  return (
    <>
      {allWords.map((word, index) => {
        return (
          <OutlineText
            key={`${word}-${index}`}
            label={word}
            color={Skia.Color('white')}
            x={wordDimensions[index]?.x || 0}
            y={wordDimensions[index]?.y || 0}
            currentTime={currentTime}
            end={currentSentence.words[index].end}
            start={currentSentence.words[index].start}
            size={34}
            fontFamily={'Inter'}
            strokeColor={Skia.Color('black')}
            strokeWidth={5}
          />
        );
      })}
    </>
  );
};

// Custom comparison function for React.memo
const arePropsEqual = (
  prevProps: CustomParagraphProps,
  nextProps: CustomParagraphProps,
) => {
  return prevProps.sentences === nextProps.sentences;
};

export default memo(CustomParagraph, arePropsEqual);
