
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';


const store = configureStore({
  reducer: {
    user: userReducer,  // Adding the user reducer to the store
  },
});

export default store;
