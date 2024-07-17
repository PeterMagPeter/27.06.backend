"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MinePlacement;
const react_1 = __importStar(require("react"));
const TeamGamePrototype_module_css_1 = __importDefault(require("./TeamGamePrototype.module.css"));
const react_bootstrap_1 = require("react-bootstrap");
const react_grid_layout_1 = require("react-grid-layout");
const react_redux_1 = require("react-redux");
const react_router_dom_1 = require("react-router-dom");
const socketInstance_1 = __importDefault(require("../../Websocket/socketInstance"));
require("react-grid-layout/css/styles.css");
require("react-resizable/css/styles.css");
const LobbyReducer_1 = require("../../reducer/LobbyReducer");
const Mine_png_1 = __importDefault(require("../../../assets/pictures/Spezialwaffen/Mine.png"));
const ResponsiveGridLayout = (0, react_grid_layout_1.WidthProvider)(react_grid_layout_1.Responsive);
// instant place button -> search for "Debug Ships Button" and make it to real code
const space = 0;
const kiDifficulties = [0.25, 0.5, 0.9];
function MinePlacement() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [kiMode, setKiMode] = (0, react_1.useState)("ki2");
    // player
    let username = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    let roomId = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.roomId);
    let gameMode = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.gameMode);
    let maxPlayers = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.maxPlayers);
    let team = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.team);
    let playersInTeam = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.playersInTeam);
    let vsAi = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.vsAi);
    let difficultyReducer = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.aiDifficulty);
    let difficulty = (0, react_1.useRef)(difficultyReducer);
    const [playersReady, setPlayersReady] = (0, react_1.useState)(0);
    // partner
    const [partnerMines, setPartnerMines] = (0, react_1.useState)([]);
    // GameGrid
    const containerRef = (0, react_1.useRef)(null);
    const [rowHeight, setRowHeight] = (0, react_1.useState)(50);
    const maxRows = gameMode === "Team" ? 14 : 10;
    const maxCols = gameMode === "Team" ? 14 : 10;
    const gridCells = maxRows * maxCols;
    const [layout, setLayout] = (0, react_1.useState)(Array.from({ length: gridCells }, (_, index) => ({
        i: index.toString(), // identifier for layout ships: i: `ship-${newId}-${letter}`,
        x: index % maxRows, //startX
        y: Math.floor(index / maxCols), //startY
        w: 1,
        h: 1,
        static: true,
        id: "",
    })));
    // items are ownShips
    const [items, setItems] = (0, react_1.useState)([]);
    // need to translate the partner ships to layout format
    const layouts = {
        lg: layout.concat(items, partnerMines),
    };
    // ChatGPT
    // --------
    // Mine -------------
    const maxMines = 3;
    let currentMines = (0, react_1.useRef)(0);
    const mineW = 1;
    const mineH = 1;
    const mineSize = 1;
    // --------
    // websocket
    (0, react_1.useEffect)(() => {
        // websocket connects to server
        // const newSocket: any = io(`${server}`);
        if (!socketInstance_1.default) {
            console.error("Socket is null or undefined.");
            return;
        }
        socketInstance_1.default.on("partnerChangedMines", (mines, playerName, partnerTeam) => {
            if (partnerTeam === team && username !== playerName)
                updatePartnerMines(mines);
        });
        socketInstance_1.default.on("minePlacementReady", (playersReady) => {
            setPlayersReady(playersReady);
        });
        socketInstance_1.default.on("startShipPlacement", (playersInTeamObj) => {
            const playersInTeamMap = new Map(Object.entries(playersInTeamObj));
            console.log("startShipPlacement map", playersInTeamMap);
            dispatch((0, LobbyReducer_1.setPlayersInTeam)({ playersInTeam: playersInTeamMap }));
            navigate("/shipplacement");
        });
        // need to set the socket at bottom to emit something
        return () => { };
    }, [socketInstance_1.default]);
    const onDrop = (layout, item, e) => {
        const data = e.dataTransfer.getData("text/plain");
        if (!data) {
            console.error("Data transfer is null");
            return;
        }
        let newId = data;
        let noSkip = true;
        let count = 0;
        // kontrolliert wie viele schiffe von was schon drin sind
        if (currentMines.current < maxMines) {
            currentMines.current += 1;
            count = currentMines.current;
        }
        else
            noSkip = false;
        if (item.y >= maxCols)
            item.y = maxCols - 1;
        // Konvertieren Sie den ASCII-Wert in einen Buchstaben
        if (noSkip) {
            let newItem = {
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
            if (gameMode === "Team")
                sendMinesToPartner([...items, newItem]);
        }
    };
    const onDragStop = (layout, oldItemIndex, newItem) => {
        // if (!dragging) {
        //   return;
        // }
        let updatedLayout = layout.map((item) => {
            if (item.i === newItem.i) {
                const newPosition = findNonOverlappingPosition(newItem);
                return Object.assign(Object.assign({}, item), newPosition);
            }
            return item;
        });
        const uniqueLayout = updatedLayout.filter((item, index, self) => index === self.findIndex((t) => t.i === item.i));
        setLayout(updatedLayout);
        const updatedItems = items.map((item) => {
            if (item.i === newItem.i) {
                const newPosition = findNonOverlappingPosition(newItem);
                return Object.assign(Object.assign({}, item), newPosition);
            }
            return item;
        });
        console.log(updatedItems);
        setItems(updatedItems);
        if (gameMode === "Team")
            sendMinesToPartner(updatedItems);
    };
    /*
     */
    // ChatGPT generated -------
    const isOverlapping = (item1, item2) => {
        // Überprüfen, ob die IDs unterschiedlich sind, um sicherzustellen, dass wir nicht denselben Element vergleichen
        if (item1.i === item2.i)
            return false;
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
        return !(item1EndX <= item2.x - space ||
            item1.x >= item2EndX + space ||
            item1EndY <= item2.y - space ||
            item1.y >= item2EndY + space);
    };
    const findNonOverlappingPosition = (newItem) => {
        let layout = [...items, ...partnerMines];
        let position = Object.assign({}, newItem);
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
    function sendMinesToPartner(arr) {
        // erstellt das richtige Format für weiterleitung an die anderen
        // i: `mine-${count}`,
        let newItems = [];
        newItems = arr.map((item, index) => {
            let s = item.i.split("-");
            console.log(s);
            let newID = "minePartner-" + s[1];
            return {
                i: newID,
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
                id: item.id,
            };
        });
        socketInstance_1.default.emit("sendPartnerChangedMines", roomId, newItems, username, team);
    }
    function layoutToShipTemplate(item) {
        let s = item.i.split("-");
        console.log(s);
        let newID = "2";
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
            if (s[2] === "a")
                newID += "a";
            if (s[2] === "b")
                newID += "b";
        }
        return {
            identifier: newID,
            startX: item.x,
            startY: item.y,
            length: item.w > item.h ? item.w : item.h,
            direction: item.w > item.h ? "X" : "Y",
        };
    }
    function shipToShipTemplate(ship) {
        return {
            identifier: ship.identifier,
            direction: ship.isHorizontal ? "X" : "Y",
            startX: ship.startPosition.x,
            startY: ship.startPosition.y,
            length: ship.length,
        };
    }
    function minesToPositionTemplate(arr) {
        let newItems = arr.map((item) => {
            return {
                x: item.x,
                y: item.y,
            };
        });
        return newItems;
    }
    function sendMinesFinal() {
        // erstellt das richtige Format für weiterleitung an die anderen
        // i: `ship-${newId}-${letter}`,
        let newItems = minesToPositionTemplate(items);
        // ---------
        console.log(newItems);
        dispatch((0, LobbyReducer_1.setMines)({ mines: newItems }));
        const playersInTeamObj = Object.fromEntries(playersInTeam);
        socketInstance_1.default.emit("sendMinePlacement", roomId, playersInTeamObj, maxPlayers, newItems);
    }
    function sendDebugMinesFinal(i) {
        // erstellt das richtige Format für weiterleitung an die anderen
        // i: `ship-${newId}-${letter}`,
        let newItems = [
            { x: 2 + i, y: 2 + i },
            { x: 3 + i, y: 3 + i },
            { x: 5 + i, y: 5 + i },
        ];
        // ---------
        console.log(newItems);
        dispatch((0, LobbyReducer_1.setMines)({ mines: newItems }));
        const playersInTeamObj = Object.fromEntries(playersInTeam);
        socketInstance_1.default.emit("sendMinePlacement", roomId, playersInTeamObj, maxPlayers, newItems);
    }
    (0, react_1.useEffect)(() => {
        const uniqueLayout = layout.filter((item, index, self) => index === self.findIndex((t) => t.i === item.i));
        if (uniqueLayout.length !== layout.length) {
            setLayout(uniqueLayout);
        }
    }, [layout]);
    // hier noch mit partnerMines vergleichen
    (0, react_1.useEffect)(() => {
        const checkForOverlaps = () => {
            let newItems = [...items];
            let allShips = [...items, ...partnerMines];
            let updated = false;
            newItems.forEach((item, index) => {
                let newItem = Object.assign({}, item);
                while (allShips.some((otherItem, otherIndex) => otherIndex !== index && isOverlapping(newItem, otherItem))) {
                    newItem = findNonOverlappingPosition(newItem);
                    updated = true;
                }
                newItems[index] = newItem;
            });
            if (updated) {
                setItems(newItems);
                setLayout([...layout, ...newItems]);
                if (gameMode === "Team")
                    sendMinesToPartner(newItems);
            }
        };
        checkForOverlaps();
    }, [items]);
    function translateToLayout(item) {
        let newW = item.direction === "X" ? item.length : 1;
        let newH = item.direction === "X" ? 1 : item.length;
        const breakpoint = /.{1,1}/g;
        const splitted = item.identifier.match(breakpoint);
        let newItem = {
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
    function updatePartnerMines(mines) {
        // const translatedPartnerMines = ships.map((item) => translateToLayout(item));
        // onDrop
        // wenn neues schiff dann hinzufügen
        if (mines.length > partnerMines.length) {
            setPartnerMines([...mines]);
            return;
        }
        // onDragStop
        // wenn updated
        let updatedLayout = layout;
        let updatedItems = partnerMines;
        mines.map((newItem) => {
            updatedLayout = layout.map((item) => {
                if (item.i === newItem.i) {
                    // const newPosition = findNonOverlappingPosition(newItem, layout);
                    return Object.assign(Object.assign({}, item), newItem);
                }
                return item;
            });
            updatedItems = partnerMines.map((item) => {
                if (item.i === newItem.i) {
                    // const newPosition = findNonOverlappingPosition(newItem, partnerMines);
                    return Object.assign(Object.assign({}, item), newItem);
                }
                return item;
            });
        });
        setLayout(updatedLayout);
        setPartnerMines(updatedItems);
    }
    // i: `mine-${count}`, for layout identifier "mine-1"
    (0, react_1.useEffect)(() => {
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
    return (<react_bootstrap_1.Container className={TeamGamePrototype_module_css_1.default.container} ref={containerRef}>
      <div className={TeamGamePrototype_module_css_1.default.LogoDiv}>
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

      <div className={TeamGamePrototype_module_css_1.default.Grid}>
        <ResponsiveGridLayout className={TeamGamePrototype_module_css_1.default.Grid2} layouts={layouts} breakpoints={{ lg: 1000 }} cols={{
            lg: maxCols,
            md: maxCols,
            sm: maxCols,
            xs: maxCols,
            xxs: maxCols,
        }} // 10 columns for each breakpoint
     rowHeight={rowHeight} // Adjust row height as needed
     
    // width={containerRef.current ? containerRef.current.offsetWidth : 1000}
    isResizable={false} isDroppable={true} onDrop={onDrop} allowOverlap={true} preventCollision={true} 
    // onDragStart={handleDragStart}
    // onDrag={onDragStop}
    // onDragStop={handleDragStop}
    onDragStop={onDragStop} onDropDragOver={(e) => {
            // rote anzeige für größe --- ChatGPT
            // Standardgröße, wenn kein Element gezogen wird
            return {
                w: 1, // Neue Breite des Elements
                h: 1, // Neue Höhe des Elements
            };
        }}>
          {layout.map((item) => (<div key={item.i} className={item.i.startsWith("mine") ? "" : TeamGamePrototype_module_css_1.default.gridCell}>
              {/* {item.i + " " + item.x + " " + item.y} */}
            </div>))}
          {items.map((item) => {
            let newPic = Mine_png_1.default;
            return (<div key={item.i} 
            // onDoubleClick={() => rotateRemove(item.i)}
            className={TeamGamePrototype_module_css_1.default.mine}>
                <react_bootstrap_1.Image src={newPic} className={TeamGamePrototype_module_css_1.default.normalPic}/>
              </div>);
        })}
          {partnerMines.map((item) => {
            let newPic = Mine_png_1.default;
            return (<div key={item.i} className={TeamGamePrototype_module_css_1.default.mine} draggable={false}>
                <react_bootstrap_1.Image draggable={false} src={newPic} className={TeamGamePrototype_module_css_1.default.normalPicMinePartner}/>
              </div>);
        })}
        </ResponsiveGridLayout>
      </div>
      {/* Settings and start button */}

      <div className={TeamGamePrototype_module_css_1.default.gameSettings}>
        <react_bootstrap_1.Button className={TeamGamePrototype_module_css_1.default.next} variant={maxMines > currentMines.current ? "danger" : "success"} onClick={sendMinesFinal} disabled={maxMines > currentMines.current}>
          Start {playersReady} / {maxPlayers}
        </react_bootstrap_1.Button>
      </div>

      <div className={TeamGamePrototype_module_css_1.default.Ships}>
        {/* <Button onClick={placeShipsRandomly} disabled={timerRunning}>
          Place Ships Randomly
        </Button> */}
        {/* Schiffs anzeige anhand des Größentags  */}
        {Array.from({ length: 1 }, (_, index) => {
            let key = index;
            let maxVal = maxMines;
            let newClass = TeamGamePrototype_module_css_1.default.mine;
            let newPic = Mine_png_1.default;
            // Erstelle ein div-Element für jeden Schlüssel
            return (<div key={key} className={newClass}>
              <a>
                {maxMines - currentMines.current != 0
                    ? `${maxMines - currentMines.current}  left`
                    : ""}
              </a>
              {maxMines - currentMines.current === 0 ? null : (<div className={TeamGamePrototype_module_css_1.default.draggableItem} draggable={maxMines > currentMines.current ? true : false} unselectable="on" onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", mineSize + "");
                    }} data-size={mineSize}>
                  <react_bootstrap_1.Image src={newPic} className={TeamGamePrototype_module_css_1.default.normalPic2} draggable={maxMines > currentMines.current ? true : false}/>
                </div>)}
            </div>);
        })}
      </div>
    </react_bootstrap_1.Container>);
}
//# sourceMappingURL=MinePlacement.js.map