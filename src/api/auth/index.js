import authRoutes from "./routes";
import { get, patch, post } from "../index";

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
  getProfile: async () => {
    const result = await get(authRoutes.profile);
    return result;
  },
  updateProfile: async (data) => {
    const result = await patch(authRoutes.profile, data);
    return result;
  },
  requestPasswordChangeOtp: async () => {
    const result = await post(authRoutes.requestPasswordChangeOtp);
    return result;
  },
  verifyPasswordChangeOtp: async (data) => {
    const result = await post(authRoutes.verifyPasswordChangeOtp, data);
    return result;
  },
};

export default AuthServices;
