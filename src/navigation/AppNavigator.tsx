import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import EditScreen from '@screens/Edit/EditScreen';
import HomeTab from './HomeTabs';

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

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {
          backgroundColor: '#020202',
        },
      }}>
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
    </Stack.Navigator>
  );
}

export default AppNavigator;
