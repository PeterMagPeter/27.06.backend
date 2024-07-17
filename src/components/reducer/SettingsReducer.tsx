import { createSlice } from "@reduxjs/toolkit";

interface Settings {
  sfxVolume: number;
  musicVolume: number;
}

// Initialer Zustand des Reducers
const initialState: Settings = {
  sfxVolume: 0.3,
  musicVolume: 0.3
  // später noch aiDifficulty und ships hinzufügen
};

// Erstelle ein Slice mit einem Reducer und Aktionen
const settingsReducer = createSlice({
  name: "settingsReducer",
  initialState,
  reducers: {

    setSettings: (state, action) => {
      state.sfxVolume = action.payload.sfxVolume;
      state.musicVolume = action.payload.musicVolume
    },
  },
});

// Exportiere Reducer und Aktionen
export const { setSettings } = settingsReducer.actions;
export default settingsReducer.reducer;
