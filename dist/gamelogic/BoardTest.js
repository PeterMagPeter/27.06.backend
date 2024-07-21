"use strict";
// istanbul ignore file
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardTest = void 0;
exports.signalSinking = signalSinking;
exports.signalGameEnd = signalGameEnd;
const logger_1 = require("../logger");
const Ship_1 = require("./Ship");
// other identifiers:
// "O" = MISS; "." = NOTHING; "X" = HIT; "D" = DESTROYED
class BoardTest {
    constructor(rows, cols, shipQuantity, boardOwner, 
    // playfield: string[][], // spielfeld mit . und identifier der Schiffe
    // ships: Ship[], // die Schiffe die der boardOwner gesetzt hat
    body, roomId, mines) {
        this.ships = new Map(); // own ships
        this.playfield = []; // 2d array from playfield with X, O, . , and identifiers
        this.shipArray = [];
        this.body = [];
        // this.ships = new Map<string, Ship>();
        // logger.info("constructor ships " + JSON.stringify(ships));
        this.initializePlayfield();
        this.addShips(this.shipArray);
        // this.shipArray = [...ships];
        this.rows = rows;
        this.cols = cols;
        this.identifier = ["2a", "2b", "3a", "3b", "4", "5"];
        this.sunkCounter = 0;
        this.shipQuantity = shipQuantity;
        this.mines = [];
        this.boardOwner = boardOwner;
        this.roomId = roomId;
        // this.playfield = playfield;
        this.body = body;
        if (mines) {
            this.mines = mines;
        }
        // for (let i = 0; i < playfield.length; i++) logger.debug(this.playfield[i]);
        logger_1.logger.debug("------------" + boardOwner + "-------------");
    }
    // shooterName <==> winner's name
    checkHit(shotPosition, shooterName) {
        let elementAt = this.playfield[shotPosition.y][shotPosition.x];
        logger_1.logger.debug("- checkHit: elementAt" + elementAt);
        if (elementAt === "." || elementAt === "O") {
            this.playfield[shotPosition.y][shotPosition.x] = "O";
            return { x: shotPosition.x, y: shotPosition.y, hit: false };
        }
        else if (elementAt === "X") {
            let test = { Fehler: "auf bestehenden Hit/ Miss geclickt" };
            logger_1.logger.error(JSON.stringify(test) + " elementAT " + elementAt),
                shotPosition;
            return { x: shotPosition.x, y: shotPosition.y, hit: true };
        }
        else {
            let test = { test: "stinkt dieser Tag" }; // DAS WIRD
            // elemtAt ist "X" oder "O"
            const ship = this.ships.get(elementAt);
            logger_1.logger.debug("- checkHit: ship " + JSON.stringify(this.ships));
            // -------------- ship ist NUR bei player undefined----------------------
            ship === null || ship === void 0 ? void 0 : ship.setHit(shotPosition);
            this.playfield[shotPosition.y][shotPosition.x] = "X";
            if (ship === null || ship === void 0 ? void 0 : ship.getIsSunk()) {
                this.sunkCounter++;
                if (this.sunkCounter == this.shipQuantity) {
                    test = signalGameEnd(shooterName);
                    return test;
                }
                else {
                    test = signalSinking(ship);
                    return test;
                }
            }
            test = { x: shotPosition.x, y: shotPosition.y, hit: true };
            //   let iwas: any = this.identifier.forEach((id) => {
            //     if (elementAt == id) {
            //       logger.debug(elementAt + " e : id " + id);
            //       const ship = this.ships.get(id);
            //       logger.debug(JSON.stringify(ship) + " ship");
            //       logger.debug(ship?.setHit(shotPosition) + " ship set hit");
            //       // ship?.setHit(shotPosition);
            //       this.playfield[shotPosition.y][shotPosition.x] = "X";
            //       if (ship?.getIsSunk()) {
            //         logger.debug(" in imSunk ");
            //         //this.sunkCounter++;
            //         if (this.sunkCounter == this.shipQuantity) {
            //           test = signalGameEnd(shooterName);
            //           return test;
            //         } else {
            //           test = signalSinking(ship);
            //           return test;
            //         }
            //       }
            //       test = { x: shotPosition.x, y: shotPosition.y, hit: true };
            //       logger.debug(test + " hit");
            //       return test;
            //     }
            //   });
            logger_1.logger.debug(JSON.stringify(test) + " checkhit ende---------------------");
            return test;
        }
    }
    teamCheckHit(shotPosition) {
        let elementAt = this.playfield[shotPosition.y][shotPosition.x];
        logger_1.logger.debug("- teamCheckHit: elementAt " + elementAt);
        if (elementAt === "." || elementAt === "O") {
            let minHit = {
                x: shotPosition.x,
                y: shotPosition.y,
                hit: false,
            };
            return minHit;
        }
        return "Hit";
    }
    droneCheckHit(shotPosition) {
        let elementAt = this.playfield[shotPosition.y][shotPosition.x];
        logger_1.logger.debug("- droneCheckHit: elementAt " + elementAt);
        let miniHit = null;
        if (!(shotPosition.x >= 0 &&
            shotPosition.x < this.rows &&
            shotPosition.y >= 0 &&
            shotPosition.y < this.cols)) {
            return miniHit;
        }
        if (elementAt === "." || elementAt === "O") {
            miniHit = {
                x: shotPosition.x,
                y: shotPosition.y,
                hit: false,
            };
        }
        else {
            miniHit = {
                x: shotPosition.x,
                y: shotPosition.y,
                hit: true,
            };
        }
        return miniHit;
    }
    // setShipPositions() {
    //   this.ships.forEach((ship) => {
    //     ship.initialPositions.forEach((position) => {
    //       this.playfield[position.x][position.y] = ship.identifier;
    //     });
    //   });
    //   for (let i = 0; i < this.ships.size; i++) logger.debug(this.playfield[i]);
    //   logger.debug("------------" + this.ships + "-------------");
    // }
    addShips(ships) {
        for (let ship of ships) {
            this.ships.set(ship.identifier, ship);
            // logger.debug(JSON.stringify(ship.identifier));
        }
        // logger.debug("-----adships-------");
    }
    addMines(mines) {
        this.mines = mines;
    }
    initializePlayfield() {
        let arr = Array.from({ length: this.rows }, () => Array(this.cols).fill("."));
        let playerShips = [];
        for (const ship of this.body) {
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
            this.shipArray.push(new Ship_1.Ship(ship.identifier, isHorizontal, position, ship.length));
        }
        this.playfield = arr;
    }
}
exports.BoardTest = BoardTest;
function signalSinking(ship) {
    return ship;
}
function signalGameEnd(winner) {
    return winner;
}
//# sourceMappingURL=BoardTest.js.map