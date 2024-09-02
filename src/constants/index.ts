import {GeneratedSentence} from 'utils/sentencesBuilder';

export const VIDEO_NAME_PREFIX = 'Video';
export const APP_NAME = 'FastCap';

export const DEFAULT_MAX_WORDS = 5;

export const TEMPLATE_SENTENCE: GeneratedSentence[] = [
  {
    uuid: '1',
    text: "Hi guys, it's me, FastCap.",
    start: 720,
    end: 3366,
    words: [
      {
        uuid: 'word1',
        sentenceUuid: '1',
        start: 720,
        end: 1000,
        text: 'Hi',
        confidence: 0.80554,
        speaker: null,
      },
      {
        uuid: 'word2',
        sentenceUuid: '1',
        start: 1030,
        end: 1574,
        text: 'guys,',
        confidence: 0.7807,
        speaker: null,
      },
      {
        uuid: 'word3',
        sentenceUuid: '1',
        start: 1702,
        end: 2142,
        text: "it's",
        confidence: 0.66275,
        speaker: null,
      },
      {
        uuid: 'word4',
        sentenceUuid: '1',
        start: 2206,
        end: 2550,
        text: 'me,',
        confidence: 0.99222,
        speaker: null,
      },
      {
        uuid: 'word5',
        sentenceUuid: '1',
        start: 2630,
        end: 3366,
        text: 'FastCap.',
        confidence: 0.79877,
        speaker: null,
      },
    ],
  },
];
