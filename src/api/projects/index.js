import { get, post, patch, deleted } from "../index";
import ProjectRoutes from "./routes";

const ProjectServices = {
  getProjects: async (params) => {
    const result = await get(ProjectRoutes.getProjects, params);
    return result;
  },

  getProjectById: async (id) => {
    const result = await get(ProjectRoutes.getProjectById(id));
    return result;
  },

  createProject: async (data) => {
    const result = await post(ProjectRoutes.createProject, data);
    return result;
  },

  updateProject: async (id, data) => {
    const result = await patch(ProjectRoutes.updateProject(id), data);
    return result;
  },

  deleteProject: async (id) => {
    const result = await deleted(ProjectRoutes.deleteProject(id));
    return result;
  },
};

export default ProjectServices;