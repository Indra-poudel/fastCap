import {Skia} from '@shopify/react-native-skia';
import React from 'react';
import {View} from 'react-native';
import KaraokeText from 'components/Skia/KaraokeText';
import OutlineText from 'components/Skia/OutlineText';

const HomeScreen = () => {
  return (
    <View
      style={{
        position: 'relative',
      }}>
      {/* <KaraokeText
        label={'Hello asdfadfafd'}
        size={32}
        fontFamily={'Inter'}
        color={Skia.Color('black')}
        x={16}
        y={100}
        fillColor={Skia.Color('Red')}
        duration={300}
      />
      <OutlineText
        label={'Hello asdfadfafd'}
        size={42}
        fontFamily={'Inter'}
        color={Skia.Color('white')}
        x={16}
        y={200}
        strokeColor={Skia.Color('black')}
        duration={300}
        strokeWidth={10}
        textStyle={{
          letterSpacing: -0.5,
        }}
      /> */}
    </View>
  );
};

export default HomeScreen;
