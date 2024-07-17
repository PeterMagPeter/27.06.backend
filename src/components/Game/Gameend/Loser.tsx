import styles from "./Loser.module.css";
import cat from "../../../assets/Gifs/sad_cat.webp";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
export function Loser() {
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.main}>
        <div className={styles.cat}>
          <img src={cat}></img>
        </div>
        <div className={styles.texts}>
          <h1 className={styles.loser}>Loser</h1>
          <h2 className={styles.subs}>What did you expect?</h2>
          <h3 className={styles.subs}>Embarassing...</h3>
          <br />
          <button onClick={() => navigate("/")} className={styles.backButton}>Be gone</button>
        </div>
      </div>
    </>
  );
}
