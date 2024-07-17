import {
  Button,
  Card,
  Col,
  Form,
  FormGroup,
  FormLabel,
  Row,
} from "react-bootstrap";
import Header from "../Header/Header";
import styles from "./GameSettings.module.css";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteLobby,
  setLobby,
  setPrivateMatch,
  setTeam,
  setPlayersInTeam,
} from "../reducer/LobbyReducer";
import socket from "../Websocket/socketInstance";
import { hostSettings } from "../reducer/LobbyReducer";
export default function GameSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let username = useSelector((state: any) => state.userReducer.username);
  let privateMatch = useSelector(
    (state: any) => state.lobbyReducer.privateMatch
  );
  let roomId = useSelector((state: any) => state.lobbyReducer.roomId);
  let team = useSelector((state: any) => state.lobbyReducer.team);
  let reducerHostName = useSelector(
    (state: any) => state.lobbyReducer.hostName
  );
  const [hostName, setHostname] = useState<string>(username);
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const [privateGame, setPrivate] = useState<boolean>(false);
  const [gameMap, setGameMap] = useState<string>("normal");
  const [gameMode, setGameMode] = useState<string>("1vs1");
  const [players, setPlayers] = useState<string[]>([hostName]);
  const [playersTeam, setPlayersTeam] = useState<Map<string, number>>(
    new Map([[reducerHostName, team]])
  );

  const [superWeapons, setSuperWeapons] = useState<boolean>(true);
  const [shotTimer, setShotTimer] = useState<number>(10);
  const [createdRoom, setCreatedRoom] = useState<boolean>(false);

  //Web Socket -> send gameSettings to backend
  useEffect(() => {
    if (username !== reducerHostName)
      socket.emit("sendJoinRoom", roomId, username);

    return () => {};
  }, []);

  function handleSaveSettings(): void {
    let body: hostSettings = {
      roomId: roomId,
      privateMatch: privateGame,
      maxPlayers: maxPlayers,
      gameMap: gameMap,
      // password?: string,
      gameMode: gameMode,
      hostName: username,
      players: players,
      superWeapons: superWeapons,
      shotTimer: shotTimer,
    };
    setEverything(body);
    if (!createdRoom) socket.emit("sendHostLobby", body);
    else socket.emit("sendHostUpdatedLobby", body);
  }
  useEffect(() => {
    // websocket connects to server
    if (!socket) return;
    socket.on("createdRoom", () => {
      setCreatedRoom(true);
      setHostname(username);
    });
    socket.on("playerChangedTeam", (playerName: string, teamNumber: number) => {
      changeTeam(playerName, teamNumber);
    });
    socket.on("playerJoinedRoom", (body: hostSettings, playerName: string) => {
      console.log(JSON.stringify(body));
      if (body && playerName) setEverything(body, playerName);
    });
    // start with superweapons
    socket.on("startMinePlacement", (playersInTeamObj: any) => {
      console.log("startMinePlacement  obj", playersInTeamObj);

      const playersInTeamMap = new Map(Object.entries(playersInTeamObj));
      console.log("startMinePlacement map", playersInTeamMap);

      dispatch(setPlayersInTeam({ playersInTeam: playersInTeamMap }));
      navigate("/mineplacement");
    });
    // start without superweapons
    socket.on("startShipPlacement", (playersInTeamObj: any) => {
      console.log("startShipPlacement  obj", playersInTeamObj);

      const playersInTeamMap = new Map(Object.entries(playersInTeamObj));
      console.log("startShipPlacement map", playersInTeamMap);

      dispatch(setPlayersInTeam({ playersInTeam: playersInTeamMap }));
      navigate("/shipplacement");
    });
    socket.on("updatedLobby", (body: hostSettings) => {
      setEverything(body);
    });
    socket.on("playerKicked", (playerName: string) => {
      if (playerName && playerName === username) goBack();
    });
    return () => {};
  }, [socket]);
  // function to set everything lol
  function setEverything(body: hostSettings, playerName?: string) {
    const uniquePlayers = [...new Set(body.players)];
    console.log(uniquePlayers);
    setPlayers(uniquePlayers);
    console.log(JSON.stringify(body));
    setHostname(body.hostName);
    setGameMap(body.gameMap);
    setGameMode(body.gameMode);
    setMaxPlayers(body.maxPlayers);
    // console.log(body.roomId, " roomid after joining")
    // roomId = body.roomId;
    setSuperWeapons(body.superWeapons);
    setShotTimer(body.shotTimer);
    setPrivate(body.privateMatch);
    if (playerName)
      setPlayersTeam((prevPlayersTeam) => {
        const updatedPlayersTeam: Map<string, number> = new Map<string, number>(
          prevPlayersTeam
        );
        updatedPlayersTeam.set(playerName, -1);
        console.log("setEverything", updatedPlayersTeam);
        return updatedPlayersTeam;
      });
    console.log("setEverything playersTeam", playersTeam);
    dispatch(
      setLobby({
        roomId: body.roomId,
        privateMatch: privateGame,
        gameMode: body.gameMode,
        hostname: body.hostName,
        maxPlayers: body.maxPlayers,
        superWeapons: body.superWeapons,
      })
    );
  }
  function startGame(): void {
    console.log("startGame", playersTeam);
    const playersInTeamObj = Object.fromEntries(playersTeam);
    if (superWeapons === true) {
      socket.emit("sendStartMinePlacement", roomId, playersInTeamObj);
    } else socket.emit("sendStartShipPlacement", roomId, playersInTeamObj);
  }

  function goBack(): void {
    // delete every state
    socket.emit("sendLeaveRoom", roomId);
    dispatch(deleteLobby());
    navigate("/online");
  }

  function kickPlayer(playerName: string): void {
    let body: hostSettings = {
      roomId: roomId,
      privateMatch: privateGame,
      maxPlayers: maxPlayers,
      gameMap: gameMap,
      // password?: string,
      gameMode: gameMode,
      hostName: username,
      players: players,
      superWeapons: superWeapons,
      shotTimer: shotTimer,
    };
    socket.emit("sendHostUpdatedLobby", body, playerName);
  }

  function changeTeam(playerName: string, value: number): void {
    console.log(value);
    if (username === playerName) dispatch(setTeam({ team: value }));
    setPlayersTeam((prevPlayersTeam) => {
      const updatedPlayersTeam = new Map(prevPlayersTeam);
      updatedPlayersTeam.set(playerName, value);
      console.log("changeTeam", updatedPlayersTeam);
      return updatedPlayersTeam;
    });
    console.log("changeTeam playersTeam", playersTeam);
  }
  const sendChangeTeam = (playerName: string, value: number) => {
    socket.emit(
      "sendPlayerChangedTeam",
      roomId,
      hostName !== username ? username : playerName,
      value
    );
  };

  return (
    <>
      <Header />
      <div className={styles.pageSettings}>
        <Button onClick={() => goBack()}> back</Button>
        <h1 className={styles.roomID}>Room-ID: {roomId?.toString()}</h1>
        <Form className={styles.gameSettings}>
          <Row className={styles.firstFormItem}>
            <Col>
              <FormGroup>
                <FormLabel>Player amount (max. 4)</FormLabel>
                <Form.Control
                  className={styles.settingsInput}
                  disabled={hostName !== username ? true : false}
                  type="number"
                  value={maxPlayers}
                  onChange={(event) => {
                    let val = parseInt(event.target.value);
                    if (gameMode === "1vs1") {
                      setMaxPlayers(2);
                    } else if (gameMode === "Team") {
                      val += val % 2;
                      val = val > 2 ? 4 : 4; // später auf val setzen wenn true
                      setMaxPlayers(val);
                    } else {
                      val = val > 2 ? val : 3;
                      setMaxPlayers(val);
                    }
                  }}
                />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <FormLabel>Private</FormLabel>
                <Form.Check
                  className={styles.settingsCheck}
                  disabled={hostName !== username ? true : false}
                  type="switch"
                  checked={privateGame}
                  // label="Private"
                  onChange={(event) => {
                    setPrivate(event.target.checked);
                    dispatch(
                      setPrivateMatch({
                        privateMatch: event.target.checked,
                      })
                    );
                  }}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row className={styles.formItem}>
            <Col>
              <FormGroup>
                <FormLabel>gameMode</FormLabel>
                <Form.Select
                  className={styles.settingsInput}
                  disabled={hostName !== username ? true : false}
                  value={gameMode}
                  onChange={(event) => {
                    let newMode = event.target.value;
                    setGameMode(newMode);
                    if (newMode === "1vs1") setMaxPlayers(2);
                    if (newMode === "FFA") setMaxPlayers(3);
                    if (newMode === "Team") setMaxPlayers(4);
                  }}
                >
                  <option>1vs1</option>
                  {/* <option>FFA</option> */}
                  <option>Team</option>
                  {/* <option>3</option> */}
                </Form.Select>
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <FormLabel>Map</FormLabel>
                <Form.Select
                  className={styles.settingsInput}
                  disabled={hostName !== username ? true : false}
                  onChange={(event) => setGameMap(event.target.value)}
                  value={gameMap}
                >
                  <option>Normal</option>
                  {/* <option>3</option> */}
                </Form.Select>
              </FormGroup>
            </Col>
          </Row>
          <Row className={styles.lastFormItem}>
            <FormGroup>
              <Col>
                <FormLabel>Shooting time (s)</FormLabel>

                <Form.Select
                  className={styles.settingsInput}
                  disabled={hostName !== username ? true : false}
                  value={shotTimer}
                  onChange={(event) =>
                    setShotTimer(parseInt(event.target.value))
                  }
                >
                  <option>10</option>
                  <option>15</option>
                  <option>20</option>
                </Form.Select>
              </Col>{" "}
              <Col>
                <FormLabel>with superWeapons?</FormLabel>
                <Form.Check
                  className={styles.settingsCheck}
                  disabled={hostName !== username ? true : false}
                  checked={superWeapons}
                  type="switch"
                  onChange={(event) => setSuperWeapons(event.target.checked)}
                />
              </Col>
            </FormGroup>
          </Row>
          <hr />
          <div className={styles.playerContainer}>
            <h4>Players:</h4>
            <br />
            {players?.map((player) => (
              <Card key={player} bg="light" className={styles.playerCard}>
                <div>
                  {" "}
                  <Card.Title>{player}</Card.Title>
                  {gameMode === "Team" ? (
                    <>
                      {" "}
                      <FormLabel>Team</FormLabel>
                      <Form.Select
                        className={styles.settingsInput}
                        onChange={(event) =>
                          sendChangeTeam(player, parseInt(event.target.value))
                        }
                        value={playersTeam.get(player)}
                        disabled={
                          !(player === username || hostName === username)
                        }
                      >
                        {playersTeam.get(player) === -1 ? (
                          <option>{playersTeam.get(player)}</option>
                        ) : null}
                        <option>1</option>
                        <option>2</option>
                        {/* <option>3</option> */}
                      </Form.Select>
                    </>
                  ) : null}
                </div>
                {hostName === player ? null : hostName === username ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      hostName !== player ? kickPlayer(player) : null
                    }
                  >
                    Kick{" "}
                  </Button>
                ) : null}
              </Card>
            ))}
          </div>
        </Form>
        <div className={styles.buttons}>
          <Button
            className={styles.settingsButton}
            onClick={() => handleSaveSettings()}
            disabled={hostName !== username ? true : false}
          >
            {!createdRoom ? "Host Game" : "Save settings"}
          </Button>
          <Button
            variant={players?.length === maxPlayers ? "success" : "light"}
            className={styles.settingsInput}
            size="lg"
            onClick={() => startGame()}
            disabled={
              players.length === maxPlayers && // unbedingt wieder zurück ändern!!!!!!!!! auf maxplayers
              hostName === username &&
              (Array.from(playersTeam.values()).every((team) => team !== -1)|| gameMode==="1vs1")
                ? false
                : true
            }
          >
            Start Game
          </Button>
          <Button onClick={() => console.log("button", playersTeam)}>
            {" "}
            print map
          </Button>
        </div>
      </div>
    </>
  );
}
