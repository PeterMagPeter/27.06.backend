"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserObject = exports.setSkin = exports.setShips = exports.setUser = exports.deleteUser = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
// Initialer Zustand des Reducers
const initialState = {
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
const userReducer = (0, toolkit_1.createSlice)({
    name: "userReducer",
    initialState,
    reducers: {
        deleteUser: (state) => {
            state.token = "";
            state.username = "";
            state.loggedIn = false;
            state.email = "";
            state.user = null;
            console.log("user gelöscht: ");
        },
        setUser: (state, action) => {
            state.token = action.payload.token;
            state.loggedIn = action.payload.loggedIn;
            state.username = action.payload.username;
            state.email = action.payload.email;
            state.guest = action.payload.guest;
        },
        setUserObject: (state, action) => {
            state.user = action.payload.user;
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
_a = userReducer.actions, exports.deleteUser = _a.deleteUser, exports.setUser = _a.setUser, exports.setShips = _a.setShips, exports.setSkin = _a.setSkin, exports.setUserObject = _a.setUserObject;
exports.default = userReducer.reducer;
//# sourceMappingURL=TestReducer.js.map