import { get, post, patch, deleted } from "../index";
import ProjectRoutes from "./routes";

const ProjectServices = {
  getProjects: async (workspaceId, params) => {
    const result = await get(ProjectRoutes.getProjects(workspaceId), params);
    return result;
  },

  getProjectById: async (workspaceId, id) => {
    const result = await get(ProjectRoutes.getProjectById(workspaceId, id));
    return result;
  },

  createProject: async (workspaceId, data) => {
    const result = await post(ProjectRoutes.createProject(workspaceId), data);
    return result;
  },

  updateProject: async (workspaceId, id, data) => {
    const result = await patch(ProjectRoutes.updateProject(workspaceId, id), data);
    return result;
  },

  deleteProject: async (workspaceId, id) => {
    const result = await deleted(ProjectRoutes.deleteProject(workspaceId, id));
    return result;
  },
};

export default ProjectServices;