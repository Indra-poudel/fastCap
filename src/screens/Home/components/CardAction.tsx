import BottomSheet from 'components/BottomSheet';
import Button from 'components/Button/Button';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from 'theme/ThemeContext';
import { verticalScale} from 'react-native-size-matters/extend';

type CardActionProps = {
  onClose: (hideTabBar?: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
};

const CardAction = ({onClose, onDelete, onEdit}: CardActionProps) => {
  const {theme} = useTheme();

  const handleEdit = () => {
    onEdit();
    onClose(true);
  };

  const handleDelete = () => {
    onDelete();
    onClose(true);
  };

  return (
    <BottomSheet label="Manage Video" onClose={onClose}>
      <View style={style.wrapper}>
        <Button
          label={'Rename'}
          icon={
            <Icon name={'rename-box'} size={24} color={theme.colors.white} />
          }
          buttonType={'primary'}
          onPress={handleEdit}
        />
        <Button
          icon={<Icon name={'delete'} size={24} color={theme.colors.error} />}
          label={'Delete'}
          buttonType={'secondary'}
          color={theme.colors.error}
          onPress={handleDelete}
        />
      </View>
    </BottomSheet>
  );
};

const style = StyleSheet.create({
  wrapper: {
    display: 'flex',
    gap: verticalScale(24),
    paddingVertical: verticalScale(24),
  },
});

export default CardAction;
