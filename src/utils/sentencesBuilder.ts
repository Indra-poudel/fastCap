import {AutoHighlightResult, TranscriptWord} from 'assemblyai';

export type SentenceWord = TranscriptWord & {
  highlighted?: boolean;
  // later add type for styling individual word
};

export type GeneratedSentence = {
  text: string;
  words: SentenceWord[];
  start: number;
  end: number;
};

export const transformWordsToSentences = (
  words: SentenceWord[],
  highlightedWords: AutoHighlightResult[],
  maxWords: number = 10,
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
    const isHighlighted = highlightedTimestamps.has(word.start);
    word.highlighted = isHighlighted;

    const isUppercaseStart = word.text[0] === word.text[0].toUpperCase();
    const endsWithPunctuation = isSentenceEnding(word.text);

    // Ensure a word followed by a comma starts with an uppercase letter if it starts a sentence
    if (word.text.endsWith(',') && !isUppercaseStart) {
      // Include this word in the previous sentence
      if (currentSentence.length > 0) {
        currentSentence.push(word);
      } else {
        sentences.push({
          text: word.text,
          words: [word],
          start: word.start,
          end: word.end,
        });
      }
    } else {
      if (previousWord && isSentenceEnding(previousWord.text)) {
        if (currentSentence.length > 0) {
          sentences.push({
            text: currentSentence.map(w => w.text).join(' '),
            words: currentSentence,
            start: currentSentence[0].start,
            end: currentSentence[currentSentence.length - 1].end,
          });
        }
        currentSentence = [word];
      } else {
        currentSentence.push(word);
      }

      // If the current sentence reaches the max word limit or ends with a sentence-ending punctuation
      if (currentSentence.length >= maxWords || endsWithPunctuation) {
        if (currentSentence.length > 1 && endsWithPunctuation) {
          const lastWord = currentSentence.pop();
          if (currentSentence.length > 0) {
            sentences.push({
              text: currentSentence.map(w => w.text).join(' '),
              words: currentSentence,
              start: currentSentence[0].start,
              end: currentSentence[currentSentence.length - 1].end,
            });
          }
          if (lastWord) {
            currentSentence = [lastWord];
          }
        } else {
          sentences.push({
            text: currentSentence.map(w => w.text).join(' '),
            words: currentSentence,
            start: currentSentence[0].start,
            end: currentSentence[currentSentence.length - 1].end,
          });
          currentSentence = [];
        }
      }
    }

    previousWord = word;
  });

  // Add any remaining words as the last sentence
  if (currentSentence.length > 0) {
    sentences.push({
      text: currentSentence.map(w => w.text).join(' '),
      words: currentSentence,
      start: currentSentence[0].start,
      end: currentSentence[currentSentence.length - 1].end,
    });
  }

  return sentences;
};

function isSentenceEnding(text: string): boolean {
  // These punctuation marks are considered to end a sentence
  const sentenceEndings = ['.', '?', '!', '。', '？', '！', ':', ';', '؟', '।'];
  return sentenceEndings.some(ending => text.endsWith(ending));
}
