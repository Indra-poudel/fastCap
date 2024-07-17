import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Canvas,
  Circle,
  ColorMatrix,
  Fill,
  Group,
  ImageShader,
  useVideo,
} from '@shopify/react-native-skia';
import {RootStackParamList, SCREENS} from 'navigation/AppNavigator';
import React from 'react';
import {Pressable, useWindowDimensions} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';

type EditScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.EDIT>;

const EditScreen = ({route}: EditScreenProps) => {
  const width = 256;
  const height = 256;
  const r = width * 0.33;

  const seek = useSharedValue<null | number>(null);
  // Set this value to true to pause the video
  const paused = useSharedValue(false);

  try {
    const {currentFrame, currentTime} = useVideo(
      'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
      {
        seek,
        paused,
        looping: true,
      },
    );
    console.log('Hello', currentFrame);
  } catch (error) {
    console.log(error);
  }

  return (
    <Canvas style={{width, height}}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={width - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
};

export default EditScreen;
