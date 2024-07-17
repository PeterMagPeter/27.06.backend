// useWebSocket.ts

import { useEffect, useState } from "react";
import io from "socket.io-client";

const server = process.env.REACT_APP_API_SERVER_URL;

const useWebSocket = () => {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket: any = io(`${server}`);
    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};

export default useWebSocket;
