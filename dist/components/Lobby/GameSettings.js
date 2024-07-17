"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameSettings;
const react_bootstrap_1 = require("react-bootstrap");
const Header_1 = __importDefault(require("../Header/Header"));
const GameSettings_module_css_1 = __importDefault(require("./GameSettings.module.css"));
const react_redux_1 = require("react-redux");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const LobbyReducer_1 = require("../reducer/LobbyReducer");
const socketInstance_1 = __importDefault(require("../Websocket/socketInstance"));
function GameSettings() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    let username = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    let privateMatch = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.privateMatch);
    let roomId = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.roomId);
    let team = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.team);
    let reducerHostName = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.hostName);
    const [hostName, setHostname] = (0, react_1.useState)(username);
    const [maxPlayers, setMaxPlayers] = (0, react_1.useState)(2);
    const [privateGame, setPrivate] = (0, react_1.useState)(false);
    const [gameMap, setGameMap] = (0, react_1.useState)("normal");
    const [gameMode, setGameMode] = (0, react_1.useState)("1vs1");
    const [players, setPlayers] = (0, react_1.useState)([hostName]);
    const [playersTeam, setPlayersTeam] = (0, react_1.useState)(new Map([[reducerHostName, team]]));
    const [superWeapons, setSuperWeapons] = (0, react_1.useState)(true);
    const [shotTimer, setShotTimer] = (0, react_1.useState)(10);
    const [createdRoom, setCreatedRoom] = (0, react_1.useState)(false);
    //Web Socket -> send gameSettings to backend
    (0, react_1.useEffect)(() => {
        if (username !== reducerHostName)
            socketInstance_1.default.emit("sendJoinRoom", roomId, username);
        return () => { };
    }, []);
    function handleSaveSettings() {
        let body = {
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
        if (!createdRoom)
            socketInstance_1.default.emit("sendHostLobby", body);
        else
            socketInstance_1.default.emit("sendHostUpdatedLobby", body);
    }
    (0, react_1.useEffect)(() => {
        // websocket connects to server
        if (!socketInstance_1.default)
            return;
        socketInstance_1.default.on("createdRoom", () => {
            setCreatedRoom(true);
            setHostname(username);
        });
        socketInstance_1.default.on("playerChangedTeam", (playerName, teamNumber) => {
            changeTeam(playerName, teamNumber);
        });
        socketInstance_1.default.on("playerJoinedRoom", (body, playerName) => {
            console.log(JSON.stringify(body));
            if (body && playerName)
                setEverything(body, playerName);
        });
        // start with superweapons
        socketInstance_1.default.on("startMinePlacement", (playersInTeamObj) => {
            console.log("startMinePlacement  obj", playersInTeamObj);
            const playersInTeamMap = new Map(Object.entries(playersInTeamObj));
            console.log("startMinePlacement map", playersInTeamMap);
            dispatch((0, LobbyReducer_1.setPlayersInTeam)({ playersInTeam: playersInTeamMap }));
            navigate("/mineplacement");
        });
        // start without superweapons
        socketInstance_1.default.on("startShipPlacement", (playersInTeamObj) => {
            console.log("startShipPlacement  obj", playersInTeamObj);
            const playersInTeamMap = new Map(Object.entries(playersInTeamObj));
            console.log("startShipPlacement map", playersInTeamMap);
            dispatch((0, LobbyReducer_1.setPlayersInTeam)({ playersInTeam: playersInTeamMap }));
            navigate("/shipplacement");
        });
        socketInstance_1.default.on("updatedLobby", (body) => {
            setEverything(body);
        });
        socketInstance_1.default.on("playerKicked", (playerName) => {
            if (playerName && playerName === username)
                goBack();
        });
        return () => { };
    }, [socketInstance_1.default]);
    // function to set everything lol
    function setEverything(body, playerName) {
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
                const updatedPlayersTeam = new Map(prevPlayersTeam);
                updatedPlayersTeam.set(playerName, -1);
                console.log("setEverything", updatedPlayersTeam);
                return updatedPlayersTeam;
            });
        console.log("setEverything playersTeam", playersTeam);
        dispatch((0, LobbyReducer_1.setLobby)({
            roomId: body.roomId,
            privateMatch: privateGame,
            gameMode: body.gameMode,
            hostname: body.hostName,
            maxPlayers: body.maxPlayers,
            superWeapons: body.superWeapons,
        }));
    }
    function startGame() {
        console.log("startGame", playersTeam);
        const playersInTeamObj = Object.fromEntries(playersTeam);
        if (superWeapons === true) {
            socketInstance_1.default.emit("sendStartMinePlacement", roomId, playersInTeamObj);
        }
        else
            socketInstance_1.default.emit("sendStartShipPlacement", roomId, playersInTeamObj);
    }
    function goBack() {
        // delete every state
        socketInstance_1.default.emit("sendLeaveRoom", roomId);
        dispatch((0, LobbyReducer_1.deleteLobby)());
        navigate("/online");
    }
    function kickPlayer(playerName) {
        let body = {
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
        socketInstance_1.default.emit("sendHostUpdatedLobby", body, playerName);
    }
    function changeTeam(playerName, value) {
        console.log(value);
        if (username === playerName)
            dispatch((0, LobbyReducer_1.setTeam)({ team: value }));
        setPlayersTeam((prevPlayersTeam) => {
            const updatedPlayersTeam = new Map(prevPlayersTeam);
            updatedPlayersTeam.set(playerName, value);
            console.log("changeTeam", updatedPlayersTeam);
            return updatedPlayersTeam;
        });
        console.log("changeTeam playersTeam", playersTeam);
    }
    const sendChangeTeam = (playerName, value) => {
        socketInstance_1.default.emit("sendPlayerChangedTeam", roomId, hostName !== username ? username : playerName, value);
    };
    return (<>
      <Header_1.default />
      <div className={GameSettings_module_css_1.default.pageSettings}>
        <react_bootstrap_1.Button onClick={() => goBack()}> back</react_bootstrap_1.Button>
        <h1 className={GameSettings_module_css_1.default.roomID}>Room-ID: {roomId === null || roomId === void 0 ? void 0 : roomId.toString()}</h1>
        <react_bootstrap_1.Form className={GameSettings_module_css_1.default.gameSettings}>
          <react_bootstrap_1.Row className={GameSettings_module_css_1.default.firstFormItem}>
            <react_bootstrap_1.Col>
              <react_bootstrap_1.FormGroup>
                <react_bootstrap_1.FormLabel>Player amount (max. 4)</react_bootstrap_1.FormLabel>
                <react_bootstrap_1.Form.Control className={GameSettings_module_css_1.default.settingsInput} disabled={hostName !== username ? true : false} type="number" value={maxPlayers} onChange={(event) => {
            let val = parseInt(event.target.value);
            if (gameMode === "1vs1") {
                setMaxPlayers(2);
            }
            else if (gameMode === "Team") {
                val += val % 2;
                val = val > 2 ? 4 : 4; // später auf val setzen wenn true
                setMaxPlayers(val);
            }
            else {
                val = val > 2 ? val : 3;
                setMaxPlayers(val);
            }
        }}/>
              </react_bootstrap_1.FormGroup>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col>
              <react_bootstrap_1.FormGroup>
                <react_bootstrap_1.FormLabel>Private</react_bootstrap_1.FormLabel>
                <react_bootstrap_1.Form.Check className={GameSettings_module_css_1.default.settingsCheck} disabled={hostName !== username ? true : false} type="switch" checked={privateGame} 
    // label="Private"
    onChange={(event) => {
            setPrivate(event.target.checked);
            dispatch((0, LobbyReducer_1.setPrivateMatch)({
                privateMatch: event.target.checked,
            }));
        }}/>
              </react_bootstrap_1.FormGroup>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
          <react_bootstrap_1.Row className={GameSettings_module_css_1.default.formItem}>
            <react_bootstrap_1.Col>
              <react_bootstrap_1.FormGroup>
                <react_bootstrap_1.FormLabel>gameMode</react_bootstrap_1.FormLabel>
                <react_bootstrap_1.Form.Select className={GameSettings_module_css_1.default.settingsInput} disabled={hostName !== username ? true : false} value={gameMode} onChange={(event) => {
            let newMode = event.target.value;
            setGameMode(newMode);
            if (newMode === "1vs1")
                setMaxPlayers(2);
            if (newMode === "FFA")
                setMaxPlayers(3);
            if (newMode === "Team")
                setMaxPlayers(4);
        }}>
                  <option>1vs1</option>
                  {/* <option>FFA</option> */}
                  <option>Team</option>
                  {/* <option>3</option> */}
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.FormGroup>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col>
              <react_bootstrap_1.FormGroup>
                <react_bootstrap_1.FormLabel>Map</react_bootstrap_1.FormLabel>
                <react_bootstrap_1.Form.Select className={GameSettings_module_css_1.default.settingsInput} disabled={hostName !== username ? true : false} onChange={(event) => setGameMap(event.target.value)} value={gameMap}>
                  <option>Normal</option>
                  {/* <option>3</option> */}
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.FormGroup>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
          <react_bootstrap_1.Row className={GameSettings_module_css_1.default.lastFormItem}>
            <react_bootstrap_1.FormGroup>
              <react_bootstrap_1.Col>
                <react_bootstrap_1.FormLabel>Shooting time (s)</react_bootstrap_1.FormLabel>

                <react_bootstrap_1.Form.Select className={GameSettings_module_css_1.default.settingsInput} disabled={hostName !== username ? true : false} value={shotTimer} onChange={(event) => setShotTimer(parseInt(event.target.value))}>
                  <option>10</option>
                  <option>15</option>
                  <option>20</option>
                </react_bootstrap_1.Form.Select>
              </react_bootstrap_1.Col>{" "}
              <react_bootstrap_1.Col>
                <react_bootstrap_1.FormLabel>with superWeapons?</react_bootstrap_1.FormLabel>
                <react_bootstrap_1.Form.Check className={GameSettings_module_css_1.default.settingsCheck} disabled={hostName !== username ? true : false} checked={superWeapons} type="switch" onChange={(event) => setSuperWeapons(event.target.checked)}/>
              </react_bootstrap_1.Col>
            </react_bootstrap_1.FormGroup>
          </react_bootstrap_1.Row>
          <hr />
          <div className={GameSettings_module_css_1.default.playerContainer}>
            <h4>Players:</h4>
            <br />
            {players === null || players === void 0 ? void 0 : players.map((player) => (<react_bootstrap_1.Card key={player} bg="light" className={GameSettings_module_css_1.default.playerCard}>
                <div>
                  {" "}
                  <react_bootstrap_1.Card.Title>{player}</react_bootstrap_1.Card.Title>
                  {gameMode === "Team" ? (<>
                      {" "}
                      <react_bootstrap_1.FormLabel>Team</react_bootstrap_1.FormLabel>
                      <react_bootstrap_1.Form.Select className={GameSettings_module_css_1.default.settingsInput} onChange={(event) => sendChangeTeam(player, parseInt(event.target.value))} value={playersTeam.get(player)} disabled={!(player === username || hostName === username)}>
                        {playersTeam.get(player) === -1 ? (<option>{playersTeam.get(player)}</option>) : null}
                        <option>1</option>
                        <option>2</option>
                        {/* <option>3</option> */}
                      </react_bootstrap_1.Form.Select>
                    </>) : null}
                </div>
                {hostName === player ? null : hostName === username ? (<react_bootstrap_1.Button variant="danger" size="sm" onClick={() => hostName !== player ? kickPlayer(player) : null}>
                    Kick{" "}
                  </react_bootstrap_1.Button>) : null}
              </react_bootstrap_1.Card>))}
          </div>
        </react_bootstrap_1.Form>
        <div className={GameSettings_module_css_1.default.buttons}>
          <react_bootstrap_1.Button className={GameSettings_module_css_1.default.settingsButton} onClick={() => handleSaveSettings()} disabled={hostName !== username ? true : false}>
            {!createdRoom ? "Host Game" : "Save settings"}
          </react_bootstrap_1.Button>
          <react_bootstrap_1.Button variant={(players === null || players === void 0 ? void 0 : players.length) === maxPlayers ? "success" : "light"} className={GameSettings_module_css_1.default.settingsInput} size="lg" onClick={() => startGame()} disabled={players.length === maxPlayers && // unbedingt wieder zurück ändern!!!!!!!!! auf maxplayers
            hostName === username &&
            (Array.from(playersTeam.values()).every((team) => team !== -1) || gameMode === "1vs1")
            ? false
            : true}>
            Start Game
          </react_bootstrap_1.Button>
          <react_bootstrap_1.Button onClick={() => console.log("button", playersTeam)}>
            {" "}
            print map
          </react_bootstrap_1.Button>
        </div>
      </div>
    </>);
}
//# sourceMappingURL=GameSettings.js.map