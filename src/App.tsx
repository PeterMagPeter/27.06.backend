import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/ErrorFallback";
import { useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignIn from "./components/Login/SignIn";
import PageProfile from "./Profile/PageProfile";
import PageMain from "./components/MainPage/PageMain";
import Registration from "./components/Registration/Registration";
import { Winner } from "./components/Game/Gameend/Winner";
import { Loser } from "./components/Game/Gameend/Loser";
import { Timeout } from "./components/Game/Gameend/Timeout";
import PageLobby from "./components/Lobby/PageLobby";
import PageOnline from "./components/Lobby/PageOnline";
import GameSettings from "./components/Lobby/GameSettings";
import TestSound from "./components/Game/Gamefield/soundtest";
import TeamGamePrototype from "./components/Game/Ship Placement/TeamGamePrototype";
import TeamGameField from "./components/Game/Gamefield/TeamGameField";
import socket from "./components/Websocket/socketInstance";
import MinePlacement from "./components/Game/Ship Placement/MinePlacement";
import WaitForVerification from "./components/Login/WaitForVerfication";
function App() {
  const loggedIn = useSelector((state: any) => state.userReducer.loggedIn);
  const username = useSelector((state: any) => state.userReducer.username);
  const roomId = useSelector((state: any) => state.lobbyReducer.roomId);

  window.addEventListener("beforeunload", (event) => {
    socket.emit("sendCustomDisconnect", roomId, username, {
      reason: "Tab closed or page unloaded",
    });

    // Optional: Warte kurz, um sicherzustellen, dass das Ereignis gesendet wird
    // Hinweis: Dies kann nicht garantiert werden, da das Schließen des Tabs den Prozess abrupt beenden kann
    socket.disconnect();
  });
  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Router>
          <Routes>
            {loggedIn ? (
              <>
                <Route path="/" element={<PageMain />} />
                <Route path="/shipplacement" element={<TeamGamePrototype />} />
                <Route path="/mineplacement" element={<MinePlacement />} />
                <Route path="/game" element={<TeamGameField />} />
                <Route path="/online" element={<PageOnline />} />
                <Route path="/onlineGameSettings" element={<GameSettings />} />
                <Route path="/lobby" element={<PageLobby />} />
                <Route path="/profile" element={<PageProfile />} />
                <Route path="/timeout" element={<Timeout />} />
                <Route path="/win" element={<Winner />} />
                <Route path="/loose" element={<Loser />} />
                <Route path="/test" element={<MinePlacement />} />
                <Route path="*" element={<Navigate to="/" />} />
                <Route path="/verification" element={<WaitForVerification/>} />
              </>
            ) : (
              <>
                <Route path="/testGame" element={<TeamGameField />} />
                <Route path="/sound" element={<TestSound />} />
                <Route path="/" element={<SignIn />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="*" element={<Navigate to="/" />} />
                <Route path="/test" element={<MinePlacement />} />
                <Route path="/verification" element={<WaitForVerification/>} />


              </>
            )}
          </Routes>
        </Router>
      </ErrorBoundary>
    </>
  );
}

export default App;
