import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {uploadAudio} from 'apis/assemblyAI';
// import {Canvas, Fill, ImageShader, useVideo} from '@shopify/react-native-skia';
import {RootStackParamList, SCREENS} from 'navigation/AppNavigator';
import React, {useState} from 'react';
import {Button, Text, View} from 'react-native';
import {convertVideoToMp3} from 'utils/video';
// import {Pressable, useWindowDimensions} from 'react-native';
// import {useSharedValue} from 'react-native-reanimated';

type EditScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.EDIT>;

const EditScreen = ({route}: EditScreenProps) => {
  const videoURL = route.params.videoURL;
  // const paused = useSharedValue(false);
  // const {width, height} = useWindowDimensions();
  // const {currentFrame} = useVideo(videoURL, {
  //   paused,
  //   volume: 1,
  // });

  const [audioUrl, setAudioUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [assemblyAudioUrl, setAssemblyAudioUrl] = useState('');

  const convertVideoToMP3 = () => {
    convertVideoToMp3(videoURL, 'hello').then(value => {
      setAudioUrl(value);
    });
  };

  const uploadAudioFile = () => {
    uploadAudio(audioUrl, progress => {
      setProgress(progress);
    }).then(uri => {
      setAssemblyAudioUrl(uri);
    });
  };

  return (
    <View>
      <Text>{videoURL}</Text>
      <Button
        title="Convert to Mp3"
        onPress={() => {
          console.log('Converting...');
          convertVideoToMP3();
        }}
      />
      <Text>{audioUrl}</Text>

      {audioUrl && (
        <>
          <Button
            title="Upload audio file"
            onPress={() => {
              uploadAudioFile();
            }}
          />

          <Text>{progress}</Text>

          <Text>{assemblyAudioUrl}</Text>
        </>
      )}
    </View>
  );

  // return (
  //   <Pressable style={{flex: 1}} onPress={() => (paused.value = !paused.value)}>
  //     <Canvas style={{flex: 1}}>
  //       <Fill>
  //         <ImageShader
  //           image={currentFrame}
  //           x={0}
  //           y={0}
  //           width={width}
  //           height={height}
  //           fit="cover"
  //         />
  //       </Fill>
  //     </Canvas>
  //   </Pressable>
  // );
};

export default EditScreen;
