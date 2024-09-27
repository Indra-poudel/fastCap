import {configureStore} from '@reduxjs/toolkit';
import {mmkvStorage} from './mmkvStorage';
import {persistStore, persistReducer} from 'redux-persist';
import {createLogger} from 'redux-logger';

import reducer from './reducer';

const persistConfig = {
  key: 'root',
  storage: mmkvStorage,
  blacklist: ['subscription'],
};

const persistedReducer = persistReducer(persistConfig, reducer);

const logger = createLogger({
  collapsed: true,
  diff: true,
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(__DEV__ ? [logger] : []),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
