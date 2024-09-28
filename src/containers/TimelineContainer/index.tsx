import CardAction from 'components/CardAction';
import Dialog from 'components/Dialog';
import Timeline from 'components/Timeline/Timeline';
import React, {useState} from 'react';
import {Text} from 'react-native';
import {SharedValue} from 'react-native-reanimated';
import {useDispatch} from 'react-redux';
import Edit from 'screens/Home/components/Edit';
import {deleteWord, updateWord} from 'store/videos/slice';
import {useTheme} from 'theme/ThemeContext';
import {GeneratedSentence, SentenceWord} from 'utils/sentencesBuilder';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

type TimelineContainerProps = {
  currentTime: SharedValue<number>;
  frameRate: number;
  totalDuration: number;
  seek: SharedValue<number>;
  height: number;
  sentences: GeneratedSentence[];
};

const TimelineContainer = (props: TimelineContainerProps) => {
  const {theme} = useTheme();
  const [selectedWord, setSelectedWord] = useState<SentenceWord | undefined>(
    undefined,
  );

  const [wordActionState, setWordActionState] = useState({
    isActionMenuOpen: false,
    isEdit: false,
    isDelete: false,
  });

  const dispatch = useDispatch();

  const onSelect = (word: SentenceWord) => {
    ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.effectClick, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    setSelectedWord(word);

    setWordActionState({
      isActionMenuOpen: true,
      isEdit: false,
      isDelete: false,
    });
  };

  const handleClose = () => {
    setSelectedWord(undefined);
  };

  const onEdit = (text: string) => {
    if (selectedWord) {
      const updatedWord = {
        ...selectedWord,
        text,
      };

      dispatch(updateWord(updatedWord));
    }
  };

  const handleEdit = () => {
    setWordActionState({
      isActionMenuOpen: false,
      isEdit: true,
      isDelete: false,
    });
  };

  const handleDelete = () => {
    setWordActionState({
      isActionMenuOpen: false,
      isDelete: true,
      isEdit: false,
    });
  };

  const handleCloseDeleteDialog = () => {
    setWordActionState({
      isActionMenuOpen: false,
      isDelete: false,
      isEdit: false,
    });
  };

  const handleRemoveWord = () => {
    selectedWord?.uuid &&
      dispatch(
        deleteWord({
          wordUuid: selectedWord?.uuid,
        }),
      );
    setWordActionState({
      isActionMenuOpen: false,
      isDelete: false,
      isEdit: false,
    });
  };

  return (
    <>
      <Timeline {...props} onSelect={onSelect} />

      {wordActionState.isEdit && selectedWord && (
        <Edit
          handleClose={handleClose}
          handleRename={onEdit}
          value={selectedWord?.text}
        />
      )}

      {selectedWord && wordActionState.isActionMenuOpen && (
        <CardAction
          title={'Manage word'}
          onClose={handleClose}
          onEdit={handleEdit}
          onDelete={handleDelete}
          primaryLabel={'Edit'}
        />
      )}

      {wordActionState.isDelete && (
        <Dialog
          title={'Warning!'}
          onClose={handleCloseDeleteDialog}
          onAction={handleRemoveWord}
          primaryActionLabel={'Delete'}
          primaryActionColor={theme.colors.error}>
          <Text
            style={[
              theme.typography.body.medium,
              {
                color: theme.colors.white,
              },
            ]}>
            This action cannot be undo - are you sure you want to continue?
          </Text>
        </Dialog>
      )}
    </>
  );
};

export default React.memo(TimelineContainer);
