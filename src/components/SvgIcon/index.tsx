import React from 'react';
import {Pressable, StyleProp, ViewStyle} from 'react-native';
import {scale} from 'react-native-size-matters/extend';

type SvgIconProps = {
  size?: number;
  children: any;
  color: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  extraProps?: Record<string, string>;
};

function SvgIcon({
  style,
  size = scale(24),
  children,
  color,
  onPress,
  extraProps,
}: SvgIconProps) {
  return (
    <Pressable style={style} onPress={onPress}>
      {React.createElement(children, {
        ...extraProps,
        width: size,
        height: size,
        fill: color,
      })}
    </Pressable>
  );
}

export default React.memo(SvgIcon);
