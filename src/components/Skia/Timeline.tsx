import {Canvas, Group, Rect, RoundedRect} from '@shopify/react-native-skia';
import React from 'react';
import {useWindowDimensions} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {SharedValue, useSharedValue} from 'react-native-reanimated';
import {useTheme} from 'theme/ThemeContext';
import {GeneratedSentence} from 'utils/sentencesBuilder';

type TimelineProps = {
  currentTime: SharedValue<number>;
  sentences: GeneratedSentence[];
  frameRate: number;
  totalDuration: SharedValue<number>;
};

const Timeline = ({
  frameRate,
  currentTime,
  sentences,
  totalDuration,
}: TimelineProps) => {
  const framesPerInterval = 10;
  const videoDurationMs = totalDuration;
  const frameDurationMs = 1000 / frameRate;
  const intervalDurationMs = frameDurationMs * framesPerInterval;
  const widthPerMs = 0.5;

  const totalWidth = videoDurationMs.value * widthPerMs;
  const numberOfIntervals = Math.ceil(
    videoDurationMs.value / intervalDurationMs,
  );
  const widthPerInterval = totalWidth / numberOfIntervals;
  const widthPerFrame = widthPerInterval / framesPerInterval;

  const {width} = useWindowDimensions();
  const {theme} = useTheme();
  const x = useSharedValue(width / 2);

  const gesture = Gesture.Pan()
    .onChange(e => {
      x.value += e.changeX;

      if (x.value >= width / 2) {
        x.value = width / 2;
      }
    })
    .onEnd(e => {});

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{height: 150}}>
        <Rect
          x={0}
          y={0}
          width={width}
          height={150}
          color={theme.colors.black1}
        />
        <Rect
          x={x}
          y={0}
          width={totalWidth}
          height={150}
          color={theme.colors.error}
        />

        {[...Array(numberOfIntervals)].map((_, intervalIndex) => {
          const intervalStartX = intervalIndex * widthPerInterval + x.value;

          return (
            <React.Fragment key={intervalIndex}>
              {/* Draw the interval */}
              <Rect
                x={intervalStartX}
                y={20}
                width={widthPerInterval}
                height={40}
                color="lightgrey"
              />
              {/* Draw the frames within the interval */}
              {[...Array(framesPerInterval)].map((_, frameIndex) => {
                const frameStartX = intervalStartX + frameIndex * widthPerFrame;

                return (
                  <Rect
                    key={frameIndex}
                    x={frameStartX}
                    y={20}
                    width={widthPerFrame - 1} // Adding a slight gap between frames
                    height={40}
                    color="grey"
                  />
                );
              })}
            </React.Fragment>
          );
        })}

        <Group>
          <Rect
            x={width / 2 - 25}
            y={0}
            width={25}
            height={150}
            color={theme.colors.black1}
            opacity={0.5}
          />
          <RoundedRect
            x={width / 2}
            y={0}
            width={5}
            height={150}
            r={20}
            color={theme.colors.secondary}
          />
          <Rect
            x={width / 2 + 5}
            y={0}
            width={25}
            height={150}
            color={theme.colors.black1}
            opacity={0.5}
          />
        </Group>
      </Canvas>
    </GestureDetector>
  );
};

export default Timeline;
