import BottomSheet from 'components/BottomSheet';
import React from 'react';
import {Pressable, StyleSheet, useWindowDimensions} from 'react-native';
import Animated, {SharedValue} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from 'theme/ThemeContext';
import * as Progress from 'react-native-progress';

type ExportVideoProps = {
  onCancel: () => void;
  percentage: SharedValue<number>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ICON_SIZE = 32;

const ExportVideo = ({onCancel, percentage}: ExportVideoProps) => {
  const {theme} = useTheme();

  const {height, width} = useWindowDimensions();

  return (
    <BottomSheet label="Let's Make It Viral!🚀🔥">
      <Progress.Bar
        animated
        progress={10 / 100}
        color={theme.colors.primary}
        unfilledColor="rgba(29, 29, 29, 0.30))"
        height={6}
        borderRadius={12}
        borderWidth={0}
        width={width}
        useNativeDriver={true}
      />
      <AnimatedPressable
        style={[
          Style.container,
          {
            backgroundColor: theme.colors.error,
            borderColor: theme.colors.error,
            top: (((height / 100) * 40) / 100) * 70 - ICON_SIZE,
          },
        ]}
        onPress={onCancel}>
        <Animated.View
          style={{
            transform: [{rotate: `${45}deg`}],
          }}>
          <Icon name={'plus'} size={ICON_SIZE} color={theme.colors.white} />
        </Animated.View>
      </AnimatedPressable>
    </BottomSheet>
  );
};

const Style = StyleSheet.create({
  container: {
    borderRadius: 45,
    height: 45,
    width: 45,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExportVideo;
