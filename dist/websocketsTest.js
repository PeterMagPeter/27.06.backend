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
// istanbul ignore file
const socket_io_1 = require("socket.io");
const GameController_Multiplayer_1 = require("./gamelogic/GameController_Multiplayer");
const GameController_Playtest_1 = require("./gamelogic/GameController_Playtest");
const GameController_Team_1 = require("./gamelogic/GameController_Team");
const logger_1 = require("./logger");
const DBService_1 = require("./services/DBService");
const Resources_1 = require("./Resources");
const BoardTest_1 = require("./gamelogic/BoardTest");
const gameControllers = new Map();
const readyCounters = new Map();
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
            io.to(roomId).emit("playerJoinedRoom", lobby, username); // players, hostname
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
            let updatedLobby = yield (0, DBService_1.updateOnlineMatch)(body, playerName);
            if (updatedLobby) {
                io.to(body.roomId).emit("updatedLobby", body);
                if (playerName) {
                    io.to(body.roomId).emit("playerKicked", playerName);
                }
            }
        }));
        // player changed team
        socket.on("sendPlayerChangedTeam", (roomId, username, team) => {
            // WRITE INTO DB
            io.to(roomId).emit("playerChangedTeam", username, team);
        });
        // players send their ships to each other
        socket.on("sendPartnerChangedShips", (roomId, ships, username, team) => {
            // WRITE INTO DB
            io.to(roomId).emit("partnerChangedShips", ships, username, team);
        });
        // player changed mine placement
        socket.on("sendPartnerChangedMines", (roomId, ships, username, team) => {
            // WRITE INTO DB
            io.to(roomId).emit("partnerChangedMines", ships, username, team);
        });
        // Host sagt spieler sollen schiffe platzieren - ohne superwaffen
        socket.on("sendStartShipPlacement", (roomId, playersInTeam) => {
            console.log("sendStartShipPlacement", playersInTeam);
            io.to(roomId).emit("startShipPlacement", playersInTeam);
        });
        // Host sagt spieler sollen schiffe platzieren - mit superwaffen
        socket.on("sendStartMinePlacement", (roomId, playersInTeam) => {
            console.log("sendStartMinePlacement", playersInTeam);
            readyCounters.set(roomId, 0);
            io.to(roomId).emit("startMinePlacement", playersInTeam);
        });
        //  player setzt alle minen
        socket.on("sendMinePlacement", (roomId, playersInTeam, maxPlayers, mines) => {
            let count = 0;
            count = readyCounters.get(roomId);
            console.log("count gibts", count, maxPlayers);
            count++;
            readyCounters.set(roomId, count);
            console.log("sendMinePlacement", mines, count, maxPlayers);
            io.to(roomId).emit("minePlacementReady", count);
            if (count === maxPlayers) {
                console.log("send to room");
                io.to(roomId).emit("startShipPlacement", playersInTeam, mines);
            }
        });
        socket.testee = null;
        socket.on("sendShipPlacement", (body, //ships
        username, roomId, cols, rows, gameMode, maxPlayers, playersInTeam, difficulty, mines) => {
            // logger.info("Received ship placement: " + JSON.stringify(body));
            /* let arr: string[][] = Array.from({ length: rows }, () =>
              Array(cols).fill(".")
            );
            let playerShips: Ship[] = [];
            for (const ship of body) {
              for (let i = 0; i < ship.length; i++) {
                let x = ship.startX;
                let y = ship.startY;
                let id = ship.identifier;
                arr[y][x] = id;
                if (ship.direction == "Y") {
                  arr[y + i][x] = id;
                } else {
                  arr[y][x + i] = id;
                }
              }
              let isHorizontal = ship.direction === "X" ? true : false;
              let position: Position = { x: ship.startX, y: ship.startY };
              playerShips.push(
                new Ship(ship.identifier, isHorizontal, position, ship.length)
              );
            } */
            const playerBoard = new BoardTest_1.BoardTest(rows, cols, body.length, username, 
            /* arr,
            playerShips, */
            body, roomId, mines);
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
                allPlayersReady(io, roomId, playerBoards, gameMode, maxPlayers, playersInTeam);
            }
        });
        socket.on(
        // send selected shot to other players
        "sendDetonateMines", (roomId, username) => {
            console.log("sendDetonateMines");
            if (gameControllers.has(roomId)) {
                const gameController = gameControllers.get(roomId);
                gameController.detonateMines(username);
                console.log("wurde ausgeführt bumm");
            }
        });
        socket.on(
        // send selected shot to other players
        "sendDetonateTorpedo", (roomId, username, startPosition, horizontal) => {
            console.log("sendDetonateTorpedo");
            if (gameControllers.has(roomId)) {
                const gameController = gameControllers.get(roomId);
                gameController.detonateTorpedo(username, startPosition, horizontal);
            }
        });
        socket.on(
        // send selected shot to other players
        "sendDetonateDrone", (roomId, username, startPosition) => {
            console.log("sendDetonateDrone");
            if (gameControllers.has(roomId)) {
                const gameController = gameControllers.get(roomId);
                gameController.detonateDrone(username, startPosition);
            }
        });
        socket.on(
        // send selected shot to other players
        "sendShotSelected", (position, username, roomId) => {
            io.to(roomId).emit("shotSelected", position, username);
        });
        // when you hit send shot Button
        socket.on("sendShotReady", (body) => {
            logger_1.logger.info("Received shot Ready at: " + body.x + " " + body.y, " from ", body.username, " room: ", body.roomId);
            if (gameControllers.has(body.roomId)) {
                const gameController = gameControllers.get(body.roomId);
                let position = { x: body.x, y: body.y };
                let count = gameController.shotsReady(body.username, position);
                io.to(body.roomId).emit("shotsReady", count); // send number to players
            }
        });
        // 1vs1 function
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
        // sollte im besten fall nach tab schließen etc. ausgeführt werden
        socket.on("sendCustomDisconnect", (roomId, username) => {
            console.log("customDisconnect", roomId, username);
            io.to(roomId).emit("customDisconnect", username);
        });
        // wird immer ausgeführt
        socket.on("disconnect", (reason) => {
            console.log(`Disconnected from server: ${reason}`);
        });
        // get the number of people in one room
        function updateRoomCount(room) {
            var _a;
            const roomCount = ((_a = io.sockets.adapter.rooms.get(room)) === null || _a === void 0 ? void 0 : _a.size) || 0;
            io.to(room).emit("roomCount", roomCount);
            return roomCount;
        }
        // check if all players are ready
        function allPlayersReady(io, roomId, playerBoards, gameMode, maxPlayers, playersInTeamObj) {
            let count = Object.keys(playerBoards).length;
            const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
            console.log(socketsInRoom === null || socketsInRoom === void 0 ? void 0 : socketsInRoom.size, playersInTeamObj);
            if (!socketsInRoom ||
                socketsInRoom.size !== maxPlayers ||
                count < maxPlayers) {
                console.log(`socketsInRoom - Not enough players ready in room ${roomId}`);
                return;
            }
            if (maxPlayers === 2) {
                // 1vs1 Mode
                const boardsWithRoomId = Object.values(playerBoards).filter(board => board.roomId === roomId);
                let num = Math.random() < 0.5 ? 0 : 1;
                const gameController = new GameController_Multiplayer_1.GameController(boardsWithRoomId, io, roomId, boardsWithRoomId[num].boardOwner);
                gameControllers.set(roomId, gameController);
                gameController.startGame();
                console.log(`Game started in room ${roomId}`);
            }
            else if (maxPlayers > 2 && gameMode === "Team" && playersInTeamObj) {
                // Team Mode
                let playersInTeam = new Map(Object.entries(playersInTeamObj));
                console.log("in function", playersInTeam);
                const team1Boards = [];
                const team2Boards = [];
                const team1Names = [];
                const team2Names = [];
                for (const username in playerBoards) {
                    if (playerBoards.hasOwnProperty(username)) {
                        const board = playerBoards[username];
                        const team = playersInTeam.get(username);
                        if (board.roomId === roomId) {
                            if (team === 1) {
                                team1Boards.push(board);
                                team1Names.push(board.boardOwner);
                            }
                            else if (team === 2) {
                                team2Boards.push(board);
                                team2Names.push(board.boardOwner);
                            }
                        }
                    }
                }
                const combinedTeam1Ships = team1Boards.flatMap(board => board.shipArray);
                const combinedTeam2Ships = team2Boards.flatMap(board => board.shipArray);
                const combinedTeam1Mines = team1Boards.flatMap(board => board.mines);
                const combinedTeam2Mines = team2Boards.flatMap(board => board.mines);
                const team1Board = new BoardTest_1.BoardTest(team1Boards[0].rows, team1Boards[0].cols, combinedTeam1Ships.length, Resources_1.Team1Name, combinedTeam1Ships.map(ship => ({
                    identifier: ship.identifier,
                    direction: ship.isHorizontal ? "X" : "Y",
                    startX: ship.startPosition.x,
                    startY: ship.startPosition.y,
                    length: ship.length
                })), roomId, combinedTeam1Mines);
                const team2Board = new BoardTest_1.BoardTest(team2Boards[0].rows, team2Boards[0].cols, combinedTeam2Ships.length, Resources_1.Team2Name, combinedTeam2Ships.map(ship => ({
                    identifier: ship.identifier,
                    direction: ship.isHorizontal ? "X" : "Y",
                    startX: ship.startPosition.x,
                    startY: ship.startPosition.y,
                    length: ship.length
                })), roomId, combinedTeam2Mines);
                const boardsWithRoomId = [team1Board, team2Board];
                let num = Math.random() < 0.5 ? 0 : 1;
                const gameController = new GameController_Team_1.TeamGameController(boardsWithRoomId, io, roomId, boardsWithRoomId[num].boardOwner, maxPlayers, gameMode, team1Names, team2Names);
                gameControllers.set(roomId, gameController);
                gameController.startGame(combinedTeam1Ships, combinedTeam2Ships);
                console.log(`Game started in room ${roomId}`);
            }
        }
    });
}
//# sourceMappingURL=websocketsTest.js.map