import Interval from 'components/Timeline/Interval';
import React, {useMemo} from 'react';
import {StyleSheet, View, useWindowDimensions} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  SlideInRight,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {useTheme} from 'theme/ThemeContext';
import TimeIndicator from 'components/Timeline/TimeIndicator';
import SubInterval from 'components/Timeline/SubInterval';
import {GeneratedSentence, SentenceWord} from 'utils/sentencesBuilder';
import WordChip from 'components/Timeline/WordChip';
import {verticalScale} from 'react-native-size-matters';

type TimelineProps = {
  currentTime: SharedValue<number>;
  frameRate: number;
  totalDuration: number;
  seek: SharedValue<number>;
  height: number;
  sentences: GeneratedSentence[];
  onSelect: (word: SentenceWord) => void;
};

const framesPerInterval = 10;
const widthPerMs = 0.5;

const wordY = verticalScale(30);

const Timeline = ({
  currentTime,
  seek,
  totalDuration: totalVideoDuration,
  height,
  frameRate,
  sentences,
  onSelect,
}: TimelineProps) => {
  const direction = useSharedValue(0);

  const previousTime = useSharedValue(currentTime.value);

  const frameDurationMs = useMemo(() => {
    return 1000 / frameRate;
  }, [frameRate]);

  const intervalDurationMs = frameDurationMs * framesPerInterval;
  const widthPerInterval = intervalDurationMs * widthPerMs;
  const widthPerFrame = widthPerInterval / framesPerInterval;

  const allWords = useMemo(() => {
    return sentences.flatMap(value => value.words);
  }, [sentences]);

  const totalDuration = useMemo(() => {
    return totalVideoDuration - frameDurationMs * 2;
  }, [frameDurationMs, totalVideoDuration]);

  const totalWidth = useMemo(() => {
    return totalDuration * widthPerMs;
  }, [totalDuration]);

  const numberOfIntervals = useMemo(() => {
    return Math.floor(totalDuration / intervalDurationMs);
  }, [intervalDurationMs, totalDuration]);

  const partialIntervalWidth = useMemo(() => {
    return (totalDuration % intervalDurationMs) * widthPerMs;
  }, [intervalDurationMs, totalDuration]);

  const lastIntervalFrames = useMemo(() => {
    return Math.floor((totalDuration % intervalDurationMs) / frameDurationMs);
  }, [frameDurationMs, intervalDurationMs, totalDuration]);

  const {width} = useWindowDimensions();
  const {theme} = useTheme();
  const x = useSharedValue(0);

  const setWordTimelineX = useSharedValue(0);

  useAnimatedReaction(
    () => currentTime.value,
    _currentTime => {
      x.value = -_currentTime * widthPerMs;

      if (_currentTime > previousTime.value) {
        direction.value = -1;
      } else if (_currentTime < previousTime.value) {
        direction.value = 1;
      } else {
        direction.value = 0;
      }

      previousTime.value = _currentTime;
    },
    [currentTime],
  );

  const gesture = Gesture.Pan()
    .onChange(e => {
      x.value += e.changeX;

      if (x.value >= 0) {
        x.value = 0;
      }

      if (x.value <= -totalWidth) {
        x.value = -totalWidth;
      }

      direction.value = e.changeX < 0 ? -1 : 1;

      const newSeekValue = -x.value / widthPerMs;
      seek.value = newSeekValue;
    })
    .onEnd(() => {
      direction.value = 0;
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{translateX: width / 2 + x.value}],
  }));

  const wordTimelineAnimatedStyles = useAnimatedStyle(() => ({
    transform: [
      {translateX: width / 2 + setWordTimelineX.value},
      {
        translateY: -wordY,
      },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={{height: height, backgroundColor: theme.colors.black1}}>
        <Animated.View
          entering={SlideInRight}
          style={[
            {
              width: totalWidth,
              height: height,
              backgroundColor: theme.colors.black1,
            },
            animatedStyles,
          ]}>
          {[...Array(numberOfIntervals)].map((_, intervalIndex) => (
            <React.Fragment key={intervalIndex}>
              <Interval
                x={intervalIndex * widthPerInterval}
                lineWidth={1}
                label={`${((intervalIndex * intervalDurationMs) / 1000).toFixed(
                  2,
                )}s`}
                lineColor={theme.colors.grey3}
                height={verticalScale(28)}
              />
              {[...Array(framesPerInterval)].map((_, frameIndex) => (
                <SubInterval
                  key={frameIndex}
                  x={
                    intervalIndex * widthPerInterval +
                    frameIndex * widthPerFrame
                  }
                  y={12}
                  height={verticalScale(16)}
                  lineWidth={1}
                  lineColor={theme.colors.grey3}
                />
              ))}
            </React.Fragment>
          ))}

          {partialIntervalWidth > 0 && (
            <Interval
              x={numberOfIntervals * widthPerInterval}
              lineWidth={2}
              label={`${(
                (numberOfIntervals * intervalDurationMs) /
                1000
              ).toFixed(2)}s`}
              lineColor={theme.colors.grey4}
              height={verticalScale(40)}
            />
          )}
          {[...Array(lastIntervalFrames)].map((_, frameIndex) => (
            <SubInterval
              key={frameIndex}
              x={
                numberOfIntervals * widthPerInterval +
                frameIndex * widthPerFrame
              }
              y={12}
              height={verticalScale(16)}
              lineWidth={1}
              lineColor={theme.colors.grey3}
            />
          ))}
        </Animated.View>

        <Animated.View
          style={[style.wordTimelineWrapper, wordTimelineAnimatedStyles]}>
          {allWords.map(word => {
            return (
              <WordChip
                key={word.uuid}
                end={word.end}
                label={word.text}
                uuid={word.uuid}
                onPress={() => {
                  onSelect(word);
                }}
                currentTime={currentTime}
                start={word.start}
                setWordTimelineX={setWordTimelineX}
                direction={direction}
              />
            );
          })}
        </Animated.View>

        <TimeIndicator x={width / 2} lineWidth={2} />
      </View>
    </GestureDetector>
  );
};

const style = StyleSheet.create({
  wordTimelineWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
});

export default Timeline;
