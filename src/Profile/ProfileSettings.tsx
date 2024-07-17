import Header from "../components/Header/Header";
import { useEffect, useState } from "react";
import { UserResource } from "../Resources";
import { putUser } from "../backendAPI/userAPI";
import Pic from "../assets/pictures/profile_pic_placeholder.png";
import { useDispatch, useSelector } from "react-redux";
import styles from "./PageProfile.module.css";
import { setSkin, setUser } from "../components/reducer/TestReducer";
import { getSkinImage } from "../Resources";
import socket from "../components/Websocket/socketInstance";
import { Modal, Toast, ToastBody, ToastHeader } from "react-bootstrap";
/**
 *
 * Add: settings route for browser navigation
 */
export default function EditProfile() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.userReducer.user);
  const skin = useSelector((state: any) => state.userReducer.skin);
  const [modalText, setModalText] = useState<string>();
  const [modalTitle, setModalTitle] = useState<string>();
  const [modalBg, setModalBg] = useState<string>();

  const [showModal, setShowModal] = useState(false);

  const [userData, setUserData] = useState({
    email: user.email,
    password: user.password,
  });

  const [skinSetting, setSkinSetting] = useState<boolean>(false);
  const [skinKey, setSkinKey] = useState(skin);

  const [edit, setEdit] = useState<string>("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  }
  useEffect(() => {
    socket.emit("sendGiveMeMySkin", user.username);

    return () => {};
  }, []);

  async function updateUser() {
    await putUser({
      _id: user._id,
      email: user.email,
      password: user.password,
      username: user.username,
    });

    dispatch(
      setUser({
        email: userData.email,
        loggedIn: true,
      })
    );
  }

  function saveSkin(val: string) {
    dispatch(setSkin({ skin: val }));
    console.log(getSkinImage(skin));
  }
  useEffect(() => {
    // websocket connects to server
    // const newSocket: any = io(`${server}`);
    if (socket) {
      socket.on("changeSkinSuccesfully", () => {
        setModalText("Skin has been updated.");
        setModalTitle("Success!");
        setShowModal(true);
        setModalBg("success");
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      });

      socket.on("changeSkinFailed", () => {
        setModalText("Could not update skin.");
        setModalTitle("Error");
        setShowModal(true);
        setModalBg("danger");
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      });

      socket.on("giveSkin", (skin: string) => {
        setSkinKey(skin);
      });
    }
  });
  return (
    <>
      <Header />
      <div className={styles.profilePage}>
        <Toast
          show={showModal}
          animation={true}
          className="blur-background"
          style={{ zIndex: "20" }}
          // delay={3000}
          // autohide
          bg={modalBg}
          // onClose={() => setShowModal(false)}
        >
          <Toast.Header className={""}>{modalTitle}</Toast.Header>
          <Toast.Body>{modalText}</Toast.Body>
        </Toast>
        <div className={styles.profileDiv}>
          {!skinSetting ? (
            <>
              <img
                className={styles.settingsImg}
                src={Pic}
                onClick={() => (edit == "" ? setEdit("picClick") : setEdit(""))}
              />
              <br />
              {edit == "picClick" && (
                <button
                  className={styles.settingsButton}
                  onClick={() => setEdit("pic")}
                >
                  Change
                </button>
              )}
              {edit == "pic" && (
                <>
                  <input className={styles.inputField} type="file"></input>
                  <br />
                  <button className={styles.settingsButton}>Save</button>
                  <button
                    onClick={() => setEdit("")}
                    className={styles.logoutButton}
                  >
                    Cancel
                  </button>
                </>
              )}
              <hr />
              <button
                className={styles.settingsButton}
                onClick={() => setSkinSetting(true)}
              >
                Set ship skins
              </button>
              <hr />
              <label>
                <b>E-mail: </b>
                {user.email}
              </label>
              <br />
              {edit == "email" ? (
                <>
                  <input
                    className={styles.inputField}
                    type="email"
                    name="email"
                    placeholder="Change e-mail adress"
                    onChange={handleChange}
                  ></input>
                  <br />
                  <button
                    onClick={() => {
                      updateUser();
                      setEdit("");
                    }}
                    className={styles.settingsButton}
                  >
                    Save changes
                  </button>
                  <button
                    onClick={() => setEdit("")}
                    className={styles.logoutButton}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEdit("email")}
                  className={styles.settingsButton}
                >
                  Change e-mail address
                </button>
              )}
              <hr />
              {edit == "password" ? (
                <>
                  <input
                    className={styles.inputField}
                    type="password"
                    name="password"
                    placeholder="Old password"
                    onChange={handleChange}
                  ></input>
                  <br />
                  <input
                    className={styles.inputField}
                    type="password"
                    placeholder="New password"
                  ></input>
                  <br />
                  <input
                    className={styles.inputField}
                    type="password"
                    placeholder="Confirm new password"
                  ></input>
                  <br />
                  <button
                    onClick={() => {
                      updateUser();
                      setEdit("");
                    }}
                    className={styles.settingsButton}
                  >
                    Save changes
                  </button>
                  <button
                    onClick={() => setEdit("")}
                    className={styles.logoutButton}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEdit("password")}
                  className={styles.logoutButton}
                >
                  Change account password
                </button>
              )}
            </>
          ) : (
            <>
              <img src={getSkinImage(skinKey)} className={styles.skinImg} />
              {/* <img src="src/assets/pictures/Skins/Grün/3.png"/> */}
              <br />
              <label>Choose skin</label>
              <select
                className={styles.skinSelect}
                onChange={(e) => {
                  setSkinKey(e.target.value);
                  socket.emit("sendChangeSkin", user.username, e.target.value);

                  saveSkin(e.target.value);
                }}
                value={skinKey}
              >
                <option value="standard">Standard</option>
                <option value="green">Green</option>
                <option value="pink">Pink</option>
                <option value="turquoise">Turquoise</option>
                <option value="camouflage">Camouflage</option>
                <option value="cow">Cow</option>
                <option value="duck">Duck</option>
                <option value="dog">Dog</option>
                <option value="sausage">Sausage</option>
              </select>
              <br />
              <button
                className={styles.logoutButton}
                onClick={() => setSkinSetting(false)}
              >
                Back to settings
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
