import {combineReducers} from '@reduxjs/toolkit';
import videosReducer from './videos/slice';
import templatesReducer from './templates/slice';
import subscriptionReducer from './subscription/slice';

export default combineReducers({
  videos: videosReducer,
  templates: templatesReducer,
  subscription: subscriptionReducer,
});
