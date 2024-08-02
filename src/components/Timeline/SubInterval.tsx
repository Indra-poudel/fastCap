import React from 'react';
import {StyleSheet, View} from 'react-native';

type TimelineSubInterval = {
  x: number;
  y: number;
  lineWidth: number;
  lineColor: string;
  height: number;
};

const SubInterval = ({
  x,
  y,
  lineWidth,
  lineColor,
  height,
}: TimelineSubInterval) => {
  return (
    <View
      style={[
        Style.wrapper,
        {
          width: lineWidth,
          height: height,
          backgroundColor: lineColor,
          left: x || 0,
          top: y,
        },
      ]}
    />
  );
};

const Style = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
});

export default SubInterval;
