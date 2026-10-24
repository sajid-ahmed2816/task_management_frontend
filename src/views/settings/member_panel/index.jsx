import { Fragment, useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Box, Button, Card, CircularProgress, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { DeleteOutlineRounded, Groups2Outlined, HourglassTopRounded, MailOutlineRounded, PersonAddAlt1Rounded, RefreshRounded, SearchRounded, ReplayRounded, CloseRounded } from "@mui/icons-material";
import MemberServices from "../../../api/members";
import toastify from "../../../components/toast";
import ConfirmationDialog from "../../../components/confirmation_dialog";

function MembersPanel({
  workspace,
  isOwner,
  section,
  setSection,
  setIsInviteDialogOpen,
  refreshKey = 0
}) {
  const workspaceId = workspace?._id;
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [memberToRemove, setMemberToRemove] = useState(null);

  useEffect(() => {
    if (!workspaceId) return;
    if (section === "invitations" && !isOwner) return;

    let active = true;
    setLoading(true);
    setError("");
    const request = section === "invitations"
      ? MemberServices.getInvitations(workspaceId)
      : MemberServices.getMembers(workspaceId);

    request
      .then((result) => {
        if (!active) return;
        if (!result?.status) throw new Error(result?.message || "Could not load workspace data.");
        const records = Array.isArray(result.data) ? result.data : [];
        if (section === "invitations") setInvitations(records);
        else setMembers(records);
      })
      .catch((requestError) => {
        if (active) setError(requestError?.message || "Could not load workspace data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [workspaceId, section, isOwner, refreshKey, reloadKey]);

  const records = section === "invitations" ? invitations : members;
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter((record) => {
      const name = record.user?.name || "";
      const email = record.email || record.user?.email || "";
      return `${name} ${email} ${record.status || ""} ${record.role || ""}`.toLowerCase().includes(query);
    });
  }, [records, search]);

  const resendInvitation = async (invitation) => {
    setActionId(invitation._id);
    try {
      await toastify(MemberServices.resendInvitation(workspaceId, invitation._id));
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      console.error(requestError);
    } finally {
      setActionId("");
    }
  };

  const revokeInvitation = async (invitation) => {
    setActionId(invitation._id);
    try {
      await toastify(MemberServices.revokeMember(workspaceId, invitation._id));
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      console.error(requestError);
    } finally {
      setActionId("");
    }
  };

  const removeMember = async () => {
    const memberId = memberToRemove?.user?._id;
    if (!workspaceId || !memberId) return;

    setActionId(memberToRemove._id);
    try {
      const result = await toastify(MemberServices.deleteMember(workspaceId, memberId));
      if (result?.status) {
        setMemberToRemove(null);
        setReloadKey((value) => value + 1);
      }
    } catch (requestError) {
      console.error(requestError);
    } finally {
      setActionId("");
    }
  };

  return (
    <Grid container spacing={2}>
      <ConfirmationDialog
        open={Boolean(memberToRemove)}
        handleClose={() => setMemberToRemove(null)}
        handleDelete={removeMember}
        title="Remove workspace member?"
        content={`Remove ${memberToRemove?.user?.name || memberToRemove?.user?.email || "this member"} from ${workspace?.name || "this workspace"}?`}
        description="They will lose access to this workspace's chats, projects, and tasks."
        isDeleting={Boolean(memberToRemove && actionId === memberToRemove._id)}
      />
      <Grid size={12}>
        <Card
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            border: "1px solid #e7edf0",
            borderRadius: 3,
            background: "linear-gradient(115deg, #f2faf9 0%, #ffffff 72%)"
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between"
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center"
              }}>
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 2.2,
                  bgcolor: "#e5f4f1",
                  color: "#168d86"
                }}
              >
                <Groups2Outlined />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 750,
                    color: "#233944",
                    fontSize: 16
                  }}
                >
                  Workspace members
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#84929a",
                    mt: 0.25
                  }}
                >
                  People with access to {workspace?.name || "this workspace"}.
                </Typography>
              </Box>
            </Stack>
            {isOwner && (
              <Button
                onClick={() => setIsInviteDialogOpen(true)}
                startIcon={<PersonAddAlt1Rounded />}
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#168d86",
                  boxShadow: "none",
                  borderRadius: 2.2,
                  px: 2,
                  "&:hover": {
                    bgcolor: "#107a74", boxShadow: "none"
                  }
                }}
              >
                Invite member
              </Button>
            )}
          </Stack>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e7edf0",
            borderRadius: 3,
            overflow: "hidden"
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 1.6,
              borderBottom: "1px solid #edf0f2",
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between"
            }}
          >
            <Stack direction="row" spacing={0.5}>
              <Button
                onClick={() => setSection("active")}
                startIcon={<Groups2Outlined sx={{ fontSize: 17 }} />}
                sx={{
                  textTransform: "none",
                  borderRadius: 1.7,
                  fontWeight: section === "active" ? 750 : 600,
                  color: section === "active" ? "#147e78" : "#839098",
                  bgcolor: section === "active" ? "#eaf6f4" : "transparent"
                }}
              >
                Active members
              </Button>
              {isOwner && (
                <Button
                  onClick={() => setSection("invitations")}
                  startIcon={<HourglassTopRounded sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 1.7,
                    fontWeight: section === "invitations" ? 750 : 600,
                    color: section === "invitations" ? "#147e78" : "#839098",
                    bgcolor: section === "invitations" ? "#eaf6f4" : "transparent"
                  }}
                >
                  Sent invitations
                </Button>
              )}
            </Stack>
            <Stack
              direction="row"
              spacing={1}
            >
              <TextField
                size="small"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={section === "invitations" ? "Search invitations" : "Search members"}
                inputProps={{
                  "aria-label": section === "invitations" ? "Search invitations" : "Search members"
                }}
                sx={{
                  width: { xs: "100%", sm: 250 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fafcfc",
                    fontSize: 13
                  }
                }}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">
                      <SearchRounded sx={{ fontSize: 18, color: "#97a3a9" }} />
                    </InputAdornment>
                  }
                }}
              />
              <IconButton
                aria-label="Refresh"
                onClick={() => setReloadKey((value) => value + 1)}
              >
                <RefreshRounded />
              </IconButton>
            </Stack>
          </Stack>

          <Box
            sx={{
              height: "calc(100vh - 371px",
              p: { xs: 1.5, sm: 2.5 },
              overflowY: "auto"
            }}
          >
            {loading && (
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  minHeight: 210
                }}
              >
                <CircularProgress size={28} sx={{ color: "#168d86" }} />
              </Box>
            )}
            {!loading && error && (
              <Alert severity="error">{error}</Alert>
            )}
            {!loading && !error && filteredRecords.length === 0 && (
              <Stack
                spacing={1}
                sx={{
                  minHeight: 210,
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center"
                }}
              >
                {section === "invitations" ?
                  <MailOutlineRounded sx={{ color: "#bd8b3e", fontSize: 30 }} /> :
                  <Groups2Outlined sx={{ color: "#4c928d", fontSize: 30 }} />
                }
                <Typography
                  sx={{
                    color: "#3b505a",
                    fontWeight: 750,
                    fontSize: 14
                  }}
                >
                  {search ?
                    "No matching results" :
                    section === "invitations" ?
                      "No invitations sent yet" :
                      "No active members yet"
                  }
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#8c999f",
                    maxWidth: 390,
                    lineHeight: 1.65
                  }}
                >
                  {section === "invitations" ?
                    "Invitations you send for this workspace will appear here with their current status." :
                    "Only active workspace members can access its chats, projects, and tasks."
                  }
                </Typography>
                {section === "active" && isOwner && (
                  <Button
                    onClick={() => setIsInviteDialogOpen(true)}
                    startIcon={<PersonAddAlt1Rounded />}
                    sx={{
                      mt: 0.3,
                      textTransform: "none",
                      color: "#168d86",
                      fontWeight: 750
                    }}
                  >
                    Invite someone to this workspace
                  </Button>
                )}
              </Stack>
            )}
            {!loading && !error && filteredRecords.length > 0 && (
              <Stack spacing={1}>
                {filteredRecords.map((record) => {
                  const isInvitation = section === "invitations";
                  const person = record.user;
                  const primary = isInvitation ? record.email : person?.name || person?.email || "Workspace member";
                  const secondary = isInvitation ? `Sent ${new Date(record.createdAt).toLocaleDateString()}` : person?.email || "";
                  return (
                    <Card
                      key={record._id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderColor: "#edf0f2",
                        borderRadius: 2.5
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center" }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: isInvitation ? "#fbf5e9" : "#eaf6f4",
                            color: isInvitation ? "#bd8b3e" : "#168d86",
                            width: 42,
                            height: 42
                          }}
                        >
                          {isInvitation ?
                            <MailOutlineRounded /> :
                            (person?.name || person?.email || "M").slice(0, 1).toUpperCase()
                          }
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            sx={{
                              color: "#233944",
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {primary}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#84929a" }}>
                            {secondary}
                          </Typography>
                        </Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center" }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: record.status === "Pending" ? "#bd8b3e" : "#71858c",
                              fontWeight: 700
                            }}
                          >
                            {isInvitation ? record.status : record.role}
                          </Typography>
                          {isInvitation && record.status === "Pending" && (
                            <Fragment>
                              <IconButton
                                aria-label="Resend invitation"
                                title="Resend invitation"
                                disabled={actionId === record._id}
                                onClick={() => resendInvitation(record)}
                                size="small"
                              >
                                <ReplayRounded fontSize="small" />
                              </IconButton>
                              <IconButton
                                aria-label="Revoke invitation"
                                title="Revoke invitation"
                                disabled={actionId === record._id}
                                onClick={() => revokeInvitation(record)}
                                size="small"
                              >
                                <CloseRounded fontSize="small" />
                              </IconButton>
                            </Fragment>
                          )}
                          {!isInvitation && isOwner && record.role !== "Owner" && (
                            <IconButton
                              aria-label="Remove member"
                              title="Remove member"
                              disabled={actionId === record._id}
                              onClick={() => setMemberToRemove(record)}
                              size="small"
                              color="error"
                            >
                              <DeleteOutlineRounded fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </Stack>
                      {isInvitation && record.expiresAt && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            ml: 7,
                            mt: 0.25,
                            color: "#9aa6aa"
                          }}
                        >
                          Expires {new Date(record.expiresAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

export default MembersPanel;
