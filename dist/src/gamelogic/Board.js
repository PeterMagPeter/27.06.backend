"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalGameEnd = exports.signalSinking = exports.Board = void 0;
const logger_1 = require("../logger");
// other identifiers:
// "O" = MISS; "." = NOTHING; "X" = HIT; "D" = DESTROYED
class Board {
    constructor(boardSize, shipQuantity, boardOwner, playfield) {
        this.ships = new Map();
        this.identifier = ["2a", "2b", "3a", "3b", "4", "5"];
        this.playfield = [];
        this.sunkCounter = 0;
        this.columnAmount = boardSize;
        this.shipQuantity = shipQuantity;
        this.boardOwner = boardOwner;
        this.playfield = playfield;
        for (let i = 0; i < playfield.length; i++)
            logger_1.logger.debug(this.playfield[i]);
        logger_1.logger.debug("-------------------------");
    }
    // shooterName <==> winner's name
    checkHit(shotPosition, shooterName) {
        let elementAt = this.playfield[shotPosition.y][shotPosition.x];
        if (elementAt === ".") {
            this.playfield[shotPosition.y][shotPosition.x] = "O";
            return { x: shotPosition.x, y: shotPosition.y, hit: false };
        }
        else if (elementAt === "X" || elementAt === "O") {
            let test = { scheiße: "an die wand", x: 0, y: 0, hit: false };
            logger_1.logger.error(test);
            return test;
        }
        else {
            let test = { test: "stinkt dieser Tag" }; // DAS WIRD
            //   bis hier funktionerts ---------------------
            //   for (let i = 0; i < this.playfield.length; i++)
            //     logger.debug(this.playfield[i]);
            for (let i = 0; i < this.identifier.length; i++) {
                let id = this.identifier[i];
                // elemtAt ist "X" oder "O"
                const ship = this.ships.get(id);
                ship === null || ship === void 0 ? void 0 : ship.setHit(shotPosition);
                this.playfield[shotPosition.y][shotPosition.x] = "X";
                if (ship === null || ship === void 0 ? void 0 : ship.getIsSunk()) {
                    //this.sunkCounter++;
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
                return test;
            }
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
    setShipPositions() {
        this.ships.forEach((ship) => {
            ship.initialPositions.forEach((position) => {
                this.playfield[position.x][position.y] = ship.identifier;
            });
        });
    }
    addShips(ships) {
        for (let ship of ships) {
            this.ships.set(ship.identifier, ship);
        }
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