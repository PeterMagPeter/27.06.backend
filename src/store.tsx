import { configureStore } from '@reduxjs/toolkit';
import userReducer from './components/reducer/TestReducer';
import lobbyReducer from './components/reducer/LobbyReducer';
import settingsReducer from './components/reducer/SettingsReducer';

const store = configureStore({
  reducer: {
    // Weitere Slices können hier hinzugefügt werden
    userReducer: userReducer,
    lobbyReducer: lobbyReducer,
    settingsReducer: settingsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>
export default store;
