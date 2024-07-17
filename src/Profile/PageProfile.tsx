import { Card, Col, Container, Row } from "react-bootstrap";
import Pic from "../assets/pictures/profile_pic_placeholder.png";
import Header from "../components/Header/Header";
import { Button } from "react-bootstrap";
import { useState } from "react";
import { useSelector } from "react-redux";
import EditProfile from "./ProfileSettings";
import { deleteLogin } from "../backendAPI/loginAPI";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "../components/reducer/TestReducer";
import styles from "./PageProfile.module.css";
import { UserResource } from "../Resources";

export default function PageProfile() {
  // let nick: string = "Peter";
  let lvl: number = 1;
  let points: number = useSelector((state: any) => state.userReducer.points);
  const nick = useSelector((state: any) => state.userReducer.username);
  const user: UserResource = useSelector((state: any) => state.userReducer.user);

  const [edit, setEdit] = useState<boolean>(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await deleteLogin();
    dispatch(deleteUser());
    navigate("/");
  };

  if (edit) {
    return (
      <>
        <EditProfile />
      </>
    );
  } else {
    return (
      <>
        <Header />
        <div className={styles.profilePage}>
          <div className={styles.profileDiv}>
            <Row>
              <Col>
                <img src={Pic} className={styles.profileImg} />
              </Col>
              <Col>
                <h4 className={styles.profileText}>{nick}</h4>
                <h4 className={styles.profileText}>Level {user.level}</h4>
                <h4 className={styles.profileText}>{user.points} XP</h4>
              </Col>
            </Row>
            <hr />
            <button
              className={styles.settingsButton}
              onClick={() => setEdit(true)}
            >
              Settings
            </button>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </>
    );
  }
}
