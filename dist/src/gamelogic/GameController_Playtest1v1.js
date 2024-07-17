"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const logger_1 = require("../logger");
const Ship_1 = require("./Ship");
class GameController {
    // constructor(...args: any[]) {
    //     if (args.length === 1) {
    //         this.socket = args[0]; // Initialisiert socket mit dem übergebenen Wert
    //     } else if (args.length === 4) {
    //         this.playerBoard = args[0];
    //         this.aiBoard = args[1];
    //         this.ai = new Ai_Playtest(this.playerBoard, "god");
    //         this.socket = args[2]; // Initialisiert socket mit dem übergebenen Wert
    //         this.gameInit();
    //     }
    //     // Weitere Logiken für andere Konstruktoraufrufe...
    // }
    constructor(playerBoards, 
    // aiBoard: Board,
    socket, playerWhosTurnItIs, difficulty) {
        this.playerBoards = playerBoards;
        this.player1Board = playerBoards[0];
        this.player2Board = playerBoards[1];
        // this.aiBoard = aiBoard;
        // this.ai = new Ai_Playtest(this.playerBoard, "god");
        this.socket = socket;
        this.playerWhosTurnItIs = playerWhosTurnItIs;
    }
    shoot(username, pos) {
        // doTheShooting
        const board = this.player1Board.boardOwner === username
            ? this.player2Board
            : this.player1Board;
        let enemyBoardOwner = board.boardOwner;
        if (!board)
            throw new Error("Whooops, didn't find the board we are looking for! " +
                this.playerWhosTurnItIs);
        let hitResult;
        // if (username === this.playerBoard.boardOwner && pos)
        hitResult = board.checkHit(pos, username);
        // else hitResult = this.ai.aiGod(0.9);
        logger_1.logger.debug(JSON.stringify(hitResult) + " in shoot");
        if (!hitResult)
            throw new Error("No hitResult");
        if (this.isMiniHit(hitResult)) {
            // hit or miss
            if (hitResult.hit === true) {
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
        else if (hitResult instanceof Ship_1.Ship) {
            // ship destroyed
            logger_1.logger.debug(" in hitResult Ship" + JSON.stringify(hitResult));
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
            logger_1.logger.debug(" in hitResult string" + JSON.stringify(hitResult));
            return this.gameOver({ username: hitResult });
        }
        else {
        }
    }
    getCurrentPlayer() {
        return this.playerWhosTurnItIs;
    }
    //   sendet gewinner
    gameOver(body) {
        logger_1.logger.error("Game over for: " + body.username);
        this.socket.emit("gameOver", body);
    }
    // switchPlayers(hit: boolean, enemyBoardOwner: string) {
    //   if (!hit) this.playerWhosTurnItIs = enemyBoardOwner;
    //   if (this.playerWhosTurnItIs === this.aiBoard.boardOwner) {
    //     logger.info("AI's turn!-----------" + this.playerWhosTurnItIs);
    //     setTimeout(() => {
    //       this.shoot(enemyBoardOwner);
    //     }, 2000);
    //   }
    // }
    hitEvent(body) {
        logger_1.logger.debug(JSON.stringify(body) + " hitevent body");
        this.socket.emit("hitEvent", body);
        // this.switchPlayers(body.hit, body.switchTo);
    }
    shipDestroyed(body, switchTo) {
        this.socket.emit("shipDestroyed", body);
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
//# sourceMappingURL=GameController_Playtest1v1.js.map