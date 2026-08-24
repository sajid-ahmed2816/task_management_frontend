const taskRoutes = {
  getTasks: "/tasks/get",
  createTask: "/tasks/add",
  updateTask: (id) => `/tasks/update/${id}`,
  deleteTask: (id) => `/tasks/delete/${id}`,
  addComment: (id) => `/tasks/${id}/comments`,
  addAttachment: (id) => `/tasks/${id}/attachments`,
};

export default taskRoutes;