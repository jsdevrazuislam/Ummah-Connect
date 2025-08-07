import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/constants";
import { useStore } from "@/store/store";

export const SERVER_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const baseURL = `${SERVER_URL}/api/v1`;

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = Cookies.get(ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isTokenExpiringSoon() {
  const accessToken = Cookies.get(ACCESS_TOKEN);
  if (!accessToken)
    return true;

  try {
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = 30;

    return decodedToken.exp
      ? decodedToken.exp - currentTime < bufferTime
      : false;
  }
  catch (e) {
    console.log(e);
    return true;
  }
}

async function refreshAuthToken() {
  const refreshToken = Cookies.get(REFRESH_TOKEN);
  if (!refreshToken) {
    useStore.getState().logout();
    return;
  }

  try {
    const response = await axios.post(`${baseURL}/users/refreshToken`, {
      refreshToken,
    });
    const data = response?.data?.data;

    if (!data?.accessToken) {
      useStore.getState().logout();
    }

    Cookies.set(ACCESS_TOKEN, data.accessToken);
    Cookies.set(REFRESH_TOKEN, data.refreshToken);

    useStore.setState({
      user: data?.user,
      accessToken: data?.accessToken,
      refreshToken: data?.refreshToken,
    });

    api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
    return data.accessToken;
  }
  catch {
    useStore.getState().logout();
    throw new Error("Token refresh failed");
  }
}

api.interceptors.request.use(async (config) => {
  if (await isTokenExpiringSoon()) {
    try {
      const newToken = await refreshAuthToken();
      config.headers.Authorization = `Bearer ${newToken}`;
    }
    catch (error) {
      console.error("Failed to refresh token before request", error);
    }
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.data?.message === "jwt expired" || error.response?.data?.message === "jwt malformed") {
      try {
        const refreshToken = Cookies.get(REFRESH_TOKEN);
        if (!refreshToken) {
          useStore.getState().logout();
          return Promise.reject(error);
        }

        const { data } = await axios.post(`${baseURL}/users/refreshToken`, {
          refreshToken,
        });

        Cookies.set(ACCESS_TOKEN, data.accessToken, {
          secure: true,
          sameSite: "strict",
        });

        api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      }
      catch (refreshError) {
        useStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
api.interceptors.response.use(
  response => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    let customMessage = "An error occurred";
    if (status === 401) {
      customMessage = message;
    }
    else if (status === 403) {
      customMessage = message;
    }
    else if (status === 404) {
      customMessage = message;
    }
    else if (status >= 500) {
      customMessage = message;
    }
    else {
      customMessage = message;
    }

    return Promise.reject(new Error(customMessage));
  },
);
export default api;
