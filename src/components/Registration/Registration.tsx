import { useState } from "react";
import { useDispatch } from "react-redux";
import styles from "./Registration.module.css";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert, Image } from "react-bootstrap";
import Logo from "../../assets/pictures/cof_logo.png";
import { postUser } from "../../backendAPI/userAPI";
import { UserResource } from "../../Resources";
import { setUser } from "../reducer/TestReducer";

export default function Registration() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailVerify, setEmailVerify] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);
  const [username, setUsername] = useState("");
  let newUser: UserResource | null;

  const handleRegisterButton = async (e: any) => {
    e.preventDefault();
    // erst wenn beides true ist wird die anfrage gesendet
    // leider nicht in real time hinbekommen
    if (email === emailVerify) {
      setEmailConfirmed(true);
      //return;
    } else setEmailConfirmed(true);
    if (password === passwordVerify) {
      setPasswordConfirmed(true);
      //return;
    } else setPasswordConfirmed(true);
    console.log(process.env.REACT_APP_API_SERVER_URL)
    newUser = await postUser({
      email: email,
      password: password,
      username: username,
    });

    navigate("/verification")
    
    console.log(newUser)
    // wenn passwort und email übereinstimmen soll der user angelegt werden
    // nachdem überprüft wurde ob der username schon existiert oder nicht
  };
  return (
    <Container className={styles.container}>
      <Container className={styles.LogoContainer}>
        <Image src={Logo} className={styles.Logo} />
      </Container>
      <Form className={styles.RegistrationForm}>
        <Form.Group className="mb-3">
          <Form.Control
            id="username"
            type="text"
            value={username}
            placeholder="Enter Username"
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </Form.Group>
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
            id="EmailVerify"
            className={emailConfirmed ? "" : styles.redBorder}
            type="text"
            value={emailVerify}
            placeholder="Email bestätigen"
            onChange={(e) => setEmailVerify(e.target.value)}
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
        <Form.Group className="mb-3">
          <Form.Control
            id="PasswordVerify"
            className={passwordConfirmed ? "" : styles.redBorder}
            type="password"
            value={passwordVerify}
            placeholder="Password bestätigen"
            onChange={(e) => setPasswordVerify(e.target.value)}
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          className="w-100"
          onClick={(e) => handleRegisterButton(e)}
        >
          Register
        </Button>
        <Alert variant="secondary" className="text-center mt-3">
          Already have an account? {"\n"}
          <Alert.Link onClick={() => navigate("/")}>Sign in</Alert.Link>
        </Alert>
      </Form>
    </Container>
  );
}
