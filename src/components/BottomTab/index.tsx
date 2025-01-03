import React from 'react';
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {BottomTabDescriptor} from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import {useTheme} from '@theme/ThemeContext';
import {scale, verticalScale} from 'react-native-size-matters/extend';

const BottomTab = ({state, descriptors, navigation}: BottomTabBarProps) => {
  const {theme} = useTheme();

  const onPress = (route: {key: string; name: string}, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      // The `merge: true` option makes sure that the params inside the tab screen are preserved
      navigation.navigate({name: route.name, merge: true, params: {}});
    }
  };

  const onLongPress = (route: {key: string}) => {
    navigation.emit({
      type: 'tabLongPress',
      target: route.key,
    });
  };

  const tabBarStyle = descriptors[state.routes[state.index].key].options
    .tabBarStyle as StyleProp<ViewStyle>;

  return (
    <View
      style={[
        Style.container,
        {
          backgroundColor: theme.colors.black2,
        },
        tabBarStyle,
      ]}>
      {state.routes.map((route, index: number) => {
        const {options} = descriptors[route.key] as BottomTabDescriptor;

        const label = options.title !== undefined ? options.title : route.name;

        const isFocused = state.index === index;

        return (
          <Pressable
            style={({pressed}) => [
              Style.tabButton,
              {
                borderTopColor: isFocused
                  ? theme.colors.primary
                  : theme.colors.transparent,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onLongPress={() => onLongPress(route)}
            onPress={() => onPress(route, isFocused)}
            key={route.key}>
            <View style={[options.tabBarItemStyle]}>
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused
                    ? options.tabBarActiveTintColor || theme.colors.primary
                    : theme.colors.grey2,
                  size: scale(36),
                })}
            </View>

            <Text
              style={[
                theme.typography.subheader.small,
                {
                  color: isFocused ? theme.colors.primary : theme.colors.grey2,
                },
              ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const Style = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: verticalScale(2)},
  },
  tabButton: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 2,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    columnGap: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: verticalScale(24),
  },
});

export default BottomTab;
