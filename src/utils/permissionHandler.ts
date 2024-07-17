// src/utils/permissions.ts
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
  PermissionStatus,
  Permission,
  requestMultiple,
} from 'react-native-permissions';
import {Alert} from 'react-native';
import {Platform} from 'react-native';

export const checkPermission = async (
  permission: Permission,
): Promise<boolean> => {
  const result = await check(permission);
  return handlePermissionResult(result, permission);
};

const handlePermissionResult = async (
  result: PermissionStatus,
  permission: Permission,
): Promise<boolean> => {
  switch (result) {
    case RESULTS.UNAVAILABLE:
      Alert.alert(
        'Permission Unavailable',
        'This feature is not available on this device.',
      );
      return false;
    case RESULTS.DENIED:
      return await requestPermission(permission);
    case RESULTS.LIMITED:
      Alert.alert(
        'Permission Limited',
        'The permission is limited: some actions are possible.',
      );
      return false;
    case RESULTS.GRANTED:
      return true;
    case RESULTS.BLOCKED:
      Alert.alert(
        'Permission Blocked',
        'The permission is denied and not requestable anymore. Open settings to change it.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => openSettings()},
        ],
      );
      return false;
    default:
      return false;
  }
};

const requestPermission = async (permission: Permission): Promise<boolean> => {
  const result = await request(permission);
  return handlePermissionResult(result, permission);
};

export const requestAllPermissions = async (): Promise<{
  allGranted: boolean;
  deniedPermissions: string[];
}> => {
  const androidPermissions = [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  ];
  const iosPermissions = [
    PERMISSIONS.IOS.CAMERA,
    PERMISSIONS.IOS.MICROPHONE,
    PERMISSIONS.IOS.PHOTO_LIBRARY,
    PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
  ];

  if (Platform.OS === 'android') {
    const results = await requestMultiple(androidPermissions);

    console.log(results);
    const deniedPermissions = androidPermissions.filter(
      permission => results[permission] !== 'granted',
    );

    return {allGranted: deniedPermissions.length === 0, deniedPermissions};
  } else {
    const results = await requestMultiple(iosPermissions);

    console.log(results);
    const deniedPermissions = iosPermissions.filter(
      permission => results[permission] !== 'granted',
    );

    return {allGranted: deniedPermissions.length === 0, deniedPermissions};
  }
};

export const checkAllPermissions = async (): Promise<boolean> => {
  const androidPermissions: Array<
    (typeof PERMISSIONS.ANDROID)[keyof typeof PERMISSIONS.ANDROID]
  > = [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  ];

  const iosPermissions: Array<
    (typeof PERMISSIONS.IOS)[keyof typeof PERMISSIONS.IOS]
  > = [
    PERMISSIONS.IOS.CAMERA,
    PERMISSIONS.IOS.MICROPHONE,
    PERMISSIONS.IOS.PHOTO_LIBRARY,
    PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
  ];

  const permissions =
    Platform.OS === 'android' ? androidPermissions : iosPermissions;

  const results = await Promise.all(
    permissions.map(permission => check(permission)),
  );

  return results.every(result => result === RESULTS.GRANTED);
};
