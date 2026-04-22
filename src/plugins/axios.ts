import axios from "axios";

export const api = axios.create({
  baseURL:
    "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/refs/heads/main",
  timeout: 30000,
  responseType: "json",
});

export default api;
