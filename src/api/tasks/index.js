import taskRoutes from "./routes";
import Axios from "../../config/axios/axios";
import { get, post, patch, deleted } from "../index";

const TaskServices = {
  getTasks: async (params) => {
    const result = await get(taskRoutes.getTasks, params);
    return result;
  },

  getTaskById: async (id) => {
    const result = await get(taskRoutes.getTaskById(id));
    return result;
  },

  createTask: async (data) => {
    const result = await post(taskRoutes.createTask, data);
    return result;
  },

  addSubTask: async (id, data) => {
    const result = await post(taskRoutes.addSubTask(id), data);
    return result;
  },

  updateTask: async (id, data) => {
    const result = await patch(taskRoutes.updateTask(id), data);
    return result;
  },

  updateSubTask: async (id, subTaskId, data) => {
    const result = await patch(taskRoutes.updateSubTask(id, subTaskId), data);
    return result;
  },

  deleteTask: async (id) => {
    const result = await deleted(taskRoutes.deleteTask(id));
    return result;
  },

  deleteSubTask: async (id, subTaskId) => {
    const result = await deleted(taskRoutes.deleteSubTask(id, subTaskId));
    return result;
  },

  addComment: async (id, data) => {
    const result = await post(taskRoutes.addComment(id), data);
    return result;
  },

  addAttachment: async (id, data) => {
    const result = await post(taskRoutes.addAttachment(id), data);
    return result;
  },

  deleteAttachment: async (id, attachmentId) => {
    const result = await deleted(taskRoutes.deleteAttachment(id, attachmentId));
    return result;
  },

  downloadAttachment: async (id, attachmentId) => {
    const result = await Axios.get(taskRoutes.downloadAttachment(id, attachmentId),
      { responseType: "blob" }
    );
    return result;
  },
};

export default TaskServices;