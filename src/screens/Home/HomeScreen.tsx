import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {useAppDispatch, useAppSelector} from 'hooks/useStore';
import {selectAllVideos, selectSelectedVideo} from 'store/videos/selector';
import Header from 'screens/Home/components/Header';
import {useTheme} from 'theme/ThemeContext';
import Label from 'components/label';
import Card from 'screens/Home/components/Card';
import {Video} from 'store/videos/type';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {Skottie} from 'react-native-skottie';
import VideoRecordingAnimation from 'assets/lotties/VideoPlayer.json';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from 'navigation/AppNavigator';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {removeVideo, setSelectedVideo} from 'store/videos/slice';
import CardAction from 'screens/Home/components/CardAction';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {TABS, TabParamList} from 'navigation/HomeTabs';
import Dialog from 'components/Dialog';

type HomeScreenProps = BottomTabScreenProps<TabParamList, TABS.HOME> & {
  setFabVisible: (visible: boolean) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC<HomeScreenProps> = ({
  navigation: routeNavigation,
  setFabVisible,
}) => {
  const dispatch = useAppDispatch();
  const videos = useAppSelector(selectAllVideos);
  const selectedVideo = useAppSelector(selectSelectedVideo);

  const {theme} = useTheme();
  const [isCardActionEnable, setCardAction] = useState(false);

  const [isEditDialogEnable, setEditDialog] = useState(false);
  const [isDeleteDialogEnable, setDeleteDialog] = useState(false);

  const navigation = useNavigation<NavigationProp>();

  const handleHideBottomTab = () => {
    setFabVisible(false);
    routeNavigation.setOptions({
      tabBarStyle: {
        display: 'none',
      },
    });
  };

  const handleVisibleBottomTab = () => {
    setFabVisible(true);
    routeNavigation.setOptions({
      tabBarStyle: {
        display: 'flex',
      },
    });
  };

  const handleClickVideoCard = (video: Video) => {
    dispatch(setSelectedVideo(video.id));

    navigation.navigate('edit', {
      videoURL: video.url,
    });
  };

  const onLongPress = (video: Video) => {
    dispatch(setSelectedVideo(video.id));
    handleHideBottomTab();
    setCardAction(true);
  };

  const handleCardActionClose = (hideBottomBar?: boolean) => {
    // dispatch(setSelectedVideo(undefined));
    !hideBottomBar && handleVisibleBottomTab();
    setCardAction(false);
  };

  const renderItem: ListRenderItem<Video> = ({item}) => {
    return (
      <Card
        imageURL={item.thumbnailUrl || item.url}
        name={item.title}
        duration={item.duration}
        createdAt={item.createdAt}
        onPress={() => handleClickVideoCard(item)}
        onLongPress={() => onLongPress(item)}
      />
    );
  };

  const renderItemSeperator = () => {
    return <View style={style.itemSeperator} />;
  };

  const handleCardEditAction = () => {
    handleHideBottomTab();
    setEditDialog(true);
  };

  const handleCardDeleteAction = () => {
    setDeleteDialog(true);
  };

  const handleCloseEditDialog = () => {
    handleVisibleBottomTab();
    setEditDialog(false);
  };

  const handleCloseDeleteDialog = () => {
    handleVisibleBottomTab();
    setDeleteDialog(false);
  };

  const handleRemoveVideo = () => {
    setDeleteDialog(false);
    handleVisibleBottomTab();
    // TODO: remove associated video from cache too
    selectedVideo && dispatch(removeVideo(selectedVideo.id));
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

      {/* TODO: POST MVP */}
      {videos.length > 0 && (
        <View style={[style.selectWrapper]}>
          {/* <Label text={'Select'} /> */}
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
          <Skottie
            source={VideoRecordingAnimation}
            autoPlay={true}
            style={style.animation}
            resizeMode="contain"
          />
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
              the creativity! 🚀
            </Text>
          </View>
        </View>
      )}

      {isCardActionEnable && (
        <CardAction
          onClose={handleCardActionClose}
          onEdit={handleCardEditAction}
          onDelete={handleCardDeleteAction}
        />
      )}

      {isEditDialogEnable && (
        <Dialog
          title={'Rename'}
          onClose={handleCloseEditDialog}
          onAction={() => {}}
          primaryActionLabel={'Save'}
          primaryActionColor={theme.colors.primary}>
          <TextInput
            value={selectedVideo?.title}
            placeholder="Video name"
            placeholderTextColor={theme.colors.grey4}
            style={[
              {...theme.typography.body.large, color: theme.colors.white},
            ]}
            cursorColor={theme.colors.primary}
          />
        </Dialog>
      )}

      {isDeleteDialogEnable && (
        <Dialog
          title={'Warning!'}
          onClose={handleCloseDeleteDialog}
          onAction={handleRemoveVideo}
          primaryActionLabel={'Delete'}
          primaryActionColor={theme.colors.error}>
          <Text
            style={[
              theme.typography.body.medium,
              {
                color: theme.colors.white,
              },
            ]}>
            This action cannot be undo - are you sure you want to continue?
          </Text>
        </Dialog>
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

  animation: {
    height: 200,
    width: 200,
    marginBottom: -20,
  },
});

export default HomeScreen;
