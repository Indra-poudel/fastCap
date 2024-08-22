import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from 'theme/ThemeContext';
import {scale, verticalScale} from 'react-native-size-matters/extend';

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
    width: scale(2),
    height: verticalScale(150),
    borderRadius: scale(10),
  },
});

export default TimeIndicator;
