import BottomSheet from 'components/BottomSheet';
import React, {useState} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/AntDesign';
import {useTheme} from 'theme/ThemeContext';

type LanguageSelectorProps = {
  onClose: () => void;
};

const LanguageSelector = ({onClose}: LanguageSelectorProps) => {
  const [inputText, setInputText] = useState('');
  const [isFocused, setFocused] = useState(false);

  const {theme} = useTheme();

  const handleInputBlurOut = () => {
    setFocused(false);
    Keyboard.dismiss();
  };

  const handleSetFocus = () => {
    setFocused(true);
  };

  return (
    <BottomSheet
      label="Language"
      isFullSize
      onClose={onClose}
      contentWrapperStyle={Style.wrapper}
      onTouch={handleInputBlurOut}>
      <View
        style={[
          Style.textInputContainer,
          {
            borderColor: isFocused ? theme.colors.primary : theme.colors.grey3,
          },
        ]}>
        <Icon name={'search1'} size={28} color={theme.colors.grey4} />
        <TextInput
          placeholder="Search..."
          placeholderTextColor={theme.colors.grey4}
          onChangeText={setInputText}
          value={inputText}
          style={[
            Style.input,
            {...theme.typography.body.large, color: theme.colors.white},
          ]}
          onFocus={handleSetFocus}
          cursorColor={theme.colors.primary}
        />
      </View>
    </BottomSheet>
  );
};

const Style = StyleSheet.create({
  wrapper: {
    padding: 24,
  },
  textInputContainer: {
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  input: {
    width: '100%',
  },
});

export default LanguageSelector;
