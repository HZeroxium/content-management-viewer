// src/lib/store/slices/auth.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "@/lib/types/auth";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
}

const initialState: AuthState = {
  token:
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserProfile }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      // Also store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", action.payload.token);
      }
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;

      // Also remove from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    },
    updateUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, updateUser } =
  authSlice.actions;
export default authSlice.reducer;
