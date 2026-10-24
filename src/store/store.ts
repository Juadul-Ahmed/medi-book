
import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

type UiState = {
  sidebarOpen: boolean;
};

const initialState: UiState = {
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { setSidebarOpen, toggleSidebar } = uiSlice.actions;

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiSlice.reducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

let store: ReturnType<typeof makeStore> | undefined;

export function getStore() {
  if (!store) {
    store = makeStore();
  }

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
