import taskRoutes from "./routes";
import { get, post, patch, deleted } from "../index";

const TaskServices = {
  getTasks: async (params) => {
    const result = await get(taskRoutes.getTasks, params);
    return result;
  },

  createTask: async (data) => {
    const result = await post(taskRoutes.createTask, data);
    return result;
  },

  updateTask: async (id, data) => {
    const result = await patch(taskRoutes.updateTask(id), data);
    return result;
  },

  deleteTask: async (id) => {
    const result = await deleted(taskRoutes.deleteTask(id));
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
};

export default TaskServices;