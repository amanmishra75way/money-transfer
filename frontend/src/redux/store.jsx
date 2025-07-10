import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import txnReducer from "./txnSlice";
import authReducer from "./authReducer.jsx";
import { api } from "../services/api.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
    txn: txnReducer,
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});
