import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '@screens/Home/HomeScreen';
import ProfileScreen from '@screens/Profile/ProfileScreen';
import Icon from 'react-native-vector-icons/Ionicons';

export enum TABS {
  HOME = 'home',
  PROFILE = 'profile',
}

const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={() => ({
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {backgroundColor: '#1C1C1E', borderTopColor: '#2C2C2E'},
        headerShown: false,
      })}>
      <Tab.Screen
        name={TABS.HOME}
        component={HomeScreen}
        options={{
          tabBarIcon: homeScreenTabBarIcon,
        }}
      />
      <Tab.Screen
        name={TABS.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarIcon: profileScreenTabBarIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export default HomeTabs;

const homeScreenTabBarIcon = ({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) => {
  return (
    <Icon
      name={focused ? 'view-dashboard' : 'view-dashboard-outline'}
      size={size}
      color={color}
    />
  );
};

const profileScreenTabBarIcon = ({
  focused,
  color,
  size,
}: {
  focused: boolean;
  color: string;
  size: number;
}) => {
  return (
    <Icon
      name={focused ? 'view-dashboard' : 'view-dashboard-outline'}
      size={size}
      color={color}
    />
  );
};
