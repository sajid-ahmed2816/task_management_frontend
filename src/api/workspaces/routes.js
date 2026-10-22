const WorkspaceRoutes = {
  getWorkspaces: "/workspaces/get",
  createWorkspace: "/workspaces/add",
  updateWorkspace: (id) => `/workspaces/update/${id}`,
  deleteWorkspace: (id) => `/workspaces/delete/${id}`,
};

export default WorkspaceRoutes