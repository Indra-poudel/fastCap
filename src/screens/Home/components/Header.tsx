import React from 'react';
import {StyleSheet, View} from 'react-native';
import AppTitle from 'screens/Home/components/AppTitle';
import ProChip from 'screens/Home/components/ProChip';
import {scale, verticalScale} from 'react-native-size-matters/extend';
import {useTheme} from 'theme/ThemeContext';

type HeaderProps = {
  onClickTryPro: () => void;
};

const Header = ({onClickTryPro}: HeaderProps) => {
  const {theme} = useTheme();
  return (
    <View style={[styles.wrapper, {backgroundColor: theme.colors.black1}]}>
      <AppTitle />
      <ProChip onClick={onClickTryPro} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(18),
  },
});

export default Header;
