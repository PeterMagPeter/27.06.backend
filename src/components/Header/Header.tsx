import styles from "./Header.module.css";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../ErrorFallback";
import {
  Image,
  Col,
  Container,
  Nav,
  NavDropdown,
  Navbar,
  Row,
  Stack,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import Home from "../../assets/pictures/cof_logo_vert.png";
import Pic from "../../assets/pictures/profile_pic_placeholder.png";
import { Button } from "react-bootstrap";
import { useState } from "react";
import { useSelector } from "react-redux";
import { deleteLogin } from "../../backendAPI/loginAPI";
import { useDispatch } from "react-redux";
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
  let pathname = window.location.pathname;
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

        <div className={styles.backText} onClick={handleHome}>
          <a> Go Back</a>
        </div>

        <div className={styles.profileContainer}>
          {!guest && (
            <div className={styles.imageContainer}>
              <Image
                onClick={() => navigate("/profile")}
                className={styles.profileImg}
                src={Pic}
              />
            </div>
          )}
          <div className={styles.headerDropdown}>
            <Nav>
              <NavDropdown title={loggedIn ? nick : "Menu"} align={"end"}>
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
                  <NavDropdown.Item
                    onClick={handleLogout}
                    style={{ backgroundColor: "darkred" }}
                  >
                    Logout
                  </NavDropdown.Item>
                )}
              </NavDropdown>
            </Nav>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
