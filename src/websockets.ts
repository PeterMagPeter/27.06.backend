import { Server, Socket } from "socket.io";
import { GameController } from "./gamelogic/GameController_Multiplayer";
import { AiGameController } from "./gamelogic/GameController_Playtest";
import { TeamGameController } from "./gamelogic/GameController_Team";
import { Ai_Playtest } from "./gamelogic/Ai_Playtest";
import { Board } from "./gamelogic/Board";
import { Ship } from "./gamelogic/Ship";
import { logger } from "./logger";
import { Position } from "./gamelogic/Types";
import { skip } from "node:test";
import { log } from "console";
import {
  deleteEntriesFromCollection,
  deleteOnlineMatch,
  getLeaderboard,
  getPublicOnlinematches,
  getUserByUsername,
  hostOnlineMatch,
  joinOnlineMatch,
  updateOnlineMatch,
  updateUserData,
  writeLeaderboard,
} from "./services/DBService";
import { OnlineMatchResource, Team1Name, Team2Name } from "./Resources";
interface ExtendedSocket extends Socket {
  testee?: any; // oder genauerer Typ, falls bekannt, z.B. GameController oder AiGameController
}
const gameControllers = new Map();
const playerSkins = new Map<string, string>();

const readyCounters = new Map<string, number>();

