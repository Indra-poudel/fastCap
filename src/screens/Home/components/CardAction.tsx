import BottomSheet from 'components/BottomSheet';
import React from 'react';
import {Text, View} from 'react-native';

type CardActionProps = {
  onClose: () => void;
};

const CardAction = ({onClose}: CardActionProps) => {
  return (
    <BottomSheet label="Manage Video" onClose={onClose}>
      <View>
        <Text>Hello</Text>
      </View>
    </BottomSheet>
  );
};

export default CardAction;
