// src/lib/store/slices/ui.slice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  socketConnected: boolean;
  theme: "light" | "dark";
  sidebarOpen: boolean;
}

const initialState: UIState = {
  socketConnected: false,
  theme:
    (typeof window !== "undefined" &&
      (localStorage.getItem("theme") as "light" | "dark")) ||
    "light",
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSocketStatus: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", state.theme);
      }
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  setSocketStatus,
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
