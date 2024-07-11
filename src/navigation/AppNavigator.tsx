import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import EditScreen from '@screens/Edit/EditScreen';
import EditSettingsScreen from '@screens/Edit/EditSettingScreen';
import EditDetailsScreen from '@screens/Edit/EditSettingScreen';
import HomeTab from './HomeTabs';

function AppNavigator() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeTabs"
        component={HomeTab}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Edit"
        component={EditScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditDetails"
        component={EditDetailsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditSettings"
        component={EditSettingsScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
