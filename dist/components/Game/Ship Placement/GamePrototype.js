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
exports.default = GamePrototype2;
const react_1 = __importStar(require("react"));
const GamePrototype_module_css_1 = __importDefault(require("./GamePrototype.module.css"));
const react_bootstrap_1 = require("react-bootstrap");
const react_grid_layout_1 = require("react-grid-layout");
const react_redux_1 = require("react-redux");
const react_router_dom_1 = require("react-router-dom");
const socketInstance_1 = __importDefault(require("../../Websocket/socketInstance"));
require("react-grid-layout/css/styles.css");
require("react-resizable/css/styles.css");
const TestReducer_1 = require("../../reducer/TestReducer");
const LobbyReducer_1 = require("../../reducer/LobbyReducer");
const _2_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/2.png"));
const _3_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/3.png"));
const _4_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/4.png"));
const _5_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/5.png"));
const _2r_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/2r.png"));
const _3r_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/3r.png"));
const _4r_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/4r.png"));
const _5r_png_1 = __importDefault(require("../../../assets/pictures/Schiffe/StandardPNG/holes/5r.png"));
const ResponsiveGridLayout = (0, react_grid_layout_1.WidthProvider)(react_grid_layout_1.Responsive);
// instant place button -> search for "Debug Ships Button" and make it to real code
const space = 0;
const kiDifficulties = [0.25, 0.5, 0.9];
function GamePrototype2() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [kiMode, setKiMode] = (0, react_1.useState)("ki1");
    // const socket = useWebSocket();
    let username = (0, react_redux_1.useSelector)((state) => state.userReducer.username);
    let roomId = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.roomId);
    let privateMatch = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.privateMatch);
    let vsAi = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.vsAi);
    let difficultyReducer = (0, react_redux_1.useSelector)((state) => state.lobbyReducer.aiDifficulty);
    let difficulty = (0, react_1.useRef)(difficultyReducer);
    const [playersReady, setPlayersReady] = (0, react_1.useState)();
    // GameGrid
    const maxRows = 10;
    const maxCols = 10;
    const gridCells = 100;
    const [layout, setLayout] = (0, react_1.useState)(Array.from({ length: gridCells }, (_, index) => ({
        i: index.toString(), // identifier
        x: index % maxRows, //startX
        y: Math.floor(index / maxCols), //startY
        w: 1,
        h: 1,
        static: true,
        id: "",
    })));
    // websocket
    (0, react_1.useEffect)(() => {
        // websocket connects to server
        // const newSocket: any = io(`${server}`);
        if (!socketInstance_1.default) {
            console.error("Socket is null or undefined.");
            return;
        }
        socketInstance_1.default.on("playersReady", (playersReady) => {
            setPlayersReady(playersReady);
        });
        socketInstance_1.default.on("gameStart", (initPlayer) => {
            dispatch((0, LobbyReducer_1.setInitPlayer)({
                initPlayer: initPlayer
            }));
            navigate("/game");
        });
        // need to set the socket at bottom to emit something
        return () => { };
    }, [socketInstance_1.default]);
    const maxS = 2;
    const maxM = 2;
    const maxL = 1;
    const maxXL = 1;
    const [draggedItem, setDraggedItem] = (0, react_1.useState)();
    const smallShipSize = "2:1:s";
    const mediumShipSize = "3:1:m";
    const largeShipSize = "4:1:l";
    const xlShipSize = "5:1:xl";
    const shipIds = (0, react_1.useRef)({ s: 0, m: 0, l: 0, xl: 0 });
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
    const [items, setItems] = (0, react_1.useState)([]);
    const [delItems, setDelItems] = (0, react_1.useState)([]);
    const layouts = { lg: layout.concat(items) };
    const rotateAdd = () => {
        let newX = delItems[0].x;
        let newY = delItems[0].y;
        let newH = delItems[0].w;
        let newW = delItems[0].h;
        let newShip = {
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
    const rotateRemove = (id) => {
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
    (0, react_1.useEffect)(() => {
        if (delItems.length === 1) {
            rotateAdd();
        }
    }, [delItems, layout, items]);
    const onDrop = (layout, item, e) => {
        const data = e.dataTransfer.getData("text/plain");
        let splitted = data.split(":");
        let newW = parseInt(splitted[0]);
        let newH = parseInt(splitted[1]);
        let newId = splitted[2];
        let noSkip = true;
        let count = 0;
        switch (newId) {
            case "s":
                if (shipIds.current.s < maxS) {
                    shipIds.current.s += 1;
                    count = shipIds.current.s;
                }
                else
                    noSkip = false;
                break;
            case "m":
                if (shipIds.current.m < maxM) {
                    shipIds.current.m += 1;
                    count = shipIds.current.m;
                }
                else
                    noSkip = false;
                break;
            case "l":
                if (shipIds.current.l < maxL) {
                    shipIds.current.l += 1;
                    count = shipIds.current.l;
                }
                else
                    noSkip = false;
                break;
            case "xl":
                if (shipIds.current.xl < maxXL) {
                    shipIds.current.xl += 1;
                    count = shipIds.current.xl;
                }
                else
                    noSkip = false;
                break;
            default:
        }
        if (item.y >= maxCols)
            item.y = maxCols - 1;
        if (noSkip) {
            let newItem = {
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
    const onDragStop = (layout, oldItemIndex, newItem) => {
        let updatedLayout = layout.map((item) => {
            if (item.i === newItem.i) {
                const newPosition = findNonOverlappingPosition(newItem, layout);
                return Object.assign(Object.assign({}, item), newPosition);
            }
            return item;
        });
        const uniqueLayout = updatedLayout.filter((item, index, self) => index === self.findIndex((t) => t.i === item.i));
        setLayout(updatedLayout);
        const updatedItems = items.map((item) => {
            if (item.i === newItem.i) {
                const newPosition = findNonOverlappingPosition(newItem, items);
                return Object.assign(Object.assign({}, item), newPosition);
            }
            return item;
        });
        setItems(updatedItems);
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
    const findNonOverlappingPosition = (newItem, layout) => {
        let position = Object.assign({}, newItem);
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
    function sendShips(event) {
        // erstellt das richtige Format für weiterleitung an die anderen
        let newItems = [];
        newItems = items.map((item, index) => {
            let s = item.i.split("-");
            let newID = "2";
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
                if (s[2] === "1")
                    newID += "a";
                if (s[2] === "2")
                    newID += "b";
            }
            return {
                identifier: newID,
                startX: item.x,
                startY: item.y,
                length: item.w > item.h ? item.w : item.h,
                direction: item.w > item.h ? "X" : "Y",
            };
        });
        dispatch((0, TestReducer_1.setShips)({
            ships: newItems,
        }));
        dispatch((0, LobbyReducer_1.setAiDifficulty)({
            vsAi: true,
            aiDifficulty: difficulty.current,
        }));
        socketInstance_1.default.emit("sendShipPlacement", newItems, username, roomId, //roomId
        //  je nachdem ob gegen ki oder nicht
        difficulty.current > -1 ? difficulty.current : undefined);
    }
    (0, react_1.useEffect)(() => {
        const uniqueLayout = layout.filter((item, index, self) => index === self.findIndex((t) => t.i === item.i));
        if (uniqueLayout.length !== layout.length) {
            setLayout(uniqueLayout);
        }
    }, [layout]);
    const placeShipsRandomly = () => {
        let test = items.forEach((item) => rotateRemove(item.i));
        setItems(test);
        let newItems = [];
        shipSizes.forEach((ship, index) => {
            let newItem = null;
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
    (0, react_1.useEffect)(() => {
        const checkForOverlaps = () => {
            let newItems = [...items];
            let updated = false;
            newItems.forEach((item, index) => {
                let newItem = Object.assign({}, item);
                while (newItems.some((otherItem, otherIndex) => otherIndex !== index && isOverlapping(newItem, otherItem))) {
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
        dispatch((0, TestReducer_1.setShips)({
            ships: newShips,
        }));
        dispatch((0, LobbyReducer_1.setAiDifficulty)({
            aiDifficulty: difficulty.current,
        }));
        navigate("/game");
    };
    const swtichKiMode = (s, newDifficulty) => {
        setKiMode(s);
        difficulty.current = newDifficulty;
    };
    return (<react_bootstrap_1.Container className={GamePrototype_module_css_1.default.container}>
      <div className={GamePrototype_module_css_1.default.LogoDiv}></div>
      {/* <Button onClick={sendDebugShips}>Debug Ships Button</Button> */}
      {/* einige Teile mit ChatGPT */}
      <ResponsiveGridLayout className={GamePrototype_module_css_1.default.Grid} layouts={layouts} breakpoints={{ lg: 1000 }} cols={{ lg: 10, md: 10, sm: 10, xs: 10, xxs: 10 }} // 10 columns for each breakpoint
     rowHeight={50} // Adjust row height as needed
     width={600} // Adjust the width as needed
     isResizable={false} isDroppable={true} onDrop={onDrop} allowOverlap={true} preventCollision={true} onDragStop={onDragStop} onDropDragOver={(e) => {
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
        }}>
        {layout.map((item) => (<div key={item.i} className={item.i.startsWith("ship") ? "" : GamePrototype_module_css_1.default.gridCell}>
            {/* {item.i + " " + item.x + " " + item.y} */}
          </div>))}
        {items.map((item) => {
            let s = item.i.split("-");
            let newPic = _3_png_1.default;
            if (item.w > item.h) {
                switch (s[1]) {
                    case "s":
                        newPic = _2_png_1.default;
                        break;
                    case "m":
                        newPic = _3_png_1.default;
                        break;
                    case "l":
                        newPic = _4_png_1.default;
                        break;
                    case "xl":
                        newPic = _5_png_1.default;
                        break;
                    default:
                        break;
                }
            }
            else {
                switch (s[1]) {
                    case "s":
                        newPic = _2r_png_1.default;
                        break;
                    case "m":
                        newPic = _3r_png_1.default;
                        break;
                    case "l":
                        newPic = _4r_png_1.default;
                        break;
                    case "xl":
                        newPic = _5r_png_1.default;
                        break;
                    default:
                        break;
                }
            }
            return (<div key={item.i} 
            // onDoubleClick={() => rotateRemove(item.i)}
            className={GamePrototype_module_css_1.default.ship}>
              <react_bootstrap_1.Image src={newPic} className={item.w > item.h ? GamePrototype_module_css_1.default.normalPic : GamePrototype_module_css_1.default.rotatedPic}/>
              <react_bootstrap_1.Button variant="info" className={item.w > item.h ? GamePrototype_module_css_1.default.rotateButtonW : GamePrototype_module_css_1.default.rotateButtonH} onClick={() => rotateRemove(item.i)}></react_bootstrap_1.Button>
            </div>);
        })}
      </ResponsiveGridLayout>
      {/* Settings and start button */}

      <div className={GamePrototype_module_css_1.default.gameSettings}>
        <react_bootstrap_1.Button className={GamePrototype_module_css_1.default.next} variant={shipSizes.length - 1 >= items.length ? "danger" : "success"} onClick={sendShips} style={{ fontSize: "100px" }} disabled={shipSizes.length - 1 >= items.length}>
          Start {(playersReady === null || playersReady === void 0 ? void 0 : playersReady.length) || 0}/2
        </react_bootstrap_1.Button>
        {vsAi && difficulty.current > -1 ? (<div className={GamePrototype_module_css_1.default.kiButtons}>
            <react_bootstrap_1.Button className={GamePrototype_module_css_1.default.ki1} onClick={() => swtichKiMode("ki1", kiDifficulties[0])} variant={kiMode == "ki1" ? "primary" : "warning"} disabled={kiMode == "ki1"}>
              Noob
            </react_bootstrap_1.Button>
            <react_bootstrap_1.Button className={GamePrototype_module_css_1.default.ki2} onClick={() => swtichKiMode("ki2", kiDifficulties[1])} variant={kiMode == "ki2" ? "primary" : "warning"} disabled={kiMode == "ki2"}>
              Human
            </react_bootstrap_1.Button>
            <react_bootstrap_1.Button className={GamePrototype_module_css_1.default.ki3} onClick={() => swtichKiMode("ki3", kiDifficulties[2])} variant={kiMode == "ki3" ? "primary" : "warning"} disabled={kiMode == "ki3"}>
              God Mode
            </react_bootstrap_1.Button>
          </div>) : null}
      </div>

      <div className={GamePrototype_module_css_1.default.Ships}>
        {/* <Button onClick={placeShipsRandomly} disabled={timerRunning}>
          Place Ships Randomly
        </Button> */}
        {/* Schiffs anzeige anhand des Größentags  */}
        {Object.keys(shipIds.current).map((key) => {
            let maxVal = maxS;
            let shipSize = smallShipSize;
            let newClass = GamePrototype_module_css_1.default.s;
            let newPic = _3_png_1.default;
            if (key === "s") {
                newPic = _2_png_1.default;
            }
            else if (key === "m") {
                maxVal = maxM;
                shipSize = mediumShipSize;
                newPic = _3_png_1.default;
                newClass = GamePrototype_module_css_1.default.m;
            }
            else if (key === "l") {
                maxVal = maxL;
                shipSize = largeShipSize;
                newPic = _4_png_1.default;
                newClass = GamePrototype_module_css_1.default.l;
            }
            else if (key === "xl") {
                maxVal = maxXL;
                shipSize = xlShipSize;
                newPic = _5_png_1.default;
                newClass = GamePrototype_module_css_1.default.xl;
            }
            // Erstelle ein div-Element für jeden Schlüssel
            return (<div key={key} className={newClass}>
              <a>
                {maxVal - shipIds.current[key] != 0
                    ? `${maxVal - shipIds.current[key]}  left`
                    : ""}
              </a>
              {maxVal - shipIds.current[key] === 0 ? null : (<div className={shipIds.current[key] < maxVal
                        ? GamePrototype_module_css_1.default.draggableItem
                        : GamePrototype_module_css_1.default.disabledItem} draggable={shipIds.current[key] < maxVal ? true : false} unselectable="on" onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", shipSize);
                        setDraggedItem(e.currentTarget); // Speichern Sie das aktuell gezogene Element
                    }} data-size={shipSize}>
                  <react_bootstrap_1.Image src={newPic} className={GamePrototype_module_css_1.default.normalPic2} draggable={shipIds.current[key] < maxVal ? true : false}/>
                </div>)}
            </div>);
        })}
      </div>
    </react_bootstrap_1.Container>);
}
//# sourceMappingURL=GamePrototype.js.map