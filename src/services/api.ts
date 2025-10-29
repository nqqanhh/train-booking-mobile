import axios from "axios";
const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://train-booking-backend-93io.onrender.com";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token?: string) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};
