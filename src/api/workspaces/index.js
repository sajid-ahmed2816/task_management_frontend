import { get, post, patch, deleted } from "../index";
import WorkspaceRoutes from "./routes";

const WorkspaceServices = {
  getWorkspaces: async (params) => {
    const result = await get(WorkspaceRoutes.getWorkspaces, params);
    return result;
  },

  createWorkspace: async (data) => {
    const result = await post(WorkspaceRoutes.createWorkspace, data);
    return result;
  },

  updateWorkspace: async (id, data) => {
    const result = await patch(WorkspaceRoutes.updateWorkspace(id), data);
    return result;
  },

  deleteWorkspace: async (id) => {
    const result = await deleted(WorkspaceRoutes.deleteWorkspace(id));
    return result;
  },
};

export default WorkspaceServices;