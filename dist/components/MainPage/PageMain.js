"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PageMain;
const react_1 = require("react");
const react_bootstrap_1 = require("react-bootstrap");
const Header_1 = __importDefault(require("../Header/Header"));
const PageMain_module_css_1 = __importDefault(require("./PageMain.module.css"));
const react_router_dom_1 = require("react-router-dom");
const react_redux_1 = require("react-redux");
const LobbyReducer_1 = require("../reducer/LobbyReducer");
const Resources_1 = require("../../Resources");
const socketInstance_1 = __importDefault(require("../Websocket/socketInstance"));
const TestReducer_1 = require("../reducer/TestReducer");
function PageMain() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const dispatch = (0, react_redux_1.useDispatch)();
    let username = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    const [leaderboard, setLeaderboard] = (0, react_1.useState)();
    const [ownRank, setOwnRank] = (0, react_1.useState)(-1);
    const playAgainstAi = () => {
        dispatch((0, LobbyReducer_1.setAiDifficulty)({
            vsAi: true,
            aiDifficulty: 0.5,
        }));
        let roomID = (0, Resources_1.generateRoomId)();
        dispatch(
        // private ki lobby
        (0, LobbyReducer_1.setLobby)({
            roomId: roomID,
            gameMode: "1vs1",
            maxPlayers: 1,
            privateMatch: true,
            hostName: username,
            superWeapons: false,
        }));
        socketInstance_1.default.emit("sendJoinRoom", roomID, username);
        // oder noch lobby davor?
        navigate("/shipplacement");
        // navigate("/mineplacement");
    };
    const playOnline = () => {
        // make sure that ai states are false
        dispatch((0, LobbyReducer_1.setAiDifficulty)({
            vsAi: false,
            aiDifficulty: -1,
        }));
        // to martyna's code
        navigate("/online");
    };
    (0, react_1.useEffect)(() => {
        socketInstance_1.default.emit("sendGiveMeMySkin", username);
        socketInstance_1.default.emit("sendGetUser", username);
        socketInstance_1.default.emit("sendGetLeaderboard");
        return () => { };
    }, []);
    (0, react_1.useEffect)(() => {
        // websocket connects to server
        // const newSocket: any = io(`${server}`);
        if (socketInstance_1.default) {
            socketInstance_1.default.on("giveSkin", (skin) => {
                dispatch((0, TestReducer_1.setSkin)({ skin: skin }));
            });
            socketInstance_1.default.on("getLeaderboard", (leaderBoard2) => {
                var _a;
                console.log(leaderBoard2);
                setLeaderboard(leaderBoard2);
                let me = (_a = leaderBoard2.find((user) => user.username === username)) === null || _a === void 0 ? void 0 : _a.rank;
                setOwnRank(me ? me : -999);
            });
            socketInstance_1.default.on("getUser", (user) => {
                dispatch((0, TestReducer_1.setUserObject)({ user: user }));
                console.log(user);
                dispatch((0, TestReducer_1.setSkin)({ skin: user.skin }));
            });
        }
    });
    return (<div className={PageMain_module_css_1.default.container}>
      <Header_1.default />
      <div className={PageMain_module_css_1.default.mainPage}>
        <react_bootstrap_1.Container className={PageMain_module_css_1.default.mainContent}>
          <react_bootstrap_1.Row className="justify-content-center align-items-center h-100">
            <react_bootstrap_1.Col md={6} className="text-center">
              <react_bootstrap_1.Container className={`d-grid gap-2 ${PageMain_module_css_1.default.buttonsContainer}`}>
                <button onClick={() => playAgainstAi()} className={PageMain_module_css_1.default.customButton}>
                  Offline-Modus
                </button>
                <button className={PageMain_module_css_1.default.customButton} onClick={() => playOnline()}>
                  Online-Modus
                </button>
              </react_bootstrap_1.Container>
            </react_bootstrap_1.Col>
            <react_bootstrap_1.Col md={4} className="d-flex flex-column align-items-center">
              <div className={PageMain_module_css_1.default.ranking}>
                <h2>Global</h2>
                <h4>Leaderboard</h4>
                <p>#{ownRank}</p>
                <p>Ranking 248</p>
                <table className={PageMain_module_css_1.default.rankingTable}>
                  <thead>
                    <tr>
                      <th>rank</th>
                      <th>username</th>
                      <th>country</th>
                      <th>level</th>
                      <th>points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard === null || leaderboard === void 0 ? void 0 : leaderboard.slice(0, 10).map((entry, index) => (<tr key={index}>
                        <td>{entry.rank}</td>
                        <td>{entry.username}</td>
                        <td>{entry.country}</td>
                        <td>{entry.level}</td>
                        <td>{entry.points}</td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </react_bootstrap_1.Col>
          </react_bootstrap_1.Row>
        </react_bootstrap_1.Container>
      </div>
    </div>);
}
//# sourceMappingURL=PageMain.js.map