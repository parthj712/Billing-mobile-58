import axios from "axios";
import { getToken } from "../utils/storage";

const API = axios.create({
  baseURL: "https://billing-web-app-sdr9.onrender.com/api",
  timeout: 10000,
});

API.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    // console.log("TOKEN SENT:", token); // debug

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // config.headers.Authorization = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;