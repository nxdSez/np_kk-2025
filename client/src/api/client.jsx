// src/api/client.js
import axios from "axios";
import useNpStore from "../stores/nopporn-stores";

const api = axios.create({ baseURL: "/api" }); // ใช้ Vite proxy ไปที่ backend

api.interceptors.request.use((config) => {
  const { token, user } = useNpStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // dev โหมด (ถ้าไม่มี JWT แต่ต้องเทสต์):
  // if (!token && process.env.NODE_ENV !== "production" && user?.id) {
  //   config.headers["x-user-id"] = String(user.id);
  // }
  return config;
});

export default api;
