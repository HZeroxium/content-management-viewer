// src/lib/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import contentReducer from "./slices/content.slice";
import usersReducer from "./slices/users.slice";
import filesReducer from "./slices/files.slice";
import uiReducer from "./slices/ui.slice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
    users: usersReducer,
    files: filesReducer,
    ui: uiReducer,
  },
});

// Export for use in other files, like axios interceptors
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for typed dispatch & selector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
