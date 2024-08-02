import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from 'theme/ThemeContext';

type TimelineInterval = {
  x: number;
  lineWidth: number;
  label: string;
  lineColor: string;
  height: number;
};

const Interval = ({
  x,
  label,
  lineWidth,
  lineColor,
  height,
}: TimelineInterval) => {
  const {theme} = useTheme();
  return (
    <>
      <View
        style={[
          {
            width: lineWidth,
            height: height,

            backgroundColor: lineColor,
            left: x,
          },
          Style.wrapper,
        ]}
      />
      <Text
        style={[
          theme.typography.subheader.small,
          {
            color: theme.colors.grey4,
            left: x,
            transform: [
              {
                translateY: 40,
              },
              {
                translateX: -20,
              },
            ],
          },
          Style.text,
        ]}>
        {label}
      </Text>
    </>
  );
};

const Style = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },

  text: {
    position: 'absolute',
  },
});

export default Interval;
