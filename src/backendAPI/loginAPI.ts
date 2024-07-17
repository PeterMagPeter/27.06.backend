import { LoginResource } from "../Resources";
export async function postLogin(
  email: string,
  password: string
): Promise<LoginResource> {
  const url = `${process.env.REACT_APP_API_SERVER_URL}/api/login`;
  console.log("email: " + email+ "pw: "+password)
  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include" as RequestCredentials,
    body: JSON.stringify({
      email: email,
      password: password
    }),
  };
  const response = await fetch(url, request);
  return await response.json();
}

export async function getLogin(): Promise<LoginResource | false> {
  const url = `${process.env.REACT_APP_API_SERVER_URL}/api/login`;
  const request = { credentials: "include" as RequestCredentials };
  const response = await fetch(url, request);
  return await response.json();
}

export async function deleteLogin() {
  const url = `${process.env.REACT_APP_API_SERVER_URL}/api/login`;
  const request = {
    methode: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include" as RequestCredentials,
  };
  await fetch(url, request);
}
