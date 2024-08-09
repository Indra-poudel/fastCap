import Interval from 'components/Timeline/Interval';
import React from 'react';
import {View, useWindowDimensions} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import {useTheme} from 'theme/ThemeContext';
import TimeIndicator from 'components/Timeline/TimeIndicator';
import SubInterval from 'components/Timeline/SubInterval';
import {GeneratedSentence} from 'utils/sentencesBuilder';

type TimelineProps = {
  currentTime: SharedValue<number>;
  frameRate: number;
  totalDuration: SharedValue<number>;
  seek: SharedValue<number>;
  height: number;
  sentences: GeneratedSentence[];
};

const Timeline = ({
  frameRate,
  currentTime,
  seek,
  totalDuration: totalVideoDuration,
  height,
}: TimelineProps) => {
  const framesPerInterval = 10;
  const frameDurationMs = 1000 / frameRate;
  const intervalDurationMs = frameDurationMs * framesPerInterval;
  const widthPerMs = 0.5;

  // Hacky way to fix gesture handler while reach at last.
  const totalDuration = useDerivedValue(() => {
    return totalVideoDuration.value - frameDurationMs * 2;
  });

  const totalWidth = totalDuration.value * widthPerMs;
  const numberOfIntervals = Math.floor(
    totalDuration.value / intervalDurationMs,
  );

  const partialIntervalWidth =
    (totalDuration.value % intervalDurationMs) * widthPerMs;
  const widthPerInterval = intervalDurationMs * widthPerMs;
  const widthPerFrame = widthPerInterval / framesPerInterval;

  // Calculate frames in the last partial interval
  const lastIntervalFrames = Math.floor(
    (totalDuration.value % intervalDurationMs) / frameDurationMs,
  );

  const {width} = useWindowDimensions();
  const {theme} = useTheme();
  const x = useSharedValue(0);

  useAnimatedReaction(
    () => currentTime.value,
    _currentTime => {
      x.value = -_currentTime * widthPerMs;
    },
    [currentTime],
  );

  const gesture = Gesture.Pan()
    .onChange(e => {
      x.value += e.changeX;

      // stop moving x less than 0
      if (x.value >= 0) {
        x.value = 0;
      }

      // stop moving x more than total width
      if (x.value <= -totalWidth) {
        x.value = -totalWidth;
      }

      const newSeekValue = -x.value / widthPerMs;
      seek.value = newSeekValue;
    })
    .onEnd(() => {});

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{translateX: width / 2 + x.value}],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={{height: height, backgroundColor: theme.colors.black1}}>
        <Animated.View
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
                height={28}
              />
              {[...Array(framesPerInterval)].map((_, frameIndex) => (
                <SubInterval
                  key={frameIndex}
                  x={
                    intervalIndex * widthPerInterval +
                    frameIndex * widthPerFrame
                  }
                  y={12}
                  height={16}
                  lineWidth={1}
                  lineColor={theme.colors.grey3}
                />
              ))}
            </React.Fragment>
          ))}
          {/* Handle partial interval if exists */}
          {partialIntervalWidth > 0 && (
            <Interval
              x={numberOfIntervals * widthPerInterval}
              lineWidth={2}
              label={`${(
                (numberOfIntervals * intervalDurationMs) /
                1000
              ).toFixed(2)}s`}
              lineColor={theme.colors.grey4}
              height={40}
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
              height={16}
              lineWidth={1}
              lineColor={theme.colors.grey3}
            />
          ))}
        </Animated.View>
        <TimeIndicator x={width / 2} lineWidth={2} />
      </View>
    </GestureDetector>
  );
};

export default Timeline;
