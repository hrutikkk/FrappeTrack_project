import axios from "axios";

<<<<<<< HEAD
// const API_BASE = "http://192.168.0.138";
const API_BASE = "http://192.168.0.32:8000";

=======
const API_BASE = "http://192.168.0.32:8000";
>>>>>>> 5f4aa97f011827599672d1459e31374f553ed050

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;