"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMines = exports.setPlayersSkins = exports.setSuperWeapons = exports.setPlayersInTeam = exports.setPrivateMatch = exports.setInitPlayer = exports.setRoomId = exports.setTeam = exports.setHostName = exports.deleteLobby = exports.setAiDifficulty = exports.setLobby = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
// Initialer Zustand des Reducers
const initialState = {
    roomId: "",
    privateMatch: false,
    initPlayer: "",
    hostName: "",
    aiDifficulty: 0.5,
    vsAi: false,
    gameMode: "1vs1",
    maxPlayers: 2,
    team: -1,
    superWeapons: true,
    playersInTeam: new Map(),
    playersSkins: new Map(),
    // später noch aiDifficulty und ships hinzufügen
};
// Erstelle ein Slice mit einem Reducer und Aktionen
const lobbyReducer = (0, toolkit_1.createSlice)({
    name: "lobbyReducer",
    initialState,
    reducers: {
        setLobby: (state, action) => {
            state.roomId = action.payload.roomId;
            state.privateMatch = action.payload.privateMatch;
            state.hostName = action.payload.hostName;
            state.maxPlayers = action.payload.maxPlayers;
            state.gameMode = action.payload.gameMode;
            state.superWeapons = action.payload.superWeapons;
        },
        setAiDifficulty: (state, action) => {
            state.vsAi = action.payload.vsAi;
            state.aiDifficulty = action.payload.aiDifficulty;
        },
        setHostName: (state, action) => {
            state.hostName = action.payload.hostName;
        },
        setRoomId: (state, action) => {
            state.roomId = action.payload.roomId;
        },
        setTeam: (state, action) => {
            state.team = action.payload.team;
        },
        setInitPlayer: (state, action) => {
            state.initPlayer = action.payload.initPlayer;
        },
        setPrivateMatch: (state, action) => {
            state.privateMatch = action.payload.privateMatch;
        },
        setPlayersInTeam: (state, action) => {
            state.playersInTeam = action.payload.playersInTeam;
        },
        setPlayersSkins: (state, action) => {
            state.playersSkins = action.payload.playersSkins;
        },
        setSuperWeapons: (state, action) => {
            state.superWeapons = action.payload.superWeapons;
        },
        setMines: (state, action) => {
            state.mines = action.payload.mines;
        },
        deleteLobby: (state) => {
            state.roomId = "";
            state.initPlayer = "";
            state.hostName = "";
            state.privateMatch = false;
            state.team = -1;
            state.maxPlayers = 2;
            state.gameMode = "1vs1";
        },
    },
});
// Exportiere Reducer und Aktionen
_a = lobbyReducer.actions, exports.setLobby = _a.setLobby, exports.setAiDifficulty = _a.setAiDifficulty, exports.deleteLobby = _a.deleteLobby, exports.setHostName = _a.setHostName, exports.setTeam = _a.setTeam, exports.setRoomId = _a.setRoomId, exports.setInitPlayer = _a.setInitPlayer, exports.setPrivateMatch = _a.setPrivateMatch, exports.setPlayersInTeam = _a.setPlayersInTeam, exports.setSuperWeapons = _a.setSuperWeapons, exports.setPlayersSkins = _a.setPlayersSkins, exports.setMines = _a.setMines;
exports.default = lobbyReducer.reducer;
//# sourceMappingURL=LobbyReducer.js.map