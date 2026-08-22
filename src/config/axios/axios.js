import axios from "axios";

const baseUrl = "http://localhost:5174/api";

const instance = axios.create({
  baseURL: baseUrl
});

instance.interceptors.request.use((request) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const { token } = user || {};
  request.headers = {
    Accept: "application/json, text/plain, */*",
    Authorization: `Bearer ${token}`,
  };
  return request;
});

instance.interceptors.response.use((response) => {
  if (response) {
    return response;
  };
});

export default instance;