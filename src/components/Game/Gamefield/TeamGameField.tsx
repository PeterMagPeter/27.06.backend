import styles from "./TeamGameFieldFinal.module.css";
import { useEffect, useState, useRef } from "react";
import { Button, Image, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logoPic from "../../../assets/pictures/cof_logo.png";
import { ShipTemplate } from "../../reducer/TestReducer";
import { deleteLobby, setLobby } from "../../reducer/LobbyReducer";
import socket from "../../Websocket/socketInstance";
import { Howl } from "howler";
import { setSettings } from "../../reducer/SettingsReducer";
import { TeamNames, getSkinImage } from "../../../Resources";
// ship images
// import smallShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/2.png";
// import mediumShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/3.png";
// import largeShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/4.png";
// import xlargeShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/5.png";
// import smallShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/2r.png";
// import mediumShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/3r.png";
// import largeShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/4r.png";
// import xlargeShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/5r.png";
import { skinImgs } from "../../../Resources";
import mineImg from "../../../assets/pictures/Spezialwaffen/Mine.png";
import torpedoImg from "../../../assets/pictures/Spezialwaffen/Torpedo.png";
import droneImg from "../../../assets/pictures/Spezialwaffen/Hubschrauber.png";
import bombImg from "../../../assets/pictures/Spezialwaffen/Atombombe.png";
import subMarineImg from "../../../assets/pictures/Spezialwaffen/U-Boot.png";
import pfeilImg from "../../../assets/pictures/Spezialwaffen/pfeil.png";
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
export default function TeamGameField() {
  // Ships
  let skin = useSelector((state: any) => state.userReducer.skin);
  let playersSkins: Map<string, string> = useSelector(
    (state: any) => state.lobbyReducer.playersSkins
  );
  console.log("playersSkins", playersSkins);

  // Player
  let username: string = useSelector(
    (state: any) => state.userReducer.username
  );
  let initPlayer: string = useSelector(
    (state: any) => state.lobbyReducer.initPlayer
  );
  let roomId: string = useSelector((state: any) => state.lobbyReducer.roomId);
  let gameMode = useSelector((state: any) => state.lobbyReducer.gameMode);
  // let gameMode = "Team";
  let privateMatch: boolean = useSelector(
    (state: any) => state.lobbyReducer.privateMatch
  );
  let playersInTeam: Map<string, number> = useSelector(
    (state: any) => state.lobbyReducer.playersInTeam
  );
  let team: number = useSelector((state: any) => state.lobbyReducer.team);
  let firstRound = useRef<Boolean>(true);
  const teamName = TeamNames[team - 1];
  let maxPlayers: number = useSelector(
    (state: any) => state.lobbyReducer.maxPlayers
  );
  let startMusic = useRef<boolean>(true);
  let ownShips = useSelector((state: any) => state.userReducer.ships);
  let ownMines = useSelector((state: any) => state.lobbyReducer.mines);

  // SuperWeapons
  let superWeapons: string = useSelector(
    (state: any) => state.lobbyReducer.superWeapons
  );

  const [toggledSuperWeapon, setToggledSuperWeapon] = useState<string>();
  const [usedSuperWeapons, setUsedSuperWeapons] = useState<string[]>([]);

  const codeNameTorpedo: string = "torpedo";
  const codeNameDrone: string = "drone";
  const everySuperWeapon: string[] = [codeNameTorpedo, codeNameDrone];
  // match variables
  const rows = gameMode === "Team" ? 14 : 10;
  const cols = gameMode === "Team" ? 14 : 10;
  let hiddenLayout = Array.from({ length: cols }, () => Array(rows).fill(null));
  const shootingTimer: number = 600;
  const modalTime = 1000;
  const afterModalTime: number = 1000;

  let cooldown = useRef<Boolean>(false); // schuss cooldown zwischen den schüssen
  const [enemyShips, setEnemyShips] = useState<ShipTemplate[]>([]);
  const [ownSelectedPosition, setOwnSelectedPosition] = useState<Position>();
  const [teamSelectedButton, setTeamSelectedButtons] = useState<
    Map<string, HTMLElement | null>
  >(new Map());
  // const [enabledPlayer, setEnabledPlayer] = useState<string>(username);
  let enabledPlayer = useRef<string>(initPlayer); // who is currently shooting
  let nextShooter = useRef<string>(username); // who is next
  const [playersReady, setPlayersReady] = useState<number>(0);
  const [shotReady, setShotReady] = useState<boolean>(false);
  const [shotsSelected, setShotsSelected] = useState<Map<string, Position>>();

  const [whosTurn, setWhosTurn] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  //  Sounds
  let sfxVolume = useSelector((state: any) => state.settingsReducer.sfxVolume);
  let musicVolume = useSelector(
    (state: any) => state.settingsReducer.musicVolume
  );

  type Position = { x: number; y: number };
  useEffect(() => {
    console.log("changed intiplayer ");

    const changeToInitPlayer = (switchTo: string) => {
      // shows whos turn it is as Modal
      console.log(switchTo, enabledPlayer.current);
      showWhosTurn();
      setTimeout(() => {
        enabledPlayer.current = switchTo;
      }, afterModalTime);

      cooldown.current = false;
      if (firstRound.current && whichTurn) {
        console.log("firstRound detonate mines");
        socket.emit("sendDetonateMines", roomId, username);
        firstRound.current = false;
      }
    };
    changeToInitPlayer(initPlayer);
    return () => {};
  }, [initPlayer]);

  const playSFXSound = (soundUrl: string) => {
    const sound = new Howl({
      src: [soundUrl],
      volume: sfxVolume,
    });
    sound.play();
  };
  const playMusicSound = (soundUrl: string) => {
    const sound = new Howl({
      src: [soundUrl],
      volume: musicVolume,
      loop: true,
    });
    sound.play();
  };
  useEffect(() => {
    if (startMusic.current) {
      startMusic.current = false;
      playMusicSound(battleMusic);
    }
    return () => {};
  }, []);

  function positionToString(position: Position): string {
    return position.x.toString() + ":" + position.y.toString();
  }
  // -----------------------------
  // Websocket---------------------
  // const socket = useWebSocket();
  useEffect(() => {
    // websocket connects to server
    // const newSocket: any = io(`${server}`);
    if (socket) {
      socket.on("hitEvent", (body: any) => {
        setShotsSelected(new Map());
        setOwnSelectedPosition(undefined);
        setHitEvent(body.x, body.y, body.username, body.hit, body.switchTo);
      });
      socket.on("searchEvent", (body: any, shooter: string) => {
        console.log("searchEvent", body, shooter);
        setSearchEvent(body.x, body.y, body.hit, shooter);
      });
      socket.on("shotSelected", (position: Position, playerName: string) => {
        if (username === playerName) return;

        setShotsSelected((prevShotsSelected) => {
          const newMap = new Map(prevShotsSelected);
          let oldPosition: Position | undefined = newMap.get(playerName);
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
      socket.on("shotsReady", (playersReady2: number) => {
        setPlayersReady(playersReady2);
      });
      socket.on("detonateTorpedo", (shooter: string) => {
        if (
          (shooter !== username && gameMode == "1vs1") ||
          (shooter !== teamName && gameMode == "Team")
        ) {
          playSFXSound(torpedoSound);
        }
      });
      socket.on("detonateDrone", (shooter: string) => {
        if (
          (shooter !== username && gameMode == "1vs1") ||
          (shooter !== teamName && gameMode == "Team")
        ) {
          playSFXSound(droneSound);
        }
      });
      socket.on("detonateTorpedo", (shooter: string) => {
        if (
          (shooter !== username && gameMode == "1vs1") ||
          (shooter !== teamName && gameMode == "Team")
        ) {
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
      socket.on("shipDestroyed", (body: ShipTemplate, shooter: string) => {
        // schiff und der der geschossen hat
        setShipDestroyed(body, shooter);
      });
      socket.on("resetShots", (switchTo: string) => {
        setShotReady(false);
        if (switchTo !== enabledPlayer.current) changeEnabledPlayer(switchTo);
      });
      socket.on("gameOver", (body: any) => {
        socket.emit("sendLeaveRoom", roomId, privateMatch);
        dispatch(deleteLobby());
        // bekommt gewinner namen
        if (body.username === username) {
          playSFXSound(victory);

          navigate("/win");
        } else {
          playSFXSound(loser);
          playSFXSound(myDis);
          navigate("/loose");
        }
      });

      // need to set the socket at bottom to emit something
    }
    return () => {};
  }, [socket]);
  // set backgroundcolor/ classname of button
  const changeColor = (button: HTMLElement, event: string) => {
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
        button.classList.add(styles.Hit);
        playSFXSound(hitSound);
      } else if (event === "Miss") {
        // button.innerHTML = "O";
        button.setAttribute("data-state", "O");
        button.classList.add(styles.Miss);
        playSFXSound(missSound);
      } else if (event === "Destroyed") {
        // button.innerHTML = "";
        button.setAttribute("data-state", "D");
        button.classList.add(styles.Destroyed);
        playSFXSound(shipDestroyed);
      } else if (event === "Normal") {
        button.setAttribute("data-state", "");
        button.classList.add(styles.button);
      } else if (event === "NormalE") {
        button.setAttribute("data-state", "");
        button.classList.add(styles.buttonE);
      } else if (event === "Selected") {
        button.setAttribute("data-state", "Selected");
        button.classList.add(styles.selected);
      } else if (event === "SelectedE") {
        button.setAttribute("data-state", "SelectedE");
        button.classList.add(styles.selectedE);
      } else if (event === "Team") {
        button.setAttribute("data-state", "Team");
        button.classList.add(styles.teamMateSelected);
      } else if (event === "Found") {
        button.setAttribute("data-state", "Found");
        button.classList.add(styles.Found);
      } else if (event === "Nothing") {
        button.setAttribute("data-state", "Nothing");
        button.classList.add(styles.Nothing);
      }
    }
  };
  // Functions that the Player sends
  function sendShot(position: Position) {
    let id = positionToString(position);
    const button = document.getElementById(id);
    let newX = position.x;
    let body = { x: newX, y: position.y, username: username, roomId: roomId };
    // console.log(body, " sendShot body")
    let state = button?.getAttribute("data-state");
    if (button)
      if (state === "" || state === "Found" || state === "Nothing")
        if (socket) {
          socket.emit("sendShot", body);
        }
  }
  // Funktionen die Websocket aufruft------------
  // Websocket ruft auf und setzt das Feld auf die passende Farbe.
  function setHitEvent(
    x: number,
    y: number,
    shooter: string,
    hit: boolean,
    switchTo?: string
  ) {
    let position = { x: x, y: y };
    let id = positionToString(position);
    let teammateNumber = playersInTeam.get(shooter);
    let teammate = team === teammateNumber;
    if (
      (username !== shooter && gameMode === "1vs1") ||
      (!teammate && gameMode === "Team")
    )
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
  function setShipDestroyed(ship: ShipTemplate, shooter: string) {
    let teammateNumber = playersInTeam.get(shooter);
    let teammate = team === teammateNumber;
    let positions: Position[] = [{ x: 0, y: 0 }];
    for (let i = 0; i < ship.length; i++) {
      positions[i] =
        ship.direction === "X"
          ? { x: ship.startX + i, y: ship.startY }
          : { x: ship.startX, y: ship.startY + i };
    }
    positions.forEach((position) => {
      let id = positionToString(position);
      if (
        (username !== shooter && gameMode === "1vs1") ||
        (!teammate && gameMode === "Team")
      )
        id = id + "E";
      const button = document.getElementById(id);
      if (button) {
        changeColor(button, "Destroyed");
      }
    });

    if (
      (shooter === username && gameMode === "1vs1") ||
      (teammate && gameMode === "Team")
    )
      setEnemyShips((prevShips) => [...prevShips, ship]);
  }
  function setSearchEvent(x: number, y: number, hit: boolean, shooter: string) {
    let position = { x: x, y: y };
    let id = positionToString(position);
    let teammateNumber = playersInTeam.get(shooter);
    let teammate = team === teammateNumber;
    if (
      (username !== shooter && gameMode === "1vs1") ||
      (!teammate && gameMode === "Team")
    )
      id = id + "E";
    const button = document.getElementById(id);
    // console.log(id, hit, username, shooter);
    let booli = hit ? "Found" : "Nothing";
    if (button) {
      changeColor(button, booli);
    }
  }

  const generateShips = (ships: ShipTemplate[], ownShips: boolean) => {
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
        } else {
          whichSkin = playersSkins.get(username);
        }
      }
    }

    // Generate own ships
    for (let i = 0; i < ships.length; i++) {
      let s = ships[i];
      let startRow: number = s.startX + 2;
      let startColumn: number = s.startY + 2;
      let endColumn, endRow;
      if (gameMode === "Team" && playersSkins.size != 0) {
        let id = s.identifier.split(":")[1];
        whichSkin = playersSkins.get(id);
        console.log("generateShips ", id, whichSkin);
      }
      const smallShip = getSkinImage(whichSkin, "2");
      const mediumShip = getSkinImage(whichSkin, "3");
      const largeShip = getSkinImage(whichSkin, "4");
      const xlargeShip = getSkinImage(whichSkin, "5");
      const smallShipR = getSkinImage(whichSkin, "2r");
      const mediumShipR = getSkinImage(whichSkin, "3r");
      const largeShipR = getSkinImage(whichSkin, "4r");
      const xlargeShipR = getSkinImage(whichSkin, "5r");
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
      } else {
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
      divs.push(
        <div
          style={{
            gridColumn: `${startRow} / ${endRow}`,
            gridRow: `${startColumn} / ${endColumn}`,
          }}
          className={styles.miniContainer}
          key={i}
        >
          <Image className={styles.miniImagesW} src={shipImage} />
        </div>
      );
    }
    return divs;
  };
  const generateMines = (mines: Position[]) => {
    const divs = [];
    // Generate own ships
    for (let i = 0; i < mines.length; i++) {
      let s = mines[i];
      let startRow: number = s.x + 2;
      let startColumn: number = s.y + 2;
      let endColumn = startColumn;
      let endRow = startRow;
      let shipImage = mineImg;
      // console.log("generateShips", startRow, startColumn, typeof startRow);
      divs.push(
        <div
          style={{
            gridColumn: `${startRow} / ${endRow}`,
            gridRow: `${startColumn} / ${endColumn}`,
          }}
          className={styles.miniContainer}
          key={i}
        >
          <Image className={styles.miniImagesW} src={shipImage} />
        </div>
      );
    }
    return divs;
  };
  const whichTurn: boolean =
    (username === enabledPlayer.current && gameMode !== "Team") ||
    (teamName === enabledPlayer.current && gameMode === "Team");
  if (firstRound.current && whichTurn) {
    console.log("firstRound detonate mines");
    socket.emit("sendDetonateMines", roomId, username);
    firstRound.current = false;
  }
  const changeEnabledPlayer = (switchTo: string) => {
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
  function changeSelectedButton(position: Position) {
    let id = positionToString(position);
    const button = document.getElementById(id);
    if (ownSelectedPosition) {
      let oldId = positionToString(ownSelectedPosition);
      const oldButton = document.getElementById(oldId);
      if (oldButton) {
        if (!hasAlreadyState(oldButton)) changeColor(oldButton, "Normal");
      }
    }
    if (button) {
      if (!hasAlreadyState(button)) {
        changeColor(button, "Selected");
        setOwnSelectedPosition(position);
        socket.emit("sendShotSelected", position, username, roomId);
      }
    }
  }
  // if button has state from server (hit, miss, destroyed... mine?) => true
  function hasAlreadyState(button: HTMLElement) {
    let attribute = button.getAttribute("data-state");
    return attribute === "X" || attribute === "O" || attribute === "D";
  }
  function shotIsReady() {
    setShotReady(true);
    if (ownSelectedPosition) {
      let body: any = {
        x: ownSelectedPosition.x,
        y: ownSelectedPosition.y,
        username,
        roomId,
      };
      socket.emit("sendShotReady", body);
    }
  }
  const showWhosTurn = () => {
    setWhosTurn(true);
    setTimeout(() => {
      setWhosTurn(false);
    }, modalTime);
  };

  function changeOpacity(imgId: string) {
    let image = document.getElementById(imgId) as HTMLImageElement | null;
    if (!image) {
      console.error(`Element with id ${imgId} not found`);
      return;
    }

    let withoutCurrent = everySuperWeapon.filter((item) => item !== imgId);
    withoutCurrent?.forEach((item) => {
      let image2 = document.getElementById(item) as HTMLImageElement | null;
      if (image2) {
        image2.style.opacity = "1";
      } else {
        console.error(`Element with id ${item} not found`);
      }
    });

    if (toggledSuperWeapon === imgId) {
      image.style.opacity = "1";
    } else {
      image.style.opacity = "0.7";
    }
  }

  function torpedo(): void {
    if (toggledSuperWeapon !== codeNameTorpedo)
      setToggledSuperWeapon(codeNameTorpedo);
    else setToggledSuperWeapon("");
  }
  function sendTorpedo(startPosition: Position, horizontal: boolean): void {
    setUsedSuperWeapons([...usedSuperWeapons, codeNameTorpedo]);
    setToggledSuperWeapon("");
    playSFXSound(torpedoSound);
    setTimeout(() => {
      socket.emit(
        "sendDetonateTorpedo",
        roomId,
        username,
        startPosition,
        horizontal
      );
    }, 400);
  }

  function drone(): void {
    if (toggledSuperWeapon !== codeNameDrone)
      setToggledSuperWeapon(codeNameDrone);
    else setToggledSuperWeapon("");
  }
  function sendDrone(startPosition: Position) {
    setUsedSuperWeapons([...usedSuperWeapons, codeNameDrone]);
    setToggledSuperWeapon("");
    playSFXSound(droneSound);
    socket.emit("sendDetonateDrone", roomId, username, startPosition);
  }

  return (
    <>
      <div
        className={
          gameMode === "Team" ? styles.containerTeam : styles.container1vs1
        }
      >
        <div className={styles.logoContainer}>
          <div className={styles.Logo}>
            {/* <Image className={styles.LogoImage} src={logoPic} /> */}
          </div>
        </div>
        <div className={styles.whosTurn}>
          {" "}
          <a className={styles.playerName}>{enabledPlayer.current}</a>'s TURN
        </div>
        {/* GAME FIELD WHERE PLAYER IS PLAYING */}

        <div
          id="Gamefield"
          className={
            whichTurn
              ? styles.GameField
              : gameMode === "Team"
              ? styles.enemyBoardDisappear
              : styles.Ownboard
          }
          style={{
            gridTemplateColumns: `repeat(${cols + 1}, 1fr)`,
            gridTemplateRows: `repeat(${rows + 1}, 1fr)`,
          }}
        >
          {generateShips(enemyShips, false)}
          {ownMines ? generateMines(ownMines) : null}
          {/* <div style={{width: "200px"}}> */}
          {Array.from({ length: cols }, (_, index) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + index);
            let letter2 = whichTurn ? letter : letter + "E";
            return (
              // className={styles[letter2]}
              <div style={{ gridArea: letter2, minWidth: "100%" }}>
                {whichTurn ? (
                  toggledSuperWeapon === codeNameTorpedo ? (
                    <div>
                      <img
                        id="pfeilImg"
                        src={pfeilImg}
                        className={styles.miniContainerPfeilTurned}
                        // className={styles.miniContainerPfeilTurned }
                        onClick={() => sendTorpedo({ x: index, y: 0 }, false)}
                      ></img>
                    </div>
                  ) : (
                    <a>{letter}</a>
                  )
                ) : (
                  <a>{letter}</a>
                )}
              </div>
            );
          })}
          {Array.from({ length: rows }, (_, index) => {
            let num = index + 1;
            let s = whichTurn ? "" : "E";
            let num2 = "NO" + num + s;

            return (
              // className={styles[num2]}
              <div style={{ gridArea: num2 }}>
                {whichTurn ? (
                  toggledSuperWeapon === codeNameTorpedo ? (
                    <div>
                      <img
                        id="pfeilImg"
                        src={pfeilImg}
                        className={styles.miniContainerPfeil}
                        onClick={() => sendTorpedo({ x: 0, y: index }, true)}
                      ></img>
                    </div>
                  ) : (
                    <a>{index + 1}</a>
                  )
                ) : (
                  <a>{index + 1}</a>
                )}
              </div>
            );
          })}
          {/* </div> */}
          {hiddenLayout.map((row, rowIndex) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + rowIndex);
            return row.map((item, itemIndex) => {
              let s = whichTurn ? "" : "E";
              let coordinate = letter + (itemIndex + 1) + s;
              let id = positionToString({ x: rowIndex, y: itemIndex });
              const button = document.getElementById(id);
              let newButton = styles.button;
              if (button) {
                newButton =
                  button.getAttribute("data-state") === "X"
                    ? styles.Hit
                    : button.getAttribute("data-state") === "D"
                    ? styles.Destroyed
                    : button.getAttribute("data-state") === "O"
                    ? styles.Miss
                    : styles.button;
              }

              return (
                <div
                  className={styles[coordinate]}
                  style={{ gridArea: coordinate }}
                >
                  <button
                    data-state=""
                    className={newButton}
                    id={positionToString({
                      x: rowIndex,
                      y: itemIndex,
                    })}
                    onClick={() => {
                      if (whichTurn && !cooldown.current) {
                        if (toggledSuperWeapon === codeNameDrone) {
                          sendDrone({
                            x: rowIndex,
                            y: itemIndex,
                          });
                        } else {
                          if (gameMode === "1vs1") {
                            sendShot({
                              x: rowIndex,
                              y: itemIndex,
                            });
                          } else if (gameMode === "Team") {
                            if (!shotReady)
                              changeSelectedButton({
                                x: rowIndex,
                                y: itemIndex,
                              });
                          }
                        }
                      }
                    }}
                  ></button>
                </div>
              );
            });
          })}
        </div>
        {/* OWN BOARD WHERE ENEMY IS PLAYING */}

        <div
          id="enemy board"
          className={
            !whichTurn
              ? styles.GameField
              : gameMode === "Team"
              ? styles.enemyBoardDisappear
              : styles.Ownboard
          }
          style={{
            gridTemplateColumns: `repeat(${cols + 1}, 1fr)`,
            gridTemplateRows: `repeat(${rows + 1}, 1fr)`,
          }}
        >
          {generateShips(ownShips, true)}
          {Array.from({ length: cols }, (_, index) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + index);
            let letter2 = !whichTurn ? letter : letter + "E";
            return (
              <div className={styles[letter2]} style={{ gridArea: letter2 }}>
                {letter}
              </div>
            );
          })}
          {Array.from({ length: rows }, (_, index) => {
            let num = index + 1;
            let s = !whichTurn ? "" : "E";
            let num2 = "NO" + num + s;
            return (
              <div className={styles[num2]} style={{ gridArea: num2 }}>
                {index + 1}
              </div>
            );
          })}
          {hiddenLayout.map((row, rowIndex) => {
            let letter = String.fromCharCode("A".charCodeAt(0) + rowIndex);
            return row.map((item, itemIndex) => {
              let s = !whichTurn ? "" : "E";
              let coordinate = letter + (itemIndex + 1) + s;

              let id = positionToString({ x: rowIndex, y: itemIndex }) + "E";
              const button = document.getElementById(id);
              let newButton = styles.button;
              if (button) {
                newButton =
                  button.getAttribute("data-state") === "X"
                    ? styles.Hit
                    : button.getAttribute("data-state") === "D"
                    ? styles.Destroyed
                    : button.getAttribute("data-state") === "O"
                    ? styles.Miss
                    : styles.buttonE;
              }
              return (
                <div
                  className={styles[coordinate]}
                  style={{ gridArea: coordinate }}
                >
                  <button
                    data-state=""
                    className={newButton}
                    id={
                      positionToString({
                        x: rowIndex,
                        y: itemIndex,
                      }) + "E"
                    }
                  ></button>
                </div>
              );
            });
          })}
        </div>
        {superWeapons && whichTurn && (
          <div className={styles.SuperWeaponsContainer}>
            <div className={styles.SuperWeapons}>
              {!usedSuperWeapons.some((name) => name === codeNameTorpedo) && (
                <img
                  id={codeNameTorpedo}
                  src={torpedoImg}
                  onClick={() => (torpedo(), changeOpacity(codeNameTorpedo))}
                ></img>
              )}
              {!usedSuperWeapons.some((name) => name === codeNameDrone) && (
                <img
                  id={codeNameDrone}
                  src={droneImg}
                  onClick={() => (drone(), changeOpacity(codeNameDrone))}
                ></img>
              )}
            </div>
          </div>
        )}
        <div className={styles.EmoteContainer}>
          <div className={styles.Emotes}>
            <Button className={styles.EmoteButton} variant="secondary">
              {" "}
              Emotes
            </Button>
          </div>
        </div>
        {gameMode === "Team" && whichTurn ? (
          <div className={styles.ShootContainer}>
            <div className={styles.Shoot}>
              <Button
                className={styles.ShootButton}
                variant="primary"
                onClick={() => (ownSelectedPosition ? shotIsReady() : null)}
                disabled={shotReady}
              >
                Shoot {playersReady} / {maxPlayers / 2}
              </Button>
            </div>
          </div>
        ) : null}
        <Modal
          show={whosTurn}
          onHide={() => setWhosTurn(false)}
          backdrop="static"
          keyboard={false}
          centered
          animation={true}
          className="blur-background"
        >
          <Modal.Title className={styles.modalText}>
            {nextShooter.current} ist jetzt dran
          </Modal.Title>
        </Modal>
      </div>
    </>
  );
}
