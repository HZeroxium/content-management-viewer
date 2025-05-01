// src/lib/store/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import uiReducer from "./slices/ui.slice";
import usersReducer from "./slices/users.slice";
import contentReducer from "./slices/content.slice";
import filesReducer from "./slices/files.slice";

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  users: usersReducer,
  contents: contentReducer,
  files: filesReducer,
});

export default rootReducer;
