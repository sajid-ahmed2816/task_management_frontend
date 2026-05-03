import { useState } from "react";

function useProvideAuth() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const userLogin = (user) => {
    setUser(user);
    const data = JSON.stringify(user)
    localStorage.setItem("user", data);
  };

  const userLogout = (user) => {
    setUser(null);
    localStorage.clear();
  };

  return {
    user,
    userLogin,
    userLogout
  };
};

export default useProvideAuth;