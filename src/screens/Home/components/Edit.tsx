import React, {useState} from 'react';
import {StyleSheet, TextInput, View, Keyboard, Text} from 'react-native';
import Dialog from 'components/Dialog';
import {useTheme} from 'theme/ThemeContext';
import {scale, verticalScale} from 'react-native-size-matters/extend';

type EditProps = {
  handleClose: () => void;
  handleRename: (newTitle: string) => void;
  value: string;
};

const Edit: React.FC<EditProps> = ({handleClose, value, handleRename}) => {
  const {theme} = useTheme();

  const [editValue, setEditValue] = useState<string>(value);
  const [isFocused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    if (text.length <= 32) {
      setEditValue(text);
    }
  };

  const handleInputBlurOut = () => {
    setFocused(false);
    Keyboard.dismiss();
  };

  const handleSetFocus = () => {
    setFocused(true);
  };

  const handleSave = () => {
    handleRename(editValue);
    handleClose();
  };

  const errorMessage =
    editValue.length >= 32
      ? 'Whoa! Keep it under 32 characters 😅'
      : editValue === ''
      ? 'Oops! You forgot the name 😅'
      : '';

  return (
    <Dialog
      title="Rename"
      onClose={handleClose}
      onAction={handleSave}
      primaryActionLabel="Save"
      primaryActionColor={theme.colors.primary}
      disabled={errorMessage !== ''}>
      <View
        style={[
          styles.textInputContainer,
          {
            borderColor: isFocused ? theme.colors.primary : theme.colors.grey3,
          },
        ]}>
        <TextInput
          editable={editValue.length <= 32}
          autoFocus
          onFocus={handleSetFocus}
          onBlur={handleInputBlurOut}
          onChangeText={handleChange}
          value={editValue}
          placeholder="Video name"
          placeholderTextColor={theme.colors.grey4}
          autoCapitalize="none"
          style={[
            styles.input,
            {...theme.typography.body.large, color: theme.colors.white},
          ]}
          cursorColor={theme.colors.primary}
        />
      </View>
      {errorMessage !== '' && (
        <View style={styles.errorContainer}>
          <Text
            style={
              (styles.errorText,
              {...theme.typography.subheader.small, color: theme.colors.error})
            }>
            {errorMessage}
          </Text>
        </View>
      )}
    </Dialog>
  );
};

export default Edit;

const styles = StyleSheet.create({
  textInputContainer: {
    paddingHorizontal: scale(12),
    borderWidth: scale(1),
    borderRadius: scale(12),
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    paddingVertical: verticalScale(12),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    paddingTop: verticalScale(12),
  },
  errorText: {
    display: 'flex',
    alignSelf: 'flex-start',
  },
});
