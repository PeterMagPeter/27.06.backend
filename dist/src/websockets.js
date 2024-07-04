"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebSocketConnection = void 0;
const socket_io_1 = require("socket.io");
const GameController_Playtest_1 = require("./gamelogic/GameController_Playtest");
const Board_1 = require("./gamelogic/Board");
const Ship_1 = require("./gamelogic/Ship");
const logger_1 = require("./logger");
function startWebSocketConnection(server) {
    const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
    console.log("WebSocket server started");
    io.on("connection", (socket) => {
        console.log("New connection:", socket.id);
        let testee = null;
        socket.on("sendShipPlacement", (body, username, difficulty) => {
            logger_1.logger.info("Received ship placement: " + JSON.stringify(body));
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
            const playerBoard = new Board_1.Board(10, 6, username, arr, playerShips);
            logger_1.logger.info("player board created");
            // playerBoard.addShips(playerShips);
            //   playerBoard.setShipPositions();
            // let aiBoard: Ai_Playtest = new Ai_Playtest(playerBoard);
            testee = new GameController_Playtest_1.GameController(playerBoard, 
            // aiBoard.aiBoard,
            socket, "Player", difficulty);
            //   testee.addPlayerBoard(playerBoard);
        });
        socket.on("sendShot", (body) => {
            logger_1.logger.info("Received shot at: " + body.x + " " + body.y);
            //   schussposition und WER schießt
            let pos = { x: body.x, y: body.y };
            testee.shoot(body.username, pos);
        });
    });
}
exports.startWebSocketConnection = startWebSocketConnection;
//# sourceMappingURL=websockets.js.map