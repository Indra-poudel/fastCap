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

type CardType = {
  imageURL: string;
  name: string;
  onPress?: ((event: GestureResponderEvent) => void) | null | undefined;
  onLongPress?: ((event: GestureResponderEvent) => void) | null | undefined;
  duration: number;
  createdAt: string;
};

const Card = ({
  imageURL,
  onPress,
  onLongPress,
  duration,
  createdAt,
  name,
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
      style={[style.wrapper]}
      onPress={onPress}
      onLongPress={onLongPress}>
      <Image
        resizeMode="cover"
        width={172}
        height={163}
        source={{
          uri: imageURL,
        }}
        style={[style.image]}
      />
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
  image: {
    borderRadius: 8,
    marginBottom: 8,
    position: 'relative',
  },

  wrapper: {
    display: 'flex',
  },
  title: {
    marginBottom: 4,
  },

  durationWrapper: {
    opacity: 0.7,
    position: 'absolute',
    left: 10,
    bottom: 60,
    padding: 4,
  },
});

export default Card;