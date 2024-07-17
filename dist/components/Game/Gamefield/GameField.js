"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GameField;
const GameField_module_css_1 = __importDefault(require("./GameField.module.css"));
const react_1 = require("react");
const react_bootstrap_1 = require("react-bootstrap");
const react_redux_1 = require("react-redux");
const react_router_dom_1 = require("react-router-dom");
const cof_logo_png_1 = __importDefault(require("../../../assets/pictures/cof_logo.png"));
const LobbyReducer_1 = require("../../reducer/LobbyReducer");
const socketInstance_1 = __importDefault(require("../../Websocket/socketInstance"));
const howler_1 = require("howler");
// ship images
const _2_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/2.png"));
const _3_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/3.png"));
const _4_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/4.png"));
const _5_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/5.png"));
const _2r_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/2r.png"));
const _3r_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/3r.png"));
const _4r_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/4r.png"));
const _5r_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/5r.png"));
// Sound Files
const hitSound = "/sounds/hit.mp3";
const missSound = "/sounds/miss.mp3";
const shipDestroyed = "/sounds/shipD.mp3";
const loser = "/sounds/loser.mp3";
const myDis = "/sounds/myDis.mp3";
const victory = "/sounds/victory.mp3";
const battleMusic = "/sounds/battleMusic.mp3";
// sound files end ------
const server = process.env.REACT_APP_API_SERVER_URL;
const fieldSize = 10;
let hiddenLayout = Array.from({ length: fieldSize }, () => Array(fieldSize).fill(null));
const waitingTime = 700;
const shootingTimer = 600;
const modalTime = 1000;
const afterModalTime = 1000;
function GameField() {
    // Player
    let username = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    let initPlayer = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.initPlayer);
    let roomId = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.roomId);
    let privateMatch = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.privateMatch);
    let startMusic = (0, react_1.useRef)(true);
    let ownShips = (0, react_redux_1.useSelector)((state) => state.userReducer.ships);
    let difficulty = (0, react_redux_1.useSelector)((state) => state.userReducer.aiDifficulty);
    let cooldown = (0, react_1.useRef)(false); // schuss cooldown zwischen den schüssen
    const [enemyShips, setEnemyShips] = (0, react_1.useState)([]);
    // const [enabledPlayer, setEnabledPlayer] = useState<string>(username);
    let enabledPlayer = (0, react_1.useRef)(initPlayer); // who is currently shooting
    let nextShooter = (0, react_1.useRef)(username); // who is next
    const [whosTurn, setWhosTurn] = (0, react_1.useState)(false);
    const dispatch = (0, react_redux_1.useDispatch)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    //  Sounds
    let sfxVolume = (0, react_redux_1.useSelector)((state) => state.settingsReducer.sfxVolume);
    let musicVolume = (0, react_redux_1.useSelector)((state) => state.settingsReducer.musicVolume);
    (0, react_1.useEffect)(() => {
        console.log("changed intiplayer ");
        changeEnabledPlayer(initPlayer);
        return () => { };
    }, [initPlayer]);
    const playSFXSound = (soundUrl) => {
        const sound = new howler_1.Howl({
            src: [soundUrl],
            volume: sfxVolume,
        });
        sound.play();
    };
    const playMusicSound = (soundUrl) => {
        const sound = new howler_1.Howl({
            src: [soundUrl],
            volume: musicVolume,
            loop: true,
        });
        sound.play();
    };
    (0, react_1.useEffect)(() => {
        if (startMusic.current) {
            startMusic.current = false;
            playMusicSound(battleMusic);
        }
        return () => { };
    }, []);
    function positionToString(position) {
        return position.x.toString() + position.y.toString();
    }
    // -----------------------------
    // Websocket---------------------
    // const socket = useWebSocket();
    (0, react_1.useEffect)(() => {
        // websocket connects to server
        // const newSocket: any = io(`${server}`);
        if (socketInstance_1.default) {
            socketInstance_1.default.on("hitEvent", (body) => {
                setHitEvent(body.x, body.y, body.username, body.hit, body.switchTo);
            });
            socketInstance_1.default.on("shipDestroyed", (body, shooter) => {
                // schiff und der der geschossen hat
                setShipDestroyed(body, shooter);
            });
            socketInstance_1.default.on("gameOver", (body) => {
                socketInstance_1.default.emit("sendLeaveRoom", roomId, privateMatch);
                dispatch((0, LobbyReducer_1.deleteLobby)());
                // bekommt gewinner namen
                if (body.username === username) {
                    playSFXSound(victory);
                    navigate("/win");
                }
                else {
                    playSFXSound(loser);
                    playSFXSound(myDis);
                    navigate("/loose");
                }
            });
            // need to set the socket at bottom to emit something
        }
        return () => { };
    }, [socketInstance_1.default]);
    // set backgroundcolor/ classname of button
    const changeColor = (button, event) => {
        if (button) {
            button.classList.forEach((className) => button.classList.remove(className));
            if (event === "Hit") {
                // button.innerHTML = "X";
                button.setAttribute("data-state", "X");
                button.classList.add(GameField_module_css_1.default.Hit);
                playSFXSound(hitSound);
            }
            else if (event === "Miss") {
                // button.innerHTML = "O";
                button.setAttribute("data-state", "O");
                button.classList.add(GameField_module_css_1.default.Miss);
                playSFXSound(missSound);
            }
            else if (event === "Destroyed") {
                // button.innerHTML = "";
                button.setAttribute("data-state", "D");
                button.classList.add(GameField_module_css_1.default.Destroyed);
                playSFXSound(shipDestroyed);
            }
        }
    };
    // Functions that the Player sends
    function sendShot(position) {
        let id = positionToString(position);
        const button = document.getElementById(id);
        let newX = position.x;
        let body = { x: newX, y: position.y, username: username, roomId: roomId };
        // console.log(body, " sendShot body")
        if (button && button.getAttribute("data-state") === "")
            if (socketInstance_1.default) {
                socketInstance_1.default.emit("sendShot", body);
            }
    }
    // Funktionen die Websocket aufruft------------
    // Websocket ruft auf und setzt das Feld auf die passende Farbe.
    function setHitEvent(x, y, shooter, hit, switchTo) {
        let position = { x: x, y: y };
        let id = positionToString(position);
        if (username !== shooter)
            id = id + "E";
        const button = document.getElementById(id);
        // console.log(id, hit, username, shooter);
        let booli = hit ? "Hit" : "Miss";
        if (button) {
            changeColor(button, booli);
        }
        console.log("setHit", switchTo, enabledPlayer.current);
        nextShooter.current = switchTo;
        cooldown.current = true;
        setTimeout(() => {
            cooldown.current = false;
            if (switchTo !== enabledPlayer.current) {
                // setEnabledPlayer(switchTo);
                changeEnabledPlayer(switchTo);
            }
        }, shootingTimer);
    }
    // Websocket setzt ein Schiff auf zerstört und es wird damit sichtbar
    function setShipDestroyed(ship, shooter) {
        console.log(JSON.stringify(ship), " shooter: ", shooter);
        let positions = [{ x: 0, y: 0 }];
        for (let i = 0; i < ship.length; i++) {
            positions[i] =
                ship.direction === "X"
                    ? { x: ship.startX + i, y: ship.startY }
                    : { x: ship.startX, y: ship.startY + i };
        }
        positions.forEach((position) => {
            let id = positionToString(position);
            if (username !== shooter)
                id = id + "E";
            const button = document.getElementById(id);
            if (button) {
                changeColor(button, "Destroyed");
            }
        });
        if (shooter === username)
            setEnemyShips((prevShips) => [...prevShips, ship]);
    }
    const generateShips = (ships) => {
        const divs = [];
        // Generate own ships
        for (let i = 0; i < ships.length; i++) {
            let s = ships[i];
            let startRow = s.startX + 2;
            let startColumn = s.startY + 2;
            let endColumn, endRow;
            let shipImage = _2_png_1.default;
            if (s.direction === "X") {
                endRow = startRow + s.length;
                endColumn = startColumn;
                switch (s.length) {
                    case 2:
                        shipImage = _2_png_1.default;
                        break;
                    case 3:
                        shipImage = _3_png_1.default;
                        break;
                    case 4:
                        shipImage = _4_png_1.default;
                        break;
                    case 5:
                        shipImage = _5_png_1.default;
                        break;
                    default:
                        break;
                }
            }
            else {
                endRow = startRow;
                endColumn = startColumn + s.length;
                switch (s.length) {
                    case 2:
                        shipImage = _2r_png_1.default;
                        break;
                    case 3:
                        shipImage = _3r_png_1.default;
                        break;
                    case 4:
                        shipImage = _4r_png_1.default;
                        break;
                    case 5:
                        shipImage = _5r_png_1.default;
                        break;
                    default:
                        break;
                }
            }
            divs.push(<div style={{
                    gridColumn: `${startRow} / ${endRow}`,
                    gridRow: `${startColumn} / ${endColumn}`,
                }} className={GameField_module_css_1.default.miniContainer} key={i}>
          <react_bootstrap_1.Image className={GameField_module_css_1.default.miniImagesW} src={shipImage}/>
        </div>);
        }
        return divs;
    };
    const whichTurn = username === enabledPlayer.current;
    const changeEnabledPlayer = (switchTo) => {
        // shows whos turn it is as Modal
        console.log(switchTo, enabledPlayer.current);
        showWhosTurn();
        setTimeout(() => {
            enabledPlayer.current = switchTo;
        }, afterModalTime);
        cooldown.current = false;
    };
    const showWhosTurn = () => {
        setWhosTurn(true);
        setTimeout(() => {
            setWhosTurn(false);
        }, modalTime);
    };
    const addEnemyShip = () => {
        setEnemyShips((prevShips) => [...prevShips, ownShips[enemyShips.length]]);
    };
    return (<>
      <div className={GameField_module_css_1.default.container}>
        <react_bootstrap_1.Image className={GameField_module_css_1.default.Logo} src={cof_logo_png_1.default}/>
        <div className={GameField_module_css_1.default.whosTurn}>
          {" "}
          <a className={GameField_module_css_1.default.playerName}>{enabledPlayer.current}</a>'s TURN
        </div>
        {/* GAME FIELD WHERE PLAYER IS PLAYING */}
        <div className={whichTurn ? GameField_module_css_1.default.GameField : GameField_module_css_1.default.Ownboard}>
          {generateShips(enemyShips)}
          {Array.from({ length: fieldSize }, (_, index) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + index);
            let letter2 = whichTurn ? letter : letter + "E";
            return (<div className={GameField_module_css_1.default[letter2]}>
                <p>{letter}</p>
              </div>);
        })}
          {Array.from({ length: fieldSize }, (_, index) => {
            let num = index + 1;
            let s = whichTurn ? "" : "E";
            let num2 = "N" + num + s;
            return (<div className={GameField_module_css_1.default[num2]}>
                <p>{index + 1}</p>
              </div>);
        })}
          {hiddenLayout.map((row, rowIndex) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + rowIndex);
            return row.map((item, itemIndex) => {
                let s = whichTurn ? "" : "E";
                let coordinate = letter + (itemIndex + 1) + s;
                let id = positionToString({ x: rowIndex, y: itemIndex });
                const button = document.getElementById(id);
                let newButton = GameField_module_css_1.default.button;
                if (button) {
                    newButton =
                        button.getAttribute("data-state") === "X"
                            ? GameField_module_css_1.default.Hit
                            : button.getAttribute("data-state") === "D"
                                ? GameField_module_css_1.default.Destroyed
                                : button.getAttribute("data-state") === "O"
                                    ? GameField_module_css_1.default.Miss
                                    : GameField_module_css_1.default.button;
                }
                return (<div className={GameField_module_css_1.default[coordinate]}>
                  <button data-state="" className={newButton} id={positionToString({
                        x: rowIndex,
                        y: itemIndex,
                    })} onClick={() => {
                        if (whichTurn && !cooldown.current) {
                            sendShot({
                                x: rowIndex,
                                y: itemIndex,
                            });
                        }
                    }}></button>
                </div>);
            });
        })}
        </div>
        {/* OWN BOARD WHERE ENEMY IS PLAYING */}
        <div className={!whichTurn ? GameField_module_css_1.default.GameField : GameField_module_css_1.default.Ownboard}>
          {generateShips(ownShips)}

          {Array.from({ length: fieldSize }, (_, index) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + index);
            let letter2 = !whichTurn ? letter : letter + "E";
            return <div className={GameField_module_css_1.default[letter2]}>{letter}</div>;
        })}
          {Array.from({ length: fieldSize }, (_, index) => {
            let num = index + 1;
            let s = !whichTurn ? "" : "E";
            let num2 = "N" + num + s;
            return <div className={GameField_module_css_1.default[num2]}>{index + 1}</div>;
        })}
          {hiddenLayout.map((row, rowIndex) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + rowIndex);
            return row.map((item, itemIndex) => {
                let s = !whichTurn ? "" : "E";
                let coordinate = letter + (itemIndex + 1) + s;
                let id = positionToString({ x: rowIndex, y: itemIndex }) + "E";
                const button = document.getElementById(id);
                let newButton = GameField_module_css_1.default.button;
                if (button) {
                    newButton =
                        button.getAttribute("data-state") === "X"
                            ? GameField_module_css_1.default.Hit
                            : button.getAttribute("data-state") === "D"
                                ? GameField_module_css_1.default.Destroyed
                                : button.getAttribute("data-state") === "O"
                                    ? GameField_module_css_1.default.Miss
                                    : GameField_module_css_1.default.buttonE;
                }
                return (<div className={GameField_module_css_1.default[coordinate]}>
                  <button data-state="" className={newButton} id={positionToString({
                        x: rowIndex,
                        y: itemIndex,
                    }) + "E"}></button>
                </div>);
            });
        })}
        </div>
        <react_bootstrap_1.Button className={GameField_module_css_1.default.Emotes} variant="secondary">
          {" "}
          Emotes
        </react_bootstrap_1.Button>
        <react_bootstrap_1.Modal show={whosTurn} onHide={() => setWhosTurn(false)} backdrop="static" keyboard={false} centered animation={true} className="blur-background">
          <react_bootstrap_1.Modal.Title className={GameField_module_css_1.default.modalText}>
            {nextShooter.current} ist jetzt dran
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal>
      </div>
    </>);
}
//# sourceMappingURL=GameField.js.map