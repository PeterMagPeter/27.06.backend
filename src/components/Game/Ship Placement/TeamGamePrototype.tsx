import React, { useState, useRef, useEffect } from "react";
import styles from "./TeamGamePrototype.module.css";
import { Container, Button, Image } from "react-bootstrap";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../../Websocket/useWebSocket";
import socket from "../../Websocket/socketInstance";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Ship,
  ShipTemplate,
  setShips,
  setSkin,
} from "../../reducer/TestReducer";
import {
  deleteLobby,
  setAiDifficulty,
  setInitPlayer,
  setLobby,
  setPlayersSkins,
} from "../../reducer/LobbyReducer";
// import smallShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/2.png";
// import mediumShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/3.png";
// import largeShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/4.png";
// import xlargeShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/5.png";
// import smallShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/2r.png";
// import mediumShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/3r.png";
// import largeShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/4r.png";
// import xlargeShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/5r.png";
import logoPic from "../../../assets/pictures/cof_logo.png";
import { match } from "assert";
import { getSkinImage } from "../../../Resources";
import Header from "../../Header/Header";
const ResponsiveGridLayout = WidthProvider(Responsive);
// instant place button -> search for "Debug Ships Button" and make it to real code
const space = 0;
const kiDifficulties = [0.25, 0.5, 0.9];
export default function TeamGamePrototype() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [kiMode, setKiMode] = useState<string>("ki2");
  // player
  let username = useSelector((state: any) => state.userReducer.username);
  let roomId = useSelector((state: any) => state.lobbyReducer.roomId);
  let gameMode = useSelector((state: any) => state.lobbyReducer.gameMode);
  let maxPlayers = useSelector((state: any) => state.lobbyReducer.maxPlayers);
  let superWeapons = useSelector(
    (state: any) => state.lobbyReducer.superWeapons
  );
  let mines = useSelector((state: any) => state.lobbyReducer.mines);
  let team = useSelector((state: any) => state.lobbyReducer.team);
  let playersInTeam: Map<string, number> = useSelector(
    (state: any) => state.lobbyReducer.playersInTeam
  );

  let privateMatch = useSelector(
    (state: any) => state.lobbyReducer.privateMatch
  );
  let vsAi = useSelector((state: any) => state.lobbyReducer.vsAi);
  let difficultyReducer = useSelector(
    (state: any) => state.lobbyReducer.aiDifficulty
  );
  let difficulty = useRef<number>(difficultyReducer);
  const [playersReady, setPlayersReady] = useState<string[]>();
  // partner
  const [partnerShips, setPartnerShips] = useState<Array<Layout>>([]);

  // GameGrid
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rowHeight, setRowHeight] = useState(50);
  const maxRows: number = gameMode === "Team" ? 14 : 10;
  const maxCols: number = gameMode === "Team" ? 14 : 10;
  const gridCells: number = maxRows * maxCols;
  const [layout, setLayout] = useState<Array<Layout>>(
    Array.from({ length: gridCells }, (_, index) => ({
      i: index.toString(), // identifier for layout ships: i: `ship-${newId}-${letter}`,
      x: index % maxRows, //startX
      y: Math.floor(index / maxCols), //startY
      w: 1,
      h: 1,
      static: true,
      id: "",
    }))
  );
  // Ships
  const [dragging, setDragging] = useState(false);
  let skin: string = useSelector((state: any) => state.userReducer.skin);
  let smallShip = getSkinImage(skin, "2");
  let mediumShip = getSkinImage(skin, "3");
  let largeShip = getSkinImage(skin, "4");
  let xlargeShip = getSkinImage(skin, "5");
  let smallShipR = getSkinImage(skin, "2r");
  let mediumShipR = getSkinImage(skin, "3r"); 
  let largeShipR = getSkinImage(skin, "4r");
  let xlargeShipR = getSkinImage(skin, "5r");
  console.log("skin: ", skin, mediumShip);

  // items are ownShips
  // {
  //   i: "ship-2-test",
  //   x: 1, //startX
  //   y: 2, //startY
  //   w: 2,
  //   h: 1,
  //   static: true,
  //   id: "",
  // }
  const [items, setItems] = useState<Array<Layout>>([]);
  const [delItems, setDelItems] = useState<Array<Layout>>([]);

  // need to translate the partner ships to layout format

  const layouts = {
    lg: layout.concat(items, partnerShips),
  };
  interface ShipIds {
    [key: string]: number;
  }

  const maxS: number = 2;
  const maxM: number = 2;
  const maxL: number = 1;
  const maxXL: number = 1;
  const [draggedItem, setDraggedItem] = useState<HTMLDivElement>();
  const smallShipSize = "2";
  const mediumShipSize = "3";
  const largeShipSize = "4";
  const xlShipSize = "5";
  const firstH = 1;

  const shipIds = useRef<ShipIds>({ s: 0, m: 0, l: 0, xl: 0 });
  // ChatGPT
  const shipSizes = [
    { w: 2, h: 1, id: "2a" }, // small ships
    { w: 2, h: 1, id: "2b" },
    { w: 3, h: 1, id: "3a" }, // medium ships
    { w: 3, h: 1, id: "3b" },
    { w: 4, h: 1, id: "4" }, // large ship
    { w: 5, h: 1, id: "5" }, // extra-large ship
  ];
  // --------
  // 2 zweier, 2 dreier, 1 vierer, 1 fünfer

  // websocket
  useEffect(() => {
    // websocket connects to server
    // const newSocket: any = io(`${server}`);
    if (!socket) {
      console.error("Socket is null or undefined.");
      return;
    }
    socket.on(
      "partnerChangedShips",
      (ships: ShipTemplate[], playerName: string, partnerTeam: number) => {
        if (partnerTeam === team && username !== playerName)
          updatePartnerShips(ships);
      }
    );
    socket.on("playersReady", (playersReady: string[]) => {
      setPlayersReady(playersReady);
    });
    socket.on(
      "gameStart",
      (
        initPlayer: string,
        skinMap?: any,
        team1Ships?: Ship[],
        team2Ships?: Ship[]
      ) => {
        let team1: boolean = false;
        let myShips: ShipTemplate[] = items.map(layoutToShipTemplate);
        if (skinMap) {
          let newMap = new Map(Object.entries(skinMap));
          // newMap.set(username, skin)
          dispatch(setPlayersSkins({ playersSkins: newMap }));
        }
        if (team1Ships && team2Ships) {
          team1 = team1Ships.some((ship) => {
            const s = ship.identifier.split(":")[1];
            return s === username;
          });

          if (team1) {
            myShips = team1Ships.map(shipToShipTemplate);
          } else {
            myShips = team2Ships.map(shipToShipTemplate);
          }
          dispatch(
            setShips({
              ships: myShips,
            })
          );
        }
        dispatch(
          setInitPlayer({
            initPlayer: initPlayer,
          })
        );
        navigate("/game");
      }
    );

    // need to set the socket at bottom to emit something

    return () => {};
  }, [socket]);

  const rotateAdd = () => {
    let newX = delItems[0].x;
    let newY = delItems[0].y;
    let newH = delItems[0].w;
    let newW = delItems[0].h;
    let newShip: any = {
      i: delItems[0].i,
      x: newX + newW > maxCols ? maxCols - newW : newX,
      y: newY + newH > maxRows ? maxRows - newH : newY,
      w: newW,
      h: newH,
      static: false,
      id: delItems[0].id,
    };
    newShip = findNonOverlappingPosition(newShip);
    // Fügen Sie das Schiff zum items-Array hinzu
    setItems([...items, newShip]);
    if (gameMode === "Team") sendShipsToPartner([...items, newShip]);
    setDelItems([]);
  };
  const rotateRemove = (id: string) => {
    // Finde das zweite Item im Array
    const secondItemIndex = items.findIndex((item, index) => id === item.i);
    setDelItems([items[secondItemIndex]]);
    if (secondItemIndex !== -1) {
      // Entferne das Item aus dem items-Array
      const updatedItems = [...items];
      updatedItems.splice(secondItemIndex, 1);
      // Aktualisiere den Zustand mit dem aktualisierten Array
      setItems(updatedItems);

      // Findet das entsprechende Item im layout-Array und entfernt es ebenfalls
      const updatedLayout = layout.filter((item, index) => id !== item.i);
      setLayout(updatedLayout);
    }
  };

  useEffect(() => {
    if (delItems.length === 1) {
      rotateAdd();
    }
  }, [delItems, layout, items]);

  const onDrop = (
    layout: Layout[],
    item: Layout,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    const data = e.dataTransfer.getData("text/plain");
    if (!data) {
      console.error("Data transfer is null");
      return;
    }
    const breakpoint = /\d[a-zA-Z]/;

    const splitted = data.split(breakpoint);
    let newW: number = parseInt(splitted[0]);
    let newH: number = firstH;
    let newId: string = data;
    let noSkip = true;
    let count: number = 0;

    // kontrolliert wie viele schiffe von was schon drin sind
    switch (splitted[0]) {
      case "2":
        if (shipIds.current.s < maxS) {
          shipIds.current.s += 1;
          count = shipIds.current.s;
        } else noSkip = false;
        break;
      case "3":
        if (shipIds.current.m < maxM) {
          shipIds.current.m += 1;
          count = shipIds.current.m;
        } else noSkip = false;
        break;
      case "4":
        if (shipIds.current.l < maxL) {
          shipIds.current.l += 1;
          count = shipIds.current.l;
        } else noSkip = false;
        break;
      case "5":
        if (shipIds.current.xl < maxXL) {
          shipIds.current.xl += 1;
          count = shipIds.current.xl;
        } else noSkip = false;
        break;
      default:
    }

    if (item.y >= maxCols) item.y = maxCols - 1;
    const asciiValue = 96 + count;
    // Konvertieren Sie den ASCII-Wert in einen Buchstaben
    const letter = String.fromCharCode(asciiValue);
    if (noSkip) {
      let newItem: any = {
        i: `ship-${newId}-${letter}`,
        x: item.x,
        y: item.y,
        w: newW,
        h: newH,
        id: newId,
      };
      // Find non-overlapping position
      newItem = findNonOverlappingPosition(newItem);

      setItems([...items, newItem]);
      if (gameMode === "Team") sendShipsToPartner([...items, newItem]);
    }
  };

  const onDragStop = (layout: any, oldItemIndex: any, newItem: Layout) => {
    // if (!dragging) {
    //   return;
    // }
    let updatedLayout: any = layout.map((item: Layout) => {
      if (item.i === newItem.i) {
        const newPosition = findNonOverlappingPosition(newItem);
        return { ...item, ...newPosition };
      }
      return item;
    });
    const uniqueLayout = updatedLayout.filter(
      (item: any, index: number, self: any) =>
        index === self.findIndex((t: any) => t.i === item.i)
    );
    setLayout(updatedLayout);

    const updatedItems = items.map((item) => {
      if (item.i === newItem.i) {
        const newPosition = findNonOverlappingPosition(newItem);
        return { ...item, ...newPosition };
      }
      return item;
    });
    console.log(updatedItems);
    setItems(updatedItems);
    if (gameMode === "Team") sendShipsToPartner(updatedItems);
  };
  /*
   */
  // ChatGPT generated -------
  const isOverlapping = (item1: Layout, item2: Layout): boolean => {
    // Überprüfen, ob die IDs unterschiedlich sind, um sicherzustellen, dass wir nicht denselben Element vergleichen
    if (item1.i === item2.i) return false;

    // Berechnen der Grenzen für beide Elemente
    const item1EndX = item1.x + item1.w;
    const item1EndY = item1.y + item1.h;
    const item2EndX = item2.x + item2.w;
    const item2EndY = item2.y + item2.h;

    // return !(
    //   item1EndX  <= item2.x ||
    //   item1.x >= item2EndX ||
    //   item1EndY <= item2.y ||
    //   item1.y >= item2EndY );
    return !(
      item1EndX <= item2.x - space ||
      item1.x >= item2EndX + space ||
      item1EndY <= item2.y - space ||
      item1.y >= item2EndY + space
    );
  };
  const findNonOverlappingPosition = (newItem: Layout): Layout => {
    let layout = [...items, ...partnerShips];

    let position = { ...newItem };
    let overlaps = true;

    while (overlaps) {
      overlaps = layout.some((item) => isOverlapping(position, item));
      if (overlaps) {
        position.x += 1;
        if (position.x + position.w > maxCols) {
          position.x = 0;
          position.y += 1;
        }
      }
      if (position.y + position.h > maxRows) {
        position.y = maxRows - position.h;
        overlaps = layout.some((item) => isOverlapping(position, item));
        if (overlaps) {
          position.x = 0;
          position.y = 0;
          while (overlaps) {
            overlaps = layout.some((item) => isOverlapping(position, item));
            if (overlaps) {
              position.x += 1;
              if (position.x + position.w > maxCols) {
                position.x = 0;
                position.y += 1;
              }
            }
          }
        }
      }
    }
    return position;
  };
  function sendShipsToPartner(arr: Layout[]): void {
    // erstellt das richtige Format für weiterleitung an die anderen
    // i: `ship-${newId}-${letter}`,
    let newItems: ShipTemplate[] = [];
    newItems = arr.map((item, index) => {
      let s: string[] = item.i.split("-");
      let newID: string = s[1];
      switch (s[1]) {
        case "2":
          newID += s[2];
          break;
        case "3":
          newID += s[2];
          break;
        default:
          break;
      }

      return {
        identifier: newID,
        startX: item.x,
        startY: item.y,
        length: item.w > item.h ? item.w : item.h,
        direction: item.w > item.h ? "X" : "Y",
      };
    });
    socket.emit("sendPartnerChangedShips", roomId, newItems, username, team);
  }
  function layoutToShipTemplate(item: any): ShipTemplate {
    let s: string[] = item.i.split("-");
    console.log(s);
    let newID: string = "2";
    switch (s[1]) {
      case "2":
        newID = "2";
        break;
      case "3":
        newID = "3";
        break;
      case "4":
        newID = "4";
        break;
      case "5":
        newID = "5";
        break;
      default:
        break;
    }
    if (s[1] === "2" || s[1] === "3") {
      if (s[2] === "a") newID += "a";
      if (s[2] === "b") newID += "b";
    }

    return {
      identifier: newID,
      startX: item.x,
      startY: item.y,
      length: item.w > item.h ? item.w : item.h,
      direction: item.w > item.h ? "X" : "Y",
    };
  }
  function shipToShipTemplate(ship: Ship): ShipTemplate {
    return {
      identifier: ship.identifier,
      direction: ship.isHorizontal ? "X" : "Y",
      startX: ship.startPosition.x,
      startY: ship.startPosition.y,
      length: ship.length,
    };
  }
  function sendShipsFinal(): void {
    // erstellt das richtige Format für weiterleitung an die anderen
    // i: `ship-${newId}-${letter}`,
    let newItems: ShipTemplate[] = [];

    // Funktion zur Umwandlung eines einzelnen Items in ein ShipTemplate ---- Claude AI

    // Mapping für items
    const ownShips = items.map(layoutToShipTemplate);
    // Mapping für partnerShips
    const mappedPartnerShips = partnerShips.map(layoutToShipTemplate);

    // Zusammenführen beider Arrays
    // newItems = [...ownShips, ...mappedPartnerShips];
    newItems = [...ownShips];
    // ---------
    console.log(newItems);
    dispatch(
      setShips({
        ships: newItems,
      })
    );
    dispatch(
      setAiDifficulty({
        vsAi: true,
        aiDifficulty: difficulty.current,
      })
    );

    const playersInTeamObj = Object.fromEntries(playersInTeam);
    socket.emit(
      "sendShipPlacement",
      newItems,
      username,
      skin,
      roomId,
      maxCols,
      maxRows,
      gameMode,
      maxPlayers,
      playersInTeamObj,
      //  je nachdem ob gegen ki oder nicht
      difficulty.current > -1 ? difficulty.current : undefined,
      mines
    );
  }

  useEffect(() => {
    const uniqueLayout = layout.filter(
      (item, index, self) => index === self.findIndex((t) => t.i === item.i)
    );

    if (uniqueLayout.length !== layout.length) {
      setLayout(uniqueLayout);
    }
  }, [layout]);

  const placeShipsRandomly = () => {
    let test: any = items.forEach((item) => rotateRemove(item.i));
    setItems(test);

    let newItems: any = [];

    shipSizes.forEach((ship, index) => {
      const breakpoint = /\d[a-zA-Z]/;
      const matches = ship.id.split(breakpoint);
      let newItem: any = null;
      if (Math.random() < 0.5)
        newItem = {
          i: `ship-${matches[0]}-${matches[1]}`,
          x: Math.floor(Math.random() * maxCols),
          y: Math.floor(Math.random() * maxRows),
          w: ship.w,
          h: ship.h,
          id: ship.id,
        };
      else
        newItem = {
          i: `ship-${matches[0]}-${matches[1]}`,
          x: Math.floor(Math.random() * maxCols),
          y: Math.floor(Math.random() * maxRows),
          w: ship.h,
          h: ship.w,
          id: ship.id,
        };

      newItem = findNonOverlappingPosition(newItem);
      newItems.push(newItem);
    });

    setItems(newItems);
  };
  // hier noch mit partnerships vergleichen
  useEffect(() => {
    const checkForOverlaps = () => {
      let newItems = [...items];
      let allShips = [...items, ...partnerShips];
      let updated = false;

      newItems.forEach((item, index) => {
        let newItem = { ...item };
        while (
          allShips.some(
            (otherItem, otherIndex) =>
              otherIndex !== index && isOverlapping(newItem, otherItem)
          )
        ) {
          newItem = findNonOverlappingPosition(newItem);
          updated = true;
        }
        newItems[index] = newItem;
      });

      if (updated) {
        setItems(newItems);
        setLayout([...layout, ...newItems]);
        if (gameMode === "Team") sendShipsToPartner(newItems);
      }
    };

    checkForOverlaps();
  }, [items]);

  const sendDebugShips = (i: number) => {
    let newShips = [
      { identifier: "2a", startX: 0, startY: 0 + i, length: 2, direction: "X" },
      { identifier: "2b", startX: 8, startY: 1 + i, length: 2, direction: "X" },
      { identifier: "4", startX: 6, startY: 2 + i, length: 4, direction: "X" },
      { identifier: "5", startX: 0, startY: 3 + i, length: 5, direction: "X" },
      { identifier: "3a", startX: 5, startY: 4 + i, length: 3, direction: "Y" },
      { identifier: "3b", startX: 2, startY: 5 + i, length: 3, direction: "Y" },
    ];
    dispatch(
      setShips({
        ships: newShips,
      })
    );
    dispatch(
      setAiDifficulty({
        vsAi: true,
        aiDifficulty: difficulty.current,
      })
    );

    const playersInTeamObj = Object.fromEntries(playersInTeam);
    socket.emit(
      "sendShipPlacement",
      newShips,
      username,
      skin,
      roomId,
      maxCols,
      maxRows,
      gameMode,
      maxPlayers,
      playersInTeamObj,
      //  je nachdem ob gegen ki oder nicht
      difficulty.current > -1 ? difficulty.current : undefined,
      mines
    );
  };
  const swtichKiMode = (s: string, newDifficulty: number) => {
    setKiMode(s);
    difficulty.current = newDifficulty;
  };
  function translateToLayout(item: ShipTemplate): Layout {
    let newW = item.direction === "X" ? item.length : 1;
    let newH = item.direction === "X" ? 1 : item.length;
    const breakpoint = /.{1,1}/g;

    const splitted = item.identifier.match(breakpoint)!;

    let newId = `shipPartner-${splitted[0]}`;
    if (splitted[1]) newId += "-" + splitted[1];
    let newItem: Layout = {
      i: newId, //i: `ship-${newId}-${letter}`,
      // i: "",
      x: item.startX,
      y: item.startY,
      w: newW,
      h: newH,
      isDraggable: false,
    };

    return newItem;
  }
  function updatePartnerShips(ships: ShipTemplate[]) {
    const translatedPartnerShips = ships.map((item) => translateToLayout(item));
    // onDrop
    // wenn neues schiff dann hinzufügen
    if (ships.length > partnerShips.length) {
      setPartnerShips([...translatedPartnerShips]);
      return;
    }
    // onDragStop
    // wenn updated
    let updatedLayout: Layout[] = layout;
    let updatedItems: Layout[] = partnerShips;
    translatedPartnerShips.map((newItem: Layout) => {
      updatedLayout = layout.map((item: Layout) => {
        if (item.i === newItem.i) {
          // const newPosition = findNonOverlappingPosition(newItem, layout);
          return { ...item, ...newItem };
        }
        return item;
      });

      updatedItems = partnerShips.map((item) => {
        if (item.i === newItem.i) {
          // const newPosition = findNonOverlappingPosition(newItem, partnerShips);
          return { ...item, ...newItem };
        }
        return item;
      });
    });
    setLayout(updatedLayout);

    setPartnerShips(updatedItems);
  }
  // i: `ship-${newId}-${letter}`, for layout identifier "ship-2-a"
  function whatShip(item: Layout, partner: boolean) {
    let newSkin = skin;
    if (partner) {
      newSkin = "standard";
    }
    smallShip = getSkinImage(newSkin, "2");
    mediumShip = getSkinImage(newSkin, "3");
    largeShip = getSkinImage(newSkin, "4");
    xlargeShip = getSkinImage(newSkin, "5");
    smallShipR = getSkinImage(newSkin, "2r");
    mediumShipR = getSkinImage(newSkin, "3r");
    largeShipR = getSkinImage(newSkin, "4r");
    xlargeShipR = getSkinImage(newSkin, "5r");
    let s: string[] = item.i.split("-");
    console.log("wahtship ", item, s)
    let newPic = mediumShip;
    if (item.w > item.h) {
      switch (s[1]) {
        case "2":
          newPic = smallShip;
          break;
        case "3":
          newPic = mediumShip;
          break;
        case "4":
          newPic = largeShip;
          break;
        case "5":
          newPic = xlargeShip;
          break;
        default:
          break;
      }
    } else {
      switch (s[1]) {
        case "2":
          newPic = smallShipR;
          break;
        case "3":
          newPic = mediumShipR;
          break;
        case "4":
          newPic = largeShipR;
          break;
        case "5":
          newPic = xlargeShipR;
          break;
        default:
          break;
      }
    }
    return newPic;
  }
