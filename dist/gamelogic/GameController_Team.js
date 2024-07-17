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
exports.TeamGameController = void 0;
const logger_1 = require("../logger");
const Ship_1 = require("./Ship");
const Resources_1 = require("../Resources");
const DBService_1 = require("../services/DBService");
class TeamGameController {
    constructor(playerBoards, io, roomId, intiPlayer, maxPlayers, gameMode, team1Names, team2Names) {
        this.playersChanged = false;
        this.shotPositions = [];
        this.gameMode = "1vs1";
        this.playerSkins = new Map();
        this.userObjects = [];
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
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("teamnames in initialize", this.team1Names, this.team2Names);
            const team1Promises = this.team1Names.map((name) => __awaiter(this, void 0, void 0, function* () {
                let newUser = yield (0, DBService_1.getUserByUsername)(name);
                if (newUser) {
                    console.log("user found");
                    this.userObjects.push(newUser);
                    this.playerSkins.set(name, newUser.skin);
                }
            }));
            const team2Promises = this.team2Names.map((name) => __awaiter(this, void 0, void 0, function* () {
                let newUser = yield (0, DBService_1.getUserByUsername)(name);
                if (newUser) {
                    this.userObjects.push(newUser);
                    this.playerSkins.set(name, newUser.skin);
                }
            }));
            yield Promise.all([...team1Promises, ...team2Promises]);
            console.log("playerSkins set", this.playerSkins);
        });
    }
    // last player calls the shots
    // return count of players ready
    shotsReady(username, position) {
        this.playersReady++;
        this.shotPositions.push(position);
        if (this.playersReady === this.maxPlayers / 2) {
            //  make shot positions unique
            this.playersReady = 0;
            const uniqueArray = this.shotPositions.filter((item, index, self) => index === self.findIndex((t) => t.x === item.x && t.y === item.y));
            // guck ob alles misses sind
            let allMisses = [];
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
            console.log(" - again? und playersWhosTurnItIs", again, this.playerWhosTurnItIs);
            console.log("- unique array ", uniqueArray);
            let teamNameBool = this.team1Names.find((player) => player === username);
            let teamName = Resources_1.Team1Name;
            let enemyBoardOwner = Resources_1.Team2Name;
            if (!teamNameBool) {
                teamName = Resources_1.Team2Name;
                enemyBoardOwner = Resources_1.Team1Name;
            }
            let whosTurn = teamName;
            if (!again)
                whosTurn = enemyBoardOwner;
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
    shoot(username, pos, teamAgain) {
        // doTheShooting
        let teamName = this.team1Names.find((player) => player === username)
            ? Resources_1.Team1Name
            : Resources_1.Team2Name;
        // returns the board that gets shot at
        const board = this.playerBoards.find((board) => board.boardOwner != teamName);
        if (!board)
            throw new Error("Whooops, didn't find the boards we are looking for! ");
        let enemyBoardOwner = board.boardOwner;
        let hitResult = board.checkHit(pos, username);
        console.log(teamName, " hat geschossen auf ", enemyBoardOwner, " username: ", username);
        let names = this.team2Names;
        let loserNames = this.team1Names;
        if (teamName == Resources_1.Team1Name) {
            names = this.team1Names;
            loserNames = this.team2Names;
        }
        let users = [];
        let losers = [];
        names.forEach(() => {
            let user = this.userObjects.find((u) => {
                username === u.username;
            });
            if (user)
                users.push(user);
        });
        loserNames.forEach(() => {
            let user = this.userObjects.find((u) => {
                username === u.username;
            });
            if (user)
                losers.push(user);
        });
        if (!hitResult)
            throw new Error("No hitResult in shoot");
        // need to check if already hit
        if (this.isMiniHit(hitResult)) {
            // hit or miss
            if (this.gameMode === "Team" || teamAgain === true) {
                // bei team niemals switchTO mitschicken sondern wo anders
                console.log(" im team hitEvent", teamAgain);
                return this.hitEvent({
                    x: hitResult.x,
                    y: hitResult.y,
                    username: username,
                    hit: hitResult.hit,
                });
            }
            else {
                console.log("kein Team mode");
                if (hitResult.hit === true) {
                    if (users) {
                        users.forEach((user) => {
                            if (user === null || user === void 0 ? void 0 : user.points)
                                user.points += Resources_1.hitPoints;
                        });
                    }
                    return this.hitEvent({
                        x: hitResult.x,
                        y: hitResult.y,
                        username: username,
                        hit: hitResult.hit,
                        switchTo: username,
                    });
                }
                else {
                    return this.hitEvent({
                        x: hitResult.x,
                        y: hitResult.y,
                        username: username,
                        hit: hitResult.hit,
                        switchTo: enemyBoardOwner,
                    });
                }
            }
        }
        else if (hitResult instanceof Ship_1.Ship) {
            if (users) {
                users.forEach((user) => {
                    if (user === null || user === void 0 ? void 0 : user.points)
                        user.points += Resources_1.shipDestroyedPoints;
                });
            }
            // ship destroyed
            let ship = {
                identifier: hitResult.identifier,
                direction: hitResult.isHorizontal ? "X" : "Y",
                startX: hitResult.initialPositions[0].x,
                startY: hitResult.initialPositions[0].y,
                length: hitResult.length,
                hit: true,
            };
            console.log("schiff zerstört von ", username);
            return this.shipDestroyed(ship, username);
        }
        else if (typeof hitResult === "string") {
            let loser = this.userObjects.find((u) => {
                username !== u.username;
            });
            // win or lose
            if (users) {
                users.forEach((user) => {
                    if (user === null || user === void 0 ? void 0 : user.points)
                        user.points += Resources_1.winnerPoints;
                });
            }
            if (losers) {
                losers.forEach((user) => {
                    if (user === null || user === void 0 ? void 0 : user.points)
                        user.points += Resources_1.loserPoints;
                });
            }
            if (this.userObjects.length != 0)
                this.userObjects.forEach((user) => __awaiter(this, void 0, void 0, function* () {
                    yield (0, DBService_1.updateUserData)(user);
                }));
            logger_1.logger.debug(" in hitResult string" + JSON.stringify(hitResult));
            return this.gameOver({ username: hitResult });
        }
        else {
        }
    }
    teamShoot(username, pos) {
        // doTheShooting
        let teamName = this.team1Names.find((player) => player === username)
            ? Resources_1.Team1Name
            : Resources_1.Team2Name;
        // returns the board that gets shot at
        const board = this.playerBoards.find((board) => board.boardOwner != teamName);
        if (!board)
            throw new Error("Whooops, didn't find the boards we are looking for! ");
        let enemyBoardOwner = board.boardOwner;
        let hitResult = board.teamCheckHit(pos);
        if (!hitResult)
            throw new Error("No hitResult in shoot");
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
    detonateMines(username) {
        let teamName = this.team1Names.find((player) => player === username)
            ? Resources_1.Team1Name
            : Resources_1.Team2Name;
        // returns the board that gets shot at
        const board = this.playerBoards.find((board) => board.boardOwner === teamName);
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
    detonateTorpedo(username, position, horizontal) {
        let teamName = this.team1Names.find((player) => player === username)
            ? Resources_1.Team1Name
            : Resources_1.Team2Name;
        // returns the board that gets shot at
        const board = this.playerBoards.find((board) => board.boardOwner != teamName);
        if (!board) {
            return;
        }
        let size = horizontal ? board.rows : board.cols;
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
    detonateDrone(username, position) {
        let teamName = this.team1Names.find((player) => player === username)
            ? Resources_1.Team1Name
            : Resources_1.Team2Name;
        // returns the board that gets shot at
        const enemyBoard = this.playerBoards.find((board) => board.boardOwner != teamName);
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
                if (e)
                    this.searchEvent(e, username);
            }, 500 + count * 500);
            count++;
        }
        return uncoveredPositions;
    }
    getCurrentPlayer() {
        return this.playerWhosTurnItIs;
    }
    //   sendet gewinner
    gameOver(body) {
        logger_1.logger.error("Game over for: " + body.username);
        this.io.to(this.roomId, { broadcast: true }).emit("gameOver", body);
    }
    switchPlayers(hit, switchTo) {
        if (!hit && switchTo !== undefined) {
            console.log("switchPlayers to", switchTo);
            this.playerWhosTurnItIs = switchTo;
        }
    }
    hitEvent(body) {
        this.io.to(this.roomId, { broadcast: true }).emit("hitEvent", body);
        if (typeof body.switchTo === "string") {
            console.log("hitevent switch to ", JSON.stringify(body.switchTo));
            this.switchPlayers(body.hit, body.switchTo);
        }
    }
    searchEvent(body, username) {
        this.io
            .to(this.roomId, { broadcast: true })
            .emit("searchEvent", body, username);
    }
    TeamHitEvent(body) {
        // this.io.to(this.roomId, { broadcast: true }).emit("teamHitEvent", body);
    }
    shipDestroyed(body, switchTo) {
        this.io
            .to(this.roomId, { broadcast: true })
            .emit("shipDestroyed", body, switchTo);
        this.switchPlayers(true, switchTo);
    }
    startGame(team1Ships, team2Ships) {
        let objectSkins = Object.fromEntries(this.playerSkins);
        this.io
            .to(this.roomId, { broadcast: true })
            .emit("gameStart", this.playerWhosTurnItIs, objectSkins, team1Ships, team2Ships);
        logger_1.logger.debug(this.playerWhosTurnItIs);
        // this.switchPlayers(true, switchTo);
    }
    isMiniHit(obj) {
        return (typeof obj === "object" &&
            typeof obj.x === "number" &&
            typeof obj.y === "number" &&
            typeof obj.hit === "boolean");
    }
}
exports.TeamGameController = TeamGameController;
//# sourceMappingURL=GameController_Team.js.map