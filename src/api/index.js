import Axios from "../config/axios";
import { ErrorHandler } from "../utils/ErrorHandler";

export const get = async (endPoint, param) => {
  try {
    const result = await Axios.get(endPoint, { params: param });
    if (result.status == 200) return result.data;
    else throw result;
  } catch (error) {
    throw ErrorHandler(error);
  };
};

export const post = async (endPoint, data) => {
  try {
    const result = await Axios.post(endPoint, data);
    if (result.status == 200) return result.data;
    else throw result;
  } catch (error) {
    throw ErrorHandler(error);
  };
};

export const patch = async (endPoint, data) => {
  try {
    const result = await Axios.patch(endPoint, data);
    if (result.status == 200) return result.data;
    else throw result;
  } catch (error) {
    throw ErrorHandler(error);
  };
};

export const deleted = async (endPoint) => {
  try {
    const result = await Axios.delete(endPoint);
    if (result.status == 200) return result.data;
    else throw result;
  } catch (error) {
    throw ErrorHandler(error);
  };
};