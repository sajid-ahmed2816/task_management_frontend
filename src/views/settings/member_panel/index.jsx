import { Box, Button, Card, Grid, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { Groups2Outlined, HourglassTopRounded, MailOutlineRounded, PersonAddAlt1Rounded, SearchRounded } from "@mui/icons-material";

function MembersPanel({
  isOwner,
  section,
  setSection,
  setIsInviteDialogOpen,
  workspaceName
}) {
  return (
    <Grid container spacing={2}>
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
              spacing={1.5} alignItems="center">
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
                  sx={{ color: "#84929a", mt: .25 }}
                >
                  People with access to {workspaceName}.
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
                    bgcolor: "#107a74",
                    boxShadow: "none"
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
            <Stack direction="row" spacing={.5}>
              <Button
                onClick={() => setSection("active")}
                sx={{
                  textTransform: "none",
                  borderRadius: 1.7,
                  fontWeight: section === "active" ? 750 : 600,
                  color: section === "active" ? "#147e78" : "#839098",
                  bgcolor: section === "active" ? "#eaf6f4" : "transparent",
                  "&:hover": {
                    bgcolor: section === "active" ? "#eaf6f4" : "#f6f8f9"
                  }
                }}
              >
                Active members
              </Button>
              {isOwner &&
                <Button
                  onClick={() => setSection("invitations")}
                  startIcon={<HourglassTopRounded sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 1.7,
                    fontWeight: section === "invitations" ? 750 : 600,
                    color: section === "invitations" ? "#147e78" : "#839098",
                    bgcolor: section === "invitations" ? "#eaf6f4" : "transparent",
                    "&:hover": {
                      bgcolor: section === "invitations" ? "#eaf6f4" : "#f6f8f9"
                    }
                  }}
                >
                  Invitations
                </Button>
              }
            </Stack>
            <TextField
              size="small"
              placeholder={section === "invitations" ? "Search invitations" : "Search members"}
              inputProps={{ "aria-label": section === "invitations" ? "Search invitations" : "Search members" }}
              sx={{
                width: { xs: "100%", sm: 250 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#fafcfc",
                  borderRadius: 2,
                  fontSize: 13
                },
                "& fieldset": {
                  borderColor: "#edf0f2"
                }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ fontSize: 18, color: "#97a3a9" }} />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Stack>

          <Box
            sx={{
              height: "calc(100vh - 366px)",
              display: "grid",
              placeItems: "center",
              p: 3
            }}
          >
            <Stack
              spacing={1.1}
              sx={{
                textAlign: "center",
                maxWidth: 360,
                alignItems: "center"
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 50,
                  height: 50,
                  borderRadius: 2.5,
                  bgcolor: section === "invitations" ? "#fbf5e9" : "#edf6f5",
                  color: section === "invitations" ? "#bd8b3e" : "#4c928d"
                }}
              >
                {section === "invitations" ? <MailOutlineRounded /> : <Groups2Outlined />}
              </Box>
              <Typography
                sx={{
                  color: "#3b505a",
                  fontWeight: 750,
                  fontSize: 14
                }}
              >
                {section === "invitations" ?
                  "No pending invitations" :
                  "Your active members will appear here"
                }
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#8c999f",
                  lineHeight: 1.65
                }}
              >
                {section === "invitations"
                  ? "Invites stay pending until the recipient signs in or registers and accepts. Resend or revoke pending invitations here; pending users cannot access workspace chats or tasks."
                  : "Only people who have accepted an invitation are active members and can access this workspace."}
              </Typography>
              {section === "active" && isOwner && (
                <Button
                  onClick={() => setIsInviteDialogOpen(true)}
                  startIcon={<PersonAddAlt1Rounded />}
                  sx={{
                    mt: .3,
                    textTransform: "none",
                    color: "#168d86",
                    fontWeight: 750
                  }}
                >
                  Invite someone to this workspace
                </Button>
              )}
            </Stack>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MembersPanel;