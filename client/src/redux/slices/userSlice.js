import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: null,  // The username of the logged-in user
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload; // Set the username
    },
    logoutUser: (state) => {
      state.username = null; // Clear the username
    },
  },
});

export const { setUsername, logoutUser } = userSlice.actions;

export default userSlice.reducer;
