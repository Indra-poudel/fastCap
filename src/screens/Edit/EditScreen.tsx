import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Canvas, Fill, ImageShader, useVideo} from '@shopify/react-native-skia';
import {RootStackParamList, SCREENS} from 'navigation/AppNavigator';
import React from 'react';
import {Pressable, useWindowDimensions} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';

type EditScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.EDIT>;

const EditScreen = ({route}: EditScreenProps) => {
  const videoURL = route.params.videoURL;
  const paused = useSharedValue(false);
  const {width, height} = useWindowDimensions();
  const {currentFrame} = useVideo(videoURL, {
    paused,
    volume: 1,
  });
  return (
    <Pressable style={{flex: 1}} onPress={() => (paused.value = !paused.value)}>
      <Canvas style={{flex: 1}}>
        <Fill>
          <ImageShader
            image={currentFrame}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
        </Fill>
      </Canvas>
    </Pressable>
  );
};

export default EditScreen;
