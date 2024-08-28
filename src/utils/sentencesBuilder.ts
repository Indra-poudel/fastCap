import {AutoHighlightResult, TranscriptWord} from 'assemblyai';
import uuid from 'react-native-uuid';

export type SentenceWord = TranscriptWord & {
  highlighted?: boolean;
  uuid: string;
  sentenceUuid?: string;
  // later add type for styling individual word
};

export type GeneratedSentence = {
  text: string;
  words: SentenceWord[];
  start: number;
  end: number;
  uuid: string;
};

export const transformWordsToSentences = (
  words: SentenceWord[],
  highlightedWords: AutoHighlightResult[],
  maxWords: number,
): GeneratedSentence[] => {
  const highlightedTimestamps = new Set<number>();

  highlightedWords.forEach(hWord => {
    hWord.timestamps.forEach(timestamp => {
      highlightedTimestamps.add(timestamp.start);
      highlightedTimestamps.add(timestamp.end);
    });
  });

  const sentences: GeneratedSentence[] = [];
  let currentSentence: SentenceWord[] = [];
  let previousWord: SentenceWord | null = null;

  words.forEach(word => {
    word.uuid = word.uuid || uuid.v4().toString();
    const isHighlighted = highlightedTimestamps.has(word.start);
    word.highlighted = word.highlighted || isHighlighted;

    const isUppercaseStart = word.text[0] === word.text[0].toUpperCase();
    const endsWithPunctuation = isSentenceEnding(word.text);

    // Ensure a word followed by a comma starts with an uppercase letter if it starts a sentence
    if (word.text.endsWith(',') && !isUppercaseStart) {
      // Include this word in the previous sentence
      if (currentSentence.length > 0) {
        currentSentence.push(word);
      } else {
        const sentenceUuid = uuid.v4().toString();
        word.sentenceUuid = sentenceUuid;

        sentences.push({
          text: word.text,
          words: [word],
          start: word.start,
          end: word.end,
          uuid: sentenceUuid,
        });
      }
    } else {
      if (previousWord && isSentenceEnding(previousWord.text)) {
        if (currentSentence.length > 0) {
          const sentenceUuid = uuid.v4().toString();
          currentSentence.forEach(w => (w.sentenceUuid = sentenceUuid));

          sentences.push({
            text: currentSentence.map(w => w.text).join(' '),
            words: currentSentence,
            start: currentSentence[0].start,
            end: currentSentence[currentSentence.length - 1].end,
            uuid: uuid.v4().toString(),
          });
        }
        currentSentence = [word];
      } else {
        currentSentence.push(word);
      }

      // If the current sentence reaches the max word limit or ends with a sentence-ending punctuation
      if (currentSentence.length >= maxWords || endsWithPunctuation) {
        const sentenceUuid = uuid.v4().toString();
        if (currentSentence.length > 1 && endsWithPunctuation) {
          const lastWord = currentSentence.pop();
          currentSentence.forEach(w => (w.sentenceUuid = sentenceUuid));
          if (currentSentence.length > 0) {
            sentences.push({
              text: currentSentence.map(w => w.text).join(' '),
              words: currentSentence,
              start: currentSentence[0].start,
              end: currentSentence[currentSentence.length - 1].end,
              uuid: sentenceUuid,
            });
          }
          if (lastWord) {
            lastWord.sentenceUuid = uuid.v4().toString();
            currentSentence = [lastWord];
          }
        } else {
          currentSentence.forEach(w => (w.sentenceUuid = sentenceUuid));
          sentences.push({
            text: currentSentence.map(w => w.text).join(' '),
            words: currentSentence,
            start: currentSentence[0].start,
            end: currentSentence[currentSentence.length - 1].end,
            uuid: sentenceUuid,
          });
          currentSentence = [];
        }
      }
    }

    previousWord = word;
  });

  // Add any remaining words as the last sentence
  if (currentSentence.length > 0) {
    const sentenceUuid = uuid.v4().toString();
    currentSentence.forEach(w => (w.sentenceUuid = sentenceUuid));
    sentences.push({
      text: currentSentence.map(w => w.text).join(' '),
      words: currentSentence,
      start: currentSentence[0].start,
      end: currentSentence[currentSentence.length - 1].end,
      uuid: sentenceUuid,
    });
  }

  return sentences;
};

function isSentenceEnding(text: string): boolean {
  // These punctuation marks are considered to end a sentence
  const sentenceEndings = ['.', '?', '!', '。', '？', '！', ':', ';', '؟', '।'];
  return sentenceEndings.some(ending => text.endsWith(ending));
}
