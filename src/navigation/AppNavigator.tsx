import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import EditScreen from '@screens/Edit/EditScreen';
import EditSettingsScreen from '@screens/Edit/EditSettingScreen';
import EditDetailsScreen from '@screens/Edit/EditSettingScreen';
import HomeTab from './HomeTabs';

export enum SCREENS {
  HOME = 'home',
  EDIT = 'edit',
  EDIT_DETAILS = 'editDetails',
  EDIT_SETTINGS = 'editSettings',
}

export type RootStackParamList = {
  home: undefined;
  edit: {videoURL: string; width: number; height: number; duration?: number };
  editDetails: undefined;
  editSettings: undefined;
};

function AppNavigator() {
  const Stack = createNativeStackNavigator<RootStackParamList>();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={SCREENS.HOME}
        component={HomeTab}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SCREENS.EDIT}
        component={EditScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SCREENS.EDIT_DETAILS}
        component={EditDetailsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SCREENS.EDIT_SETTINGS}
        component={EditSettingsScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
