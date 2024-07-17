import { logger } from "../logger";
import { Ai_Playtest } from "./Ai_Playtest";
import { Board } from "./Board";
import { Position, HitResult, ShipType, miniHit } from "./Types";
import { Socket } from "socket.io";
import { Ship } from "./Ship";
import { json } from "stream/consumers";
import { log } from "console";
import {
  Team1Name,
  Team2Name,
  UserResource,
  hitPoints,
  loserPoints,
  shipDestroyedPoints,
  winnerPoints,
} from "../Resources";
import {
  getUserByUsername,
  updateUserData,
  writeLeaderboard,
} from "../services/DBService";

export class TeamGameController {
  playerBoards: Board[];
  playersChanged: boolean = false;
  playerWhosTurnItIs: string;
  io: any;
  roomId: string;
  playersReady: number;
  shotPositions: Position[] = [];
  maxPlayers: number;
  team1Names: string[];
  team2Names: string[];
  gameMode: string = "1vs1";
  playerSkins: Map<string, string> = new Map();
  userObjects: UserResource[] = [];

  constructor(
    playerBoards: Board[],
    io: any,
    roomId: string,
    intiPlayer: string,
    maxPlayers: number,
    gameMode: string,
    team1Names: string[],
    team2Names: string[]
  ) {
    this.playerBoards = playerBoards;
    this.io = io;
    this.roomId = roomId;
    // coin flip whos starts
    this.playerWhosTurnItIs = intiPlayer;
    this.maxPlayers = maxPlayers;
    this.playersReady = 0;
    this.gameMode = gameMode;
    this.team1Names = team1Names;
    this.team2Names = team2Names;
  }
  async initialize() {
    console.log("teamnames in initialize", this.team1Names, this.team2Names);

    const team1Promises = this.team1Names.map(async (name) => {
      let newUser: UserResource | null = await getUserByUsername(name);
      if (newUser) {
        console.log("user found");
        this.userObjects.push(newUser);
        this.playerSkins.set(name, newUser.skin);
      }
    });

    const team2Promises = this.team2Names.map(async (name) => {
      let newUser: UserResource | null = await getUserByUsername(name);
      if (newUser) {
        this.userObjects.push(newUser);
        this.playerSkins.set(name, newUser.skin);
      }
    });

    await Promise.all([...team1Promises, ...team2Promises]);

    console.log("playerSkins set", this.playerSkins);
  }
  // last player calls the shots
  // return count of players ready
  shotsReady(username: string, position: Position): number {
    this.playersReady++;
    this.shotPositions.push(position);
    if (this.playersReady === this.maxPlayers / 2) {
      //  make shot positions unique
      this.playersReady = 0;
      const uniqueArray = this.shotPositions.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.x === item.x && t.y === item.y)
      );
      // guck ob alles misses sind
      let allMisses: string[] = [];
      uniqueArray.forEach((pos, index) => {
        allMisses.push(this.teamShoot(username, pos));
      });
      let again = false;
      if (allMisses.some((item) => item === "Hit")) {
        // if alls are misses switch teams
        again = true;
      }

      uniqueArray.forEach((pos, index) => {
        setTimeout(() => {
          this.shoot(username, pos, again); // oder position plus username speichern falls man auf nur die die getroffen haben sind dran switched
        }, index * 500);
      });

      console.log("shotsReady: ", username);
      console.log(
        " - again? und playersWhosTurnItIs",
        again,
        this.playerWhosTurnItIs
      );
      console.log("- unique array ", uniqueArray);
      let teamNameBool = this.team1Names.find((player) => player === username);
      let teamName = Team1Name;
      let enemyBoardOwner = Team2Name;

      if (!teamNameBool) {
        teamName = Team2Name;
        enemyBoardOwner = Team1Name;
      }

      let whosTurn = teamName;
      if (!again) whosTurn = enemyBoardOwner;
      this.switchPlayers(again, whosTurn);
      console.log(" - whosTurn ", whosTurn);
      setTimeout(() => {
        this.io
          .to(this.roomId, { broadcast: true })
          .emit("resetShots", whosTurn);
      }, 500 * (this.maxPlayers / 2));

