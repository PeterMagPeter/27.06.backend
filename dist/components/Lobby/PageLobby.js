"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PageLobby;
const react_bootstrap_1 = require("react-bootstrap");
const Header_1 = __importDefault(require("../Header/Header"));
const PageLobby_module_css_1 = __importDefault(require("./PageLobby.module.css"));
const react_router_dom_1 = require("react-router-dom");
const socketInstance_1 = __importDefault(require("../Websocket/socketInstance"));
const LobbyReducer_1 = require("../reducer/LobbyReducer");
const react_1 = require("react");
const react_redux_1 = require("react-redux");
function PageLobby() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const dispatch = (0, react_redux_1.useDispatch)();
    let username = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    const [games, setGames] = (0, react_1.useState)();
    const [gameMode, setGameMode] = (0, react_1.useState)("");
    const [roomInput, setRoomInput] = (0, react_1.useState)("");
    //placeholders------------------ change to hostSettings interface in future
    function deleteAllRooms() {
        socketInstance_1.default.emit("sendCloseAllRooms");
    }
    function joinLobby() {
        dispatch((0, LobbyReducer_1.setLobby)({
            roomId: roomInput,
        }));
        navigate("/onlineGameSettings");
    }
    (0, react_1.useEffect)(() => {
        socketInstance_1.default.emit("sendGetLobbies", gameMode);
        return () => { };
    }, []);
    (0, react_1.useEffect)(() => {
        // websocket connects to server
        if (!socketInstance_1.default)
            return;
        socketInstance_1.default.on("getLobbies", (body) => {
            setGames(body);
        });
        return () => { };
    }, [socketInstance_1.default]);
    function joinGame(roomId, privateMatch, gameMode, hostName, maxPlayers, superWeapons) {
        dispatch((0, LobbyReducer_1.setLobby)({
            roomId: roomId,
            privateMatch: privateMatch,
            gameMode: gameMode,
            hostName: hostName,
            maxPlayers: maxPlayers,
            superWeapons: superWeapons,
        }));
        navigate("/onlineGameSettings");
    }
    function getLobbies() {
        socketInstance_1.default.emit("sendGetLobbies", gameMode); // zu gamemode variable ändern
    }
    //------------------------------
    return (<>
      <Header_1.default />

      <div className={PageLobby_module_css_1.default.lobbyPage}>
        <div className={PageLobby_module_css_1.default.searchContainer}>
          <react_bootstrap_1.Form.Select onChange={(event) => {
            let newMode = event.target.value;
            if (newMode === "All")
                newMode = "";
            setGameMode(newMode);
        }}>
            <option>All</option>
            <option>1vs1</option>
            {/* <option>FFA</option> */}
            <option>Team</option>
            {/* <option>3</option> */}
          </react_bootstrap_1.Form.Select>
          <react_bootstrap_1.Button size="lg" onClick={getLobbies}>
            {" "}
            get Lobbies
          </react_bootstrap_1.Button>
          <react_bootstrap_1.Form.Group controlId="validationCustom01">
            <react_bootstrap_1.Form.Label>RoomID</react_bootstrap_1.Form.Label>
            <react_bootstrap_1.Form.Control type="text" placeholder="..." value={roomInput} onChange={(e) => setRoomInput(e.target.value)}/>
            <react_bootstrap_1.Form.Control.Feedback>Looks good!</react_bootstrap_1.Form.Control.Feedback>
            <react_bootstrap_1.Button onClick={joinLobby}> Join</react_bootstrap_1.Button>
          </react_bootstrap_1.Form.Group>
          <react_bootstrap_1.Button variant="danger" size="sm" className={PageLobby_module_css_1.default.onlineButton2} onClick={() => deleteAllRooms()}>
            DELETE ALL ROOMS
          </react_bootstrap_1.Button>
        </div>
        <react_bootstrap_1.Container className={PageLobby_module_css_1.default.lobbyContent}>
          <h1>Game Lobby</h1>
          <div className={PageLobby_module_css_1.default.gameCards}>
            {games === null || games === void 0 ? void 0 : games.map((game) => {
            var _a, _b;
            return (<div className={PageLobby_module_css_1.default.gameCard}>
                <h4 className={PageLobby_module_css_1.default.gameTitle}>
                  Game <b>{game.roomId}</b>&nbsp;&nbsp;&nbsp;&nbsp;Host:{" "}
                  {game.hostName}
                </h4>
                <hr />
                <h5 className={PageLobby_module_css_1.default.gameText}>
                  Players: {(_a = game.players) === null || _a === void 0 ? void 0 : _a.length}/{game.maxPlayers}, time:{" "}
                  {game.shotTimer} min
                </h5>
                <hr />
                {((_b = game.players) === null || _b === void 0 ? void 0 : _b.length) != game.maxPlayers && (<button className={PageLobby_module_css_1.default.gameCardFooterButton} onClick={() => joinGame(game.roomId, game.privateMatch, game.gameMode, game.hostName, game.maxPlayers, game.superWeapons)}>
                    Join
                  </button>)}
                <button className={PageLobby_module_css_1.default.gameCardFooterButton} disabled={true}>
                  Watch
                </button>
              </div>);
        })}
          </div>
        </react_bootstrap_1.Container>
      </div>
    </>);
}
//# sourceMappingURL=PageLobby.js.map