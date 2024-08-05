import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {SpeechModel} from 'assemblyai';
import BottomSheet from 'components/BottomSheet';
import {languages_best, languages_nano} from 'constants/languages';
import React, {useMemo, useState} from 'react';
import {Keyboard, Pressable, StyleSheet, Text, View} from 'react-native';
import CountryFlag from 'react-native-country-flag';
import {TextInput} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/AntDesign';
import {useTheme} from 'theme/ThemeContext';

type LanguageSelectorProps = {
  onClose: () => void;
  onSelect: (value: languageType) => void;
};

export type languageType = {
  label: string;
  code: string;
  model: SpeechModel;
  country_code: string;
  short_label: string;
};

const LanguageSelector = ({onClose, onSelect}: LanguageSelectorProps) => {
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

  const filterLanguagesMemo = useMemo(() => {
    return [...languages_best, ...languages_nano].filter(language => {
      return (
        language.label.toLowerCase().includes(inputText.toLowerCase()) ||
        language.country_code.toLowerCase().includes(inputText.toLowerCase())
      );
    });
  }, [inputText]);

  const renderItem: ListRenderItem<languageType> = ({item}) => {
    return (
      <Pressable
        onPress={() => {
          onSelect(item);
        }}
        style={({pressed}) => [
          Style.item,
          {
            opacity: pressed ? 0.5 : 1,
          },
        ]}>
        <Text
          style={[{...theme.typography.body.large, color: theme.colors.white}]}>
          {item.label}
        </Text>

        <CountryFlag isoCode={item.country_code} size={28} />
      </Pressable>
    );
  };

  return (
    <BottomSheet
      label="Language"
      isFullSize
      onClose={onClose}
      onTouch={handleInputBlurOut}>
      <>
        <View style={Style.wrapper}>
          <View
            style={[
              Style.textInputContainer,
              {
                borderColor: isFocused
                  ? theme.colors.primary
                  : theme.colors.grey3,
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
        </View>

        <View style={Style.flashListWrapper}>
          <FlashList<languageType>
            onTouchStart={handleInputBlurOut}
            keyExtractor={item => item.code}
            renderItem={renderItem}
            data={filterLanguagesMemo}
            estimatedItemSize={50}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </>
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

  item: {
    height: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  flashListWrapper: {
    flex: 1,
    width: '100%',
    paddingBottom: 115,
  },
});

export default LanguageSelector;
