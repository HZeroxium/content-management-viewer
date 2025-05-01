// src/lib/store/slices/files.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FilesState {
  uploadProgress: Record<string, number>;
  error: string | null;
}

const initialState: FilesState = {
  uploadProgress: {},
  error: null,
};

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setUploadProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number }>
    ) => {
      state.uploadProgress[action.payload.id] = action.payload.progress;
    },
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    },
    setFilesError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearFilesError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUploadProgress,
  clearUploadProgress,
  setFilesError,
  clearFilesError,
} = filesSlice.actions;
export default filesSlice.reducer;
