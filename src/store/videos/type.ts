import {TranscriptLanguageCode} from 'assemblyai';
import {TemplateId} from 'store/templates/type';
import {GeneratedSentence} from 'utils/sentencesBuilder';

export type VideosSliceState = {
  byId: Record<VideoId, Video>;
  allIds: VideoId[];
  selectedVideoId: VideoId | undefined;
};

export type VideoId = string;

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
  audioUrl: string;
};
