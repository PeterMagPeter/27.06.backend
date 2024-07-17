"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalGameEnd = exports.signalSinking = exports.Board = void 0;
const logger_1 = require("../logger");
// other identifiers:
// "O" = MISS; "." = NOTHING; "X" = HIT; "D" = DESTROYED
class Board {
    constructor(rows, cols, shipQuantity, boardOwner, playfield, // spielfeld mit . und identifier der Schiffe
    ships, // die Schiffe die der boardOwner gesetzt hat
    roomId, mines) {
        this.ships = new Map(); // own ships
        this.shipArray = [];
        // this.ships = new Map<string, Ship>();
        // logger.info("constructor ships " + JSON.stringify(ships));
        this.addShips(ships);
        this.shipArray = [...ships];
        this.rows = rows;
        this.cols = cols;
        this.identifier = ["2a", "2b", "3a", "3b", "4", "5"];
        this.sunkCounter = 0;
        this.shipQuantity = shipQuantity;
        this.mines = [];
        this.boardOwner = boardOwner;
        this.roomId = roomId;
        this.playfield = playfield;
        if (mines) {
            this.mines = mines;
        }
        for (let i = 0; i < playfield.length; i++)
            logger_1.logger.debug(this.playfield[i]);
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
}
exports.Board = Board;
function signalSinking(ship) {
    return ship;
}
exports.signalSinking = signalSinking;
function signalGameEnd(winner) {
    return winner;
}
exports.signalGameEnd = signalGameEnd;
//# sourceMappingURL=Board.js.map