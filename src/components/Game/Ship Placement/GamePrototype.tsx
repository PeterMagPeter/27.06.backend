import React, { useState, useRef, useEffect } from "react";
import styles from "./GamePrototype.module.css";
import { Container, Button, Image } from "react-bootstrap";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../../Websocket/useWebSocket";
import socket from "../../Websocket/socketInstance";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { ShipTemplate, setShips } from "../../reducer/TestReducer";
import { setAiDifficulty, setInitPlayer, setLobby } from "../../reducer/LobbyReducer";
import smallShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/2.png";
import mediumShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/3.png";
import largeShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/4.png";
import xlargeShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/5.png";
import smallShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/2r.png";
import mediumShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/3r.png";
import largeShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/4r.png";
import xlargeShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/5r.png";
import logoPic from "../../../assets/pictures/cof_logo.png";
const ResponsiveGridLayout = WidthProvider(Responsive);
// instant place button -> search for "Debug Ships Button" and make it to real code
const space = 0;
const kiDifficulties = [0.25, 0.5, 0.9];
export default function GamePrototype2() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [kiMode, setKiMode] = useState<string>("ki1");
  
  // const socket = useWebSocket();
  let username = useSelector((state: any) => state.userReducer.username);
  let roomId = useSelector((state: any) => state.lobbyReducer.roomId);
  let privateMatch = useSelector((state: any) => state.lobbyReducer.privateMatch);
  let vsAi = useSelector((state: any) => state.lobbyReducer.vsAi);
  let difficultyReducer = useSelector((state: any) => state.lobbyReducer.aiDifficulty);
  let difficulty = useRef<number>(difficultyReducer);
  const [playersReady, setPlayersReady] = useState<string[]>();
  // GameGrid
  const maxRows: number = 10;
  const maxCols: number = 10;
  const gridCells: number = 100;
  const [layout, setLayout] = useState<Array<Layout>>(
    Array.from({ length: gridCells }, (_, index) => ({
      i: index.toString(), // identifier
      x: index % maxRows, //startX
      y: Math.floor(index / maxCols), //startY
      w: 1,
      h: 1,
      static: true,
      id: "",
    }))
  );

  // websocket
  useEffect(() => {
    // websocket connects to server
    // const newSocket: any = io(`${server}`);
    if (!socket) {
      console.error("Socket is null or undefined.");
      return;
    }
    socket.on("playersReady", (playersReady: string[]) => {
      setPlayersReady(playersReady);
    });
    socket.on("gameStart", (initPlayer: string) => {
      dispatch(
        setInitPlayer({
          initPlayer: initPlayer
        })
      );
      navigate("/game");
    });

    // need to set the socket at bottom to emit something

    return () => {};
  }, [socket]);
  // Ships
  interface ShipIds {
    [key: string]: number;
  }

  const maxS: number = 2;
  const maxM: number = 2;
  const maxL: number = 1;
  const maxXL: number = 1;
  const [draggedItem, setDraggedItem] = useState<HTMLDivElement>();
  const smallShipSize = "2:1:s";
  const mediumShipSize = "3:1:m";
  const largeShipSize = "4:1:l";
  const xlShipSize = "5:1:xl";

  const shipIds = useRef<ShipIds>({ s: 0, m: 0, l: 0, xl: 0 });
  // ChatGPT
  const shipSizes = [
    { w: 2, h: 1, id: "s" }, // small ships
    { w: 2, h: 1, id: "s" },
    { w: 3, h: 1, id: "m" }, // medium ships
    { w: 3, h: 1, id: "m" },
    { w: 4, h: 1, id: "l" }, // large ship
    { w: 5, h: 1, id: "xl" }, // extra-large ship
  ];
  // --------
  // 2 zweier, 2 dreier, 1 vierer, 1 fünfer

  const [items, setItems] = useState<Array<Layout>>([]);
  const [delItems, setDelItems] = useState<Array<Layout>>([]);

  const layouts = { lg: layout.concat(items) };

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
      id: "",
    };
    newShip = findNonOverlappingPosition(newShip, items);
    // Fügen Sie das Schiff zum items-Array hinzu
    setItems([...items, newShip]);
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
    let splitted = data.split(":");
    let newW: number = parseInt(splitted[0]);
    let newH: number = parseInt(splitted[1]);
    let newId: string = splitted[2];
    let noSkip = true;
    let count: number = 0;
    switch (newId) {
      case "s":
        if (shipIds.current.s < maxS) {
          shipIds.current.s += 1;
          count = shipIds.current.s;
        } else noSkip = false;
        break;
      case "m":
        if (shipIds.current.m < maxM) {
          shipIds.current.m += 1;
          count = shipIds.current.m;
        } else noSkip = false;
        break;
      case "l":
        if (shipIds.current.l < maxL) {
          shipIds.current.l += 1;
          count = shipIds.current.l;
        } else noSkip = false;
        break;
      case "xl":
        if (shipIds.current.xl < maxXL) {
          shipIds.current.xl += 1;
          count = shipIds.current.xl;
        } else noSkip = false;
        break;
      default:
    }

    if (item.y >= maxCols) item.y = maxCols - 1;

    if (noSkip) {
      let newItem: any = {
        i: `ship-${newId}-${count}`,
        x: item.x,
        y: item.y,
        w: newW,
        h: newH,
        id: newId,
      };

      // Find non-overlapping position
      newItem = findNonOverlappingPosition(newItem, items);

      setItems([...items, newItem]);
    }
  };

  const onDragStop = (layout: any, oldItemIndex: any, newItem: Layout) => {
    let updatedLayout: any = layout.map((item: Layout) => {
      if (item.i === newItem.i) {
        const newPosition = findNonOverlappingPosition(newItem, layout);
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
        const newPosition = findNonOverlappingPosition(newItem, items);
        return { ...item, ...newPosition };
      }
      return item;
    });

    setItems(updatedItems);
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
  const findNonOverlappingPosition = (newItem: Layout, layout: Layout[]) => {
    let position = { ...newItem };
    let overlaps = true;

    while (overlaps) {
      overlaps = items.some((item) => isOverlapping(position, item));
      if (overlaps) {
        position.x += 1;
        if (position.x + position.w > maxCols) {
          position.x = 0;
          position.y += 1;
        }
      }
      if (position.y + position.h > maxRows) {
        position.y = maxRows - position.h;
        overlaps = items.some((item) => isOverlapping(position, item));
        if (overlaps) {
          position.x = 0;
          position.y = 0;
          while (overlaps) {
            overlaps = items.some((item) => isOverlapping(position, item));
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
  function sendShips(event: any): void {
    // erstellt das richtige Format für weiterleitung an die anderen
    let newItems: ShipTemplate[] = [];
    newItems = items.map((item, index) => {
      let s: string[] = item.i.split("-");
      let newID: string = "2";
      switch (s[1]) {
        case "s":
          newID = "2";
          break;
        case "m":
          newID = "3";
          break;
        case "l":
          newID = "4";
          break;
        case "xl":
          newID = "5";
          break;
        default:
          break;
      }
      if (s[1] === "s" || s[1] === "m") {
        if (s[2] === "1") newID += "a";
        if (s[2] === "2") newID += "b";
      }

      return {
        identifier: newID,
        startX: item.x,
        startY: item.y,
        length: item.w > item.h ? item.w : item.h,
        direction: item.w > item.h ? "X" : "Y",
      };
    });
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
    socket.emit(
      "sendShipPlacement",
      newItems,
      username,
      roomId, //roomId
      //  je nachdem ob gegen ki oder nicht
      difficulty.current > -1 ? difficulty.current : undefined 
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
      let newItem: any = null;
      if (Math.random() < 0.5)
        newItem = {
          i: `ship-${ship.id}-${index}`,
          x: Math.floor(Math.random() * maxCols),
          y: Math.floor(Math.random() * maxRows),
          w: ship.w,
          h: ship.h,
          id: ship.id,
        };
      else
        newItem = {
          i: `ship-${ship.id}-${index}`,
          x: Math.floor(Math.random() * maxCols),
          y: Math.floor(Math.random() * maxRows),
          w: ship.h,
          h: ship.w,
          id: ship.id,
        };

      newItem = findNonOverlappingPosition(newItem, newItems);
      newItems.push(newItem);
    });

    setItems(newItems);
  };
  useEffect(() => {
    const checkForOverlaps = () => {
      let newItems = [...items];
      let updated = false;

      newItems.forEach((item, index) => {
        let newItem = { ...item };
        while (
          newItems.some(
            (otherItem, otherIndex) =>
              otherIndex !== index && isOverlapping(newItem, otherItem)
          )
        ) {
          newItem = findNonOverlappingPosition(newItem, newItems);
          updated = true;
        }
        newItems[index] = newItem;
      });

      if (updated) {
        setItems(newItems);
        setLayout([...layout, ...newItems]);
      }
    };

    checkForOverlaps();
  }, [items]);

  const sendDebugShips = () => {
    let newShips = [
      { identifier: "2a", startX: 0, startY: 0, length: 2, direction: "X" },
      { identifier: "2b", startX: 8, startY: 0, length: 2, direction: "X" },
      { identifier: "4", startX: 6, startY: 9, length: 4, direction: "X" },
      { identifier: "5", startX: 0, startY: 9, length: 5, direction: "X" },
      { identifier: "3a", startX: 5, startY: 5, length: 3, direction: "Y" },
      { identifier: "3b", startX: 2, startY: 2, length: 3, direction: "Y" },
    ];
    dispatch(
      setShips({
        ships: newShips,
      })
    );
    dispatch(
      setAiDifficulty({
        aiDifficulty: difficulty.current,
      })
    );
    navigate("/game");
  };
  const swtichKiMode = (s: string, newDifficulty: number) => {
    setKiMode(s);
    difficulty.current = newDifficulty;
  };

  return (
    <Container className={styles.container}>
      <div className={styles.LogoDiv}></div>
      {/* <Button onClick={sendDebugShips}>Debug Ships Button</Button> */}
      {/* einige Teile mit ChatGPT */}
      <ResponsiveGridLayout
        className={styles.Grid}
        layouts={layouts}
        breakpoints={{ lg: 1000 }}
        cols={{ lg: 10, md: 10, sm: 10, xs: 10, xxs: 10 }} // 10 columns for each breakpoint
        rowHeight={50} // Adjust row height as needed
        width={600} // Adjust the width as needed
        isResizable={false}
        isDroppable={true}
        onDrop={onDrop}
        allowOverlap={true}
        preventCollision={true}
        onDragStop={onDragStop}
        onDropDragOver={(e) => {
          // rote anzeige für größe
          if (draggedItem) {
            // Versuchen Sie, die Größe basierend auf dem gezogenen Element zu setzen
            let [nW, nH] = draggedItem.dataset.size
              ? draggedItem.dataset.size.split(":")
              : [null, null];
            const w = parseInt(nW || "0");
            const h = parseInt(nH || "0");
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
          let s: string[] = item.i.split("-");
          let newPic: string = mediumShip;
          if (item.w > item.h) {
            switch (s[1]) {
              case "s":
                newPic = smallShip;
                break;
              case "m":
                newPic = mediumShip;
                break;
              case "l":
                newPic = largeShip;
                break;
              case "xl":
                newPic = xlargeShip;
                break;
              default:
                break;
            }
          } else {
            switch (s[1]) {
              case "s":
                newPic = smallShipR;
                break;
              case "m":
                newPic = mediumShipR;
                break;
              case "l":
                newPic = largeShipR;
                break;
              case "xl":
                newPic = xlargeShipR;
                break;
              default:
                break;
            }
          }
          return (
            <div
              key={item.i}
              // onDoubleClick={() => rotateRemove(item.i)}
              className={styles.ship}
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
                  item.w > item.h ? styles.rotateButtonW : styles.rotateButtonH
                }
                onClick={() => rotateRemove(item.i)}
              ></Button>
            </div>
          );
        })}
      </ResponsiveGridLayout>
      {/* Settings and start button */}

      <div className={styles.gameSettings}>
        <Button
          className={styles.next}
          variant={shipSizes.length - 1 >= items.length ? "danger" : "success"}
          onClick={sendShips}
          style={{ fontSize: "100px" }}
          disabled={shipSizes.length - 1 >= items.length}
        >
          Start {playersReady?.length || 0}/2
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
          let maxVal = maxS;
          let shipSize = smallShipSize;
          let newClass: string = styles.s;
          let newPic: string = mediumShip;
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
                  draggable={shipIds.current[key] < maxVal ? true : false}
                  unselectable="on"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", shipSize);
                    setDraggedItem(e.currentTarget); // Speichern Sie das aktuell gezogene Element
                  }}
                  data-size={shipSize}
                >
                  <Image
                    src={newPic}
                    className={styles.normalPic2}
                    draggable={shipIds.current[key] < maxVal ? true : false}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Container>
  );
}
