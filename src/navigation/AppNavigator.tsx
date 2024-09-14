import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import EditScreen from '@screens/Edit/EditScreen';
import HomeScreen from 'screens/Home/HomeScreen';
import Purchases, {LOG_LEVEL} from 'react-native-purchases';
import {Platform} from 'react-native';
import {RC_APP_KEY} from 'constants/keys';

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

function AppNavigator() {
  const Stack = createNativeStackNavigator<RootStackParamList>();

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
      Purchases.configure({apiKey: RC_APP_KEY});

      Purchases.getOfferings()
        .then(() => {})
        .catch(reason => {
          console.log('err', reason);
        });
    }
  }, []);

  return (
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
      <Stack.Screen
        name={SCREENS.EDIT}
        component={EditScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
