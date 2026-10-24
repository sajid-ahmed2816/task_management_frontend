import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Avatar, Box, Button, Card, CircularProgress, Stack, Typography } from "@mui/material";
import { Groups2Rounded, MailOutlineRounded } from "@mui/icons-material";
import MemberServices from "../../api/members";
import useAuth from "../../hooks/useAuth";

const pendingInviteKey = "pendingWorkspaceInvitationToken";

function InvitationLanding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userLogout } = useAuth();
  const token = searchParams.get("token") || sessionStorage.getItem(pendingInviteKey) || "";
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("This invitation link is missing its token.");
      return;
    }

    sessionStorage.setItem(pendingInviteKey, token);
    if (searchParams.has("token")) {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.hash}`);
    }

    if (!user?.token) {
      setInvitation(null);
      setError("");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    MemberServices.previewInvitation(token)
      .then((result) => {
        if (!active) return;
        if (!result?.status || !result?.data) throw new Error(result?.message || "Invitation could not be loaded.");
        setInvitation(result.data);
      })
      .catch(() => {
        if (active) setError("Unable to open this link. Confirm the account you are using, or try again later.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token, user?.token]);

  const openInvitations = () => {
    const next = "/settings?tab=invitations";
    if (user?.token) {
      navigate(next, { replace: true });
      return;
    }

    const loginUrl = `/login?returnTo=${encodeURIComponent(next)}&inviteEmail=${encodeURIComponent(invitation?.email || "")}`;
    navigate(loginUrl, { replace: true });
  };

  const switchAccount = () => {
    userLogout();
    navigate(`/login?returnTo=${encodeURIComponent("/settings?tab=invitations")}`, { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, bgcolor: "#f3f7f7" }}>
      <Card elevation={0} sx={{ width: "100%", maxWidth: 520, p: { xs: 3, sm: 4 }, border: "1px solid #e4eceb", borderRadius: 4 }}>
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <Avatar sx={{ width: 58, height: 58, bgcolor: "#e5f4f1", color: "#168d86" }}>
            <MailOutlineRounded />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: "#19333e", fontWeight: 750 }}>
              {invitation ? "Workspace invitation" : "Continue to Flow"}
            </Typography>
            <Typography sx={{ mt: 0.7, color: "#7d8b91" }}>
                {invitation
                  ? "Review the invitation, then choose whether to accept it."
                  : "Sign in or create an account to continue."}
            </Typography>
          </Box>

          {loading && <CircularProgress size={28} sx={{ color: "#168d86" }} />}
          {!loading && error && (
            <Alert
              severity="warning"
              action={user?.token && <Button color="inherit" size="small" onClick={switchAccount}>Switch account</Button>}
              sx={{ width: "100%", textAlign: "left" }}
            >
              {error}
            </Alert>
          )}
          {!loading && invitation && (
            <Box sx={{ width: "100%", p: 2.2, borderRadius: 3, bgcolor: "#f5faf9", border: "1px solid #e4efed", textAlign: "left" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar variant="rounded" sx={{ bgcolor: "#168d86", borderRadius: 2 }}>
                  {invitation.workspace?.name?.slice(0, 1)?.toUpperCase() || <Groups2Rounded />}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 750, color: "#19333e" }}>{invitation.workspace?.name || "Workspace"}</Typography>
                  <Typography variant="body2" sx={{ color: "#798990" }}>
                    Invited email: {invitation.email}
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="body2" sx={{ mt: 1.8, color: "#60737a", lineHeight: 1.65 }}>
                {invitation.invitedBy?.name
                  ? `${invitation.invitedBy.name} invited you to collaborate in this workspace.`
                  : "You have been invited to collaborate in this workspace."}
              </Typography>
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            disabled={loading || (Boolean(user?.token) && !invitation)}
            onClick={openInvitations}
            sx={{ py: 1.2, borderRadius: 2.2, bgcolor: "#168d86", textTransform: "none", fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: "#107a74", boxShadow: "none" } }}
          >
            {user?.token ? "Continue to invitation" : "Sign in or create account"}
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}

export default InvitationLanding;
