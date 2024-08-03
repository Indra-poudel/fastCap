import {createSelector} from '@reduxjs/toolkit';
import {RootState} from 'store';

export const selectVideosState = (state: RootState) => state.videos;

export const selectAllVideos = createSelector(selectVideosState, videosState =>
  videosState.allIds.map(id => videosState.byId[id]),
);

export const selectVideoById = (videoId: string) =>
  createSelector(selectVideosState, videosState => videosState.byId[videoId]);

export const selectSelectedVideo = createSelector(
  selectVideosState,
  videosState =>
    videosState.selectedVideoId
      ? videosState.byId[videosState.selectedVideoId]
      : null,
);
