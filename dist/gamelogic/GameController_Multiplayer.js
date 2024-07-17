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
exports.GameController = void 0;
const logger_1 = require("../logger");
const Ship_1 = require("./Ship");
const DBService_1 = require("../services/DBService");
const Resources_1 = require("../Resources");
class GameController {
    constructor(playerBoards, io, roomId, intiPlayer) {
        this.userObjects = [];
        this.playersChanged = false;
        this.playerSkins = new Map();
        this.playerBoards = playerBoards;
        this.io = io;
        this.roomId = roomId;
        this.playerWhosTurnItIs = intiPlayer;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let board of this.playerBoards) {
                let newUser = yield (0, DBService_1.getUserByUsername)(board.boardOwner);
                if (newUser) {
                    console.log("usergefunden", newUser);
                    this.userObjects.push(newUser);
                    this.playerSkins.set(board.boardOwner, newUser.skin);
                }
            }
            console.log("playerSkins set", this.playerSkins);
        });
    }
    // shooter name and position
    shoot(username, pos, noSwitch) {
        return __awaiter(this, void 0, void 0, function* () {
            // doTheShooting
            console.log("shoot aufgerufen ", username, pos);
            // returns the board that gets shot at
            const board = this.playerBoards.find((board) => board.boardOwner != username);
            if (!board)
                throw new Error("Whooops, didn't find the board we are looking for! enemy from: " +
                    username);
            let enemyBoardOwner = board.boardOwner;
            let hitResult = board.checkHit(pos, username);
            let user = this.userObjects.find((u) => username === u.username);
            console.log("shoot user", user, this.userObjects);
            if (!hitResult)
                throw new Error("No hitResult in shoot");
            if (this.isMiniHit(hitResult)) {
                // hit or miss
                if (noSwitch === true) {
                    // bei team niemals switchTO mitschicken sondern wo anders
                    // console.log(" im team hitEvent", noSwitch);
                    return this.hitEvent({
                        x: hitResult.x,
                        y: hitResult.y,
                        username: username,
                        hit: hitResult.hit,
                    });
                }
                else {
                    console.log("mit switch");
                    if (hitResult.hit === true) {
                        if (user === null || user === void 0 ? void 0 : user.points) {
                            user.points += Resources_1.hitPoints;
                            console.log("userpoints ", user.points);
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
                // ship destroyed
                if (user === null || user === void 0 ? void 0 : user.points)
                    user.points += Resources_1.shipDestroyedPoints;
                let ship = {
                    identifier: hitResult.identifier,
                    direction: hitResult.isHorizontal ? "X" : "Y",
                    startX: hitResult.initialPositions[0].x,
                    startY: hitResult.initialPositions[0].y,
                    length: hitResult.length,
                    hit: true,
                };
                return this.shipDestroyed(ship, username);
            }
            else if (typeof hitResult === "string") {
                // win or lose
                let loser = this.userObjects.find((u) => {
                    username !== u.username;
                });
                if (user === null || user === void 0 ? void 0 : user.points)
                    user.points += Resources_1.winnerPoints;
                if (loser === null || loser === void 0 ? void 0 : loser.points)
                    loser.points += Resources_1.loserPoints;
                if (this.userObjects.length != 0) {
                    this.userObjects.forEach((user) => __awaiter(this, void 0, void 0, function* () {
                        yield (0, DBService_1.updateUserData)(user);
                    }));
                    yield (0, DBService_1.writeLeaderboard)();
                }
                return this.gameOver({ username: hitResult });
            }
            else {
            }
        });
    }
    // detonate mines on each board
    detonateMines(username) {
        let board = this.playerBoards.find((board) => username === board.boardOwner);
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
        let board = this.playerBoards.find((board) => username !== board.boardOwner);
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
                // setTimeout(() => {
                // }, 1000 + i * 500);
                console.log(" return bitte");
                return;
            }
        }
    }
    // position needs to be min 1 for x and y
    detonateDrone(username, position) {
        let enemyBoard = this.playerBoards.find((board) => username !== board.boardOwner);
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
        if (!hit) {
            this.playerWhosTurnItIs = switchTo;
        }
    }
    hitEvent(body) {
        this.io.to(this.roomId, { broadcast: true }).emit("hitEvent", body);
        this.switchPlayers(body.hit, body.switchTo);
    }
    searchEvent(body, username) {
        this.io
            .to(this.roomId, { broadcast: true })
            .emit("searchEvent", body, username);
    }
    shipDestroyed(body, switchTo) {
        this.io
            .to(this.roomId, { broadcast: true })
            .emit("shipDestroyed", body, switchTo);
        this.switchPlayers(true, switchTo);
    }
    startGame() {
        console.log("playerSkins in startGame", this.playerSkins);
        let objectSkins = Object.fromEntries(this.playerSkins);
        console.log("objectSkins after transformation", objectSkins);
        this.io
            .to(this.roomId, { broadcast: true })
            .emit("gameStart", this.playerWhosTurnItIs, objectSkins);
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
exports.GameController = GameController;
//# sourceMappingURL=GameController_Multiplayer.js.map