import React, {useState} from 'react';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import HomeScreen from '@screens/Home/HomeScreen';
import ProfileScreen from '@screens/Profile/ProfileScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTab from 'components/BottomTab';
import FloatingActionButton from 'containers/FloatingActionButtonContainer';

export enum TABS {
  HOME = 'home_tab',
  PROFILE = 'profile_tab',
}

export type TabParamList = {
  [TABS.HOME]: undefined;
  [TABS.PROFILE]: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function HomeTabs() {
  const [isFabVisible, setFabVisible] = useState(true);

  const handleFabVisibility = (visible: boolean) => {
    setFabVisible(visible);
  };

  return (
    <>
      <Tab.Navigator
        tabBar={BottomTabRenderer}
        screenOptions={() => ({
          headerShown: false,
        })}>
        <Tab.Screen
          name={TABS.HOME}
          options={{
            tabBarIcon: homeScreenTabBarIcon,
            title: 'Home',
          }}>
          {props => (
            <HomeScreen {...props} setFabVisible={handleFabVisibility} />
          )}
        </Tab.Screen>
        <Tab.Screen
          name={TABS.PROFILE}
          component={ProfileScreen}
          options={{
            tabBarIcon: profileScreenTabBarIcon,
            title: 'Profile',
          }}
        />
      </Tab.Navigator>
      {isFabVisible && <FloatingActionButton />}
    </>
  );
}

export default HomeTabs;

const BottomTabRenderer = (props: BottomTabBarProps) => {
  return <BottomTab {...props} />;
};

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
      name={focused ? 'folder' : 'folder-outline'}
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
      name={focused ? 'account' : 'account-outline'}
      size={size}
      color={color}
    />
  );
};
