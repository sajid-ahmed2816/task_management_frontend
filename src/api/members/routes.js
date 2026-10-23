const MemberRoutes = {
  getMembers: (workspaceId) => `/workspace-members/${workspaceId}/members/get`,
  getInvitations: (workspaceId) => `/workspace-members/${workspaceId}/invitations/get`,
  createInvitation: (workspaceId) => `/workspace-members/${workspaceId}/invitations/invite`,
  resendInvitation: (workspaceId, invitationId) => `/workspace-members/${workspaceId}/${invitationId}/resend`,
  acceptInvitation: () => `/workspace-members/invitations/accept`,
  deleteMember: (workspaceId, id) => `/workspace-members/${workspaceId}/members/delete/${id}`,
  revokeMember: (workspaceId, invitationId) => `/workspace-members/${workspaceId}/invitations/revoke/${invitationId}`,
};

export default MemberRoutes;