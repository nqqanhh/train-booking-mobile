import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import ticketReducer from "../slices/ticketSlice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["tickets"], // chỉ persist tickets
};

const rootReducer = combineReducers({
  tickets: ticketReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
