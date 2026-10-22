const taskRoutes = {
  getTasks: (workspaceId) => `/tasks/${workspaceId}/get`,
  getTaskById: (workspaceId, id) => `/tasks/${workspaceId}/${id}`,
  createTask: (workspaceId) => `/tasks/${workspaceId}/add`,
  addSubTask: (workspaceId, id) => `/tasks/${workspaceId}/${id}/subtasks`,
  updateTask: (workspaceId, id) => `/tasks/${workspaceId}/update/${id}`,
  updateSubTask: (workspaceId, id, subTaskId) => `/tasks/${workspaceId}/${id}/subtasks/${subTaskId}`,
  deleteTask: (workspaceId, id) => `/tasks/${workspaceId}/delete/${id}`,
  deleteSubTask: (workspaceId, id, subTaskId) => `/tasks/${workspaceId}/${id}/subtasks/${subTaskId}`,
  addComment: (workspaceId, id) => `/tasks/${workspaceId}/${id}/comments`,
  addAttachment: (workspaceId, id) => `/tasks/${workspaceId}/${id}/attachments`,
  deleteAttachment: (workspaceId, id, attachmentId) => `/tasks/${workspaceId}/${id}/attachments/${attachmentId}`,
  downloadAttachment: (workspaceId, id, attachmentId) => `/tasks/${workspaceId}/${id}/attachments/${attachmentId}/download`,
};

export default taskRoutes;