"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebSocketConnection = startWebSocketConnection;
const socket_io_1 = require("socket.io");
const GameController_Multiplayer_1 = require("./gamelogic/GameController_Multiplayer");
const GameController_Playtest_1 = require("./gamelogic/GameController_Playtest");
const Board_1 = require("./gamelogic/Board");
const Ship_1 = require("./gamelogic/Ship");
const logger_1 = require("./logger");
const DBService_1 = require("./services/DBService");
const gameControllers = new Map();
function startWebSocketConnection(server) {
    const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
    console.log("WebSocket server started");
    let playerBoards = {};
    io.on("connection", (socket) => {
        console.log("New connection:", socket.id);
        // get all lobbies
        socket.on("sendGetLobbies", (gameMode) => __awaiter(this, void 0, void 0, function* () {
            let lobbies = yield (0, DBService_1.getPublicOnlinematches)(gameMode);
            socket.emit("getLobbies", lobbies); // players, hostname
        }));
        // join a room/ lobby,
        socket.on("sendJoinRoom", (roomId, username) => __awaiter(this, void 0, void 0, function* () {
            socket.join(roomId);
            // an db senden wo und wer joined
            let lobby = yield (0, DBService_1.joinOnlineMatch)(roomId, username);
            console.log(`${username} joined room: ${roomId}`, lobby);
            io.to(roomId).emit("playerJoinedRoom", lobby); // players, hostname
        }));
        // erstellt Lobby ------- need to update this to send it back too all player in room and update it in db
        socket.on("sendHostLobby", (body) => __awaiter(this, void 0, void 0, function* () {
            socket.join(body.roomId);
            // in db lobby erstellen
            let lobby = yield (0, DBService_1.hostOnlineMatch)(body);
            console.log("created room", JSON.stringify(lobby));
            io.to(body.roomId).emit("createdRoom");
        }));
        socket.on("sendHostUpdatedLobby", (body, playerName) => __awaiter(this, void 0, void 0, function* () {
            // in db lobby updaten
            let lobby = yield (0, DBService_1.updateOnlineMatch)(body, playerName);
            io.to(body.roomId).emit("updatedLobby", body);
            if (playerName)
                io.to(body.roomId).emit("playerKicked", playerName);
        }));
        // Host sagt spieler sollen schiffe platzieren
        socket.on("sendStartShipPlacement", (roomId) => {
            io.to(roomId).emit("startShipPlacement");
        });
        socket.testee = null;
        socket.on("sendShipPlacement", (body, username, roomId, difficulty) => {
            // logger.info("Received ship placement: " + JSON.stringify(body));
            let fieldSize = 10;
            let arr = Array.from({ length: fieldSize }, () => Array(fieldSize).fill("."));
            let playerShips = [];
            for (const ship of body) {
                for (let i = 0; i < ship.length; i++) {
                    let x = ship.startX;
                    let y = ship.startY;
                    let id = ship.identifier;
                    arr[y][x] = id;
                    if (ship.direction == "Y") {
                        arr[y + i][x] = id;
                    }
                    else {
                        arr[y][x + i] = id;
                    }
                }
                let isHorizontal = ship.direction === "X" ? true : false;
                let position = { x: ship.startX, y: ship.startY };
                playerShips.push(new Ship_1.Ship(ship.identifier, isHorizontal, position, ship.length));
            }
            const playerBoard = new Board_1.Board(10, 6, username, arr, playerShips, roomId);
            logger_1.logger.info("player board created");
            if (difficulty && difficulty > -1) {
                // create ai GameController
                logger_1.logger.info("createt ai testee");
                const gameController = new GameController_Playtest_1.AiGameController(playerBoard, socket, username, difficulty, roomId);
                // in map speichern
                gameControllers.set(roomId, gameController);
                gameController.startGame();
                // noch gamestart emit machen damit man direkt gegen ki spielen kann
            }
            else {
                let playersReady = [];
                playerBoards[username] = playerBoard;
                for (const username in playerBoards) {
                    if (playerBoards.hasOwnProperty(username)) {
                        const board = playerBoards[username];
                        if (board.roomId === roomId) {
                            playersReady.push(board.boardOwner);
                        }
                    }
                }
                io.to(roomId).emit("playersReady", playersReady);
                allPlayersReady(io, roomId, playerBoards);
            }
        });
        socket.on("sendShot", (body) => {
            logger_1.logger.info("Received shot at: " + body.x + " " + body.y, " room: ", body.roomId);
            if (gameControllers.has(body.roomId)) {
                const gameController = gameControllers.get(body.roomId);
                gameController.shoot(body.username, { x: body.x, y: body.y });
            }
            else {
                logger_1.logger.error("testee is not an instance of GameController or AiGameController");
            }
        });
        socket.on("sendLeaveRoom", (roomId, privateMatch) => __awaiter(this, void 0, void 0, function* () {
            socket.leave(roomId);
            console.log(`Benutzer ${socket.id} hat den Raum ${roomId} verlassen.`);
            // Prüfen, ob der Raum leer ist
            const room = io.sockets.adapter.rooms.get(roomId);
            if (!room || room.size === 0) {
                // Raum existiert nicht mehr oder ist leer
                gameControllers.delete(roomId);
                yield (0, DBService_1.deleteOnlineMatch)(roomId);
                console.log(`Raum ${roomId} und zugehöriger GameController gelöscht.`);
            }
        }));
        socket.on("sendCloseAllRooms", () => __awaiter(this, void 0, void 0, function* () {
            yield (0, DBService_1.deleteEntriesFromCollection)("PublicOnlinematches");
            yield (0, DBService_1.deleteEntriesFromCollection)("PrivateOnlinematches");
        }));
        // get the number of people in one room
        function updateRoomCount(room) {
            var _a;
            const roomCount = ((_a = io.sockets.adapter.rooms.get(room)) === null || _a === void 0 ? void 0 : _a.size) || 0;
            io.to(room).emit("roomCount", roomCount);
            return roomCount;
        }
        // check if all players are ready
        function allPlayersReady(io, roomId, playerBoards) {
            let count = Object.keys(playerBoards).length;
            if (count === 2) {
                const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
                if (!socketsInRoom || socketsInRoom.size !== 2) {
                    console.log(`Not enough players ready in room ${roomId}`);
                    return;
                }
                const boardsWithRoomId = [];
                for (const username in playerBoards) {
                    if (playerBoards.hasOwnProperty(username)) {
                        const board = playerBoards[username];
                        if (board.roomId === roomId) {
                            boardsWithRoomId.push(board);
                        }
                    }
                }
                let num = Math.random() < 0.5 ? 0 : 1;
                // gamecontroller erstellen
                const gameController = new GameController_Multiplayer_1.GameController(boardsWithRoomId, io, roomId, boardsWithRoomId[num].boardOwner);
                // in map speichern
                gameControllers.set(roomId, gameController);
                gameController.startGame();
                // socket.testee = n;
                // socket.testee.startGame();
                console.log(`Game started in room ${roomId}`);
            }
        }
    });
}
//# sourceMappingURL=websockets.js.map