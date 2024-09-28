import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {Video, VideoId, VideosSliceState} from 'store/videos/type';
import {SentenceWord} from 'utils/sentencesBuilder';

const initialState: VideosSliceState = {
  byId: {},
  allIds: [],
  selectedVideoId: undefined,
};

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    addVideo: (state, action: PayloadAction<Video>) => {
      const video = action.payload;
      state.byId[video.id] = video;
      state.allIds.unshift(video.id);
    },
    removeVideo: (state, action: PayloadAction<VideoId>) => {
      const videoId = action.payload;
      delete state.byId[videoId];
      state.allIds = state.allIds.filter(id => id !== videoId);
    },
    updateVideo: (state, action: PayloadAction<Video>) => {
      const video = action.payload;
      if (state.byId[video.id]) {
        state.byId[video.id] = video;
      }
    },
    reorderVideos: (state, action: PayloadAction<VideoId[]>) => {
      state.allIds = action.payload;
    },

    setSelectedVideo: (state, action: PayloadAction<VideoId | undefined>) => {
      state.selectedVideoId = action.payload;
    },

    updateWord: (state, action: PayloadAction<SentenceWord>) => {
      const payload = action.payload;
      const selectedVideoId = state.selectedVideoId;

      if (selectedVideoId) {
        const video = state.byId[selectedVideoId];
        if (video) {
          for (const sentence of video.sentences) {
            const word = sentence.words.find(w => w.uuid === payload.uuid);
            if (word) {
              Object.assign(word, payload); // Update the word with the new properties
              break; // Once the word is found and updated, exit the loop
            }
          }
        }
      }
    },

    deleteWord: (state, action: PayloadAction<{wordUuid: string}>) => {
      const {wordUuid} = action.payload;

      const selectedVideoId = state.selectedVideoId;

      if (selectedVideoId) {
        const video = state.byId[selectedVideoId];
        if (video) {
          for (const sentence of video.sentences) {
            const wordIndex = sentence.words.findIndex(
              w => w.uuid === wordUuid,
            );
            if (wordIndex !== -1) {
              sentence.words.splice(wordIndex, 1); // Remove the word
              break; // Exit after deleting the word
            }
          }
        }
      }
    },
  },
});

export const {
  addVideo,
  removeVideo,
  updateVideo,
  reorderVideos,
  setSelectedVideo,
  updateWord,
  deleteWord,
} = videosSlice.actions;
export default videosSlice.reducer;
