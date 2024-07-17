"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TeamGameField;
const TeamGameFieldFinal_module_css_1 = __importDefault(require("./TeamGameFieldFinal.module.css"));
const react_1 = require("react");
const react_bootstrap_1 = require("react-bootstrap");
const react_redux_1 = require("react-redux");
const react_router_dom_1 = require("react-router-dom");
const LobbyReducer_1 = require("../../reducer/LobbyReducer");
const socketInstance_1 = __importDefault(require("../../Websocket/socketInstance"));
const howler_1 = require("howler");
const Resources_1 = require("../../../Resources");
const Mine_png_1 = __importDefault(require("../../../assets/pictures/Spezialwaffen/Mine.png"));
const Torpedo_png_1 = __importDefault(require("../../../assets/pictures/Spezialwaffen/Torpedo.png"));
const Hubschrauber_png_1 = __importDefault(require("../../../assets/pictures/Spezialwaffen/Hubschrauber.png"));
const pfeil_png_1 = __importDefault(require("../../../assets/pictures/Spezialwaffen/pfeil.png"));
// Sound Files
const hitSound = "/sounds/hit.mp3";
const missSound = "/sounds/miss.mp3";
const shipDestroyed = "/sounds/shipD.mp3";
const loser = "/sounds/loser.mp3";
const myDis = "/sounds/myDis.mp3";
const victory = "/sounds/victory.mp3";
const battleMusic = "/sounds/battleMusic.mp3";
const torpedoSound = "/sounds/torpedoSound.mp3";
const droneSound = "/sounds/droneSound.mp3";
// sound files end ------
// TODO
/**
 * - schiffe von mates anzeigen, und alle vom gegner
 * - spielfeld auf ordentliche größe anpassen (auch gameprototype)
 * - nach ablauf von timer random (oder gar nicht) schießen
 * - schön designen
 * - button von partner anders farbig und nach wechsel grün weg -c
 * - wenn einer getroffen hat alle wieder freigeben oder board tauschen -c
 * - anch hit wieder dran - c
 * - spieler machen ready um zu schießen - button wieder freigeben -c
 * - spieler wählen feld zum schießen aus - c
 * - partner sieht schuss platzierung - c
 * - keine gleiche auswahl - juckt
 *
 */
