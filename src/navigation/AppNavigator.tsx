import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import EditScreen from '@screens/Edit/EditScreen';
import HomeScreen from 'screens/Home/HomeScreen';
import {useAppDispatch} from 'hooks/useStore';
import {RC_APP_KEY} from 'constants/keys';
import {ActivityIndicator, Platform, StyleSheet} from 'react-native';
import {setSubscribed} from 'store/subscription/slice';
import Purchases, {LOG_LEVEL} from 'react-native-purchases';
import BootSplash from 'react-native-bootsplash';
import {fontSource} from 'constants/fonts';
import {useFonts} from '@shopify/react-native-skia';

export enum SCREENS {
  HOME = 'home',
  EDIT = 'edit',
  EDIT_DETAILS = 'editDetails',
  EDIT_SETTINGS = 'editSettings',
}

export type RootStackParamList = {
  home: undefined;
  edit: {
    videoURL: string;
    width: number;
    height: number;
  };
  editDetails: undefined;
  editSettings: undefined;
};

type EditScreenProps = NativeStackScreenProps<RootStackParamList, SCREENS.EDIT>;

function AppNavigator() {
  const Stack = createNativeStackNavigator<RootStackParamList>();

  const customFontMgr = useFonts(fontSource);

  const [hideSpinner, setHideSpinner] = useState(false);

  const dispatch = useAppDispatch();
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    BootSplash.hide({fade: true}).then(() => {
      console.log('BootSplash has been hidden successfully');
    });

    if (Platform.OS === 'ios') {
      Purchases.configure({apiKey: RC_APP_KEY});
      Purchases.getCustomerInfo()
        .then(customerInfo => {
          const _isSubscribed =
            customerInfo.entitlements.active.pro !== undefined;
          dispatch(setSubscribed(_isSubscribed));
        })
        .catch(error => {
          console.log('Error', error);
        })
        .finally(() => {
          setHideSpinner(true);
        });
    } else {
      setHideSpinner(true);
    }
  }, []);

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          contentStyle: {
            backgroundColor: '#020202',
          },
        }}>
        <Stack.Screen
          name={SCREENS.HOME}
          component={HomeScreen}
          options={{headerShown: false}}
        />
        {/* <Stack.Screen
        name={SCREENS.HOME}
        component={HomeTab}
        options={{headerShown: false}}
      /> */}
        <Stack.Screen name={SCREENS.EDIT} options={{headerShown: false}}>
          {(props: EditScreenProps) => (
            <EditScreen {...props} customFontMgr={customFontMgr} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
      {(!hideSpinner || !customFontMgr) && (
        <ActivityIndicator
          size={'large'}
          color={'#3377FF'}
          style={StyleSheet.absoluteFill}
        />
      )}
    </>
  );
}

export default AppNavigator;
