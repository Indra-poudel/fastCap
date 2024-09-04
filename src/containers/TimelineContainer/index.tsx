import Timeline from 'components/Timeline/Timeline';
import React, {useState} from 'react';
import {SharedValue} from 'react-native-reanimated';
import {useDispatch} from 'react-redux';
import Edit from 'screens/Home/components/Edit';
import {updateWord} from 'store/videos/slice';
import {GeneratedSentence, SentenceWord} from 'utils/sentencesBuilder';

type TimelineContainerProps = {
  currentTime: SharedValue<number>;
  frameRate: number;
  totalDuration: number;
  seek: SharedValue<number>;
  height: number;
  sentences: GeneratedSentence[];
};

const TimelineContainer = (props: TimelineContainerProps) => {
  const [selectedWord, setSelectedWord] = useState<SentenceWord | undefined>(
    undefined,
  );

  const dispatch = useDispatch();

  const onSelect = (word: SentenceWord) => {
    setSelectedWord(word);
  };

  const handleCloseEdit = () => {
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

  return (
    <>
      {selectedWord && (
        <Edit
          handleClose={handleCloseEdit}
          handleRename={onEdit}
          value={selectedWord.text}
        />
      )}

      <Timeline {...props} onSelect={onSelect} />
    </>
  );
};

export default React.memo(TimelineContainer);
