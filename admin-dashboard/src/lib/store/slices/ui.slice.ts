// src/lib/store/slices/ui.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  darkMode: boolean;
  socketConnected: boolean;
}

const initialState: UIState = {
  darkMode: false,
  socketConnected: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    setSocketStatus(state, action: PayloadAction<boolean>) {
      state.socketConnected = action.payload;
    },
  },
});

export const { toggleDarkMode, setSocketStatus } = uiSlice.actions;
export default uiSlice.reducer;