function TeamGameField() {
    // Ships
    let skin = (0, react_redux_1.useSelector)((state) => state.userReducer.skin);
    let playersSkins = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.playersSkins);
    console.log("playersSkins", playersSkins);
    // Player
    let username = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    let initPlayer = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.initPlayer);
    let roomId = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.roomId);
    let gameMode = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.gameMode);
    // let gameMode = "Team";
    let privateMatch = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.privateMatch);
    let playersInTeam = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.playersInTeam);
    let team = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.team);
    let firstRound = (0, react_1.useRef)(true);
    const teamName = Resources_1.TeamNames[team - 1];
    let maxPlayers = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.maxPlayers);
    let startMusic = (0, react_1.useRef)(true);
    let ownShips = (0, react_redux_1.useSelector)((state) => state.userReducer.ships);
    let ownMines = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.mines);
    // SuperWeapons
    let superWeapons = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.superWeapons);
    const [toggledSuperWeapon, setToggledSuperWeapon] = (0, react_1.useState)();
    const [usedSuperWeapons, setUsedSuperWeapons] = (0, react_1.useState)([]);
    const codeNameTorpedo = "torpedo";
    const codeNameDrone = "drone";
    const everySuperWeapon = [codeNameTorpedo, codeNameDrone];
    // match variables
    const rows = gameMode === "Team" ? 14 : 10;
    const cols = gameMode === "Team" ? 14 : 10;
    let hiddenLayout = Array.from({ length: cols }, () => Array(rows).fill(null));
    const shootingTimer = 600;
    const modalTime = 1000;
    const afterModalTime = 1000;
    let cooldown = (0, react_1.useRef)(false); // schuss cooldown zwischen den schüssen
    const [enemyShips, setEnemyShips] = (0, react_1.useState)([]);
    const [ownSelectedPosition, setOwnSelectedPosition] = (0, react_1.useState)();
    const [teamSelectedButton, setTeamSelectedButtons] = (0, react_1.useState)(new Map());
    // const [enabledPlayer, setEnabledPlayer] = useState<string>(username);
    let enabledPlayer = (0, react_1.useRef)(initPlayer); // who is currently shooting
    let nextShooter = (0, react_1.useRef)(username); // who is next
    const [playersReady, setPlayersReady] = (0, react_1.useState)(0);
    const [shotReady, setShotReady] = (0, react_1.useState)(false);
    const [shotsSelected, setShotsSelected] = (0, react_1.useState)();
    const [whosTurn, setWhosTurn] = (0, react_1.useState)(false);
    const dispatch = (0, react_redux_1.useDispatch)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    //  Sounds
    let sfxVolume = (0, react_redux_1.useSelector)((state) => state.settingsReducer.sfxVolume);
    let musicVolume = (0, react_redux_1.useSelector)((state) => state.settingsReducer.musicVolume);
    (0, react_1.useEffect)(() => {
        console.log("changed intiplayer ");
        const changeToInitPlayer = (switchTo) => {
            // shows whos turn it is as Modal
            console.log(switchTo, enabledPlayer.current);
            showWhosTurn();
            setTimeout(() => {
                enabledPlayer.current = switchTo;
            }, afterModalTime);
            cooldown.current = false;
            if (firstRound.current && whichTurn) {
                console.log("firstRound detonate mines");
                socketInstance_1.default.emit("sendDetonateMines", roomId, username);
                firstRound.current = false;
            }
        };
        changeToInitPlayer(initPlayer);
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
        return position.x.toString() + ":" + position.y.toString();
    }
    // -----------------------------
    // Websocket---------------------
    // const socket = useWebSocket();
    (0, react_1.useEffect)(() => {
        // websocket connects to server
        // const newSocket: any = io(`${server}`);
        if (socketInstance_1.default) {
            socketInstance_1.default.on("hitEvent", (body) => {
                setShotsSelected(new Map());
                setOwnSelectedPosition(undefined);
                setHitEvent(body.x, body.y, body.username, body.hit, body.switchTo);
            });
            socketInstance_1.default.on("searchEvent", (body, shooter) => {
                console.log("searchEvent", body, shooter);
                setSearchEvent(body.x, body.y, body.hit, shooter);
            });
            socketInstance_1.default.on("shotSelected", (position, playerName) => {
                if (username === playerName)
                    return;
                setShotsSelected((prevShotsSelected) => {
                    const newMap = new Map(prevShotsSelected);
                    let oldPosition = newMap.get(playerName);
                    let teammateNumber = playersInTeam.get(playerName);
                    let teammate = team === teammateNumber;
                    // Reset old button
                    if (oldPosition) {
                        let oldId = positionToString(oldPosition);
                        if (!teammate) {
                            oldId = oldId + "E";
                        }
                        const oldButton = document.getElementById(oldId);
                        if (oldButton) {
                            if (!hasAlreadyState(oldButton)) {
                                console.log("Resetting old button:", oldButton, oldId);
                                changeColor(oldButton, teammate ? "Normal" : "NormalE");
                            }
                        }
                    }
                    // Set new button
                    let newId = positionToString(position);
                    if (!teammate) {
                        newId = newId + "E";
                    }
                    const newButton = document.getElementById(newId);
                    if (newButton) {
                        if (!hasAlreadyState(newButton))
                            changeColor(newButton, teammate ? "Team" : "SelectedE");
                    }
                    // Update map
                    newMap.set(playerName, position);
                    console.log("Updated shots:", newMap);
                    return newMap;
                });
            });
            socketInstance_1.default.on("shotsReady", (playersReady2) => {
                setPlayersReady(playersReady2);
            });
            socketInstance_1.default.on("detonateTorpedo", (shooter) => {
                if ((shooter !== username && gameMode == "1vs1") ||
                    (shooter !== teamName && gameMode == "Team")) {
                    playSFXSound(torpedoSound);
                }
            });
            socketInstance_1.default.on("detonateDrone", (shooter) => {
                if ((shooter !== username && gameMode == "1vs1") ||
                    (shooter !== teamName && gameMode == "Team")) {
                    playSFXSound(droneSound);
                }
            });
            socketInstance_1.default.on("detonateTorpedo", (shooter) => {
                if ((shooter !== username && gameMode == "1vs1") ||
                    (shooter !== teamName && gameMode == "Team")) {
                    playSFXSound(torpedoSound);
                }
            });
            // socket.on("shotSelected", (position: Position, playerName: string) => {
            //   // schiff und der der geschossen hat
            //   let id = positionToString(position);
            //   let teammate = playersInTeam.get(playerName);
            //   if (!teammate) {
            //     id = id + "E";
            //   }
            //   const button = document.getElementById(id);
            //   const newMap = new Map(teamSelectedButton);
            //   newMap.set(playerName, button);
            //   setTeamSelectedButtons(newMap);
            // });
            socketInstance_1.default.on("shipDestroyed", (body, shooter) => {
                // schiff und der der geschossen hat
                setShipDestroyed(body, shooter);
            });
            socketInstance_1.default.on("resetShots", (switchTo) => {
                setShotReady(false);
                if (switchTo !== enabledPlayer.current)
                    changeEnabledPlayer(switchTo);
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
            button.classList.forEach((className) => {
                // console.log(className);
                // if (className.includes("button"))
                return button.classList.remove(className);
            });
            // console.log(button.classList, "class list");
            if (event === "Hit") {
                // button.innerHTML = "X";
                button.setAttribute("data-state", "X");
                button.classList.add(TeamGameFieldFinal_module_css_1.default.Hit);
                playSFXSound(hitSound);
            }
            else if (event === "Miss") {
                // button.innerHTML = "O";
                button.setAttribute("data-state", "O");
                button.classList.add(TeamGameFieldFinal_module_css_1.default.Miss);
                playSFXSound(missSound);
            }
            else if (event === "Destroyed") {
                // button.innerHTML = "";
                button.setAttribute("data-state", "D");
                button.classList.add(TeamGameFieldFinal_module_css_1.default.Destroyed);
                playSFXSound(shipDestroyed);
            }
            else if (event === "Normal") {
                button.setAttribute("data-state", "");
                button.classList.add(TeamGameFieldFinal_module_css_1.default.button);
            }
            else if (event === "NormalE") {
                button.setAttribute("data-state", "");
                button.classList.add(TeamGameFieldFinal_module_css_1.default.buttonE);
            }
            else if (event === "Selected") {
                button.setAttribute("data-state", "Selected");
                button.classList.add(TeamGameFieldFinal_module_css_1.default.selected);
            }
            else if (event === "SelectedE") {
                button.setAttribute("data-state", "SelectedE");
                button.classList.add(TeamGameFieldFinal_module_css_1.default.selectedE);
            }
            else if (event === "Team") {
                button.setAttribute("data-state", "Team");
                button.classList.add(TeamGameFieldFinal_module_css_1.default.teamMateSelected);
            }
            else if (event === "Found") {
                button.setAttribute("data-state", "Found");
                button.classList.add(TeamGameFieldFinal_module_css_1.default.Found);
            }
            else if (event === "Nothing") {
                button.setAttribute("data-state", "Nothing");
                button.classList.add(TeamGameFieldFinal_module_css_1.default.Nothing);
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
        let state = button === null || button === void 0 ? void 0 : button.getAttribute("data-state");
        if (button)
            if (state === "" || state === "Found" || state === "Nothing")
                if (socketInstance_1.default) {
                    socketInstance_1.default.emit("sendShot", body);
                }
    }
    // Funktionen die Websocket aufruft------------
    // Websocket ruft auf und setzt das Feld auf die passende Farbe.
    function setHitEvent(x, y, shooter, hit, switchTo) {
        let position = { x: x, y: y };
        let id = positionToString(position);
        let teammateNumber = playersInTeam.get(shooter);
        let teammate = team === teammateNumber;
        if ((username !== shooter && gameMode === "1vs1") ||
            (!teammate && gameMode === "Team"))
            id = id + "E";
        const button = document.getElementById(id);
        // console.log(id, hit, username, shooter);
        let booli = hit ? "Hit" : "Miss";
        if (button) {
            changeColor(button, booli);
        }
        // console.log("setHit", switchTo, enabledPlayer.current);
        if (switchTo) {
            changeEnabledPlayer(switchTo);
        }
    }
    // Websocket setzt ein Schiff auf zerstört und es wird damit sichtbar
    function setShipDestroyed(ship, shooter) {
        let teammateNumber = playersInTeam.get(shooter);
        let teammate = team === teammateNumber;
        let positions = [{ x: 0, y: 0 }];
        for (let i = 0; i < ship.length; i++) {
            positions[i] =
                ship.direction === "X"
                    ? { x: ship.startX + i, y: ship.startY }
                    : { x: ship.startX, y: ship.startY + i };
        }
        positions.forEach((position) => {
            let id = positionToString(position);
            if ((username !== shooter && gameMode === "1vs1") ||
                (!teammate && gameMode === "Team"))
                id = id + "E";
            const button = document.getElementById(id);
            if (button) {
                changeColor(button, "Destroyed");
            }
        });
        if ((shooter === username && gameMode === "1vs1") ||
            (teammate && gameMode === "Team"))
            setEnemyShips((prevShips) => [...prevShips, ship]);
    }
    function setSearchEvent(x, y, hit, shooter) {
        let position = { x: x, y: y };
        let id = positionToString(position);
        let teammateNumber = playersInTeam.get(shooter);
        let teammate = team === teammateNumber;
        if ((username !== shooter && gameMode === "1vs1") ||
            (!teammate && gameMode === "Team"))
            id = id + "E";
        const button = document.getElementById(id);
        // console.log(id, hit, username, shooter);
        let booli = hit ? "Found" : "Nothing";
        if (button) {
            changeColor(button, booli);
        }
    }
    const generateShips = (ships, ownShips) => {
        const divs = [];
        let whichSkin = skin ? skin : "standard";
        console.log("generateShips", whichSkin);
        if (gameMode === "1vs1" && playersSkins.size != 0) {
            for (let [nick, skin] of playersSkins) {
                if (!ownShips) {
                    if (nick !== username) {
                        whichSkin = playersSkins.get(nick);
                        console.log("gegner", whichSkin);
                        break;
                    }
                }
                else {
                    whichSkin = playersSkins.get(username);
                }
            }
        }
        // Generate own ships
        for (let i = 0; i < ships.length; i++) {
            let s = ships[i];
            let startRow = s.startX + 2;
            let startColumn = s.startY + 2;
            let endColumn, endRow;
            if (gameMode === "Team" && playersSkins.size != 0) {
                let id = s.identifier.split(":")[1];
                whichSkin = playersSkins.get(id);
                console.log("generateShips ", id, whichSkin);
            }
            const smallShip = (0, Resources_1.getSkinImage)(whichSkin, "2");
            const mediumShip = (0, Resources_1.getSkinImage)(whichSkin, "3");
            const largeShip = (0, Resources_1.getSkinImage)(whichSkin, "4");
            const xlargeShip = (0, Resources_1.getSkinImage)(whichSkin, "5");
            const smallShipR = (0, Resources_1.getSkinImage)(whichSkin, "2r");
            const mediumShipR = (0, Resources_1.getSkinImage)(whichSkin, "3r");
            const largeShipR = (0, Resources_1.getSkinImage)(whichSkin, "4r");
            const xlargeShipR = (0, Resources_1.getSkinImage)(whichSkin, "5r");
            let shipImage = smallShip;
            // console.log("generateShips", startRow, startColumn, typeof startRow);
            if (s.direction === "X") {
                endRow = startRow + s.length;
                endColumn = startColumn;
                switch (s.length) {
                    case 2:
                        shipImage = smallShip;
                        break;
                    case 3:
                        shipImage = mediumShip;
                        break;
                    case 4:
                        shipImage = largeShip;
                        break;
                    case 5:
                        shipImage = xlargeShip;
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
                        shipImage = smallShipR;
                        break;
                    case 3:
                        shipImage = mediumShipR;
                        break;
                    case 4:
                        shipImage = largeShipR;
                        break;
                    case 5:
                        shipImage = xlargeShipR;
                        break;
                    default:
                        break;
                }
            }
            divs.push(<div style={{
                    gridColumn: `${startRow} / ${endRow}`,
                    gridRow: `${startColumn} / ${endColumn}`,
                }} className={TeamGameFieldFinal_module_css_1.default.miniContainer} key={i}>
          <react_bootstrap_1.Image className={TeamGameFieldFinal_module_css_1.default.miniImagesW} src={shipImage}/>
        </div>);
        }
        return divs;
    };
    const generateMines = (mines) => {
        const divs = [];
        // Generate own ships
        for (let i = 0; i < mines.length; i++) {
            let s = mines[i];
            let startRow = s.x + 2;
            let startColumn = s.y + 2;
            let endColumn = startColumn;
            let endRow = startRow;
            let shipImage = Mine_png_1.default;
            // console.log("generateShips", startRow, startColumn, typeof startRow);
            divs.push(<div style={{
                    gridColumn: `${startRow} / ${endRow}`,
                    gridRow: `${startColumn} / ${endColumn}`,
                }} className={TeamGameFieldFinal_module_css_1.default.miniContainer} key={i}>
          <react_bootstrap_1.Image className={TeamGameFieldFinal_module_css_1.default.miniImagesW} src={shipImage}/>
        </div>);
        }
        return divs;
    };
    const whichTurn = (username === enabledPlayer.current && gameMode !== "Team") ||
        (teamName === enabledPlayer.current && gameMode === "Team");
    if (firstRound.current && whichTurn) {
        console.log("firstRound detonate mines");
        socketInstance_1.default.emit("sendDetonateMines", roomId, username);
        firstRound.current = false;
    }
    const changeEnabledPlayer = (switchTo) => {
        // shows whos turn it is as Modal
        // console.log(switchTo, enabledPlayer.current);
        if (switchTo !== enabledPlayer.current) {
            console.log("switch To ", switchTo);
            nextShooter.current = switchTo;
            cooldown.current = true;
            showWhosTurn();
            setTimeout(() => {
                enabledPlayer.current = switchTo;
            }, afterModalTime);
            cooldown.current = false;
        }
    };
    function changeSelectedButton(position) {
        let id = positionToString(position);
        const button = document.getElementById(id);
        if (ownSelectedPosition) {
            let oldId = positionToString(ownSelectedPosition);
            const oldButton = document.getElementById(oldId);
            if (oldButton) {
                if (!hasAlreadyState(oldButton))
                    changeColor(oldButton, "Normal");
            }
        }
        if (button) {
            if (!hasAlreadyState(button)) {
                changeColor(button, "Selected");
                setOwnSelectedPosition(position);
                socketInstance_1.default.emit("sendShotSelected", position, username, roomId);
            }
        }
    }
    // if button has state from server (hit, miss, destroyed... mine?) => true
    function hasAlreadyState(button) {
        let attribute = button.getAttribute("data-state");
        return attribute === "X" || attribute === "O" || attribute === "D";
    }
    function shotIsReady() {
        setShotReady(true);
        if (ownSelectedPosition) {
            let body = {
                x: ownSelectedPosition.x,
                y: ownSelectedPosition.y,
                username,
                roomId,
            };
            socketInstance_1.default.emit("sendShotReady", body);
        }
    }
    const showWhosTurn = () => {
        setWhosTurn(true);
        setTimeout(() => {
            setWhosTurn(false);
        }, modalTime);
    };
    function changeOpacity(imgId) {
        let image = document.getElementById(imgId);
        if (!image) {
            console.error(`Element with id ${imgId} not found`);
            return;
        }
        let withoutCurrent = everySuperWeapon.filter((item) => item !== imgId);
        withoutCurrent === null || withoutCurrent === void 0 ? void 0 : withoutCurrent.forEach((item) => {
            let image2 = document.getElementById(item);
            if (image2) {
                image2.style.opacity = "1";
            }
            else {
                console.error(`Element with id ${item} not found`);
            }
        });
        if (toggledSuperWeapon === imgId) {
            image.style.opacity = "1";
        }
        else {
            image.style.opacity = "0.7";
        }
    }
    function torpedo() {
        if (toggledSuperWeapon !== codeNameTorpedo)
            setToggledSuperWeapon(codeNameTorpedo);
        else
            setToggledSuperWeapon("");
    }
    function sendTorpedo(startPosition, horizontal) {
        setUsedSuperWeapons([...usedSuperWeapons, codeNameTorpedo]);
        setToggledSuperWeapon("");
        playSFXSound(torpedoSound);
        setTimeout(() => {
            socketInstance_1.default.emit("sendDetonateTorpedo", roomId, username, startPosition, horizontal);
        }, 400);
    }
    function drone() {
        if (toggledSuperWeapon !== codeNameDrone)
            setToggledSuperWeapon(codeNameDrone);
        else
            setToggledSuperWeapon("");
    }
    function sendDrone(startPosition) {
        setUsedSuperWeapons([...usedSuperWeapons, codeNameDrone]);
        setToggledSuperWeapon("");
        playSFXSound(droneSound);
        socketInstance_1.default.emit("sendDetonateDrone", roomId, username, startPosition);
    }
    return (<>
      <div className={gameMode === "Team" ? TeamGameFieldFinal_module_css_1.default.containerTeam : TeamGameFieldFinal_module_css_1.default.container1vs1}>
        <div className={TeamGameFieldFinal_module_css_1.default.logoContainer}>
          <div className={TeamGameFieldFinal_module_css_1.default.Logo}>
            {/* <Image className={styles.LogoImage} src={logoPic} /> */}
          </div>
        </div>
        <div className={TeamGameFieldFinal_module_css_1.default.whosTurn}>
          {" "}
          <a className={TeamGameFieldFinal_module_css_1.default.playerName}>{enabledPlayer.current}</a>'s TURN
        </div>
        {/* GAME FIELD WHERE PLAYER IS PLAYING */}

        <div id="Gamefield" className={whichTurn
            ? TeamGameFieldFinal_module_css_1.default.GameField
            : gameMode === "Team"
                ? TeamGameFieldFinal_module_css_1.default.enemyBoardDisappear
                : TeamGameFieldFinal_module_css_1.default.Ownboard} style={{
            gridTemplateColumns: `repeat(${cols + 1}, 1fr)`,
            gridTemplateRows: `repeat(${rows + 1}, 1fr)`,
        }}>
          {generateShips(enemyShips, false)}
          {ownMines ? generateMines(ownMines) : null}
          {/* <div style={{width: "200px"}}> */}
          {Array.from({ length: cols }, (_, index) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + index);
            let letter2 = whichTurn ? letter : letter + "E";
            return (
            // className={styles[letter2]}
            <div style={{ gridArea: letter2, minWidth: "100%" }}>
                {whichTurn ? (toggledSuperWeapon === codeNameTorpedo ? (<div>
                      <img id="pfeilImg" src={pfeil_png_1.default} className={TeamGameFieldFinal_module_css_1.default.miniContainerPfeilTurned} 
                // className={styles.miniContainerPfeilTurned }
                onClick={() => sendTorpedo({ x: index, y: 0 }, false)}></img>
                    </div>) : (<a>{letter}</a>)) : (<a>{letter}</a>)}
              </div>);
        })}
          {Array.from({ length: rows }, (_, index) => {
            let num = index + 1;
            let s = whichTurn ? "" : "E";
            let num2 = "NO" + num + s;
            return (
            // className={styles[num2]}
            <div style={{ gridArea: num2 }}>
                {whichTurn ? (toggledSuperWeapon === codeNameTorpedo ? (<div>
                      <img id="pfeilImg" src={pfeil_png_1.default} className={TeamGameFieldFinal_module_css_1.default.miniContainerPfeil} onClick={() => sendTorpedo({ x: 0, y: index }, true)}></img>
                    </div>) : (<a>{index + 1}</a>)) : (<a>{index + 1}</a>)}
              </div>);
        })}
          {/* </div> */}
          {hiddenLayout.map((row, rowIndex) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + rowIndex);
            return row.map((item, itemIndex) => {
                let s = whichTurn ? "" : "E";
                let coordinate = letter + (itemIndex + 1) + s;
                let id = positionToString({ x: rowIndex, y: itemIndex });
                const button = document.getElementById(id);
                let newButton = TeamGameFieldFinal_module_css_1.default.button;
                if (button) {
                    newButton =
                        button.getAttribute("data-state") === "X"
                            ? TeamGameFieldFinal_module_css_1.default.Hit
                            : button.getAttribute("data-state") === "D"
                                ? TeamGameFieldFinal_module_css_1.default.Destroyed
                                : button.getAttribute("data-state") === "O"
                                    ? TeamGameFieldFinal_module_css_1.default.Miss
                                    : TeamGameFieldFinal_module_css_1.default.button;
                }
                return (<div className={TeamGameFieldFinal_module_css_1.default[coordinate]} style={{ gridArea: coordinate }}>
                  <button data-state="" className={newButton} id={positionToString({
                        x: rowIndex,
                        y: itemIndex,
                    })} onClick={() => {
                        if (whichTurn && !cooldown.current) {
                            if (toggledSuperWeapon === codeNameDrone) {
                                sendDrone({
                                    x: rowIndex,
                                    y: itemIndex,
                                });
                            }
                            else {
                                if (gameMode === "1vs1") {
                                    sendShot({
                                        x: rowIndex,
                                        y: itemIndex,
                                    });
                                }
                                else if (gameMode === "Team") {
                                    if (!shotReady)
                                        changeSelectedButton({
                                            x: rowIndex,
                                            y: itemIndex,
                                        });
                                }
                            }
                        }
                    }}></button>
                </div>);
            });
        })}
        </div>
        {/* OWN BOARD WHERE ENEMY IS PLAYING */}

        <div id="enemy board" className={!whichTurn
            ? TeamGameFieldFinal_module_css_1.default.GameField
            : gameMode === "Team"
                ? TeamGameFieldFinal_module_css_1.default.enemyBoardDisappear
                : TeamGameFieldFinal_module_css_1.default.Ownboard} style={{
            gridTemplateColumns: `repeat(${cols + 1}, 1fr)`,
            gridTemplateRows: `repeat(${rows + 1}, 1fr)`,
        }}>
          {generateShips(ownShips, true)}
          {Array.from({ length: cols }, (_, index) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + index);
            let letter2 = !whichTurn ? letter : letter + "E";
            return (<div className={TeamGameFieldFinal_module_css_1.default[letter2]} style={{ gridArea: letter2 }}>
                {letter}
              </div>);
        })}
          {Array.from({ length: rows }, (_, index) => {
            let num = index + 1;
            let s = !whichTurn ? "" : "E";
            let num2 = "NO" + num + s;
            return (<div className={TeamGameFieldFinal_module_css_1.default[num2]} style={{ gridArea: num2 }}>
                {index + 1}
              </div>);
        })}
          {hiddenLayout.map((row, rowIndex) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + rowIndex);
            return row.map((item, itemIndex) => {
                let s = !whichTurn ? "" : "E";
                let coordinate = letter + (itemIndex + 1) + s;
                let id = positionToString({ x: rowIndex, y: itemIndex }) + "E";
                const button = document.getElementById(id);
                let newButton = TeamGameFieldFinal_module_css_1.default.button;
                if (button) {
                    newButton =
                        button.getAttribute("data-state") === "X"
                            ? TeamGameFieldFinal_module_css_1.default.Hit
                            : button.getAttribute("data-state") === "D"
                                ? TeamGameFieldFinal_module_css_1.default.Destroyed
                                : button.getAttribute("data-state") === "O"
                                    ? TeamGameFieldFinal_module_css_1.default.Miss
                                    : TeamGameFieldFinal_module_css_1.default.buttonE;
                }
                return (<div className={TeamGameFieldFinal_module_css_1.default[coordinate]} style={{ gridArea: coordinate }}>
                  <button data-state="" className={newButton} id={positionToString({
                        x: rowIndex,
                        y: itemIndex,
                    }) + "E"}></button>
                </div>);
            });
        })}
        </div>
        {superWeapons && whichTurn && (<div className={TeamGameFieldFinal_module_css_1.default.SuperWeaponsContainer}>
            <div className={TeamGameFieldFinal_module_css_1.default.SuperWeapons}>
              {!usedSuperWeapons.some((name) => name === codeNameTorpedo) && (<img id={codeNameTorpedo} src={Torpedo_png_1.default} onClick={() => (torpedo(), changeOpacity(codeNameTorpedo))}></img>)}
              {!usedSuperWeapons.some((name) => name === codeNameDrone) && (<img id={codeNameDrone} src={Hubschrauber_png_1.default} onClick={() => (drone(), changeOpacity(codeNameDrone))}></img>)}
            </div>
          </div>)}
        <div className={TeamGameFieldFinal_module_css_1.default.EmoteContainer}>
          <div className={TeamGameFieldFinal_module_css_1.default.Emotes}>
            <react_bootstrap_1.Button className={TeamGameFieldFinal_module_css_1.default.EmoteButton} variant="secondary">
              {" "}
              Emotes
            </react_bootstrap_1.Button>
          </div>
        </div>
        {gameMode === "Team" && whichTurn ? (<div className={TeamGameFieldFinal_module_css_1.default.ShootContainer}>
            <div className={TeamGameFieldFinal_module_css_1.default.Shoot}>
              <react_bootstrap_1.Button className={TeamGameFieldFinal_module_css_1.default.ShootButton} variant="primary" onClick={() => (ownSelectedPosition ? shotIsReady() : null)} disabled={shotReady}>
                Shoot {playersReady} / {maxPlayers / 2}
              </react_bootstrap_1.Button>
            </div>
          </div>) : null}
        <react_bootstrap_1.Modal show={whosTurn} onHide={() => setWhosTurn(false)} backdrop="static" keyboard={false} centered animation={true} className="blur-background">
          <react_bootstrap_1.Modal.Title className={TeamGameFieldFinal_module_css_1.default.modalText}>
            {nextShooter.current} ist jetzt dran
          </react_bootstrap_1.Modal.Title>
        </react_bootstrap_1.Modal>
      </div>
    </>);
}
//# sourceMappingURL=TeamGameField.js.map