import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from 'theme/ThemeContext';

type TimeIndicatorProps = {
  x: number;
  lineWidth: number;
};

const TimeIndicator = ({x, lineWidth}: TimeIndicatorProps) => {
  const {theme} = useTheme();

  return (
    <View
      style={[
        Style.wrapper,
        {
          backgroundColor: theme.colors.secondary,
          transform: [{translateX: x - lineWidth}],
        },
      ]}
    />
  );
};

const Style = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: 2,
    height: 150,
    borderRadius: 10,
  },
});

export default TimeIndicator;
