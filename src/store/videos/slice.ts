import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {Video, VideoId, VideosSliceState} from 'store/videos/type';

const initialState: VideosSliceState = {
  byId: {},
  allIds: [],
  selectedVideoId: '',
};

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    addVideo: (state, action: PayloadAction<Video>) => {
      const video = action.payload;
      state.byId[video.id] = video;
      state.allIds.push(video.id);
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
  },
});

export const {addVideo, removeVideo, updateVideo, reorderVideos} =
  videosSlice.actions;
export default videosSlice.reducer;
