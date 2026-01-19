import axios from "axios";

// const API_BASE = "http://192.168.0.32:8000";
const API_BASE = "http://192.168.0.29:8000";
const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;