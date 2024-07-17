import styles from "./Winner.module.css";
import firework from "../../../assets/Gifs/firework.webp";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
export function Winner() {
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.main}>
        <div className={styles.firework}>
          <img src={firework}></img>
        </div>
        <div className={styles.texts}>
          <h1 className={styles.winText}>You won!</h1>
          <h3 className={styles.congrats}>Congratulations, Commander!</h3>
          <button onClick={() => navigate("/")} className={styles.backButton}>Main menu</button>
        </div>
      </div>
    </>
  );
}
