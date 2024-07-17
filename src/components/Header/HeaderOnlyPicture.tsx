import styles from "./Header.module.css";
import { Image, Navbar, NavDropdown } from "react-bootstrap";
import Home from "../../assets/pictures/cof_logo_vert.png";
import Pic from "../../assets/pictures/profile_pic_placeholder.png";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteLogin } from "../../backendAPI/loginAPI";
import { deleteUser } from "../reducer/TestReducer";
import { useNavigate } from "react-router-dom";
import { deleteLobby } from "../reducer/LobbyReducer";
import socket from "../Websocket/socketInstance";

export default function Header() {
  let loggedIn = useSelector((state: any) => state.userReducer.loggedIn);
  let roomId = useSelector((state: any) => state.lobbyReducer.roomId);
  let nick = useSelector((state: any) => state.userReducer.username);
  let guest = useSelector((state: any) => state.userReducer.guest);

  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await deleteLogin();
    dispatch(deleteUser());
    navigate("/");
  };

  function handleHome(): void {
    socket.emit("sendLeaveRoom", roomId);
    dispatch(deleteLobby());
    navigate("/");
  }

  function handleLogin(): void {
    dispatch(deleteUser());
    navigate("/");
  }

  return (
    <Navbar className="bg-body-tertiary" data-bs-theme="dark">
      <div className={styles.headerStack}>
        <div className={styles.logo}>
          <Image
            onClick={() => handleHome()}
            className={styles.homeImg}
            src={Home}
            width={"250px"}
          />
        </div>
        <div className={styles.profileContainer}>
          <NavDropdown
            title={
              <div>
              <Image
                className={styles.profileImg}
                src={Pic}
                roundedCircle
              />
              <a className={styles.nickname}>{nick}</a>
              </div>
            }
            id="nav-dropdown"
            align={"end"}
          >
            {!guest && (
              <NavDropdown.Item onClick={() => navigate("/profile")}>
                Profile settings
              </NavDropdown.Item>
            )}
            {soundOn ? (
              <NavDropdown.Item onClick={() => setSoundOn(false)}>
                Sound off
              </NavDropdown.Item>
            ) : (
              <NavDropdown.Item onClick={() => setSoundOn(true)}>
                Sound on
              </NavDropdown.Item>
            )}
            {musicOn ? (
              <NavDropdown.Item onClick={() => setMusicOn(false)}>
                Music off
              </NavDropdown.Item>
            ) : (
              <NavDropdown.Item onClick={() => setMusicOn(true)}>
                Music on
              </NavDropdown.Item>
            )}
            <NavDropdown.Divider />
            {guest ? (
              <NavDropdown.Item onClick={() => handleLogin()}>
                Login
              </NavDropdown.Item>
            ) : (
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            )}
          </NavDropdown>
        </div>
      </div>
    </Navbar>
  );
}
