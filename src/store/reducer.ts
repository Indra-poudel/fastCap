import {combineReducers} from '@reduxjs/toolkit';
import videosReducer from './videos/slice';

export default combineReducers({
  videos: videosReducer,
});
