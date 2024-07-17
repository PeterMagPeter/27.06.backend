import { createSlice } from "@reduxjs/toolkit";
import { Position } from "../../Resources";

export interface hostSettings {
  roomId: string | null;
  privateMatch: boolean;
  gameMap: string;
  password?: string;
  maxPlayers: number; // former playerCount
  gameMode: string;
  hostName: string;
  players: string[];
  superWeapons: boolean;
  shotTimer: number;
}

interface Lobby {
  roomId: string;
  privateMatch: boolean;
  initPlayer: string;
  hostName: string;
  aiDifficulty: number;
  vsAi: boolean;
  gameMode: string;
  maxPlayers: number;
  team: number;
  superWeapons: boolean
  playersInTeam: Map<string, number>;
  playersSkins: Map<string, string>
  mines?: Position[];
}

// Initialer Zustand des Reducers
const initialState: Lobby = {
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
  playersInTeam: new Map<string, number>(),
  playersSkins: new Map<string, string>(),
  // später noch aiDifficulty und ships hinzufügen
};

// Erstelle ein Slice mit einem Reducer und Aktionen
const lobbyReducer = createSlice({
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
export const {
  setLobby,
  setAiDifficulty,
  deleteLobby,
  setHostName,
  setTeam,
  setRoomId,
  setInitPlayer,
  setPrivateMatch,
  setPlayersInTeam,
  setSuperWeapons,
  setPlayersSkins,
  setMines
} = lobbyReducer.actions;
export default lobbyReducer.reducer;
