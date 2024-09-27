import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useAppDispatch, useAppSelector} from 'hooks/useStore';
import {selectAllVideos, selectSelectedVideo} from 'store/videos/selector';
import Header from 'screens/Home/components/Header';
import {useTheme} from 'theme/ThemeContext';
import Card from 'screens/Home/components/Card';
import {Video} from 'store/videos/type';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {Skottie} from 'react-native-skottie';
import VideoRecordingAnimation from 'assets/lotties/VideoPlayer.json';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList, SCREENS} from 'navigation/AppNavigator';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {removeVideo, setSelectedVideo, updateVideo} from 'store/videos/slice';
import CardAction from 'screens/Home/components/CardAction';
import Dialog from 'components/Dialog';
import Edit from 'screens/Home/components/Edit';
import {SafeAreaView} from 'react-native-safe-area-context';
import {scale, verticalScale} from 'react-native-size-matters/extend';
import {deleteVideoDirectory} from 'utils/directory';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';
import FloatingActionButton from 'containers/FloatingActionButtonContainer';
import RevenueCatUI, {PAYWALL_RESULT} from 'react-native-purchases-ui';
import {useSelector} from 'react-redux';
import {selectSubscriptionState} from 'store/subscription/selector';
import {setSubscribed} from 'store/subscription/slice';

// type HomeScreenProps = BottomTabScreenProps<TabParamList, TABS.HOME> & {
//   setFabVisible: (visible: boolean) => void;
// };

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.HOME>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const dispatch = useAppDispatch();
  const videos = useAppSelector(selectAllVideos);
  const selectedVideo = useAppSelector(selectSelectedVideo);

  const {theme} = useTheme();
  const [isCardActionEnable, setCardAction] = useState(false);

  const [isEditDialogEnable, setEditDialog] = useState(false);
  const [isDeleteDialogEnable, setDeleteDialog] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const navigation = useNavigation<NavigationProp>();

  const {isSubscribed} = useSelector(selectSubscriptionState);

  useEffect(() => {
    if (isDeleting && selectedVideo?.id) {
      deleteVideoDirectory(selectedVideo?.id)
        .then(() => {
          // handleVisibleBottomTab();
          selectedVideo && dispatch(removeVideo(selectedVideo.id));
          ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false,
          });
        })
        .catch(() => {
          console.error('error while deleting');
        })
        .finally(() => {
          setDeleting(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleting, selectedVideo]);

  // const handleHideBottomTab = () => {
  //   setFabVisible(false);
  //   routeNavigation.setOptions({
  //     tabBarStyle: {
  //       display: 'none',
  //     },
  //   });
  // };

  // const handleVisibleBottomTab = () => {
  //   setFabVisible(true);
  //   routeNavigation.setOptions({
  //     tabBarStyle: {
  //       display: 'flex',
  //     },
  //   });
  // };

  const handleClickVideoCard = (video: Video) => {
    dispatch(setSelectedVideo(video.id));

    navigation.navigate('edit', {
      videoURL: video.url,
      height: video.height,
      width: video.width,
    });
  };

  const onLongPress = (video: Video) => {
    dispatch(setSelectedVideo(video.id));
    // handleHideBottomTab();
    setCardAction(true);

    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.longPress, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };

  const handleCardActionClose = (_hideBottomBar?: boolean) => {
    // dispatch(setSelectedVideo(undefined));
    // !_hideBottomBar && handleVisibleBottomTab();
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
        rotation={item.rotation}
      />
    );
  };

  const renderItemSeperator = () => {
    return <View style={style.itemSeperator} />;
  };

  const handleCardEditAction = () => {
    // handleHideBottomTab();
    setEditDialog(true);
  };

  const handleCardDeleteAction = () => {
    setDeleteDialog(true);
  };

  const handleCloseEditDialog = () => {
    // handleVisibleBottomTab();
    setEditDialog(false);
  };

  const handleCloseDeleteDialog = () => {
    // handleVisibleBottomTab();
    setDeleteDialog(false);
  };

  const handleRemoveVideo = () => {
    setDeleteDialog(false);
    setDeleting(true);
  };

  const handleRename = (newTitle: string) => {
    // handleVisibleBottomTab();

    if (selectedVideo) {
      const updatedVideo: Video = {
        ...selectedVideo,
        title: newTitle,
      };

      // Dispatch the updateVideo action
      dispatch(updateVideo(updatedVideo));
    }
  };

  const getIsSubscription = (paywall: PAYWALL_RESULT) => {
    switch (paywall) {
      case PAYWALL_RESULT.NOT_PRESENTED:
        return true;
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
        return false;
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      default:
        return false;
    }
  };

  const handleOnClickTryPro = () => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    RevenueCatUI.presentPaywall().then(paywall => {
      const _isSubscribed = getIsSubscription(paywall);
      dispatch(setSubscribed(_isSubscribed));
    });
  };

  return (
    <SafeAreaView
      style={[
        style.wrapper,
        {
          backgroundColor: theme.colors.black1,
        },
      ]}>
      <Header onClickTryPro={handleOnClickTryPro} isSubscribed={isSubscribed} />

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

      <FloatingActionButton />

      {isCardActionEnable && (
        <CardAction
          onClose={handleCardActionClose}
          onEdit={handleCardEditAction}
          onDelete={handleCardDeleteAction}
        />
      )}

      {isEditDialogEnable && selectedVideo && (
        <Edit
          handleClose={handleCloseEditDialog}
          value={selectedVideo.title}
          handleRename={handleRename}
        />
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

      {isDeleting && (
        <View style={style.flexCenter}>
          <ActivityIndicator size={'large'} color={theme.colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  flexCenter: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  wrapper: {
    flex: 1,
  },

  selectWrapper: {
    paddingVertical: verticalScale(12),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(18),
  },

  listWrapper: {
    flex: 1,
    transform: [
      {
        translateX: scale(18),
      },
    ],
  },

  itemSeperator: {
    height: verticalScale(24),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
  },

  emptyContainerTextWrapper: {
    gap: verticalScale(8),
    alignItems: 'center',
  },

  info: {
    width: scale(300),
    textAlign: 'center',
  },

  animation: {
    height: verticalScale(200),
    width: scale(200),
    marginBottom: verticalScale(-20),
  },
});

export default HomeScreen;
