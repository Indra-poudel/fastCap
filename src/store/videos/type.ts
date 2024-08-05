import {TranscriptLanguageCode} from 'assemblyai';
import {GeneratedSentence} from 'utils/sentencesBuilder';

export type VideosSliceState = {
  byId: Record<VideoId, Video>;
  allIds: VideoId[];
  selectedVideoId: '';
};

export type VideoId = string;

export type Video = {
  id: VideoId;
  title: string;
  url: string;
  language?: TranscriptLanguageCode;
  sentences: GeneratedSentence[];
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  duration: number;
  thumbnailUrl: string;
  height: number;
  width: number;
};
