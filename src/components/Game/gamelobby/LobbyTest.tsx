import styles from "./GameField.module.css";
import { useEffect, useState, useRef } from "react";
import { Button, Image, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logoPic from "../../../assets/pictures/cof_logo.png";
import { ShipTemplate } from "../../reducer/TestReducer";
import { setLobby, setRoomId } from "../../reducer/LobbyReducer";
import useWebSocket from "../../Websocket/useWebSocket";
import socket from "../../Websocket/socketInstance";
import smallShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/2.png";
import mediumShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/3.png";
import largeShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/4.png";
import xlargeShip from "../../../assets/pictures/Schiffe/StandardPNG/holes/5.png";
import smallShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/2r.png";
import mediumShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/3r.png";
import largeShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/4r.png";
import xlargeShipR from "../../../assets/pictures/Schiffe/StandardPNG/holes/5r.png";

const server = process.env.REACT_APP_API_SERVER_URL;
export default function LobbyTest() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let username = useSelector((state: any) => state.userReducer.username);
  let newRoomId = useRef<string>("");
//   const socket = useWebSocket();
  useEffect(() => {
    // websocket connects to server
    if (!socket) return;
    socket.on("startShipPlacement", () => {
      navigate("/shipplacement");
    });

    return () => {
    };
  }, [socket]);
  const joinLobby = () => {
    newRoomId.current = "cooleLobby";
    socket.emit("sendJoinRoom", newRoomId.current, username);
    console.log("join", newRoomId.current)
    dispatch(
      setRoomId({
        roomId: newRoomId.current,
      })
    );
  };

  return <Button onClick={joinLobby}> join lobby</Button>;
}
