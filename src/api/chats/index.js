import { get, post } from "../index";
import ChatRoutes from "./routes";

const ChatServices = {
  getUsers: async (workspaceId) => {
    const result = await get(ChatRoutes.getUsers(workspaceId));
    return result;
  },

  getLinks: async (workspaceId, params) => {
    const result = await get(ChatRoutes.getLinks(workspaceId), params);
    return result;
  },

  getConversations: async (workspaceId) => {
    const result = await get(ChatRoutes.getConversations(workspaceId));
    return result;
  },

  createConversation: async (workspaceId, data) => {
    const result = await post(ChatRoutes.createConversation(workspaceId), data);
    return result;
  },

  getMessages: async (workspaceId, conversationId, params) => {
    const result = await get(ChatRoutes.getMessages(workspaceId, conversationId), params);
    return result;
  },

  sendMessage: async (workspaceId, conversationId, data) => {
    const result = await post(ChatRoutes.sendMessage(workspaceId, conversationId), data)
    return result;
  },

  getLinkPreview: async (workspaceId, url) => {
    const result = await get(ChatRoutes.getLinkPreview(workspaceId), { url });
    return result;
  },
};

export default ChatServices;
