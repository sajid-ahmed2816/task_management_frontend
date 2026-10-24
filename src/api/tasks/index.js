import taskRoutes from "./routes";
import Axios from "../../config/axios/axios";
import { get, post, patch, deleted } from "../index";

const TaskServices = {
  getTasks: async (workspaceId, params) => {
    const result = await get(taskRoutes.getTasks(workspaceId), params);
    return result;
  },

  getTaskById: async (workspaceId, id) => {
    const result = await get(taskRoutes.getTaskById(workspaceId, id));
    return result;
  },

  createTask: async (workspaceId, data) => {
    const result = await post(taskRoutes.createTask(workspaceId), data);
    return result;
  },

  addSubTask: async (workspaceId, id, data) => {
    const result = await post(taskRoutes.addSubTask(workspaceId, id), data);
    return result;
  },

  updateTask: async (workspaceId, id, data) => {
    const result = await patch(taskRoutes.updateTask(workspaceId, id), data);
    return result;
  },

  updateSubTask: async (workspaceId, id, subTaskId, data) => {
    const result = await patch(taskRoutes.updateSubTask(workspaceId, id, subTaskId), data);
    return result;
  },

  deleteTask: async (workspaceId, id) => {
    const result = await deleted(taskRoutes.deleteTask(workspaceId, id));
    return result;
  },

  deleteSubTask: async (workspaceId, id, subTaskId) => {
    const result = await deleted(taskRoutes.deleteSubTask(workspaceId, id, subTaskId));
    return result;
  },

  addComment: async (workspaceId, id, data) => {
    const result = await post(taskRoutes.addComment(workspaceId, id), data);
    return result;
  },

  addAttachment: async (workspaceId, id, data) => {
    const result = await post(taskRoutes.addAttachment(workspaceId, id), data);
    return result;
  },

  deleteAttachment: async (workspaceId, id, attachmentId) => {
    const result = await deleted(taskRoutes.deleteAttachment(workspaceId, id, attachmentId));
    return result;
  },

  downloadAttachment: async (workspaceId, id, attachmentId) => {
    const result = await Axios.get(taskRoutes.downloadAttachment(workspaceId, id, attachmentId),
      { responseType: "blob" }
    );
    return result;
  },
};

export default TaskServices;