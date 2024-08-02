import Interval from 'components/Timeline/Interval';
import React from 'react';
import {View, useWindowDimensions} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {useTheme} from 'theme/ThemeContext';

type TimelineProps = {
  currentTime: SharedValue<number>;
  frameRate: number;
  totalDuration: SharedValue<number>;
  seek: SharedValue<number>;
};

const Timeline = ({
  frameRate,
  currentTime,
  seek,
  totalDuration,
}: TimelineProps) => {
  const framesPerInterval = 10;
  const frameDurationMs = 1000 / frameRate;
  const intervalDurationMs = frameDurationMs * framesPerInterval;
  const widthPerMs = 0.5;

  const totalWidth = totalDuration.value * widthPerMs;
  const numberOfIntervals = Math.floor(
    totalDuration.value / intervalDurationMs,
  );
  const partialIntervalWidth =
    (totalDuration.value % intervalDurationMs) * widthPerMs;
  const widthPerInterval = intervalDurationMs * widthPerMs;
  const widthPerFrame = widthPerInterval / framesPerInterval;

  const {width} = useWindowDimensions();
  const {theme} = useTheme();
  const x = useSharedValue(0);

  useAnimatedReaction(
    () => currentTime.value,
    _currentTime => {
      x.value = -_currentTime * widthPerMs;

      if (x.value >= 0) {
        x.value = 0;
      }

      if (_currentTime + frameDurationMs >= totalDuration.value) {
        x.value = -_currentTime * widthPerMs;
      }

      if (
        x.value <=
        -(totalDuration.value - frameDurationMs * 2) * widthPerMs
      ) {
        x.value = -(totalDuration.value - frameDurationMs * 2) * widthPerMs;
      }
    },
    [currentTime],
  );

  const gesture = Gesture.Pan()
    .onChange(e => {
      x.value += e.changeX;

      if (x.value >= 0) {
        x.value = 0;
      }

      if (
        x.value <=
        -(totalDuration.value - frameDurationMs * 2) * widthPerMs
      ) {
        x.value = -(totalDuration.value - frameDurationMs * 2) * widthPerMs;
      }

      const newSeekValue = -x.value / widthPerMs;
      seek.value = newSeekValue;
    })
    .onEnd(() => {
      // // Snap to nearest frame or interval
      // seek.value = Math.round(seek.value / frameDurationMs) * frameDurationMs;
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{translateX: width / 2 + x.value}],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={{height: 150, backgroundColor: theme.colors.black1}}>
        <Animated.View
          style={[
            {
              width: totalWidth,
              height: 150,
              backgroundColor: theme.colors.error,
            },
            animatedStyles,
          ]}>
          {[...Array(numberOfIntervals)].map((_, intervalIndex) => (
            <React.Fragment key={intervalIndex}>
              <Interval
                x={intervalIndex * widthPerInterval}
                lineWidth={2}
                label={`${((intervalIndex * intervalDurationMs) / 1000).toFixed(
                  2,
                )}s`}
                lineColor={theme.colors.grey4}
                height={40}
              />
              {[...Array(framesPerInterval)].map((_, frameIndex) => (
                <View
                  key={frameIndex}
                  style={{
                    position: 'absolute',
                    left:
                      intervalIndex * widthPerInterval +
                      frameIndex * widthPerFrame,
                    top: 20,
                    width: 1,
                    height: 20,
                    backgroundColor: 'grey',
                  }}
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
        </Animated.View>
        <View
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'row',
            transform: [{translateX: width / 2 - 25}],
          }}>
          <View
            style={{
              width: 25,
              height: 150,
              backgroundColor: theme.colors.black1,
              opacity: 0.5,
            }}
          />
          <View
            style={{
              width: 5,
              height: 150,
              backgroundColor: theme.colors.secondary,
              borderRadius: 10,
            }}
          />
          <View
            style={{
              width: 25,
              height: 150,
              backgroundColor: theme.colors.black1,
              opacity: 0.5,
            }}
          />
        </View>
      </View>
    </GestureDetector>
  );
};

export default Timeline;