useEffect(() => {

  return () => {
  }
}, [partnerShips])

  const handleDragStart = () => {
    setDragging(true);
  };
  const handleDragStop = () => {
    setDragging(false);
  };

  useEffect(() => {
    const updateRowHeight = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const gridWidth = containerWidth * (2.6 / 6); // Annahme: Grid nimmt 2.6 von 6 Spalten ein
        const cellWidth = gridWidth / maxCols;
        const wert = gameMode === "Team" ? 1.5 : 1.5; // bro kein plan.....
        const newRowHeight = Math.floor(cellWidth / wert);

        setRowHeight(newRowHeight);
      }
    };

    updateRowHeight();
    window.addEventListener("resize", updateRowHeight);

    return () => window.removeEventListener("resize", updateRowHeight);
  }, [maxCols]);

  const handleDragStartShips = (e: any, shipSize: any) => {
    e.dataTransfer.setData("text/plain", shipSize);
    setDraggedItem(e.currentTarget);
  };

  const [touchedShip, setTouchedShip] = useState<string | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleTouchStart = (e: React.TouchEvent, shipSize: string) => {
    e.preventDefault();
    const touch = e.touches[0];
    const startTime = Date.now();
    const startPos = { x: touch.clientX, y: touch.clientY };

    const timer = setTimeout(() => {
      const distanceMoved = Math.sqrt(
        Math.pow(touch.clientX - startPos.x, 2) +
          Math.pow(touch.clientY - startPos.y, 2)
      );
      if (distanceMoved < 10) {
        // Wenn sich der Finger kaum bewegt hat
        setTouchedShip(shipSize);
        setTouchStartPos(startPos);
      }
    }, 200); // 200ms Verzögerung

    const handleTouchEnd = () => {
      clearTimeout(timer);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchend", handleTouchEnd, { once: true });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchedShip) return;
    e.preventDefault();
    const touch = e.touches[0];
    // Hier können Sie visuelle Feedback für das Ziehen hinzufügen
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchedShip || !touchStartPos) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    if (dropTarget && dropTarget.classList.contains("gridCell")) {
      const rect = dropTarget.getBoundingClientRect();
      const x = Math.floor(
        (touch.clientX - rect.left) / (rect.width / maxCols)
      );
      const y = Math.floor(
        (touch.clientY - rect.top) / (rect.height / maxRows)
      );
      handleShipDrop(touchedShip, x, y);
    }
    setTouchedShip(null);
    setTouchStartPos(null);
  };
  const handleShipDrop = (shipSize: string, x: number, y: number) => {
    const newW = parseInt(shipSize);
    const newH = firstH;
    const newId = shipSize;

    // Hier Ihre Logik zum Hinzufügen des Schiffs, ähnlich wie in Ihrer bestehenden onDrop-Funktion
    let newItem: any = {
      i: `ship-${newId}-${String.fromCharCode(
        97 + shipIds.current[shipSize[0]]
      )}`,
      x: x,
      y: y,
      w: newW,
      h: newH,
      id: newId,
    };

    newItem = findNonOverlappingPosition(newItem);

    setItems([...items, newItem]);
    if (gameMode === "Team") sendShipsToPartner([...items, newItem]);

    // Aktualisieren Sie shipIds
    shipIds.current[shipSize[0]] += 1;
  };
  function goBack(): void {
    socket.emit("sendLeaveRoom", roomId);
    dispatch(deleteLobby());
    navigate("/");
  }
  return (
    <>
      <Container className={styles.container} ref={containerRef}>
        <Button onClick={() => console.log(items, partnerShips)}>
          {" "}
          print items
        </Button>
        {/* <div className={styles.Header}><Header></Header></div> */}
        <div className={styles.LogoDiv} onClick={() => goBack()}>
          <div className={styles.backText}>Go Back</div>
          {/* <Button onClick={() => sendDebugShips(0)}>
          Debug Ships Button Team 1 oder Solo
        </Button>
        <Button onClick={() => sendDebugShips(1)}>
          Debug Ships Button Team 2
        </Button> */}
        </div>

        {/* einige Teile mit ChatGPT */}

        <div className={styles.Grid}>
          {/* <div className={styles.layoutGrind}> */}
          <ResponsiveGridLayout
            className={styles.Grid2}
            layouts={layouts}
            breakpoints={{ lg: 1000 }}
            cols={{
              lg: maxCols,
              md: maxCols,
              sm: maxCols,
              xs: maxCols,
              xxs: maxCols,
            }} // 10 columns for each breakpoint
            rowHeight={rowHeight} // Adjust row height as needed
            // width={containerRef.current ? containerRef.current.offsetWidth : 1000}
            isResizable={false}
            isDroppable={true}
            useCSSTransforms={true}
            onDrop={onDrop}
            allowOverlap={true}
            preventCollision={true}
            // onDragStart={handleDragStart}
            // onDrag={onDragStop}
            // onDragStop={handleDragStop}
            onDragStop={onDragStop}
            onDropDragOver={(e) => {
              // rote anzeige für größe --- ChatGPT
              if (draggedItem) {
                // Versuchen Sie, die Größe basierend auf dem gezogenen Element zu setzen
                let [nW, nH] = draggedItem.dataset.size
                  ? draggedItem.dataset.size.split("")
                  : [null, null];
                const w = parseInt(nW || "0");
                const h = firstH;
                // Stellen Sie sicher, dass w und h als number zurückgegeben werden
                return {
                  w: isNaN(w) ? 0 : w, // Verwenden Sie 0 als Standardwert, wenn die Konvertierung fehlschlägt
                  h: isNaN(h) ? 0 : h, // Verwenden Sie 0 als Standardwert, wenn die Konvertierung fehlschlägt
                };
              }
              // Standardgröße, wenn kein Element gezogen wird
              return {
                w: 3, // Neue Breite des Elements
                h: 1, // Neue Höhe des Elements
              };
            }}
          >
            {layout.map((item) => (
              <div
                key={item.i}
                className={item.i.startsWith("ship") ? "" : styles.gridCell}
              >
                {/* {item.i + " " + item.x + " " + item.y} */}
              </div>
            ))}
            {items.map((item) => {
              let newPic = whatShip(item, false);
              return (
                <div
                  key={item.i}
                  // onDoubleClick={() => rotateRemove(item.i)}
                  className={item.w > item.h ? styles.ship : styles.rotatedShip}
                >
                  <Image
                    src={newPic}
                    className={
                      item.w > item.h ? styles.normalPic : styles.rotatedPic
                    }
                  />
                  <Button
                    variant="info"
                    className={
                      item.w > item.h
                        ? styles.rotateButtonW
                        : styles.rotateButtonH
                    }
                    onClick={() => rotateRemove(item.i)}
                  ></Button>
                </div>
              );
            })}
            {partnerShips.map((item) => {
              let newPic = whatShip(item, true);
              return (
                <div key={item.i} className={styles.ship} draggable={false}>
                  <Image
                    draggable={false}
                    src={newPic}
                    className={
                      item.w > item.h ? styles.normalPic : styles.rotatedPic
                    }
                  />
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
        {/* </div> */}

        {/* Settings and start button */}

        <div className={styles.gameSettings}>
          <Button
            className={styles.next}
            variant={
              shipSizes.length - 1 >= items.length ? "danger" : "success"
            }
            onClick={() => sendShipsFinal()}
            disabled={shipSizes.length - 1 >= items.length}
          >
            Start {playersReady?.length || 0} / {maxPlayers}
          </Button>
          {vsAi && difficulty.current > -1 ? (
            <div className={styles.kiButtons}>
              <Button
                className={styles.ki1}
                onClick={() => swtichKiMode("ki1", kiDifficulties[0])}
                variant={kiMode == "ki1" ? "primary" : "warning"}
                disabled={kiMode == "ki1"}
              >
                Noob
              </Button>
              <Button
                className={styles.ki2}
                onClick={() => swtichKiMode("ki2", kiDifficulties[1])}
                variant={kiMode == "ki2" ? "primary" : "warning"}
                disabled={kiMode == "ki2"}
              >
                Human
              </Button>
              <Button
                className={styles.ki3}
                onClick={() => swtichKiMode("ki3", kiDifficulties[2])}
                variant={kiMode == "ki3" ? "primary" : "warning"}
                disabled={kiMode == "ki3"}
              >
                God Mode
              </Button>
            </div>
          ) : null}
        </div>

        <div className={styles.Ships}>
          {/* <Button onClick={placeShipsRandomly} disabled={timerRunning}>
          Place Ships Randomly
        </Button> */}
          {/* Schiffs anzeige anhand des Größentags  */}
          {Object.keys(shipIds.current).map((key) => {
             let newSkin = skin;
             smallShip = getSkinImage(newSkin, "2");
             mediumShip = getSkinImage(newSkin, "3");
             largeShip = getSkinImage(newSkin, "4");
             xlargeShip = getSkinImage(newSkin, "5");
             smallShipR = getSkinImage(newSkin, "2r");
             mediumShipR = getSkinImage(newSkin, "3r");
             largeShipR = getSkinImage(newSkin, "4r");
             xlargeShipR = getSkinImage(newSkin, "5r");
            let maxVal = maxS;
            let shipSize = smallShipSize;
            let newClass: string = styles.s;
            let newPic = mediumShip;
            console.log("auswahl 1",newPic)

            if (key === "s") {
              newPic = smallShip;
            } else if (key === "m") {
              maxVal = maxM;
              shipSize = mediumShipSize;
              newPic = mediumShip;
              newClass = styles.m;
            } else if (key === "l") {
              maxVal = maxL;
              shipSize = largeShipSize;
              newPic = largeShip;
              newClass = styles.l;
            } else if (key === "xl") {
              maxVal = maxXL;
              shipSize = xlShipSize;
              newPic = xlargeShip;
              newClass = styles.xl;
            }
            console.log("auswahl ",newPic)
            // Erstelle ein div-Element für jeden Schlüssel
            return (
              <div key={key} className={newClass}>
                <a>
                  {maxVal - shipIds.current[key] != 0
                    ? `${maxVal - shipIds.current[key]}  left`
                    : ""}
                </a>
                {maxVal - shipIds.current[key] === 0 ? null : (
                  <div
                    className={
                      shipIds.current[key] < maxVal
                        ? styles.draggableItem
                        : styles.disabledItem
                    }
                    style={{ backgroundImage: `url(${newPic})` }}
                    draggable={shipIds.current[key] < maxVal ? true : false}
                    unselectable="on"
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", shipSize);
                      setDraggedItem(e.currentTarget); // Speichern Sie das aktuell gezogene Element
                    }}
                    onTouchStart={(e) => handleTouchStart(e, shipSize)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    data-size={shipSize}
                  >
                    {/* <Image
                    src={newPic}
                    className={styles.normalPic2}
                    // draggable={shipIds.current[key] < maxVal ? true : false}
                    draggable={false}
                    onTouchStart={(e) => {
                      e.stopPropagation(); // Verhindert Bubbling
                      handleTouchStart(e, shipSize);
                    }}
                    onTouchMove={(e) => {
                      e.stopPropagation();
                      handleTouchMove(e);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      handleTouchEnd(e);
                    }}
                    onDragStart={(e) => {
                      e.preventDefault(); // Verhindert Standard-Drag für das Bild
                      e.stopPropagation();
                      e.dataTransfer.setData("text/plain", shipSize);
                      const parentDiv = e.currentTarget.parentElement;
                      if (parentDiv instanceof HTMLDivElement) {
                        setDraggedItem(parentDiv);
                      }
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                  /> */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </>
  );
}
