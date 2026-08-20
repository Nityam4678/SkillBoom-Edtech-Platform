import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  signupData: null,
  loading: false,
  initialized: false,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setSignupData(state, value) {
      state.signupData = value.payload;
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setToken(state, value) {
      state.token = value.payload;
    },
    setInitialized(state, value) {
      state.initialized = value.payload;
    },
  },
});

export const { setSignupData, setLoading, setToken, setInitialized } = authSlice.actions;

export default authSlice.reducer;