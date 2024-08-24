import {formatDistanceToNow} from 'date-fns';
import React, {useMemo} from 'react';
import {
  GestureResponderEvent,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTheme} from 'theme/ThemeContext';
import {formatDuration} from 'utils/time';

import {scale, verticalScale} from 'react-native-size-matters/extend';

type CardType = {
  imageURL: string;
  name: string;
  onPress?: ((event: GestureResponderEvent) => void) | null | undefined;
  onLongPress?: ((event: GestureResponderEvent) => void) | null | undefined;
  duration: number;
  createdAt: string;
  rotation: number;
};

const Card = ({
  imageURL,
  onPress,
  onLongPress,
  duration,
  createdAt,
  name,
  rotation,
}: CardType) => {
  const {theme} = useTheme();

  const timeAgo = useMemo(() => {
    return formatDistanceToNow(new Date(createdAt), {addSuffix: true});
  }, [createdAt]);

  const durationInMMSS = useMemo(() => {
    return formatDuration(duration);
  }, [duration]);

  return (
    <Pressable
      delayLongPress={300}
      style={[style.wrapper]}
      onPress={onPress}
      onLongPress={onLongPress}>
      <View
        style={[
          {
            width: scale(172),
            height: verticalScale(163),
            backgroundColor: theme.colors.grey5,
          },
          style.overflowHidden,
          style.imageWrapper,
        ]}>
        <Image
          width={scale(172)}
          height={verticalScale(163)}
          resizeMode="center"
          source={{
            uri: imageURL,
          }}
          style={[
            style.image,
            {
              transform: [{rotate: `${-rotation}deg`}],
            },
          ]}
        />
      </View>

      <View
        style={[
          {
            backgroundColor: theme.colors.black1,
          },
          style.durationWrapper,
        ]}>
        <Text
          style={[
            theme.typography.body.small,
            {
              color: theme.colors.white,
            },
          ]}>
          {durationInMMSS}
        </Text>
      </View>

      <Text
        style={[
          theme.typography.subheader.small,
          {
            color: theme.colors.white,
          },
        ]}>
        {name}
      </Text>
      <Text
        style={[
          theme.typography.subheader.small,
          style.title,
          {
            color: theme.colors.grey3,
          },
        ]}>
        {timeAgo}
      </Text>
    </Pressable>
  );
};

const style = StyleSheet.create({
  overflowHidden: {
    overflow: 'hidden',
  },

  imageWrapper: {
    borderRadius: scale(8),
  },

  image: {
    borderRadius: scale(8),
    marginBottom: verticalScale(8),
    position: 'relative',
  },

  wrapper: {
    display: 'flex',
  },
  title: {
    marginBottom: verticalScale(4),
  },

  durationWrapper: {
    opacity: 0.7,
    position: 'absolute',
    left: scale(10),
    bottom: verticalScale(80),
    padding: scale(4),
  },
});

export default Card;
