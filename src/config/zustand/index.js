import { create } from "zustand";

const useStore = create((set) => ({
  token: JSON.parse(localStorage.getItem("user"))?.token,
}));

export default useStore;