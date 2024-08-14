import {useState, useRef, useEffect, useCallback} from 'react';
import {convertVideoToMp3} from 'utils/video';
import {
  generateTranscription,
  getTranscriptionById,
  uploadAudio,
} from 'apis/assemblyAI';
import {languageType} from 'components/LanguageSelector';
import {
  GeneratedSentence,
  transformWordsToSentences,
} from 'utils/sentencesBuilder';
import mock from 'mocks/transcript.json';
import uuid from 'react-native-uuid';

const POLLING_INTERVAL = 2000; // 5 seconds

enum TranscriptionSteps {
  CONVERT_VIDEO_TO_MP3 = '🎥🎧 Extracting the Beats',
  UPLOAD_AUDIO = '🎵 Processing the Soundwaves',
  GENERATE_TRANSCRIPTION = '📝 Creating the Script',
  CHECK_TRANSCRIPTION_STATUS = '🔍 Confirming the Script',
  COMPLETE = '✅ All Done, Fam!',
}

export enum OverallProcessStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export const useTranscriptionService = ({
  isMock,
  maxWords,
}: {
  isMock?: boolean;
  maxWords: number;
}) => {
  const [currentStep, setCurrentStep] = useState<TranscriptionSteps>(
    TranscriptionSteps.CONVERT_VIDEO_TO_MP3,
  );
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [overallStatus, setOverallStatus] = useState<OverallProcessStatus>(
    OverallProcessStatus.IDLE,
  );
  const [sentences, setSentences] = useState<GeneratedSentence[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState('');

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const startTranscriptionProcess = useCallback(
    async (
      videoUri: string,
      language: languageType,
      totalDurationInMilliSeconds: number,
    ) => {
      if (isMock) {
        const audioName = 'transcriptionAudio' + uuid.v4();
        const mp3Uri = await convertVideoToMp3(
          videoUri,
          audioName,
          totalDurationInMilliSeconds,
          setStepProgress,
        );

        const words = mock.words || [];
        const highlightedWords = mock.auto_highlights_result?.results || [];
        const generatedSentences = transformWordsToSentences(
          words,
          highlightedWords,
          maxWords,
        );

        setTimeout(() => {
          setAudioUrl(mp3Uri);
          setSentences(generatedSentences);
          setOverallStatus(OverallProcessStatus.COMPLETED);
        }, 1000);
      } else {
        try {
          setError(null);
          setOverallStatus(OverallProcessStatus.PROCESSING);

          // Step 1: Convert video to MP3
          setCurrentStep(TranscriptionSteps.CONVERT_VIDEO_TO_MP3);
          setStepProgress(0);
          const audioName = 'transcriptionAudio' + uuid.v4();
          const mp3Uri = await convertVideoToMp3(
            videoUri,
            audioName,
            totalDurationInMilliSeconds,
            setStepProgress,
          );
          console.log('mp3 uri', mp3Uri);
          if (!isMounted.current) {
            return;
          }

          // Step 2: Upload audio
          setCurrentStep(TranscriptionSteps.UPLOAD_AUDIO);
          const audioUrl = await uploadAudio(mp3Uri, progress => {
            setStepProgress(progress);
          });
          setAudioUrl(mp3Uri);
          if (!isMounted.current) {
            return;
          }

          // Step 3: Generate transcription
          setCurrentStep(TranscriptionSteps.GENERATE_TRANSCRIPTION);
          setStepProgress(0);
          const transcription = await generateTranscription(
            {
              audio_url: audioUrl,
              language_code: language.code,
              speech_model: language.model,
              auto_highlights: true,
            },
            progress => {
              setStepProgress(progress);
            },
          );
          if (!isMounted.current) {
            return;
          }

          // Step 4: Poll for transcription status until complete
          let newTranscription = transcription;

          setCurrentStep(TranscriptionSteps.CHECK_TRANSCRIPTION_STATUS);
          setStepProgress(0);

          while (
            newTranscription.data.status === 'queued' ||
            newTranscription.data.status === 'processing'
          ) {
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
            if (!isMounted.current) {
              return;
            }

            const updatedTranscription = await getTranscriptionById(
              transcription.data.id,
            );
            if (!isMounted.current) {
              return;
            }

            if (updatedTranscription.data.status === 'processing') {
              setStepProgress(50);
            }
            newTranscription = updatedTranscription;
          }

          if (newTranscription.data.status === 'completed') {
            const words = newTranscription.data.words || [];
            const highlightedWords =
              newTranscription.data.auto_highlights_result?.results || [];
            const generatedSentences = transformWordsToSentences(
              words,
              highlightedWords,
              maxWords,
            );

            setSentences(generatedSentences);
            setCurrentStep(TranscriptionSteps.COMPLETE);
            setOverallStatus(OverallProcessStatus.COMPLETED);
          } else {
            setError('Transcription failed');
          }
        } catch {
          if (isMounted.current) {
            setError('Transcription process error');
            setOverallStatus(OverallProcessStatus.ERROR);
          }
        }
      }
    },
    [isMock],
  );

  return {
    currentStep,
    stepProgress,
    overallStatus,
    sentences,
    error,
    audioUrl,
    startTranscriptionProcess,
  };
};
