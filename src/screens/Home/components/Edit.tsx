import React, {useState} from 'react';
import {StyleSheet, TextInput, View, Keyboard, Text} from 'react-native';
import Dialog from 'components/Dialog';
import {useTheme} from 'theme/ThemeContext';

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
    setEditValue(text);
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

  return (
    <Dialog
      title="Rename"
      onClose={handleClose}
      onAction={handleSave}
      primaryActionLabel="Save"
      primaryActionColor={theme.colors.primary}
      disabled={!editValue.trim()}>
      <View
        style={[
          styles.textInputContainer,
          {
            borderColor: isFocused ? theme.colors.primary : theme.colors.grey3,
          },
        ]}>
        <TextInput
          autoFocus
          onFocus={handleSetFocus}
          onBlur={handleInputBlurOut}
          onChangeText={handleChange}
          value={editValue}
          placeholder="Video name"
          placeholderTextColor={theme.colors.grey4}
          style={[
            styles.input,
            {...theme.typography.body.large, color: theme.colors.white},
          ]}
          cursorColor={theme.colors.primary}
        />
      </View>
      {editValue === '' && (
        <View style={styles.errorContainer}>
          <Text
            style={
              (styles.errorText,
              {...theme.typography.subheader.small, color: theme.colors.error})
            }>
            {'Oops! You forgot the name 😅'}
          </Text>
        </View>
      )}
    </Dialog>
  );
};

export default Edit;

const styles = StyleSheet.create({
  textInputContainer: {
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    width: '100%',
  },
  errorContainer: {
    paddingTop: 12,
  },
  errorText: {
    display: 'flex',
    alignSelf: 'flex-start',
  },
});