      this.shotPositions = [];
    }
    return this.playersReady;
  }
  // shooter name and position
  shoot(username: string, pos: Position, teamAgain?: boolean) {
    // doTheShooting
    let teamName = this.team1Names.find((player) => player === username)
      ? Team1Name
      : Team2Name;
    // returns the board that gets shot at
    const board = this.playerBoards.find(
      (board) => board.boardOwner != teamName
    );

    if (!board)
      throw new Error("Whooops, didn't find the boards we are looking for! ");

    let enemyBoardOwner = board.boardOwner;
    let hitResult: string | Ship | miniHit = board.checkHit(pos, username);
    console.log(
      teamName,
      " hat geschossen auf ",
      enemyBoardOwner,
      " username: ",
      username
    );
    let names = this.team2Names;
    let loserNames = this.team1Names;
    if (teamName == Team1Name) {
      names = this.team1Names;
      loserNames = this.team2Names;
    }
    let users: UserResource[] = [];
    let losers: UserResource[] = [];
    names.forEach(() => {
      let user: UserResource | undefined = this.userObjects.find(
        (u) => username === u.username
      );
      if (user) users.push(user);
    });
    loserNames.forEach(() => {
      let user: UserResource | undefined = this.userObjects.find(
        (u) => username === u.username
      );
      if (user) losers.push(user);
    });
    console.log("team shoot ", users, this.userObjects);
    if (!hitResult) throw new Error("No hitResult in shoot");
    // need to check if already hit
    if (this.isMiniHit(hitResult)) {
      if (hitResult.hit === true) {
        if (users) {
          users.forEach((user) => {
            console.log("team shoot each user", user);

            if (user?.points) {
              user.points += hitPoints;
              console.log("userpoints ", user.points);
            }
          });
        }
      }
      // hit or miss
      if (this.gameMode === "Team" || teamAgain === true) {
        // bei team niemals switchTO mitschicken sondern wo anders
        // console.log(" im team hitEvent", teamAgain);

        return this.hitEvent({
          x: hitResult.x,
          y: hitResult.y,
          username: username,
          hit: hitResult.hit,
        });
      } else {
        // console.log("kein Team mode");
        if (hitResult.hit === true) {
          return this.hitEvent({
            x: hitResult.x,
            y: hitResult.y,
            username: username,
            hit: hitResult.hit,
            switchTo: username,
          });
        } else {
          return this.hitEvent({
            x: hitResult.x,
            y: hitResult.y,
            username: username,
            hit: hitResult.hit,
            switchTo: enemyBoardOwner,
          });
        }
      }
    } else if (hitResult instanceof Ship) {
      if (users) {
        users.forEach((user) => {
          if (user?.points) user.points += shipDestroyedPoints;
        });
      }

      // ship destroyed
      let ship: ShipType = {
        identifier: hitResult.identifier,
        direction: hitResult.isHorizontal ? "X" : "Y",
        startX: hitResult.initialPositions[0].x,
        startY: hitResult.initialPositions[0].y,
        length: hitResult.length,
        hit: true,
      };
      console.log("schiff zerstört von ", username);
      return this.shipDestroyed(ship, username);
    } else if (typeof hitResult === "string") {
      let loser = this.userObjects.find((u) => {
        username !== u.username;
      });
      // win or lose
      if (users) {
        users.forEach((user) => {
          if (user?.points) user.points += winnerPoints;
        });
      }
      if (losers) {
        losers.forEach((user) => {
          if (user?.points) user.points += loserPoints;
        });
      }
      if (this.userObjects.length != 0) {
        console.log("update User points");
        this.userObjects.forEach(async (user) => {
          await updateUserData(user);
        });
        // await writeLeaderboard();
      }
      logger.debug(" in hitResult string" + JSON.stringify(hitResult));
      return this.gameOver({ username: teamName });
    } else {
    }
  }
  teamShoot(username: string, pos: Position) {
    // doTheShooting
    let teamName = this.team1Names.find((player) => player === username)
      ? Team1Name
      : Team2Name;
    // returns the board that gets shot at
    const board = this.playerBoards.find(
      (board) => board.boardOwner != teamName
    );
    if (!board)
      throw new Error("Whooops, didn't find the boards we are looking for! ");

    let enemyBoardOwner = board.boardOwner;
    let hitResult: string | Ship | miniHit = board.teamCheckHit(pos);

    if (!hitResult) throw new Error("No hitResult in shoot");
    // need to check if already hit
    if (this.isMiniHit(hitResult)) {
      // hit or miss
      if (hitResult.hit === false) {
        console.log("teamShoot Miss");
        return "Miss";
      }
    }
    console.log("teamShoot Hit");

    return "Hit";
  }

  // detonate mines on each board
  detonateMines(username: string) {
    let teamName = this.team1Names.find((player) => player === username)
      ? Team1Name
      : Team2Name;
    // returns the board that gets shot at
    const board = this.playerBoards.find(
      (board) => board.boardOwner === teamName
    );

    // console.log("detonateMines ", username, board);
    if (board && board.mines) {
      let count = 0;
      for (let mine of board.mines) {
        // console.log("detonateMines ", mine);
        setTimeout(() => {
          this.shoot(username, mine, true);
        }, 1000 + count * 800);
        count++;
      }
    }
  }

  // detonate torpedo
  detonateTorpedo(username: string, position: Position, horizontal: boolean) {
    let teamName = this.team1Names.find((player) => player === username)
      ? Team1Name
      : Team2Name;
    // returns the board that gets shot at
    const board = this.playerBoards.find(
      (board) => board.boardOwner != teamName
    );
    if (!board) {
      return;
    }
    let size: number = horizontal ? board.rows : board.cols;
    console.log("detonateTorpedo GOOO");
    for (let i = 0; i < size; i++) {
      let hitPosition = !horizontal
        ? { x: position.x, y: i }
        : { x: i, y: position.y };
      console.log(" - detonateTorpedo ", hitPosition);

      let hitResult = board.teamCheckHit(hitPosition);
      console.log(" - detonateTorped ", hitResult);
      setTimeout(() => {
        this.shoot(username, hitPosition, true);
      }, i * 500);
      console.log(" - detonateTorped nach shoot");

      if (hitResult === "Hit") {
        // hit or miss

        console.log(" return bitte");
        return;
      }
    }
  }

  // position needs to be min 1 for x and y
  detonateDrone(username: string, position: Position) {
    let teamName = this.team1Names.find((player) => player === username)
      ? Team1Name
      : Team2Name;
    // returns the board that gets shot at
    const enemyBoard = this.playerBoards.find(
      (board) => board.boardOwner != teamName
    );
    if (!enemyBoard) {
      return null;
    }
    let uncoveredPositions = [
      //check center
      enemyBoard.droneCheckHit(position),
      //check left
      enemyBoard.droneCheckHit({ x: position.x - 1, y: position.y }),
      //check right
      enemyBoard.droneCheckHit({ x: position.x + 1, y: position.y }),
      //check below
      enemyBoard.droneCheckHit({ x: position.x, y: position.y - 1 }),
      //check above
      enemyBoard.droneCheckHit({ x: position.x, y: position.y + 1 }),
    ].filter((e) => e !== null);
    let count = 0;
    console.log(uncoveredPositions);
    for (let e of uncoveredPositions) {
      console.log("send e ", e);
      setTimeout(() => {
        if (e) this.searchEvent(e, username);
      }, 500 + count * 500);
      count++;
    }
    return uncoveredPositions;
  }

  getCurrentPlayer() {
    return this.playerWhosTurnItIs;
  }

  //   sendet gewinner
  gameOver(body: { username: string }) {
    logger.error("Game over for: " + body.username);
    this.io.to(this.roomId, { broadcast: true }).emit("gameOver", body);
  }

  switchPlayers(hit: boolean, switchTo: string) {
    if (!hit && switchTo !== undefined) {
      console.log("switchPlayers to", switchTo);

      this.playerWhosTurnItIs = switchTo!;
    }
  }

  hitEvent(body: HitResult) {
    this.io.to(this.roomId, { broadcast: true }).emit("hitEvent", body);
    if (typeof body.switchTo === "string") {
      console.log("hitevent switch to ", JSON.stringify(body.switchTo));
      this.switchPlayers(body.hit, body.switchTo);
    }
  }
  searchEvent(body: miniHit, username: string) {
    this.io
      .to(this.roomId, { broadcast: true })
      .emit("searchEvent", body, username);
  }
  TeamHitEvent(body: HitResult) {
    // this.io.to(this.roomId, { broadcast: true }).emit("teamHitEvent", body);
  }

  shipDestroyed(body: ShipType, switchTo: string) {
    this.io
      .to(this.roomId, { broadcast: true })
      .emit("shipDestroyed", body, switchTo);
    this.switchPlayers(true, switchTo);
  }
  startGame(team1Ships: Ship[], team2Ships: Ship[]) {
    let objectSkins = Object.fromEntries(this.playerSkins);

    this.io
      .to(this.roomId, { broadcast: true })
      .emit(
        "gameStart",
        this.playerWhosTurnItIs,
        objectSkins,
        team1Ships,
        team2Ships
      );
    logger.debug(this.playerWhosTurnItIs);
    // this.switchPlayers(true, switchTo);
  }

  isMiniHit(obj: any): obj is miniHit {
    return (
      typeof obj === "object" &&
      typeof obj.x === "number" &&
      typeof obj.y === "number" &&
      typeof obj.hit === "boolean"
    );
  }
}
