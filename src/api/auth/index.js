import authRoutes from "./routes";
import { post } from "../index";

const AuthServices = {
  signUp: async (obj) => {
    const result = await post(authRoutes.signUp, obj);
    return result;
  },
  login: async (obj) => {
    const result = await post(authRoutes.login, obj);
    return result;
  },
  verifyOtp: async (obj) => {
    const result = await post(authRoutes.verifyOtp, obj);
    return result;
  },
  resendOtp: async (obj) => {
    const result = await post(authRoutes.resendOtp, obj);
    return result;
  },
};

export default AuthServices;