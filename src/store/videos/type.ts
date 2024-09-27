import {TranscriptLanguageCode} from 'assemblyai';
import {TemplateId} from 'store/templates/type';
import {GeneratedSentence} from 'utils/sentencesBuilder';

export type VideosSliceState = {
  byId: Record<VideoId, Video>;
  allIds: VideoId[];
  selectedVideoId: VideoId | undefined;
};

export type SubscriptionSliceState = {
  isSubscribed: boolean;
  isLoading: boolean;
};

export type VideoId = string;

export enum ExportQuality {
  VERY_HIGH = 4,
  HIGH = 3,
  MEDIUM = 2,
  LOW = 0.5,
  STANDARD = 1,
}

export type Video = {
  id: VideoId;
  title: string;
  url: string;
  language?: TranscriptLanguageCode;
  sentences: GeneratedSentence[];
  templateId: TemplateId;
  createdAt: string;
  updatedAt: string;
  duration: number;
  thumbnailUrl?: string;
  height: number;
  width: number;
  rotation: number;
  audioUrl: string;
  exportQuality: ExportQuality;
};
