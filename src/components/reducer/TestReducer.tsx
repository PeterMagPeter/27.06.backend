import { createSlice } from "@reduxjs/toolkit";
import { UserResource } from "../../Resources";
export interface ShipTemplate {
  identifier: string;
  direction: "X" | "Y";
  startX: number;
  startY: number;
  length: number;
}
type Position = { x: number; y: number };
export interface Ship {
  isHorizontal: boolean;
  startPosition: Position;
  length: number;
  initialPositions: Position[];
  hitPositions: Position[];

  imSunk: boolean;
  identifier: string;
}
interface User {
  token: string;
  user: UserResource | null
  loggedIn: boolean;
  username: string;
  email: string;
  ships: ShipTemplate[];
  guest: boolean;
  skin: string;
  points: number;
}

// Initialer Zustand des Reducers
const initialState: User = {
  token: "",
  user: null,
  loggedIn: false,
  username: "",
  email: "",
  ships: [],
  guest: true,
  skin: "standard",
  points: 0
};

// Erstelle ein Slice mit einem Reducer und Aktionen
const userReducer = createSlice({
  name: "userReducer",
  initialState,
  reducers: {
    deleteUser: (state) => {
      state.token = "";
      state.username = "";
      state.loggedIn = false;
      state.email = "";
      state.user = null
      console.log("user gelöscht: ");
    },
    setUser: (state, action) => {
      state.token = action.payload.token;
      state.loggedIn = action.payload.loggedIn;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.guest = action.payload.guest;
    },
    setUserObject: (state, action)=>{
      state.user = action.payload.user
    },
    setShips: (state, action) => {
      state.ships = action.payload.ships;
    },
    setSkin: (state, action) => {
      state.skin = action.payload.skin;
    },
    setPoints: (state, action) => {
      state.points = action.payload.points;
    }
  },
});

// Exportiere Reducer und Aktionen
export const { deleteUser, setUser, setShips, setSkin,setUserObject } = userReducer.actions;
export default userReducer.reducer;
