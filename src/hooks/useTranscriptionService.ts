import {useState} from 'react';
import {SentencesResponse} from 'assemblyai';
import {convertVideoToMp3} from 'utils/video';
import {
  generateTranscription,
  getSentencesByTranscriptionId,
  getTranscriptionById,
  uploadAudio,
} from 'apis/assemblyAI';

const POLLING_INTERVAL = 2000; // 5 seconds

enum TranscriptionSteps {
  CONVERT_VIDEO_TO_MP3 = 'Converting video to MP3',
  UPLOAD_AUDIO = 'Uploading audio',
  GENERATE_TRANSCRIPTION = 'Generating transcription',
  CHECK_TRANSCRIPTION_STATUS = 'Checking transcription status',
  FETCH_SENTENCES = 'Fetching sentences',
  COMPLETE = 'Complete',
}

export enum OverallProcessStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export const useTranscriptionService = () => {
  const [currentStep, setCurrentStep] = useState<TranscriptionSteps>(
    TranscriptionSteps.CONVERT_VIDEO_TO_MP3,
  );
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [overallStatus, setOverallStatus] = useState<OverallProcessStatus>(
    OverallProcessStatus.IDLE,
  );
  const [sentences, setSentences] = useState<SentencesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTranscriptionProcess = async (videoUri: string) => {
    console.log('VIDEO URI', videoUri);
    try {
      setError(null);
      setOverallStatus(OverallProcessStatus.PROCESSING);

      // Step 1: Convert video to MP3
      setCurrentStep(TranscriptionSteps.CONVERT_VIDEO_TO_MP3);
      setStepProgress(0);
      const mp3Uri = await convertVideoToMp3(videoUri, 'transcriptionAudio');

      console.log('Audio url', mp3Uri);

      // Step 2: Upload audio
      setCurrentStep(TranscriptionSteps.UPLOAD_AUDIO);
      const audioUrl = await uploadAudio(mp3Uri, progress => {
        setStepProgress(progress);
      });

      // Step 3: Generate transcription
      setCurrentStep(TranscriptionSteps.GENERATE_TRANSCRIPTION);
      setStepProgress(0);
      const transcription = await generateTranscription(
        {
          audio_url: audioUrl,
        },
        progress => {
          setStepProgress(progress);
        },
      );

      // Step 4: Poll for transcription status until complete
      let transcriptionStatus = transcription.data.status;

      setCurrentStep(TranscriptionSteps.CHECK_TRANSCRIPTION_STATUS);
      setStepProgress(0);

      while (
        transcriptionStatus === 'queued' ||
        transcriptionStatus === 'processing'
      ) {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        const updatedTranscription = await getTranscriptionById(
          transcription.data.id,
        );
        if (updatedTranscription.data.status === 'processing') {
          setStepProgress(50);
        }
        transcriptionStatus = updatedTranscription.data.status;
      }

      if (transcriptionStatus === 'completed') {
        // Step 5: Fetch sentences
        setCurrentStep(TranscriptionSteps.FETCH_SENTENCES);
        const transcriptionSentences = await getSentencesByTranscriptionId(
          transcription.data.id,
          progress => {
            setStepProgress(progress);
          },
        );
        setSentences(transcriptionSentences.data);
        setCurrentStep(TranscriptionSteps.COMPLETE);
        setOverallStatus(OverallProcessStatus.COMPLETED);
      } else {
        setError('Transcription failed');
      }
    } catch {
      setError('Transcription process error');
      setOverallStatus(OverallProcessStatus.ERROR);
    }
  };

  return {
    currentStep,
    stepProgress,
    overallStatus,
    sentences,
    error,
    startTranscriptionProcess,
  };
};
