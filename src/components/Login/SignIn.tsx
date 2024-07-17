import styles from "./SignIn.module.css";
import { useReducer, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Image,
  Card,
  Alert,
} from "react-bootstrap";
import { setUser } from "../reducer/TestReducer";
import Logo from "../../assets/pictures/cof_logo.png";
import { postLogin } from "../../backendAPI/loginAPI";
import { getUser } from "../../backendAPI/userAPI";
import { useNavigate } from "react-router-dom";
import { generateRoomId } from "../../Resources";

const server = process.env.REACT_APP_API_SERVER;
const SignIn = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const base64 = btoa(`${email}:${password}`);
  const navigate = useNavigate();
  let signInCounter = useSelector((state: any) => state.userReducer.signInCounter);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    console.log(typeof email, typeof password);
    const loginResponse = await postLogin(email, password);
    const getLoggedIn = await getUser(loginResponse.id);
    // if (getLoggedIn){
    console.log(getLoggedIn.email, " email");
    dispatch(
      setUser({
        email: getLoggedIn.email,
        loggedIn: true,
        username: getLoggedIn.username,
        guest: false
      })
    );
    // }
    // wenn login erfolgreich soll im redux store die entsprechenden daten gesetzt werden
    // aus login response sollte unsername noch ankommen
  };

  function handleGuest(): void {
    dispatch(
      setUser({
        email: email === ""? "guest"+generateRoomId() : email,
        loggedIn: true,
        username: email === ""? "guest"+generateRoomId() : email,
        guest: email === "" ? true : false

      })
    );
  }

  return (
    <Container className={styles.container}>
      <Container className={styles.imageContainer}>
        <Image className={styles.image} src={Logo} />
      </Container>

      <Container className={styles.signIn}>
        <Form className={styles.FormGroup}>
          <Form.Group className="mb-3">
            <Form.Control
              id="EmailInput"
              type="text"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              id="PasswordInput"
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="w-100"
            onClick={(e) => handleLogin(e)}
          >
            Sign In
          </Button>
          <hr />
          <div className="social-login text-center">
            <Button variant="outline-primary" className="me-2">
              Facebook
            </Button>
            <Button variant="outline-danger" className="me-2">
              Google
            </Button>
            <Button variant="outline-info" className="me-2">
              Twitter
            </Button>
          </div>
          <div className={styles.gastButton}>
            <Button
              onClick={() => handleGuest()}
              variant="info"
              className={styles.gastButton}
            >
              Als Gast fortfahren
            </Button>
          </div>
          <Alert variant="primary" className="text-center mt-3">
          Want to create an account? {"\n"}
          <Alert.Link onClick={() => navigate("/registration")}>Sign up</Alert.Link>
        </Alert>
        </Form>
      </Container>
    </Container>
  );
};

export default SignIn;
