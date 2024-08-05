import SvgIcon from 'components/SvgIcon';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Lighting} from 'assets/svg';
import {APP_NAME} from 'constants/index';
import {useTheme} from 'theme/ThemeContext';

const AppTitle = () => {
  const {theme} = useTheme();
  return (
    <View style={[styles.wrapper]}>
      <SvgIcon size={24} color={'#FF0'}>
        {Lighting}
      </SvgIcon>

      <Text
        style={[
          theme.typography.subheader.large,
          {
            color: theme.colors.white,
          },
        ]}>
        {APP_NAME}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppTitle;
