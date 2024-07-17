import { RegisterResource, UserResource } from "../Resources";

export async function getAllUsers(): Promise<UserResource> {
  const url = `${process.env.REACT_APP_API_SERVER_URL}/api/user/all`;
  const request = { credentials: "include" as RequestCredentials };
  const response = await fetch(url, request);
  return await response.json();
}

export async function getUser(userId: string): Promise<UserResource> {
  const url = `${process.env.REACT_APP_API_SERVER_URL}/api/user/${userId}`;
  const request = { credentials: "include" as RequestCredentials };
  const response = await fetch(url, request);
  return await response.json();
}

export async function postUser(user: RegisterResource): Promise<UserResource> {
  const url = `${process.env.REACT_APP_API_SERVER_URL}/api/user`;
  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include" as RequestCredentials,
    body: JSON.stringify({ ...user }),
  };
  const response = await fetch(url, request);
  return await response.json();
}

export async function putUser(user: UserResource): Promise<UserResource> {
  const url = `${process.env.REACT_APP_API_SERVER_URL}/api/user/${user._id}`;
  const request = {
    method: "PUT",
    headers: {
      "Content Type": "application/json",
    },
    credentials: "include" as RequestCredentials,
    body: JSON.stringify({ ...user }),
  };
  const response = await fetch(url, request);
  return await response.json();
}

export async function deleteUser(userId: string) {
  const url = `${process.env.REACT_APP_API_SERVER_URL}/api/user/${userId}`;
  const request = {
    method: "DELETE",
    headers: {
      "Content Type": "application/json",
    },
    credentials: "include" as RequestCredentials,
  };
  await fetch(url, request);
}
