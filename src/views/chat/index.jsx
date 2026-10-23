import { useMemo, useState } from "react";
import {
  AddRounded,
  ArrowUpwardRounded,
  ChatBubbleOutlineRounded,
  ChevronRightRounded,
  Groups2Outlined,
  InsertLinkRounded,
  LinkOutlined,
  SearchRounded,
  SettingsOutlined,
  TagRounded,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useStore from "../../config/zustand";

const paneBorder = "1px solid #e8edf0";

function Chat() {
  const [activeTab, setActiveTab] = useState("messages");
  const [search, setSearch] = useState("");
  const { workspace } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const workspaceName = workspace?.name || "No workspace selected";
  const userInitial = useMemo(() => user?.name?.trim()?.charAt(0)?.toUpperCase() || "Y", [user?.name]);

  return (
    <Box
      sx={{ maxWidth: 1440, mx: "auto", minWidth: 0 }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          mb: 2.5,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" }
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{
              color: "#172b3a",
              fontSize: 24,
              fontWeight: 600
            }}
          >
            Messages
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            border: paneBorder,
            borderRadius: 2.5,
            px: 1.1,
            py: .75,
            bgcolor: "#fff",
            maxWidth: "100%",
            alignItems: "center"
          }}
        >
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 27,
              height: 27,
              borderRadius: 1.3,
              bgcolor: "#eaf5f4",
              color: "#168d86"
            }}
          >
            <Groups2Outlined sx={{ fontSize: 17 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#8a979e",
                display: "block",
                lineHeight: 1.1
              }}
            >
              Current workspace
            </Typography>
            <Typography
              noWrap
              variant="body2"
              sx={{
                maxWidth: 220,
                color: "#30444e",
                fontWeight: 700
              }}
            >
              {workspaceName}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Card
        elevation={0}
        sx={{
          height: "calc(100vh - 114px)",
          minHeight: { xs: 680, md: 550 },
          maxHeight: { xs: "none", md: 900 },
          border: paneBorder,
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          bgcolor: "#fff"
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: 320 },
            minHeight: { xs: 265, md: 0 },
            flexShrink: 0,
            borderRight: { xs: 0, md: paneBorder },
            borderBottom: { xs: paneBorder, md: 0 },
            display: "flex",
            flexDirection: "column",
            minWidth: 0
          }}
        >
          <Stack
            direction="row"
            sx={{
              px: 2,
              py: 2,
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 750,
                  color: "#203640",
                  fontSize: 15
                }}
              >
                Your inbox
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#94a0a6" }}
              >
                Only active workspace members
              </Typography>
            </Box>
            <Tooltip
              title="Start a conversation"
            >
              <span>
                <IconButton
                  disabled={!workspace?._id}
                  sx={{
                    color: "#168d86",
                    bgcolor: "#edf7f6",
                    "&:hover": {
                      bgcolor: "#dff1ef"
                    }
                  }}
                >
                  <AddRounded />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <Box sx={{ px: 1.5, pb: 1.5 }}>
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
              size="small"
              placeholder="Search people or messages"
              inputProps={{ "aria-label": "Search people or messages" }}
              slotProps={{
                input: {
                  startAdornment:
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: "#97a3a9", fontSize: 19 }} />
                    </InputAdornment>
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#f8fafb",
                  borderRadius: 2.2, fontSize: 13
                },
                "& fieldset": {
                  borderColor: "#edf0f2"
                }
              }}
            />
          </Box>

          <Stack direction="row" spacing={.5} sx={{ px: 1.5, pb: 1.5 }}>
            {[{
              key: "messages",
              label: "Messages",
              icon: <ChatBubbleOutlineRounded sx={{ fontSize: 16 }} />
            }, {
              key: "links",
              label: "Links",
              icon: <LinkOutlined sx={{ fontSize: 17 }} />
            }].map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                startIcon={tab.icon}
                sx={{
                  px: 1.2,
                  py: .7,
                  minWidth: 0,
                  borderRadius: 1.8,
                  textTransform: "none",
                  fontWeight: activeTab === tab.key ? 750 : 600,
                  fontSize: 12.5,
                  color: activeTab === tab.key ? "#147e78" : "#839098",
                  bgcolor: activeTab === tab.key ? "#eaf6f4" : "transparent",
                  "&:hover": {
                    bgcolor: activeTab === tab.key ? "#eaf6f4" : "#f6f8f9"
                  }
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>

          <Divider sx={{ borderColor: "#edf0f2" }} />

          <Box
            sx={{
              flex: 1,
              display: "grid",
              placeItems: "center",
              p: 3
            }}
          >
            <Stack
              spacing={1.1}
              sx={{
                maxWidth: 230,
                textAlign: "center",
                alignItems: "center"
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 46,
                  height: 46,
                  borderRadius:
                    2.5, bgcolor: "#f2f7f7", color: "#89aaa7"
                }}
              >
                {activeTab === "links" ? <InsertLinkRounded /> : <ChatBubbleOutlineRounded />}
              </Box>
              <Typography
                sx={{
                  color: "#40535d",
                  fontWeight: 750,
                  fontSize: 13.5
                }}
              >
                {activeTab === "links" ?
                  "No shared links yet" :
                  "Your conversations will show here"
                }
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#95a1a8", lineHeight: 1.6 }}
              >
                {activeTab === "links" ?
                  "Links shared in workspace chats will be collected here." :
                  "Start a chat with someone who is an active member of this workspace."
                }
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: "#edf0f2" }} />
          <Stack
            direction="row"
            spacing={1.2}
            sx={{
              p: 1.7,
              alignItems: "center"
            }}
          >
            <Avatar
              src={user?.profile_picture || undefined}
              sx={{
                width: 34,
                height: 34,
                bgcolor: "#dff1ef",
                color: "#287d77",
                fontSize: 13,
                fontWeight: 800
              }}
            >
              {userInitial}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                noWrap
                variant="body2"
                sx={{
                  color: "#354952",
                  fontWeight: 700,
                  fontSize: 12.5
                }}
              >
                {user?.name || "You"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#96a1a6" }}
              >
                Your account
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: { xs: 415, md: 0 },
            display: "flex",
            flexDirection: "column",
            bgcolor: "#fcfdfd",
            position: "relative"
          }}
        >
          <Stack
            direction="row"
            spacing={1.3}
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 1.8,
              borderBottom: paneBorder,
              bgcolor: "#fff",
              alignItems: "center"
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.8,
                bgcolor: "#eff5f5",
                color: "#91aaa9"
              }}
            >
              <Groups2Outlined sx={{ fontSize: 20 }} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  color: "#2d424c",
                  fontWeight: 750,
                  fontSize: 14
                }}
              >
                Workspace conversations
              </Typography>
              <Stack
                direction="row"
                spacing={.55}
                sx={{ alignItems: "center" }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#bdc8cc"
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "#8e9ba1" }}
                >
                  Active members only
                </Typography>
              </Stack>
            </Box>
            <Tooltip
              title="Workspace settings">
              <IconButton
                onClick={() => navigate("/setting")}
                size="small"
                sx={{ color: "#88969c" }}
              >
                <SettingsOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Box
            sx={{
              flex: 1,
              display: "grid",
              placeItems: "center",
              p: 3
            }}
          >
            <Stack
              spacing={1.35}
              sx={{
                textAlign: "center",
                maxWidth: 360,
                alignItems: "center"
              }}
            >
              <Box sx={{ position: "relative", mb: .5 }}>
                <Box
                  sx={{
                    display: "grid",
                    placeItems: "center",
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    bgcolor: "#eaf6f4",
                    color: "#198b83"
                  }}
                >
                  <ChatBubbleOutlineRounded sx={{ fontSize: 32 }} />
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    display: "grid",
                    placeItems: "center",
                    width: 31,
                    height: 31,
                    right: -3,
                    bottom: -1,
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    color: "#718a91",
                    border: "1px solid #e6eded"
                  }}
                >
                  <TagRounded sx={{ fontSize: 15 }} />
                </Box>
              </Box>
              <Typography
                sx={{
                  color: "#273e49",
                  fontWeight: 750,
                  fontSize: 18
                }}
              >
                A little quieter in here
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#87959c",
                  lineHeight: 1.7
                }}
              >
                Messages are private to this workspace. Once teammates accept their invitation and become active members, you can start a conversation with them here.
              </Typography>
              {!workspace?._id && (
                <Button
                  onClick={() => navigate("/setting")}
                  endIcon={<ArrowUpwardRounded sx={{ transform: "rotate(45deg)" }} />}
                  sx={{
                    mt: .5,
                    textTransform: "none",
                    color: "#168d86",
                    fontWeight: 700
                  }}
                >
                  Choose a workspace
                </Button>
              )}
              {workspace?._id && (
                <Stack
                  direction="row"
                  spacing={.8}
                  sx={{
                    mt: .7,
                    p: 1.1,
                    px: 1.4,
                    borderRadius: 2,
                    bgcolor: "#f2f7f7",
                    color: "#71868b",
                    alignItems: "center"
                  }}
                >
                  <Groups2Outlined sx={{ fontSize: 17 }} />
                  <Typography
                    variant="caption"
                  >
                    Only active members appear in chat search.
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderTop: paneBorder,
              bgcolor: "#fff"
            }}
          >
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={4}
              disabled
              placeholder="Choose a teammate to start messaging"
              inputProps={{ "aria-label": "Write a message" }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Send message">
                        <span>
                          <IconButton
                            disabled
                            size="small"
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: 1.7,
                              bgcolor: "#168d86",
                              color: "#fff",
                              "&:hover": {
                                bgcolor: "#107a74"
                              }
                            }}
                          >
                            <ArrowUpwardRounded sx={{ fontSize: 19 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  )
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "#fafcfc",
                  pr: 1,
                  fontSize: 13
                },
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#a0aaaf"
                },
                "& fieldset": {
                  borderColor: "#e9eef0"
                }
              }}
            />
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default Chat;
