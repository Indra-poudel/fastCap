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
import {createVideoDirectory, moveFileToVideoDirectory} from 'utils/directory';

export enum FLOATING_ACTION {
  RECORD = 'record',
  GALLERY = 'gallery',
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FloatingActionButton = () => {
  const [open, setOpen] = useState(false);
  const [isSelecting, setSelecting] = useState(false);

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

  const handleAddVideoObjectToStore = async (response: ImagePickerResponse) => {
    if (
      response.assets &&
      response?.assets[0].uri &&
      response.assets[0].width &&
      response.assets[0].height
    ) {
      const date = new Date(Date.now());
      const isoString = date.toISOString();
      const title = VIDEO_NAME_PREFIX + '_' + Date.now();

      const originalUri = decodeURIComponent(response?.assets[0].uri);

      const fileExtension =
        originalUri?.substring(originalUri.lastIndexOf('.')) || '';

      const id = uuid.v4().toString();
      const videoDirectory = await createVideoDirectory(id);

      const finalVideoPath = await moveFileToVideoDirectory(
        originalUri,
        title,
        videoDirectory,
        fileExtension,
      );

      console.log('Final url', finalVideoPath);

      dispatch(
        addVideo({
          id: id,
          title: title,
          url: finalVideoPath,
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
          rotation: 0,
        }),
      );

      dispatch(setSelectedVideo(id));

      setOpen(prev => !prev);
      setSelecting(false);

      navigation.navigate('edit', {
        videoURL: finalVideoPath,
        height: response.assets[0].height,
        width: response.assets[0].width,
      });
    }
  };

  const handleSelectVideoFromGallery = async () => {
    try {
      setSelecting(true);
      const response = await launchImageLibrary({
        mediaType: 'video',
        videoQuality: 'high',
        selectionLimit: 1,
        assetRepresentationMode: 'current',
      });

      if (!response.didCancel) {
        console.log(response);

        await handleAddVideoObjectToStore(response);
      } else {
        setSelecting(false);
        setOpen(false);
      }
    } catch {
      setSelecting(false);
      console.error('error while selecting video from gallery');
    }
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
      isSelecting={isSelecting}
      setOpen={setOpen}
      onAction={handlePermission}
    />
  );
};

export default FloatingActionButton;
