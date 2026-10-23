import { get, post, patch, deleted } from "../index";
import MemberRoutes from "./routes";

const MemberServices = {
  getMembers: async (workspaceId, params) => {
    const result = await get(MemberRoutes.getMembers(workspaceId), params);
    return result;
  },

  getInvitations: async (workspaceId, params) => {
    const result = await get(MemberRoutes.getInvitations(workspaceId), params);
    return result;
  },

  createInvitation: async (workspaceId, data) => {
    const result = await post(MemberRoutes.createInvitation(workspaceId), data);
    return result;
  },

  resendInvitation: async (workspaceId, invitationId, data) => {
    const result = await post(MemberRoutes.resendInvitation(workspaceId, invitationId), data);
    return result;
  },

  acceptInvitation: async (data) => {
    const result = await post(MemberRoutes.acceptInvitation(), data);
    return result;
  },

  deleteMember: async (workspaceId, id) => {
    const result = await deleted(MemberRoutes.deleteMember(workspaceId, id));
    return result;
  },

  revokeMember: async (workspaceId, invitationId) => {
    const result = await deleted(MemberRoutes.revokeMember(workspaceId, invitationId));
    return result;
  },
};

export default MemberServices;