// istanbul ignore file

import { logger } from "../logger";
import { Ship } from "./Ship";
import { Position, miniHit } from "./Types";

// other identifiers:
// "O" = MISS; "." = NOTHING; "X" = HIT; "D" = DESTROYED

export class BoardTest {
  ships: Map<string, Ship> = new Map<string, Ship>(); // own ships
  identifier: string[]; // all 6 ship identifiers
  playfield: string[][] = []; // 2d array from playfield with X, O, . , and identifiers
  sunkCounter: number;
  rows: number;
  cols: number;
  // if all ships are sunken, signal game end
  shipQuantity: number;
  mines: Position[];
  boardOwner: string;
  roomId: string;
  shipArray: Ship[] = [];
  body: any[] = [];
  constructor(
    rows: number,
    cols: number,
    shipQuantity: number,
    boardOwner: string,
    // playfield: string[][], // spielfeld mit . und identifier der Schiffe
    // ships: Ship[], // die Schiffe die der boardOwner gesetzt hat
    body: any[],
    roomId: string,
    mines?: Position[]
  ) {
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
    logger.debug("------------" + boardOwner + "-------------");
  }

  // shooterName <==> winner's name
  checkHit(
    shotPosition: Position,
    shooterName: string
  ): miniHit | Ship | string {
    let elementAt = this.playfield[shotPosition.y][shotPosition.x];
    logger.debug("- checkHit: elementAt" + elementAt);
    if (elementAt === "." || elementAt === "O") {
      this.playfield[shotPosition.y][shotPosition.x] = "O";
      return { x: shotPosition.x, y: shotPosition.y, hit: false };
    } else if (elementAt === "X") {
      let test: any = { Fehler: "auf bestehenden Hit/ Miss geclickt" };
      logger.error(JSON.stringify(test) + " elementAT " + elementAt),
        shotPosition;
      return { x: shotPosition.x, y: shotPosition.y, hit: true };
    } else {
      let test: any = { test: "stinkt dieser Tag" }; // DAS WIRD
      // elemtAt ist "X" oder "O"

      const ship = this.ships.get(elementAt);
      logger.debug("- checkHit: ship " + JSON.stringify(this.ships));
      // -------------- ship ist NUR bei player undefined----------------------
      ship?.setHit(shotPosition);
      this.playfield[shotPosition.y][shotPosition.x] = "X";
      if (ship?.getIsSunk()) {
        this.sunkCounter++;
        if (this.sunkCounter == this.shipQuantity) {
          test = signalGameEnd(shooterName);
          return test;
        } else {
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
      logger.debug(
        JSON.stringify(test) + " checkhit ende---------------------"
      );
      return test;
    }
  }
  teamCheckHit(shotPosition: Position): miniHit | string {
    let elementAt = this.playfield[shotPosition.y][shotPosition.x];
    logger.debug("- teamCheckHit: elementAt " + elementAt);
    if (elementAt === "." || elementAt === "O") {
      let minHit: miniHit = {
        x: shotPosition.x,
        y: shotPosition.y,
        hit: false,
      };
      return minHit;
    }
    return "Hit";
  }
  droneCheckHit(shotPosition: Position): miniHit | null {
    let elementAt = this.playfield[shotPosition.y][shotPosition.x];
    logger.debug("- droneCheckHit: elementAt " + elementAt);
    let miniHit: miniHit | null = null;
    if (!(
      shotPosition.x >= 0 &&
      shotPosition.x < this.rows &&
      shotPosition.y >= 0 &&
      shotPosition.y < this.cols)
    ) {
      return miniHit;
    }
    if (elementAt === "." || elementAt === "O") {
      miniHit = {
        x: shotPosition.x,
        y: shotPosition.y,
        hit: false,
      };
    } else {
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

  addShips(ships: Ship[]) {
    for (let ship of ships) {
      this.ships.set(ship.identifier, ship);
      // logger.debug(JSON.stringify(ship.identifier));
    }
    // logger.debug("-----adships-------");
  }

  addMines(mines: Position[]) {
    this.mines = mines;
  }

  initializePlayfield() {
    let arr: string[][] = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(".")
    );
    let playerShips: Ship[] = [];
    for (const ship of this.body) {
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
      this.shipArray.push(
        new Ship(ship.identifier, isHorizontal, position, ship.length)
      );
    }
    this.playfield = arr;
  }
}

export function signalSinking(ship: Ship): Ship {
  return ship;
}

export function signalGameEnd(winner: string): string {
  return winner;
}
