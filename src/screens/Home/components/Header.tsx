import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import AppTitle from 'screens/Home/components/AppTitle';
import ProChip from 'screens/Home/components/ProChip';
import {scale, verticalScale} from 'react-native-size-matters/extend';
import {useTheme} from 'theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type HeaderProps = {
  onClickTryPro: () => void;
  onClickInfo: () => void;
  isSubscribed: boolean;
};

const Header = ({onClickTryPro, isSubscribed, onClickInfo}: HeaderProps) => {
  const {theme} = useTheme();
  return (
    <View style={[styles.wrapper, {backgroundColor: theme.colors.black1}]}>
      <AppTitle />
      <View style={styles.right}>
        {!isSubscribed && <ProChip onClick={onClickTryPro} />}
        <Pressable onPress={onClickInfo}>
          <Icon
            name={'information'}
            size={scale(24)}
            color={theme.colors.grey3}
          />
        </Pressable>
      </View>
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

  right: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
});

export default Header;