export function startWebSocketConnection(server: any) {
  const io = new Server(server, { cors: { origin: "*" } });
  console.log("WebSocket server started");

  let playerBoards: { [username: string]: Board } = {};
  io.on("connection", (socket: any) => {
    console.log("New connection:", socket.id);

    socket.on("sendGetUser", async (username: string) => {
      let user = await getUserByUsername(username);
      delete playerBoards[username];
      if (user) {
        socket.emit("getUser", user);
      }
    });
    socket.on("sendGetLeaderboard", async () => {
      await writeLeaderboard()
        .then(async () => {
          let leaderboard = await getLeaderboard();
          if (leaderboard) {
            console.log(leaderboard);
            socket.emit("getLeaderboard", leaderboard);
          }
        })
        .catch((error) => {
          console.error("Failed to initialize gameController:", error);
        });
    });
    socket.on("sendChangeSkin", async (username: string, skin: string) => {
      let user = await getUserByUsername(username);
      if (user) {
        let changed = await updateUserData({ ...user, skin: skin });
        if (changed) socket.emit("changeSkinSuccesfully");
        else socket.emit("changeSkinFailed");
      }
    });
    // get all lobbies
    socket.on("sendGetLobbies", async (gameMode: string) => {
      let lobbies = await getPublicOnlinematches(gameMode);
      socket.emit("getLobbies", lobbies); // players, hostname
    });

    // join a room/ lobby,
    socket.on("sendJoinRoom", async (roomId: string, username: string) => {
      socket.join(roomId);
      // an db senden wo und wer joined
      let lobby = await joinOnlineMatch(roomId, username);
      if (lobby) {
        socket.join(roomId);
        console.log(`${username} joined room: ${roomId}`, lobby);
        io.to(roomId).emit("playerJoinedRoom", lobby, username); // players, hostname}
      }
    });

    // erstellt Lobby ------- need to update this to send it back too all player in room and update it in db
    socket.on("sendHostLobby", async (body: OnlineMatchResource) => {
      socket.join(body.roomId);
      // in db lobby erstellen
      let lobby = await hostOnlineMatch(body);
      console.log("created room", JSON.stringify(lobby));
      if (lobby) io.to(body.roomId).emit("createdRoom");
      let lobbies = await getPublicOnlinematches();
      if (lobbies) io.emit("getLobbies", lobbies);
    });
    socket.on(
      "sendHostUpdatedLobby",
      async (body: OnlineMatchResource, playerName?: string) => {
        // in db lobby updaten
        let updatedLobby: boolean | OnlineMatchResource | null =
          await updateOnlineMatch(body, playerName);
        if (updatedLobby) {
          io.to(body.roomId).emit("updatedLobby", body);
          if (playerName) {
            io.to(body.roomId).emit("playerKicked", playerName);
          }
        }
      }
    );
    // player changed team
    socket.on(
      "sendPlayerChangedTeam",
      (roomId: string, username: string, team: number) => {
        // WRITE INTO DB
        io.to(roomId).emit("playerChangedTeam", username, team);
      }
    );
    // players send their ships to each other
    socket.on(
      "sendPartnerChangedShips",
      (roomId: string, ships: Ship[], username: string, team: number) => {
        // WRITE INTO DB
        io.to(roomId).emit("partnerChangedShips", ships, username, team);
      }
    );
    // player changed mine placement
    socket.on(
      "sendPartnerChangedMines",
      (roomId: string, ships: Ship[], username: string, team: number) => {
        // WRITE INTO DB
        io.to(roomId).emit("partnerChangedMines", ships, username, team);
      }
    );
    // Host sagt spieler sollen schiffe platzieren - ohne superwaffen
    socket.on(
      "sendStartShipPlacement",
      (roomId: string, playersInTeam: any) => {
        console.log("sendStartShipPlacement", playersInTeam);
        io.to(roomId).emit("startShipPlacement", playersInTeam);
      }
    );
    // Host sagt spieler sollen schiffe platzieren - mit superwaffen

    socket.on(
      "sendStartMinePlacement",
      (roomId: string, playersInTeam: any) => {
        console.log("sendStartMinePlacement", playersInTeam);
        readyCounters.set(roomId, 0);
        io.to(roomId).emit("startMinePlacement", playersInTeam);
      }
    );
    //  player setzt alle minen
    socket.on(
      "sendMinePlacement",
      (
        roomId: string,
        playersInTeam: any,
        maxPlayers: number,
        mines: Position[]
      ) => {
        let count = 0;

        count = readyCounters.get(roomId)!;
        console.log("count gibts", count, maxPlayers);

        count++;
        readyCounters.set(roomId, count);
        console.log("sendMinePlacement", mines, count, maxPlayers);
        io.to(roomId).emit("minePlacementReady", count);
        if (count === maxPlayers) {
          console.log("send to room");
          io.to(roomId).emit("startShipPlacement", playersInTeam, mines);
        }
      }
    );
    socket.testee = null;
    socket.on(
      "sendShipPlacement",
      (
        body: any[], //ships
        username: string,
        skin: string,
        roomId: string,
        cols: number,
        rows: number,
        gameMode: string,
        maxPlayers: number,
        playersInTeam?: Map<string, number>,
        difficulty?: number,
        mines?: Position[]
      ) => {
        // logger.info("Received ship placement: " + JSON.stringify(body));
        let arr: string[][] = Array.from({ length: rows }, () =>
          Array(cols).fill(".")
        );
        let playerShips: Ship[] = [];
        for (const ship of body) {
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
          playerShips.push(
            new Ship(ship.identifier, isHorizontal, position, ship.length)
          );
        }
        const playerBoard = new Board(
          rows,
          cols,
          body.length,
          username,
          arr,
          playerShips,
          roomId,
          mines
        );
        logger.info("player board created");
        if (difficulty && difficulty > -1) {
          // create ai GameController
          logger.info("createt ai testee");
          const gameController = new AiGameController(
            playerBoard,
            socket,
            username,
            difficulty,
            roomId
          );
          // in map speichern
          gameControllers.set(roomId, gameController);
          gameController.startGame();
          // noch gamestart emit machen damit man direkt gegen ki spielen kann
        } else {
          let playersReady = [];
          playerBoards[username] = playerBoard;
          for (const username in playerBoards) {
            if (playerBoards.hasOwnProperty(username)) {
              const board = playerBoards[username];
              if (board.roomId === roomId) {
                playersReady.push(board.boardOwner);
              }
            }
          }
          io.to(roomId).emit("playersReady", playersReady);
          playerSkins.set(username, skin);
          allPlayersReady(
            io,
            roomId,
            playerBoards,
            gameMode,
            maxPlayers,
            playersInTeam
          );
        }
      }
    );
    socket.on(
      // send selected shot to other players
      "sendDetonateMines",
      (roomId: string, username: string) => {
        console.log("sendDetonateMines");
        if (gameControllers.has(roomId)) {
          const gameController = gameControllers.get(roomId);
          gameController.detonateMines(username);
          console.log("wurde ausgeführt bumm");
        }
      }
    );
    socket.on(
      // send selected shot to other players
      "sendDetonateTorpedo",
      (
        roomId: string,
        username: string,
        startPosition: Position,
        horizontal: boolean
      ) => {
        console.log("sendDetonateTorpedo");
        if (gameControllers.has(roomId)) {
          io.to(roomId).emit("detonateTorpedo", username);
          const gameController = gameControllers.get(roomId);
          gameController.detonateTorpedo(username, startPosition, horizontal);
        }
      }
    );
    socket.on(
      // send selected shot to other players
      "sendDetonateDrone",
      (roomId: string, username: string, startPosition: Position) => {
        console.log("sendDetonateDrone");
        if (gameControllers.has(roomId)) {
          io.to(roomId).emit("detonateDrone", username);
          const gameController = gameControllers.get(roomId);
          gameController.detonateDrone(username, startPosition);
        }
      }
    );
    socket.on(
      // send selected shot to other players
      "sendShotSelected",
      (position: Position, username: string, roomId: string) => {
        io.to(roomId).emit("shotSelected", position, username);
      }
    );
    // when you hit send shot Button
    socket.on(
      "sendShotReady",
      (body: { x: number; y: number; username: string; roomId: string }) => {
        logger.info(
          "Received shot Ready at: " + body.x + " " + body.y,
          " from ",
          body.username,
          " room: ",
          body.roomId
        );
        if (gameControllers.has(body.roomId)) {
          const gameController = gameControllers.get(body.roomId);
          let position: Position = { x: body.x, y: body.y };
          let count = gameController.shotsReady(body.username, position);
          io.to(body.roomId).emit("shotsReady", count); // send number to players
        }
      }
    );
    // 1vs1 function
    socket.on(
      "sendShot",
      (body: { x: number; y: number; username: string; roomId: string }) => {
        logger.info(
          "Received shot at: " + body.x + " " + body.y,
          " room: ",
          body.roomId
        );
        if (gameControllers.has(body.roomId)) {
          const gameController = gameControllers.get(body.roomId);
          gameController.shoot(body.username, { x: body.x, y: body.y });
        } else {
          logger.error(
            "testee is not an instance of GameController or AiGameController"
          );
        }
      }
    );
    socket.on(
      "sendLeaveRoom",
      async (roomId: string, privateMatch: boolean) => {
        socket.leave(roomId);
        console.log(`Benutzer ${socket.id} hat den Raum ${roomId} verlassen.`);

        // Prüfen, ob der Raum leer ist
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room || room.size === 0) {
          // Raum existiert nicht mehr oder ist leer
          gameControllers.delete(roomId);
          await deleteOnlineMatch(roomId);
          console.log(
            `Raum ${roomId} und zugehöriger GameController gelöscht.`
          );
        }
      }
    );
    socket.on("sendCloseAllRooms", async () => {
      await deleteEntriesFromCollection("PublicOnlinematches");
      await deleteEntriesFromCollection("PrivateOnlinematches");
    });
    // sollte im besten fall nach tab schließen etc. ausgeführt werden
    socket.on("sendCustomDisconnect", (roomId: string, username: string) => {
      console.log("customDisconnect", roomId, username);
      io.to(roomId).emit("customDisconnect", username);
    });
    // wird immer ausgeführt
    socket.on("disconnect", (reason: any) => {
      console.log(`Disconnected from server: ${reason}`);
    });
    // get the number of people in one room
    function updateRoomCount(room: string) {
      const roomCount = io.sockets.adapter.rooms.get(room)?.size || 0;
      io.to(room).emit("roomCount", roomCount);
      return roomCount;
    }
    // check if all players are ready
    function allPlayersReady(
      io: Server,
      roomId: string,
      playerBoards: { [username: string]: Board },
      gameMode: string,
      maxPlayers: number,
      playersInTeamObj?: Map<string, number>
    ) {
      let count: number = Object.keys(playerBoards).length;
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
      console.log(socketsInRoom?.size, playersInTeamObj);
      if (
        !socketsInRoom ||
        socketsInRoom.size !== maxPlayers ||
        count < maxPlayers
      ) {
        console.log(
          `socketsInRoom - Not enough players ready in room ${roomId}`
        );
        return;
      }
      if (maxPlayers === 2) {
        // 1vs1 Mode

        const boardsWithRoomId: Board[] = [];
        for (const username in playerBoards) {
          if (playerBoards.hasOwnProperty(username)) {
            const board = playerBoards[username];

            if (board.roomId === roomId) {
              boardsWithRoomId.push(board);
            }
          }
        }
        let num = Math.random() < 0.5 ? 0 : 1;
        // gamecontroller erstellen
        const gameController = new GameController(
          boardsWithRoomId,
          io,
          roomId,
          boardsWithRoomId[num].boardOwner
        );
        // in map speichern
        gameController
          .initialize()
          .then(() => {
            // Nachdem die Initialisierung abgeschlossen ist, wird das Spiel gestartet
            gameControllers.set(roomId, gameController);
            gameController.startGame();
          })
          .catch((error) => {
            console.error("Failed to initialize gameController:", error);
          });
        // socket.testee = n;
        // socket.testee.startGame();

        console.log(`Game started in room ${roomId}`);
      } else if (maxPlayers > 2 && gameMode === "Team" && playersInTeamObj) {
        // Team Mode
        // if (count >= 2 && playersInTeamObj) {
        let playersInTeam: Map<string, number> = new Map(
          Object.entries(playersInTeamObj)
        );
        console.log("in function", playersInTeam);
        const boardsWithRoomId: Board[] = [];
        // verteile alle boards auf teams
        const team1Boards: Board[] = [];
        const team2Boards: Board[] = [];
        const team1Names: string[] = [];
        const team2Names: string[] = [];
        console.log(playersInTeam);
        for (const username in playerBoards) {
          if (playerBoards.hasOwnProperty(username)) {
            const board = playerBoards[username];
            const team = playersInTeam.get(username);

            if (board.roomId === roomId) {
              if (team === 1) {
                team1Boards.push(board);
              } else if (team === 2) {
                team2Boards.push(board);
              }
            }
          }
        }

        // -----------------
        let playFieldTeam1: string[][] = Array.from(
          { length: team1Boards[0].rows },
          () => Array(team1Boards[0].cols).fill(".")
        );
        let playFieldTeam2: string[][] = Array.from(
          { length: team1Boards[0].rows },
          () => Array(team1Boards[0].cols).fill(".")
        );
        const combinedTeam1Ships: Ship[] = [];
        const combinedTeam2Ships: Ship[] = [];
        const combinedTeam1Mines: Position[] = [];
        const combinedTeam2Mines: Position[] = [];
        team1Boards.forEach((board, boardIndex) => {
          board.ships.forEach((ship, shipIndex) => {
            const newShip: Ship = new Ship(
              ship.identifier + ":" + board.boardOwner, // damit jedes schiff von jedem einen unique identifier hat
              ship.isHorizontal,
              ship.startPosition,
              ship.length
            );
            for (let i = 0; i < newShip.length; i++) {
              let { x, y } = newShip.startPosition;
              let id = newShip.identifier;
              playFieldTeam1[y][x] = id;
              if (!newShip.isHorizontal) {
                // === "Y"
                playFieldTeam1[y + i][x] = id;
              } else {
                playFieldTeam1[y][x + i] = id;
              }
            }
            combinedTeam1Ships.push(newShip);
          });
          combinedTeam1Mines.push(...board.mines);
          team1Names.push(board.boardOwner);
        });
        team2Boards.forEach((board, boardIndex) => {
          board.ships.forEach((ship, shipIndex) => {
            const newShip: Ship = new Ship(
              ship.identifier + ":" + board.boardOwner, // damit jedes schiff von jedem einen unique identifier hat
              ship.isHorizontal,
              ship.startPosition,
              ship.length
            );
            for (let i = 0; i < newShip.length; i++) {
              let { x, y } = newShip.startPosition;
              let id = newShip.identifier;
              playFieldTeam2[y][x] = id;
              if (!newShip.isHorizontal) {
                // === "Y"
                playFieldTeam2[y + i][x] = id;
              } else {
                playFieldTeam2[y][x + i] = id;
              }
            }
            combinedTeam2Ships.push(newShip);
          });
          combinedTeam2Mines.push(...board.mines);
          team2Names.push(board.boardOwner);
        });
        const team1Board = new Board(
          team1Boards[0].rows,
          team1Boards[0].cols,
          combinedTeam1Ships.length,
          Team1Name, // anderer Name?
          playFieldTeam1,
          combinedTeam1Ships,
          roomId,
          combinedTeam1Mines
        );
        const team2Board = new Board(
          team1Boards[0].rows,
          team1Boards[0].cols,
          combinedTeam2Ships.length,
          Team2Name, // anderer Name?
          playFieldTeam2,
          combinedTeam2Ships,
          roomId,
          combinedTeam2Mines
        );
        boardsWithRoomId.push(team1Board, team2Board);
        // ----------------
        let num = Math.random() < 0.5 ? 0 : 1;
        // gamecontroller erstellen
        const gameController = new TeamGameController(
          boardsWithRoomId,
          io,
          roomId,
          boardsWithRoomId[num].boardOwner,
          maxPlayers,
          gameMode,
          team1Names,
          team2Names
        );
        // in map speichern
        gameController
          .initialize()
          .then(() => {
            // Nachdem die Initialisierung abgeschlossen ist, wird das Spiel gestartet
            gameControllers.set(roomId, gameController);
            gameController.startGame(combinedTeam1Ships, combinedTeam2Ships);
          })
          .catch((error) => {
            console.error("Failed to initialize gameController:", error);
          });
        // socket.testee = n;
        // socket.testee.startGame();

        console.log(`Game started in room ${roomId}`);
      }
    }
  });
}
