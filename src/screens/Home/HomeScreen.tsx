import React from 'react';
import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useAppSelector} from 'hooks/useStore';
import {selectAllVideos} from 'store/videos/selector';
import withPageWrapper from 'hoc/withPageWrapper';
import Header from 'screens/Home/components/Header';
import {useTheme} from 'theme/ThemeContext';
import Label from 'components/label';
import Card from 'screens/Home/components/Card';
import {Video} from 'store/videos/type';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {Skottie} from 'react-native-skottie';
import VideoRecordingAnimation from 'assets/lotties/VideoPlayer.json';

const HomeScreen = () => {
  const videos = useAppSelector(selectAllVideos);
  const {theme} = useTheme();

  const {width, height} = useWindowDimensions();

  const renderItem: ListRenderItem<Video> = ({item}) => {
    return (
      <Card
        imageURL={item.url}
        name={item.title}
        duration={item.duration}
        createdAt={item.createdAt}
      />
    );
  };

  const renderItemSeperator = () => {
    return <View style={style.itemSeperator} />;
  };

  return (
    <View
      style={[
        style.wrapper,
        {
          backgroundColor: theme.colors.black1,
        },
      ]}>
      <Header />

      {videos.length > 0 && (
        <View style={[style.selectWrapper]}>
          <Label text={'Select'} />
        </View>
      )}

      {videos.length > 0 ? (
        <View style={[style.listWrapper]}>
          <FlashList<Video>
            keyExtractor={item => item.id}
            renderItem={renderItem}
            data={videos}
            horizontal={false}
            numColumns={2}
            estimatedItemSize={170}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={renderItemSeperator}
          />
        </View>
      ) : (
        <View style={style.emptyContainer}>
          <Skottie source={VideoRecordingAnimation} autoPlay={true} />
          <View style={[style.emptyContainerTextWrapper]}>
            <Text
              style={[
                theme.typography.header.small,
                {
                  color: theme.colors.grey5,
                },
              ]}>
              👾 Auto-Magic Captions!
            </Text>
            <Text
              style={[
                style.info,
                theme.typography.body.medium,
                {
                  color: theme.colors.grey3,
                },
              ]}>
              Tap the{' '}
              <Text
                style={[
                  theme.typography.body.medium,
                  {
                    color: theme.colors.primary,
                  },
                ]}>
                {' '}
                +{' '}
              </Text>{' '}
              to add your first video. We'll handle the subtitles, you handle
              the creativity!🚀
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  selectWrapper: {
    paddingVertical: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
  },

  listWrapper: {
    flex: 1,
    transform: [
      {
        translateX: 18,
      },
    ],
  },

  itemSeperator: {
    height: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyContainerTextWrapper: {
    gap: 8,
    alignItems: 'center',
  },

  info: {
    width: 300,
    textAlign: 'center',
  },
});

export default withPageWrapper(HomeScreen);
