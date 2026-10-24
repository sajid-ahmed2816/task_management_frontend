import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Avatar, Box, Button, Card, CircularProgress, Stack, Typography } from "@mui/material";
import { Groups2Rounded, MailOutlineRounded } from "@mui/icons-material";
import MemberServices from "../../../api/members";
import useAuth from "../../../hooks/useAuth";
import useStore from "../../../config/zustand";

const pendingInviteKey = "pendingWorkspaceInvitationToken";
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

function IncomingInvitations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userLogout } = useAuth();
  const { setWorkspace, refreshWorkspaces, refreshAllProjects } = useStore();
  const token = searchParams.get("inviteToken") || sessionStorage.getItem(pendingInviteKey) || "";
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  const emailMatches = useMemo(
    () => normalizeEmail(user?.email) === normalizeEmail(invitation?.email),
    [user?.email, invitation?.email]
  );

  useEffect(() => {
    if (!token) {
      setInvitation(null);
      setLoading(false);
      setError("");
      return;
    }

    sessionStorage.setItem(pendingInviteKey, token);
    let active = true;
    setLoading(true);
    setError("");
    MemberServices.previewInvitation(token)
      .then((result) => {
        if (!active) return;
        if (!result?.status || !result?.data) throw new Error(result?.message || "Invitation could not be loaded.");
        setInvitation(result.data);
      })
      .catch(() => {
        if (active) {
          setInvitation(null);
          setError("Unable to open this link. Confirm the account you are using, or check the link and try again.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  const accept = async () => {
    setAccepting(true);
    setError("");
    try {
      const result = await MemberServices.acceptInvitation({ token });
      if (!result?.status) throw new Error(result?.message || "Invitation could not be accepted.");

      sessionStorage.removeItem(pendingInviteKey);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("inviteToken");
      nextParams.delete("tab");
      setSearchParams(nextParams, { replace: true });
      setWorkspace({ _id: invitation.workspace.id, name: invitation.workspace.name, role: "Member" });
      refreshWorkspaces();
      refreshAllProjects();
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError?.message || "Invitation could not be accepted. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  const switchAccount = () => {
    const destination = "/settings?tab=invitations";
    const login = `/login?returnTo=${encodeURIComponent(destination)}&inviteEmail=${encodeURIComponent(invitation?.email || "")}`;
    sessionStorage.setItem(pendingInviteKey, token);
    userLogout();
    navigate(login, { replace: true });
  };

  return (
    <Stack spacing={2}>
      <Card elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, border: "1px solid #e7edf0", borderRadius: 3, background: "linear-gradient(115deg, #f2faf9 0%, #ffffff 72%)" }}>
        <Typography sx={{ color: "#233944", fontWeight: 750, fontSize: 16 }}>Invitations</Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: "#84929a" }}>
          Review workspace invitations sent to your account.
        </Typography>
      </Card>

      {loading && <Box sx={{ display: "grid", placeItems: "center", p: 6 }}><CircularProgress size={28} sx={{ color: "#168d86" }} /></Box>}
      {!loading && error && (
        <Alert
          severity="warning"
          action={user?.token && <Button color="inherit" size="small" onClick={switchAccount}>Switch account</Button>}
        >
          {error}
        </Alert>
      )}
      {!loading && !error && !invitation && (
        <Card elevation={0} sx={{ p: 4, border: "1px solid #e7edf0", borderRadius: 3, textAlign: "center" }}>
          <MailOutlineRounded sx={{ color: "#8b9ba1", fontSize: 30 }} />
          <Typography sx={{ mt: 1, color: "#3b505a", fontWeight: 700 }}>No invitation selected</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "#8c999f" }}>
            Open the invitation link from your email to review and accept it here.
          </Typography>
        </Card>
      )}
      {!loading && invitation && (
        <Card elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, border: "1px solid #e7edf0", borderRadius: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: "#e5f4f1", color: "#168d86", borderRadius: 2 }}>
                {invitation.workspace?.name?.slice(0, 1)?.toUpperCase() || <Groups2Rounded />}
              </Avatar>
              <Box>
                <Typography sx={{ color: "#233944", fontWeight: 750 }}>{invitation.workspace?.name || "Workspace"}</Typography>
                <Typography variant="body2" sx={{ color: "#84929a" }}>
                  {invitation.invitedBy?.name ? `Invited by ${invitation.invitedBy.name}` : "Workspace invitation"} · {invitation.email}
                </Typography>
                <Typography variant="caption" sx={{ color: "#9aa6aa" }}>
                  Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              disabled={!emailMatches || accepting}
              loading={accepting}
              onClick={accept}
              sx={{ flexShrink: 0, px: 2.5, py: 1.1, borderRadius: 2, bgcolor: "#168d86", textTransform: "none", fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: "#107a74", boxShadow: "none" } }}
            >
              Accept invitation
            </Button>
          </Stack>
          {!emailMatches && (
            <Alert
              severity="warning"
              action={<Button color="inherit" size="small" onClick={switchAccount}>Switch account</Button>}
              sx={{ mt: 2, alignItems: "center" }}
            >
              This invitation was sent to {invitation.email}. You are signed in as {user?.email || "another account"}.
            </Alert>
          )}
        </Card>
      )}
    </Stack>
  );
}

export default IncomingInvitations;
