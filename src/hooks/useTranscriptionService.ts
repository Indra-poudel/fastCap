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
import {output} from 'mocks/output';

const POLLING_INTERVAL = 2000; // 5 seconds

enum TranscriptionSteps {
  CONVERT_VIDEO_TO_MP3 = 'Converting video to MP3',
  UPLOAD_AUDIO = 'Uploading audio',
  GENERATE_TRANSCRIPTION = 'Generating transcription',
  CHECK_TRANSCRIPTION_STATUS = 'Checking transcription status',
  COMPLETE = 'Complete',
}

export enum OverallProcessStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export const useTranscriptionService = ({isMock}: {isMock?: boolean}) => {
  const [currentStep, setCurrentStep] = useState<TranscriptionSteps>(
    TranscriptionSteps.CONVERT_VIDEO_TO_MP3,
  );
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [overallStatus, setOverallStatus] = useState<OverallProcessStatus>(
    OverallProcessStatus.IDLE,
  );
  const [sentences, setSentences] = useState<GeneratedSentence[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const startTranscriptionProcess = useCallback(
    async (videoUri: string, language: languageType) => {
      console.log('VIDEO URI', videoUri);
      if (isMock) {
        setSentences(output);
        setOverallStatus(OverallProcessStatus.COMPLETED);
      } else {
        try {
          setError(null);
          setOverallStatus(OverallProcessStatus.PROCESSING);

          // Step 1: Convert video to MP3
          setCurrentStep(TranscriptionSteps.CONVERT_VIDEO_TO_MP3);
          setStepProgress(0);
          const mp3Uri = await convertVideoToMp3(
            videoUri,
            'transcriptionAudio',
          );
          if (!isMounted.current) {
            return;
          }

          console.log('Audio url', mp3Uri);

          // Step 2: Upload audio
          setCurrentStep(TranscriptionSteps.UPLOAD_AUDIO);
          const audioUrl = await uploadAudio(mp3Uri, progress => {
            setStepProgress(progress);
          });
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
    startTranscriptionProcess,
  };
};