const ProjectRoutes = {
  getProjects: (workspaceId) => `/projects/${workspaceId}/get`,
  getProjectById: (workspaceId, id) => `/projects/${workspaceId}/${id}`,
  createProject: (workspaceId) => `/projects/${workspaceId}/add`,
  updateProject: (workspaceId, id) => `/projects/${workspaceId}/update/${id}`,
  deleteProject: (workspaceId, id) => `/projects/${workspaceId}/delete/${id}`,
};

export default ProjectRoutes