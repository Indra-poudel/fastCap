import BottomSheet from 'components/BottomSheet';
import Button from 'components/Button/Button';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from 'theme/ThemeContext';
import {verticalScale} from 'react-native-size-matters/extend';

type CardActionProps = {
  title: string;
  onClose: (hideTabBar?: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  primaryLabel: string;
  secondaryLabel?: string;
  primaryIcon?: string;
  secondaryIcon?: string;
};

const CardAction = ({
  title,
  onClose,
  onDelete,
  onEdit,
  primaryLabel,
  secondaryLabel,
  primaryIcon,
  secondaryIcon,
}: CardActionProps) => {
  const {theme} = useTheme();

  const handleEdit = () => {
    onEdit();
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <BottomSheet label={title} onClose={onClose}>
      <View style={style.wrapper}>
        <Button
          label={primaryLabel}
          icon={
            <Icon
              name={primaryIcon || 'rename-box'}
              size={24}
              color={theme.colors.white}
            />
          }
          buttonType={'primary'}
          onPress={handleEdit}
        />
        <Button
          icon={
            <Icon
              name={secondaryIcon || 'delete'}
              size={24}
              color={theme.colors.error}
            />
          }
          label={secondaryLabel || 'Delete'}
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
