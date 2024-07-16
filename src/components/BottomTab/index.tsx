import React from 'react';
import {Text, View, Pressable, StyleSheet} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {BottomTabDescriptor} from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import {useTheme} from '@theme/ThemeContext';

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

  return (
    <View
      style={[
        Style.container,
        {
          backgroundColor: theme.colors.black2,
        },
      ]}>
      {state.routes.map((route, index: number) => {
        const {options} = descriptors[route.key] as BottomTabDescriptor;

        const label = options.title !== undefined ? options.title : route.name;

        const isFocused = state.index === index;

        return (
          <Pressable
            style={[
              Style.tabButton,
              {
                borderTopColor: isFocused
                  ? theme.colors.primary
                  : theme.colors.transparent,
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
                  size: 36,
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
    shadowOffset: {width: 0, height: 2},
  },
  tabButton: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 2,
    paddingHorizontal: 16,
    paddingTop: 12,
    columnGap: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
});

export default BottomTab;
