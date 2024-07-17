import styles from "./Timeout.module.css";
import { useNavigate } from "react-router-dom";
import { Button, Image } from "react-bootstrap";
export function Timeout() {
  const navigate = useNavigate();
  navigate("/");
  return (
    <>
      <div className={styles.main}>
        <div className={styles.texts}>
          <h1>Time is up!</h1>
          <br />
          <h3>Thank you for playing.</h3>
          <h4>Please fill out our survey.</h4>
        </div>
        <Button onClick={() => navigate("/")}>Go back</Button>
      </div>
    </>
  );
}
