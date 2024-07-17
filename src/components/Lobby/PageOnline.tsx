import { Button } from "react-bootstrap";
import Header from "../Header/Header";
import styles from "./PageOnline.module.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setHostName, setRoomId } from "../reducer/LobbyReducer";
import { generateRoomId } from "../../Resources";
export default function PageOnline() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let username = useSelector((state: any) => state.userReducer.username);
  function hostLobby() {
    let newRoomid = generateRoomId();
    console.log(newRoomid);
    dispatch(setHostName({ hostName: username }));
    dispatch(setRoomId({ roomId: newRoomid }));
    navigate("/onlineGameSettings");
  }

  return (
    <>
      <Header />
      <div className={styles.onlinePage}>
        <button className={styles.onlineButton} onClick={() => hostLobby()}>
          Host Game
        </button>
        <button
          className={styles.onlineButton}
          onClick={() => navigate("/lobby")}
        >
          Join Game
        </button>
      </div>
    </>
  );
}
