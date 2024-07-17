"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toolkit_1 = require("@reduxjs/toolkit");
const TestReducer_1 = __importDefault(require("./components/reducer/TestReducer"));
const LobbyReducer_1 = __importDefault(require("./components/reducer/LobbyReducer"));
const SettingsReducer_1 = __importDefault(require("./components/reducer/SettingsReducer"));
const store = (0, toolkit_1.configureStore)({
    reducer: {
        // Weitere Slices können hier hinzugefügt werden
        userReducer: TestReducer_1.default,
        lobbyReducer: LobbyReducer_1.default,
        settingsReducer: SettingsReducer_1.default
    },
});
exports.default = store;
//# sourceMappingURL=store.js.map