const ProjectRoutes = {
  getProjects: "/projects/get",
  getProjectById: (id) => `/projects/${id}`,
  createProject: "/projects/add",
  updateProject: (id) => `/projects/update/${id}`,
  deleteProject: (id) => `/projects/delete/${id}`,
};

export default ProjectRoutes