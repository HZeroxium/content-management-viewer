// src/lib/store/slices/content.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContentResponseDto, ContentBlockDto } from "@/lib/types/content";

export interface ContentState {
  currentContent: ContentResponseDto | null;
  loading: boolean;
  error: string | null;
  savedSuccess: boolean;
}

const initialState: ContentState = {
  currentContent: null,
  loading: false,
  error: null,
  savedSuccess: false,
};

const contentSlice = createSlice({
  name: "contents",
  initialState,
  reducers: {
    setCurrentContent: (state, action: PayloadAction<ContentResponseDto>) => {
      state.currentContent = action.payload;
    },
    updateContentBlock: (
      state,
      action: PayloadAction<{ index: number; block: ContentBlockDto }>
    ) => {
      if (state.currentContent && state.currentContent.blocks) {
        const { index, block } = action.payload;
        state.currentContent.blocks[index] = {
          ...state.currentContent.blocks[index],
          ...block,
        };
      }
    },
    addContentBlock: (state, action: PayloadAction<ContentBlockDto>) => {
      if (state.currentContent) {
        if (!state.currentContent.blocks) {
          state.currentContent.blocks = [];
        }
        state.currentContent.blocks.push({
          ...action.payload,
          metadata: action.payload.metadata || {},
        });
      }
    },
    removeContentBlock: (state, action: PayloadAction<number>) => {
      if (state.currentContent && state.currentContent.blocks) {
        state.currentContent.blocks.splice(action.payload, 1);
      }
    },
    clearCurrentContent: (state) => {
      state.currentContent = null;
      state.loading = false;
      state.error = null;
      state.savedSuccess = false; // Reset success state when navigating away
    },
    saveStart: (state) => {
      state.loading = true;
      state.error = null;
      state.savedSuccess = false;
    },
    saveSuccess: (state) => {
      state.loading = false;
      state.error = null;
      state.savedSuccess = true;
    },
    saveFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.savedSuccess = false;
    },
    clearSaveStatus: (state) => {
      state.savedSuccess = false;
      state.error = null;
    },
  },
});

export const {
  setCurrentContent,
  updateContentBlock,
  addContentBlock,
  removeContentBlock,
  clearCurrentContent,
  saveStart,
  saveSuccess,
  saveFailure,
  clearSaveStatus,
} = contentSlice.actions;

export default contentSlice.reducer;
