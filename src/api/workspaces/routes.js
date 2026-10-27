const WorkspaceRoutes = {
  getWorkspaces: "/workspaces/get",
  getDashboard: (workspaceId) => `/workspaces/${workspaceId}/dashboard`,
  createWorkspace: "/workspaces/add",
  updateWorkspace: (id) => `/workspaces/update/${id}`,
  deleteWorkspace: (id) => `/workspaces/delete/${id}`,
};

export default WorkspaceRoutes
