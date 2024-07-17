"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSettings = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
// Initialer Zustand des Reducers
const initialState = {
    sfxVolume: 0.3,
    musicVolume: 0.3
    // später noch aiDifficulty und ships hinzufügen
};
// Erstelle ein Slice mit einem Reducer und Aktionen
const settingsReducer = (0, toolkit_1.createSlice)({
    name: "settingsReducer",
    initialState,
    reducers: {
        setSettings: (state, action) => {
            state.sfxVolume = action.payload.sfxVolume;
            state.musicVolume = action.payload.musicVolume;
        },
    },
});
// Exportiere Reducer und Aktionen
exports.setSettings = settingsReducer.actions.setSettings;
exports.default = settingsReducer.reducer;
//# sourceMappingURL=SettingsReducer.js.map