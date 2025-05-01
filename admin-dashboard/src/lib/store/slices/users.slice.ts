// src/lib/store/slices/users.slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UsersState {
  selectedUserId: string | null;
  isEditing: boolean;
  error: string | null;
}

const initialState: UsersState = {
  selectedUserId: null,
  isEditing: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<string | null>) => {
      state.selectedUserId = action.payload;
      state.error = null;
    },
    startEditing: (state) => {
      state.isEditing = true;
      state.error = null;
    },
    stopEditing: (state) => {
      state.isEditing = false;
    },
    setUsersError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearUsersError: (state) => {
      state.error = null;
    },
  },
});

export const {
  selectUser,
  startEditing,
  stopEditing,
  setUsersError,
  clearUsersError,
} = usersSlice.actions;
export default usersSlice.reducer;
