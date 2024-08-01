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
import {GeneratedSentence} from 'utils/sentencesBuilder';

type TimelineProps = {
  currentTime: SharedValue<number>;
  sentences: GeneratedSentence[];
  frameRate: number;
  totalDuration: SharedValue<number>;
  seek: SharedValue<number>;
};

const Timeline = ({
  frameRate,
  currentTime,
  sentences,
  seek,
  totalDuration,
}: TimelineProps) => {
  const framesPerInterval = 10;
  const frameDurationMs = 1000 / frameRate;
  const intervalDurationMs = frameDurationMs * framesPerInterval;
  const widthPerMs = 0.5;

  const totalWidth = totalDuration.value * widthPerMs;
  const numberOfIntervals = Math.ceil(totalDuration.value / intervalDurationMs);
  const widthPerInterval = totalWidth / numberOfIntervals;
  const widthPerFrame = widthPerInterval / framesPerInterval;

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

      const newSeekValue = -x.value / widthPerMs;
      if (newSeekValue >= 0 && newSeekValue <= totalDuration.value) {
        seek.value = newSeekValue;
      }

      // Ensure x.value does not exceed the bounds
      if (x.value > 0) {
        x.value = 0;
      }
    })
    .onEnd(() => {});

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{translateX: width / 2 + x.value}],
    };
  }, [currentTime]);

  return (
    <GestureDetector gesture={gesture}>
      <View style={{height: 150, backgroundColor: theme.colors.black1}}>
        {/* Total timeline */}
        <Animated.View
          style={[
            {
              width: totalWidth,
              height: 150,
              backgroundColor: theme.colors.error,
            },
            animatedStyles,
          ]}>
          {/* Draw the intervals and frames */}
          {[...Array(numberOfIntervals)].map((_, intervalIndex) => {
            const intervalStartX = intervalIndex * widthPerInterval;

            return (
              <React.Fragment key={intervalIndex}>
                {/* Draw a larger line at the start of the interval */}
                <View
                  style={{
                    position: 'absolute',
                    left: intervalStartX,
                    top: 10,
                    width: 2,
                    height: 40,
                    backgroundColor: 'black',
                  }}
                />
                {/* Draw the frames within the interval */}
                {[...Array(framesPerInterval)].map((_, frameIndex) => {
                  const frameStartX =
                    intervalStartX + frameIndex * widthPerFrame;
                  return (
                    <View
                      key={frameIndex}
                      style={{
                        position: 'absolute',
                        left: frameStartX,
                        top: 20,
                        width: 1,
                        height: 20,
                        backgroundColor: 'grey',
                      }}
                    />
                  );
                })}
                {/* Draw a larger line at the end of the interval */}
                <View
                  style={{
                    position: 'absolute',
                    left: intervalStartX + widthPerInterval,
                    top: 10,
                    width: 2,
                    height: 40,
                    backgroundColor: 'black',
                  }}
                />
              </React.Fragment>
            );
          })}
        </Animated.View>
        {/* end of total timeline */}

        {/* current time indicator  */}
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
        {/*  end of current time indicator  */}
      </View>
    </GestureDetector>
  );
};

export default Timeline;
