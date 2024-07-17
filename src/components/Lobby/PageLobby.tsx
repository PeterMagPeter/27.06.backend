import { Container, Button, Form } from "react-bootstrap";
import Header from "../Header/Header";
import styles from "./PageLobby.module.css";
import { useNavigate } from "react-router-dom";
import socket from "../Websocket/socketInstance";
import { hostSettings, setLobby } from "../reducer/LobbyReducer";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function PageLobby() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let username = useSelector((state: any) => state.userReducer.username);
  const [games, setGames] = useState<hostSettings[]>();
  const [gameMode, setGameMode] = useState<string>("");
  const [roomInput, setRoomInput] = useState<string>("");
  //placeholders------------------ change to hostSettings interface in future

  function deleteAllRooms(): void {
    socket.emit("sendCloseAllRooms");
  }
  function joinLobby(): void {
    dispatch(
      setLobby({
        roomId: roomInput,
      })
    );
    navigate("/onlineGameSettings");
  }
  useEffect(() => {
    socket.emit("sendGetLobbies", gameMode);

    return () => {};
  }, []);

  useEffect(() => {
    // websocket connects to server
    if (!socket) return;
    socket.on("getLobbies", (body: hostSettings[]) => {
      setGames(body);
    });

    return () => {};
  }, [socket]);

  function joinGame(
    roomId: string,
    privateMatch: boolean,
    gameMode: string,
    hostName: string,
    maxPlayers: number,
    superWeapons: boolean
  ): void {
    dispatch(
      setLobby({
        roomId: roomId,
        privateMatch: privateMatch,
        gameMode: gameMode,
        hostName: hostName,
        maxPlayers: maxPlayers,
        superWeapons: superWeapons,
      })
    );
    navigate("/onlineGameSettings");
  }
  function getLobbies() {
    socket.emit("sendGetLobbies", gameMode); // zu gamemode variable ändern
  }

  //------------------------------

  return (
    <>
      <Header  />

      <div className={styles.lobbyPage}>
        <div className={styles.searchContainer}>
          <Form.Select
            onChange={(event) => {
              let newMode = event.target.value;
              if (newMode === "All") newMode = "";
              setGameMode(newMode);
            }}
          >
            <option>All</option>
            <option>1vs1</option>
            {/* <option>FFA</option> */}
            <option>Team</option>
            {/* <option>3</option> */}
          </Form.Select>
          <Button size="lg" onClick={getLobbies}>
            {" "}
            get Lobbies
          </Button>
          <Form.Group controlId="validationCustom01">
            <Form.Label>RoomID</Form.Label>
            <Form.Control
              type="text"
              placeholder="..."
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Button onClick={joinLobby}> Join</Button>
          </Form.Group>
          <Button
            variant="danger" 
            size="sm"
            className={styles.onlineButton2}
            onClick={() => deleteAllRooms()}
          >
            DELETE ALL ROOMS
          </Button>
        </div>
        <Container className={styles.lobbyContent}>
          <h1>Game Lobby</h1>
          <div className={styles.gameCards}>
            {games?.map((game: hostSettings) => (
              <div className={styles.gameCard}>
                <h4 className={styles.gameTitle}>
                  Game <b>{game.roomId}</b>&nbsp;&nbsp;&nbsp;&nbsp;Host:{" "}
                  {game.hostName}
                </h4>
                <hr />
                <h5 className={styles.gameText}>
                  Players: {game.players?.length}/{game.maxPlayers}, time:{" "}
                  {game.shotTimer} min
                </h5>
                <hr />
                {game.players?.length != game.maxPlayers && (
                  <button
                    className={styles.gameCardFooterButton}
                    onClick={() =>
                      joinGame(
                        game.roomId!,
                        game.privateMatch,
                        game.gameMode,
                        game.hostName,
                        game.maxPlayers,
                        game.superWeapons
                      )
                    }
                  >
                    Join
                  </button>
                )}
                <button className={styles.gameCardFooterButton} disabled={true}>
                  Watch
                </button>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </>
  );
}
