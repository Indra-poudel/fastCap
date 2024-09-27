import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {SubscriptionSliceState} from 'store/videos/type';

const initialState: SubscriptionSliceState = {
  isSubscribed: false,
  isLoading: false,
};

const subscriptionSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    setSubscribed: (state, action: PayloadAction<boolean>) => {
      state.isSubscribed = action.payload;
    },
  },
});

export const {setSubscribed} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
