import { useEffect, useState } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import Header from "../Header/Header";
import styles from "./PageMain.module.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAiDifficulty, setLobby } from "../reducer/LobbyReducer";
import {
  LeaderboardRessource,
  UserResource,
  generateRoomId,
} from "../../Resources";
import socket from "../Websocket/socketInstance";
import { setSkin, setUserObject } from "../reducer/TestReducer";
export default function PageMain() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let username = useSelector((state: any) => state.userReducer.username);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRessource[]>();
  const [ownRank, setOwnRank] = useState<number>(-1);

  const playAgainstAi = () => {
    dispatch(
      setAiDifficulty({
        vsAi: true,
        aiDifficulty: 0.5,
      })
    );
    let roomID = generateRoomId();
    dispatch(
      // private ki lobby
      setLobby({
        roomId: roomID,
        gameMode: "1vs1",
        maxPlayers: 1,
        privateMatch: true,
        hostName: username,
        superWeapons: false,
      })
    );
    socket.emit("sendJoinRoom", roomID, username);
    // oder noch lobby davor?
    navigate("/shipplacement");
    // navigate("/mineplacement");
  };
  const playOnline = () => {
    // make sure that ai states are false
    dispatch(
      setAiDifficulty({
        vsAi: false,
        aiDifficulty: -1,
      })
    );
    // to martyna's code
    navigate("/online");
  };
  useEffect(() => {
    socket.emit("sendGiveMeMySkin", username);
    socket.emit("sendGetUser", username);
    socket.emit("sendGetLeaderboard");

    return () => {};
  }, []);
  useEffect(() => {
    // websocket connects to server
    // const newSocket: any = io(`${server}`);
    if (socket) {
      socket.on("giveSkin", (skin: string) => {
        dispatch(setSkin({ skin: skin }));
      });
      socket.on("getLeaderboard", (leaderBoard2: LeaderboardRessource[]) => {
        console.log(leaderBoard2);
        setLeaderboard(leaderBoard2);
        let me = leaderBoard2.find((user) => user.username === username)?.rank;
        setOwnRank(me ? me : -999);
      });
      socket.on("getUser", (user: UserResource) => {
        dispatch(setUserObject({ user: user }));
        console.log(user)
        dispatch(setSkin({ skin: user.skin }));
      });
    }
  });
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.mainPage}>
        <Container className={styles.mainContent}>
          <Row className="justify-content-center align-items-center h-100">
            <Col md={6} className="text-center">
              <Container className={`d-grid gap-2 ${styles.buttonsContainer}`}>
                <button
                  onClick={() => playAgainstAi()}
                  className={styles.customButton}
                >
                  Offline-Modus
                </button>
                <button
                  className={styles.customButton}
                  onClick={() => playOnline()}
                >
                  Online-Modus
                </button>
              </Container>
            </Col>
            <Col md={4} className="d-flex flex-column align-items-center">
              <div className={styles.ranking}>
                <h2>Global</h2>
                <h4>Leaderboard</h4>
                <p>#{ownRank}</p>
                <p>Ranking 248</p>
                <table className={styles.rankingTable}>
                  <thead>
                    <tr>
                      <th>rank</th>
                      <th>username</th>
                      <th>country</th>
                      <th>level</th>
                      <th>points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard?.slice(0, 10).map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.rank}</td>
                        <td>{entry.username}</td>
                        <td>{entry.country}</td>
                        <td>{entry.level}</td>
                        <td>{entry.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
