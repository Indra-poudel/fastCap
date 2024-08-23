import FloatingActionButtonView from 'components/FloatingActionButton';
import React, {useState} from 'react';
import {Alert} from 'react-native';
import {openSettings} from 'react-native-permissions';
import {
  checkAllPermissions,
  requestAllPermissions,
} from 'utils/permissionHandler';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'navigation/AppNavigator';
import {useNavigation} from '@react-navigation/native';
import {VIDEO_NAME_PREFIX} from 'constants/index';
import {useAppDispatch} from 'hooks/useStore';
import {addVideo, setSelectedVideo} from 'store/videos/slice';
import {ExportQuality} from 'store/videos/type';
import uuid from 'react-native-uuid';

export enum FLOATING_ACTION {
  RECORD = 'record',
  GALLERY = 'gallery',
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FloatingActionButton = () => {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();

  const handlePermission = async (action: FLOATING_ACTION) => {
    const granted = await checkAllPermissions();

    if (!granted) {
      const {allGranted, deniedPermissions} = await requestAllPermissions();
      if (allGranted) {
        performAction(action);
      } else {
        Alert.alert(
          'Permissions Denied',
          `The following permissions were denied: ${deniedPermissions.join(
            ', ',
          )}`,
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
      }
    } else {
      performAction(action);
    }
  };

  const performAction = (selectedAction: FLOATING_ACTION) => {
    if (selectedAction === FLOATING_ACTION.GALLERY) {
      handleSelectVideoFromGallery();
    } else {
      handleRecordVideo();
    }
  };

  const handleAddVideoObjectToStore = (response: ImagePickerResponse) => {
    if (
      response.assets &&
      response?.assets[0].uri &&
      response.assets[0].width &&
      response.assets[0].height
    ) {
      const date = new Date(Date.now());
      const isoString = date.toISOString();
      const title = VIDEO_NAME_PREFIX + '-' + Date.now();

      const id = uuid.v4().toString();

      dispatch(
        addVideo({
          id: id,
          title: title,
          url: response?.assets[0].uri,
          language: undefined,
          sentences: [],
          createdAt: isoString,
          updatedAt: isoString,
          duration: response.assets[0].duration || 0,
          templateId: '1',
          width: response.assets[0].width,
          height: response.assets[0].height,
          audioUrl: '',
          exportQuality: ExportQuality.STANDARD,
        }),
      );

      dispatch(setSelectedVideo(id));
    }
  };

  const handleSelectVideoFromGallery = () => {
    launchImageLibrary({
      mediaType: 'video',
      videoQuality: 'high',
      selectionLimit: 1,
      assetRepresentationMode: 'compatible',
    })
      .then(response => {
        handleAddVideoObjectToStore(response);
        console.log('Response', response);

        setOpen(prev => !prev);

        response.assets &&
          response?.assets[0].uri &&
          response.assets[0].width &&
          response.assets[0].height &&
          navigation.navigate('edit', {
            videoURL: response.assets[0].uri,
            height: response.assets[0].height,
            width: response.assets[0].width,
          });
      })
      .catch(error => {
        console.log('error', error);
      });
  };

  const handleRecordVideo = () => {
    launchCamera({
      mediaType: 'video',
      videoQuality: 'high',
      saveToPhotos: true,
    })
      .then(response => {
        handleAddVideoObjectToStore(response);
        console.log('Response', response);

        setOpen(prev => !prev);

        response.assets &&
          response?.assets[0].uri &&
          response.assets[0].width &&
          response.assets[0].height &&
          navigation.navigate('edit', {
            videoURL: response.assets[0].uri,
            height: response.assets[0].height,
            width: response.assets[0].width,
          });
      })
      .catch(error => {
        console.log('error', error);
      });
  };

  return (
    <FloatingActionButtonView
      open={open}
      setOpen={setOpen}
      onAction={handlePermission}
    />
  );
};

export default FloatingActionButton;
