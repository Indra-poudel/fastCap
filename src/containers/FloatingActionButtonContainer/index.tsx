import FloatingActionButtonView from 'components/FloatingActionButton';
import React, {useState} from 'react';
import {Alert} from 'react-native';
import {openSettings} from 'react-native-permissions';
import {
  checkAllPermissions,
  requestAllPermissions,
} from 'utils/permissionHandler';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'navigation/AppNavigator';
import {useNavigation} from '@react-navigation/native';

export enum FLOATING_ACTION {
  RECORD = 'record',
  GALLERY = 'gallery',
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FloatingActionButton = () => {
  const [open, setOpen] = useState(false);
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
    console.log('Selected Action', selectedAction);
    if (selectedAction === FLOATING_ACTION.GALLERY) {
      handleSelectVideoFromGallery();
    } else {
      handleRecordVideo();
    }
  };

  const handleSelectVideoFromGallery = () => {
    launchImageLibrary({
      mediaType: 'video',
      videoQuality: 'high',
      selectionLimit: 1,
    })
      .then(response => {
        console.log('Response', response);

        setOpen(prev => !prev);

        response.assets &&
          response?.assets[0].uri &&
          navigation.navigate('edit', {
            videoURL: response.assets[0].uri,
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
        console.log('Response', response);

        setOpen(prev => !prev);

        response.assets &&
          response?.assets[0].uri &&
          navigation.navigate('edit', {
            videoURL: response.assets[0].uri,
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
