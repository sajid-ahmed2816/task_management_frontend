const taskRoutes = {
  getTasks: "/tasks/get",
  getTaskById: (id) => `/tasks/${id}`,
  createTask: "/tasks/add",
  addSubTask: (id) => `/tasks/${id}/subtasks`,
  updateTask: (id) => `/tasks/update/${id}`,
  updateSubTask: (id, subTaskId) => `/tasks/${id}/subtasks/${subTaskId}`,
  deleteTask: (id) => `/tasks/delete/${id}`,
  deleteSubTask: (id, subTaskId) => `/tasks/${id}/subtasks/${subTaskId}`,
  addComment: (id) => `/tasks/${id}/comments`,
  addAttachment: (id) => `/tasks/${id}/attachments`,
  deleteAttachment: (id, attachmentId) => `/tasks/${id}/attachments/${attachmentId}`,
  downloadAttachment: (id, attachmentId) => `/tasks/${id}/attachments/${attachmentId}/download`,
};

export default taskRoutes;