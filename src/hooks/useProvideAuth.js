import { useState } from "react";

function useProvideAuth() {
  const [user, setUser] = useState(localStorage.getItem("user"));

  const userLogin = (user) => {
    localStorage.setItem("uuser", user);
    setUser(user);
  };

  return {
    user,
    userLogin
  };
};

export default useProvideAuth;