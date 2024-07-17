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
import { Ship, ShipTemplate, setShips } from "../../reducer/TestReducer";
import {
  setAiDifficulty,
  setInitPlayer,
  setLobby,
  setMines,
  setPlayersInTeam,
} from "../../reducer/LobbyReducer";
import mineImg from "../../../assets/pictures/Spezialwaffen/Mine.png";
import { Position } from "../../../Resources";

const ResponsiveGridLayout = WidthProvider(Responsive);
// instant place button -> search for "Debug Ships Button" and make it to real code
const space = 0;
const kiDifficulties = [0.25, 0.5, 0.9];
export default function MinePlacement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [kiMode, setKiMode] = useState<string>("ki2");
  // player
  let username = useSelector((state: any) => state.userReducer.username);
  let roomId = useSelector((state: any) => state.lobbyReducer.roomId);
  let gameMode = useSelector((state: any) => state.lobbyReducer.gameMode);
  let maxPlayers = useSelector((state: any) => state.lobbyReducer.maxPlayers);
  let team = useSelector((state: any) => state.lobbyReducer.team);
  let playersInTeam: Map<string, number> = useSelector(
    (state: any) => state.lobbyReducer.playersInTeam
  );
  let vsAi = useSelector((state: any) => state.lobbyReducer.vsAi);
  let difficultyReducer = useSelector(
    (state: any) => state.lobbyReducer.aiDifficulty
  );
  let difficulty = useRef<number>(difficultyReducer);
  const [playersReady, setPlayersReady] = useState<number>(0);
  // partner
  const [partnerMines, setPartnerMines] = useState<Array<Layout>>([]);

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
  // items are ownShips
  const [items, setItems] = useState<Array<Layout>>([]);

  // need to translate the partner ships to layout format

  const layouts = {
    lg: layout.concat(items, partnerMines),
  };
  // ChatGPT
  // --------
  // Mine -------------
  const maxMines: number = 3;
  let currentMines = useRef<number>(0);
  const mineW: number = 1;
  const mineH: number = 1;
  const mineSize: number = 1;

  // --------

  // websocket
  useEffect(() => {
    // websocket connects to server
    // const newSocket: any = io(`${server}`);
    if (!socket) {
      console.error("Socket is null or undefined.");
      return;
    }
    socket.on(
      "partnerChangedMines",
      (mines: Layout[], playerName: string, partnerTeam: number) => {
        if (partnerTeam === team && username !== playerName)
          updatePartnerMines(mines);
      }
    );
    socket.on("minePlacementReady", (playersReady: number) => {
      setPlayersReady(playersReady);
    });

    socket.on("startShipPlacement", (playersInTeamObj: any) => {
      const playersInTeamMap = new Map(Object.entries(playersInTeamObj));
      console.log("startShipPlacement map", playersInTeamMap);

      dispatch(setPlayersInTeam({ playersInTeam: playersInTeamMap }));
      navigate("/shipplacement");
    });

    // need to set the socket at bottom to emit something

    return () => {};
  }, [socket]);

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
    let newId: string = data;
    let noSkip = true;
    let count: number = 0;

    // kontrolliert wie viele schiffe von was schon drin sind

    if (currentMines.current < maxMines) {
      currentMines.current += 1;
      count = currentMines.current;
    } else noSkip = false;

    if (item.y >= maxCols) item.y = maxCols - 1;
    // Konvertieren Sie den ASCII-Wert in einen Buchstaben
    if (noSkip) {
      let newItem: any = {
        i: `mine-${count}`,
        x: item.x,
        y: item.y,
        w: mineW,
        h: mineH,
        id: newId,
      };
      // Find non-overlapping position
      newItem = findNonOverlappingPosition(newItem);

      setItems([...items, newItem]);
      if (gameMode === "Team") sendMinesToPartner([...items, newItem]);
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
    if (gameMode === "Team") sendMinesToPartner(updatedItems);
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
    let layout = [...items, ...partnerMines];

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
  function sendMinesToPartner(arr: Layout[]): void {
    // erstellt das richtige Format für weiterleitung an die anderen
    // i: `mine-${count}`,
    let newItems: Layout[] = [];
    newItems = arr.map((item, index) => {
      let s: string[] = item.i.split("-");
      console.log(s)
      let newID: string = "minePartner-"+s[1];

      return {
        i: newID,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        id: item.id,
      };
    });
    socket.emit("sendPartnerChangedMines", roomId, newItems, username, team);
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
  function minesToPositionTemplate(arr: Layout[]): Position[] {
    let newItems: Position[] = arr.map((item) => {
      return {
        x: item.x,
        y: item.y,
      };
    });
    return newItems;
  }
  function sendMinesFinal(): void {
    // erstellt das richtige Format für weiterleitung an die anderen
    // i: `ship-${newId}-${letter}`,

    let newItems: Position[] = minesToPositionTemplate(items);
    // ---------
    console.log(newItems);

    dispatch(setMines({ mines: newItems }));
    const playersInTeamObj = Object.fromEntries(playersInTeam);
    socket.emit(
      "sendMinePlacement",
      roomId,
      playersInTeamObj,
      maxPlayers,
      newItems
    );
  }
  function sendDebugMinesFinal(i: number): void {
    // erstellt das richtige Format für weiterleitung an die anderen
    // i: `ship-${newId}-${letter}`,

    let newItems: Position[] = [
      { x: 2 + i, y: 2 + i },
      { x: 3 + i, y: 3 + i },
      { x: 5 + i, y: 5 + i },
    ];
    // ---------
    console.log(newItems);

    dispatch(setMines({ mines: newItems }));
    const playersInTeamObj = Object.fromEntries(playersInTeam);
    socket.emit(
      "sendMinePlacement",
      roomId,
      playersInTeamObj,
      maxPlayers,
      newItems
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

  // hier noch mit partnerMines vergleichen
  useEffect(() => {
    const checkForOverlaps = () => {
      let newItems = [...items];
      let allShips = [...items, ...partnerMines];
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
        if (gameMode === "Team") sendMinesToPartner(newItems);
      }
    };

    checkForOverlaps();
  }, [items]);

  function translateToLayout(item: ShipTemplate): Layout {
    let newW = item.direction === "X" ? item.length : 1;
    let newH = item.direction === "X" ? 1 : item.length;
    const breakpoint = /.{1,1}/g;

    const splitted = item.identifier.match(breakpoint)!;

    let newItem: Layout = {
      i: `minePartner-${splitted[0]}-${splitted[1]}`, //i: `ship-${newId}-${letter}`,
      // i: "",
      x: item.startX,
      y: item.startY,
      w: newW,
      h: newH,
      isDraggable: false,
    };

    return newItem;
  }
  function updatePartnerMines(mines: Layout[]) {
    // const translatedPartnerMines = ships.map((item) => translateToLayout(item));
    // onDrop
    // wenn neues schiff dann hinzufügen
    if (mines.length > partnerMines.length) {
      setPartnerMines([...mines]);
      return;
    }
    // onDragStop
    // wenn updated
    let updatedLayout: Layout[] = layout;
    let updatedItems: Layout[] = partnerMines;
    mines.map((newItem: Layout) => {
      updatedLayout = layout.map((item: Layout) => {
        if (item.i === newItem.i) {
          // const newPosition = findNonOverlappingPosition(newItem, layout);
          return { ...item, ...newItem };
        }
        return item;
      });

      updatedItems = partnerMines.map((item) => {
        if (item.i === newItem.i) {
          // const newPosition = findNonOverlappingPosition(newItem, partnerMines);
          return { ...item, ...newItem };
        }
        return item;
      });
    });
    setLayout(updatedLayout);

    setPartnerMines(updatedItems);
  }
  // i: `mine-${count}`, for layout identifier "mine-1"

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

  return (
    <Container className={styles.container} ref={containerRef}>
      <div className={styles.LogoDiv}>
        {" "}
        {/* <Button onClick={() => sendDebugMinesFinal(0)}>
          Debug Mines Button Team 1 oder Solo
        </Button>
        <Button onClick={() => sendDebugMinesFinal(1)}>
          Debug Mines Button Team 2
        </Button> */}
      </div>
      {/* <Button onClick={()=>console.log(items, partnerMines)}>print items</Button> */}
      {/* <Button onClick={sendDebugShips}>Debug Ships Button</Button> */}
      {/* einige Teile mit ChatGPT */}

      <div className={styles.Grid}>
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
          onDrop={onDrop}
          allowOverlap={true}
          preventCollision={true}
          // onDragStart={handleDragStart}
          // onDrag={onDragStop}
          // onDragStop={handleDragStop}
          onDragStop={onDragStop}
          onDropDragOver={(e) => {
            // rote anzeige für größe --- ChatGPT
            // Standardgröße, wenn kein Element gezogen wird
            return {
              w: 1, // Neue Breite des Elements
              h: 1, // Neue Höhe des Elements
            };
          }}
        >
          {layout.map((item) => (
            <div
              key={item.i}
              className={item.i.startsWith("mine") ? "" : styles.gridCell}
            >
              {/* {item.i + " " + item.x + " " + item.y} */}
            </div>
          ))}
          {items.map((item) => {
            let newPic: string = mineImg;
            return (
              <div
                key={item.i}
                // onDoubleClick={() => rotateRemove(item.i)}
                className={styles.mine}
              >
                <Image src={newPic} className={styles.normalPic} />
              </div>
            );
          })}
          {partnerMines.map((item) => {
            let newPic: string = mineImg;
            return (
              <div key={item.i} className={styles.mine} draggable={false}>
                <Image
                  draggable={false}
                  src={newPic}
                  className={styles.normalPicMinePartner}
                />
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
      {/* Settings and start button */}

      <div className={styles.gameSettings}>
        <Button
          className={styles.next}
          variant={maxMines > currentMines.current ? "danger" : "success"}
          onClick={sendMinesFinal}
          disabled={maxMines > currentMines.current}
        >
          Start {playersReady} / {maxPlayers}
        </Button>
      </div>

      <div className={styles.Ships}>
        {/* <Button onClick={placeShipsRandomly} disabled={timerRunning}>
          Place Ships Randomly
        </Button> */}
        {/* Schiffs anzeige anhand des Größentags  */}
        {Array.from({ length: 1 }, (_, index) => {
          let key = index;
          let maxVal = maxMines;
          let newClass: string = styles.mine;
          let newPic: string = mineImg;

          // Erstelle ein div-Element für jeden Schlüssel
          return (
            <div key={key} className={newClass}>
              <a>
                {maxMines - currentMines.current != 0
                  ? `${maxMines - currentMines.current}  left`
                  : ""}
              </a>
              {maxMines - currentMines.current === 0 ? null : (
                <div
                  className={styles.draggableItem}
                  draggable={maxMines > currentMines.current ? true : false}
                  unselectable="on"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", mineSize + "");
                  }}
                  data-size={mineSize}
                >
                  <Image
                    src={newPic}
                    className={styles.normalPic2}
                    draggable={maxMines > currentMines.current ? true : false}
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
