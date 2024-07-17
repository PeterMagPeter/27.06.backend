import styles from "./WaitForVerification.module.css";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/pictures/cof_logo.png"
import { Button } from "react-bootstrap";
export default function WaitForVerification() {
  const navigate = useNavigate();

  return (
    <div className={styles.verificationContainer}>
    <div className={styles.verificationImageContainer}>
      <img className={styles.verificationImage} src={Logo} />
    </div>
    <div className={styles.verificationTextContainer}>
      <h1 className={styles.verificationTitle}>Your registration was successful.</h1>
      <h3 className={styles.verificationText}>Please check your e-mail inbox to verify your account.</h3>
      <Button className={styles.verificationButton} onClick={()=>navigate("/")}>Login</Button>
    </div>
  </div>
    
  );
}
