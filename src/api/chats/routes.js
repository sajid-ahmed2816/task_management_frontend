const ChatRoutes = {
  getUsers: (workspaceId) => `/chats/${workspaceId}/users`,
  getLinks: (workspaceId) => `/chats/${workspaceId}/links`,
  getConversations: (workspaceId) => `/chats/${workspaceId}/conversations`,
  createConversation: (workspaceId) => `/chats/${workspaceId}/conversations`,
  getMessages: (workspaceId, conversationId) => `/chats/${workspaceId}/conversations/${conversationId}/messages`,
  sendMessage: (workspaceId, conversationId) => `/chats/${workspaceId}/conversations/${conversationId}/messages`,
  getLinkPreview: (workspaceId) => `/chats/${workspaceId}/link-preview`,
};

export default ChatRoutes;
