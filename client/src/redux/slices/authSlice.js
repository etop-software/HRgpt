import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  privileges: {},
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPrivileges: (state, action) => {
      state.privileges = action.payload;  // Store user privileges
    },
    setAuthentication: (state, action) => {
      state.isAuthenticated = action.payload;  // Store authentication status
    },
  },
});

// Export actions to dispatch
export const { setPrivileges, setAuthentication } = authSlice.actions;
export default authSlice.reducer;
