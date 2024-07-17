"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ai_Playtest = void 0;
const Board_1 = require("./Board");
const logger_1 = require("../logger");
const Ship_1 = require("./Ship");
const fs = __importStar(require("fs"));
class Ai_Playtest {
    constructor(playerBoard, difficulty) {
        this.presetBoards = [
            [
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", "2a", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", "2a", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                ["3a", "3a", "3a", ".", ".", "2b", "2b", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                ["3b", "3b", "3b", ".", ".", "5", "5", "5", "5", "5"],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", "4", "4", "4", "4", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
            ],
            [
                [".", ".", ".", "5", "5", "5", "5", "5", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", "2a", "."],
                [".", ".", ".", "3a", "3a", "3a", ".", ".", "2a", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", "2b", "2b"],
                [".", ".", ".", "3b", "3b", "3b", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", "4", "4", "4", "4", ".", ".", "."],
            ],
            [
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "3a"],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "3a"],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "3a"],
                [".", ".", "4", ".", ".", "2a", "2a", ".", ".", "."],
                [".", ".", "4", ".", ".", ".", ".", ".", ".", "5"],
                [".", ".", "4", ".", ".", ".", ".", ".", "2b", "5"],
                [".", ".", "4", ".", ".", ".", ".", ".", "2b", "5"],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "5"],
                [".", ".", ".", "3b", "3b", "3b", ".", ".", ".", "5"],
            ],
            [
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", "5", "5", "5", "5", "5", ".", ".", "2a"],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "2a"],
                [".", ".", ".", ".", "3a", "3a", "3a", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", "4", "4", "4", "4", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", "3b", "3b", "3b"],
                [".", ".", "2b", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", "2b", ".", ".", ".", ".", ".", ".", "."],
            ],
            [
                ["4", "4", "4", "4", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                ["3a", "3a", "3a", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", "2a", "2a"],
                ["3b", "3b", "3b", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", "2b", ".", ".", ".", "5", "."],
                [".", ".", ".", ".", "2b", ".", ".", ".", "5", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", "5", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", "5", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", "5", "."],
            ],
            [
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", "3a", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", "3a", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", "3a", ".", ".", ".", ".", ".", "2a", "2a", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", "3b", "3b", "3b", ".", "."],
                [".", ".", "2b", ".", ".", ".", ".", ".", ".", "4"],
                [".", ".", "2b", ".", ".", ".", ".", ".", ".", "4"],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "4"],
                [".", ".", ".", "5", "5", "5", "5", "5", ".", "4"],
            ],
            [
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                ["3a", ".", ".", ".", "4", "4", "4", "4", ".", "."],
                ["3a", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                ["3a", ".", ".", ".", ".", ".", ".", "3b", "3b", "3b"],
                [".", ".", "2a", "2a", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", "2b", "2b", ".", ".", "5", "5", "5", "5", "5"],
            ],
            [
                [".", "5", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", "5", ".", "3a", "3a", "3a", ".", ".", ".", "."],
                [".", "5", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", "5", ".", ".", ".", ".", ".", "4", ".", "."],
                [".", "5", ".", ".", "2a", "2a", ".", "4", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", "4", ".", "."],
                [".", "3b", ".", ".", ".", ".", ".", "4", ".", "."],
                [".", "3b", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", "3b", ".", ".", ".", "2b", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", "2b", ".", ".", ".", "."],
            ],
            [
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", "4", "4", "4", "4", ".", "2a", "2a"],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", "2b", ".", ".", "5", "5", "5", "5", "5", "."],
                [".", "2b", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", "3a", "3a", "3a", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", "3b", "3b", "3b", ".", ".", ".", "."],
            ],
            [
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", "2a", "2a", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "2b"],
                [".", ".", ".", ".", ".", "3a", ".", ".", ".", "2b"],
                [".", "3b", "3b", "3b", ".", "3a", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", "3a", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                ["5", "5", "5", "5", "5", ".", "4", "4", "4", "4"],
            ],
        ];
        this.identifier = [];
        this.identifierCopy = [];
        this.playerShipPositions = [];
        this.focusedShip = [];
        this.emtpyPositions = [];
        this.testArray = Array.from({ length: 10 }, () => Array(10).fill(0));
        this.playerBoard = playerBoard;
        this.aiBoard = new Board_1.Board(10, 6, "Ai", this.initializeBoard());
        //this.aiBoard = new Board(10, 6, "ai", this.getPreset());
        difficulty ? (this.difficulty = difficulty) : (this.difficulty = undefined);
        playerBoard.identifier.forEach((val) => this.identifier.push(val));
        playerBoard.identifier.forEach((val) => this.identifierCopy.push(val));
        this.ships = new Map();
        // AI-Feature: Add all ship positions into ships map
        playerBoard.ships.forEach((ship) => {
            this.ships.set(ship.identifier, ship);
            ship.initialPositions.forEach((shipPosition) => {
                this.playerShipPositions.push(shipPosition);
            });
        });
        this.ShipPositionsFillUp(this.playerShipPositions);
        /* if (difficulty == "God") {
          this.probability = 0.9;
          this.aiGod(this.probability);
        } else if (difficulty == "Normal") {
          this.probability = 0.6;
          this.aiGod(this.probability);
        } else if (difficulty == "Easy") {
          this.probability = 0.3;
          this.aiGod(this.probability);
        } else {
          this.probability = 0;
        } */
    }
    // Difficulty god-mode. If set, the AI has a statistical hit rate of at least 50 %
    aiGod(probability) {
        let hit = Math.random() > 0.7;
        logger_1.logger.debug(hit + " " + " aiGod---------");
        // for (let i = 0; i < this.testArray.length; i++) {
        //     for (let k = 0; k < this.testArray.length; k++) {
        //         if (this.testArray[i][k] !== 1) {
        //             this.testArray[i][k] = 1
        //             return { x: k, y: i, hit: k%2 ==0? true:false }
        //         }
        //     }
        // }
        if (this.focusedShip.length > 0) {
            // Prepare shot and return result
            let shotCoordinate = this.focusedShip[0];
            let checkHitResult = this.playerBoard.checkHit(shotCoordinate, "Ai");
            this.removeSpecificPos(this.focusedShip, shotCoordinate);
            this.removeSpecificPos(this.playerShipPositions, shotCoordinate);
            return checkHitResult;
        }
        if (!hit) {
            let coord = this.getRandomPosition(this.emtpyPositions);
            this.removeSpecificPos(this.emtpyPositions, coord);
            let result = { x: coord.x, y: coord.y, hit: false };
            return result;
        }
        else {
            // Get random ship
            let identifier = this.getRandomIdentifier(this.identifier);
            let ship = this.ships.get(identifier);
            //    bis hier hin gehts ----------------------------------
            // Save all ship positions
            logger_1.logger.debug(JSON.stringify("ship.initialPositions: " + ship.initialPositions));
            for (let pos of ship.initialPositions) {
                this.focusedShip.push(pos);
            }
            // ship.initialPositions.forEach((coords: any) => {
            //   this.focusedShip.push(coords);
            // });
            // Remove identifier from array
            //this.removePickedIdentifier(this.identifierCopy, ship.identifier);
            // Prepare shot and return result
            let shotCoordinate = this.focusedShip[0];
            // CHECK IF THE PLAYERBOARD HAS THE VALUE WE EXPECT FROM focusedShipCoords' STATE
            // if(this.playerboard[shotCoordinate.y][shotCoordinate.x]!=="?")
            let checkHitResult = this.playerBoard.checkHit(shotCoordinate, "Ai");
            this.removeSpecificPos(this.focusedShip, shotCoordinate);
            this.removeSpecificPos(this.playerShipPositions, shotCoordinate);
            this.removePickedIdentifier(this.identifier, identifier);
            return checkHitResult;
        }
    }
    aiTest(probability) {
        let math = Math.random();
        let result = math > probability;
        let rX = Math.floor(Math.random() * 10);
        let rY = Math.floor(Math.random() * 10);
        if (result) {
            while (this.playerBoard.playfield[rY][rX] === "X" ||
                this.playerBoard.playfield[rY][rX] === "O" ||
                this.playerBoard.playfield[rY][rX] === ".") {
                rX = Math.floor(Math.random() * 10);
                rY = Math.floor(Math.random() * 10);
            }
            let shotCoordinate = { x: rX, y: rY };
            let checkHitResult = this.playerBoard.checkHit(shotCoordinate, "Ai");
            return checkHitResult;
        }
        while (this.playerBoard.playfield[rY][rX] === ".") {
            rX = Math.floor(Math.random() * 10);
            rY = Math.floor(Math.random() * 10);
        }
        let shotCoordinate = { x: rX, y: rY };
        let checkHitResult = this.playerBoard.checkHit(shotCoordinate, "Ai");
        return checkHitResult;
    }
    /**
     * Difficulty middle. If set, AI knows the ship positions, but a randomizer is used to
     * randomly pic coordinates from a list of the enemies ship coordinates and some unused coordinates.
     * If a randomly picked coordinate is a hit, the AI tries to test the coordinates around that hit
     * systematically until the ship is sunk.
     */
    aiNormal(probability) {
        let hit = Math.random() < probability;
        if (this.focusedShip.length > 0) {
            // Prepare shot and return result
            let shotCoordinate = this.focusedShip[0];
            let checkHitResult = this.playerBoard.checkHit(shotCoordinate, "Ai");
            this.removeSpecificPos(this.focusedShip, shotCoordinate);
            return checkHitResult;
        }
        if (!hit) {
            let coord = this.getRandomPosition(this.emtpyPositions);
            const posBackup = coord;
            this.removeSpecificPos(this.emtpyPositions, coord);
            return { x: posBackup.x, y: posBackup.y, hit: false };
        }
        else {
            // Get random ship
            let ship = this.ships.get(this.getRandomIdentifier(this.identifierCopy));
            // Save all ship positions
            ship.initialPositions.forEach((coords) => {
                this.focusedShip.push(coords);
            });
            // Remove identifier from array
            this.removePickedIdentifier(this.identifierCopy, ship.identifier);
            // Prepare shot and return result
            let shotCoordinate = this.focusedShip[0];
            let checkHitResult = this.playerBoard.checkHit(shotCoordinate, "Ai");
            this.removeSpecificPos(this.focusedShip, shotCoordinate);
            return checkHitResult;
        }
    }
    /**
     * Difficulty easy. If set, AI knows the ship positions, but a randomizer is used to
     * randomly pic coordinates from a list of the enemies ship coordinates and many unused coordinates.
     * If a randomly picked coordinate is a hit, the AI tries to test the coordinates around that hit
     * systematically until the ship is sunk.
     */
    aiEasy(probability) {
        let hit = Math.random() < probability;
        if (this.focusedShip.length > 0) {
            // Prepare shot and return result
            let shotCoordinate = this.focusedShip[0];
            let checkHitResult = this.playerBoard.checkHit(shotCoordinate, "Ai");
            this.removeSpecificPos(this.focusedShip, shotCoordinate);
            return checkHitResult;
        }
        if (!hit) {
            let coord = this.getRandomPosition(this.emtpyPositions);
            const posBackup = coord;
            this.removeSpecificPos(this.emtpyPositions, coord);
            return { x: posBackup.x, y: posBackup.y, hit: false };
        }
        else {
            // Get random ship
            let ship = this.ships.get(this.getRandomIdentifier(this.identifier));
            // Save all ship positions
            ship.initialPositions.forEach((coords) => {
                this.focusedShip.push(coords);
            });
            // Remove identifier from array
            this.removePickedIdentifier(this.identifier, ship.identifier);
            // Prepare shot and return result
            let shotCoordinate = this.focusedShip[0];
            let checkHitResult = this.playerBoard.checkHit(shotCoordinate, "Ai");
            this.removeSpecificPos(this.focusedShip, shotCoordinate);
            return checkHitResult;
        }
    }
    getPreset() {
        const index = Math.floor(Math.random() * this.presetBoards.length);
        return this.presetBoards[index];
    }
    initializeBoard() {
        const playfield = this.generateEmtpyPlayfield();
        const ships = this.generateShips();
        for (const ship of ships) {
            this.placeShip(playfield, ship);
        }
        return playfield;
        // this.writeBoardToFile(board);
    }
    // To fill list with random coordinates, depending on the set difficulty
    aiRandomizedPositionFills() {
        const randomX = Math.floor(Math.random() * 10);
        const randomY = Math.floor(Math.random() * 10);
        return { x: randomX, y: randomY };
    }
    // Pick a random coordinate from list
    getRandomPosition(arr) {
        let randomPositionPick = arr[Math.floor(Math.random() * arr.length)];
        return randomPositionPick;
    }
    // Pick random identifier
    getRandomIdentifier(arr) {
        let identifier = arr[Math.floor(Math.random() * arr.length)];
        return identifier;
    }
    // Delete picked identifier
    removePickedIdentifier(arr, idToDelete) {
        // arr = arr.filter(id => {
        //     (id !== idToDelete);
        // });
        let index = arr.findIndex((id) => {
            return id === idToDelete;
        });
        if (index !== -1) {
            arr.splice(index, 1);
        }
    }
    // Remove a specific position
    removeSpecificPos(arr, coordToDel) {
        // arr = arr.filter(coord => {
        //     (coord.x !== coordToDel.x && coord.y !== coordToDel.y);
        // });
        logger_1.logger.debug("removeSpecificPos arr: " +
            JSON.stringify(arr) +
            " coordToDel" +
            JSON.stringify(coordToDel));
        let index = arr.findIndex((coord) => {
            return coord.x === coordToDel.x && coord.y === coordToDel.y;
        });
        logger_1.logger.debug(index + " index");
        if (index !== -1) {
            logger_1.logger.debug("index !== -1");
            arr.splice(index, 1);
        }
        logger_1.logger.debug("------end removeSpecificPos------------");
    }
    // Remove all coords of a ship from an array
    removeAllCoordsFromShipInArr(arr, ship) {
        ship.initialPositions.forEach((pos) => {
            let index = arr.findIndex((coord) => {
                return pos.x === coord.x && pos.y === coord.y;
            });
            if (index !== -1) {
                arr.splice(index, 1);
            }
        });
    }
    // Choose how to fill playerShipPositions array
    ShipPositionsFillUp(arr) {
        this.emtpyPositions = this.getAllEmtpyFields(arr);
    }
    // Remove all coords of all ships from array
    getAllEmtpyFields(arr) {
        // Copy all ship val
        let arrWithEmtpyCoords = [];
        // Create 81 emtpy coords
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                let coord = { x: x, y: y };
                if (!arr.includes(coord)) {
                    arrWithEmtpyCoords.push(coord);
                }
            }
        }
        return arrWithEmtpyCoords;
    }
    //-----------------Random Shiffsplatzierung-----------------
    generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    isValidPlacement(board, ship) {
        const { x, y } = ship.startPosition;
        // Überprüfen, ob das Schiff innerhalb der Grenzen des Spielfelds liegt
        if (ship.isHorizontal) {
            if (x + ship.length > 9) {
                return false;
            }
        }
        else {
            if (y + ship.length > 9) {
                return false;
            }
        }
        // Überprüfen der umliegenden Felder für den Mindestabstand von 1 Feld
        for (let i = 0; i < ship.length; i++) {
            let shipX = x;
            let shipY = y;
            if (ship.isHorizontal) {
                shipX += i;
            }
            else {
                shipY += i;
            }
            // Überprüfen, ob das aktuelle Feld belegt ist
            if (board[shipY][shipX] === "X") {
                return false;
            }
            // Überprüfen der umliegenden Felder
            for (let deltaY = -1; deltaY <= 1; deltaY++) {
                for (let deltaX = -1; deltaX <= 1; deltaX++) {
                    const checkX = shipX + deltaX;
                    const checkY = shipY + deltaY;
                    // Sicherstellen, dass die zu überprüfenden Felder innerhalb der Spielfeldgrenzen liegen
                    if (checkX >= 0 && checkX < 10 && checkY >= 0 && checkY < 10) {
                        if (board[checkY][checkX] === "X") {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    placeShip(board, ship) {
        let isPlaced = false;
        while (!isPlaced) {
            ship.startPosition.x = this.generateRandomNumber(0, 9);
            ship.startPosition.y = this.generateRandomNumber(0, 9);
            ship.isHorizontal = Math.random() < 0.5;
            if (this.isValidPlacement(board, ship)) {
                for (let i = 0; i < ship.length; i++) {
                    if (ship.isHorizontal) {
                        board[ship.startPosition.y][ship.startPosition.x + i] =
                            ship.identifier;
                    }
                    else {
                        board[ship.startPosition.y + i][ship.startPosition.x] =
                            ship.identifier;
                    }
                }
                isPlaced = true;
            }
        }
        return isPlaced;
    }
    generateEmtpyPlayfield() {
        const playfield = [];
        for (let i = 0; i < 10; i++) {
            playfield.push(Array(10).fill("."));
        }
        return playfield;
    }
    generateShips() {
        const ships = [];
        let id = "";
        let placeholderPos = { x: -1, y: -1 };
        for (let i = 0; i < 2; i++) {
            if (i == 0) {
                id = "2a";
            }
            else {
                id = "2b";
            }
            ships.push(new Ship_1.Ship(id, false, placeholderPos, 2));
        }
        for (let i = 0; i < 2; i++) {
            if (i == 0) {
                id = "3a";
            }
            else {
                id = "3b";
            }
            ships.push(new Ship_1.Ship(id, false, placeholderPos, 3));
        }
        ships.push(new Ship_1.Ship("4", false, placeholderPos, 4));
        ships.push(new Ship_1.Ship("5", false, placeholderPos, 5));
        return ships;
    }
    writeBoardToFile(board) {
        const rows = board.length;
        const cols = board[0].length;
        // Array in eine Textdarstellung umwandeln
        let boardText = "";
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                boardText += board[i][j] + " ";
            }
            boardText = boardText.trim(); // Entfernen des letzten Leerzeichens in der Zeile
            boardText += "\n"; // Neue Zeile
        }
        // Schreiben der Textdarstellung in eine Datei
        fs.writeFileSync("boards.txt", boardText, "utf8");
    }
}
exports.Ai_Playtest = Ai_Playtest;
//# sourceMappingURL=Ai_Playtest.js.map