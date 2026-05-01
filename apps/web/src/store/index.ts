import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import itineraryReducer from './itinerarySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    itineraries: itineraryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

