import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  AddRounded,
  ArrowUpwardRounded,
  ChatBubbleOutlineRounded,
  Groups2Outlined,
  InsertLinkRounded,
  LinkOutlined,
  SearchRounded,
  SettingsOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useStore from "../../config/zustand";
import ChatServices from "../../api/chats";
import { apiBaseUrl } from "../../config/axios/axios";
const paneBorder = "1px solid #e8edf0";
const socketUrl = apiBaseUrl.replace(/\/api\/?$/, "");
const urlPattern = /https?:\/\/[^\s<>()]+/gi;
const linkPreviewCache = new Map();
const getId = (value) => String(value?._id || value || "");
function extractLinks(text = "") {
  return [
    ...new Set(
      (text.match(urlPattern) || []).map((url) =>
        url.replace(/[.,!?;:]+$/, ""),
      ),
    ),
  ];
}
function getHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
function formatTime(date) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}
function formatDate(date) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    parsed,
  );
}
function upsertMessage(messages, nextMessage) {
  if (!nextMessage?._id) return messages;
  const byId = new Map(messages.map((message) => [getId(message), message]));
  byId.set(getId(nextMessage), nextMessage);
  return [...byId.values()].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
}
function getPeer(conversation, currentUserId) {
  return (
    (conversation?.participants || []).find(
      (person) => getId(person) !== currentUserId,
    ) || null
  );
}
function LinkPreviewCard({ workspaceId, url }) {
  const [preview, setPreview] = useState(
    () => linkPreviewCache.get(url) || null,
  );
  const [loaded, setLoaded] = useState(() => linkPreviewCache.has(url));
  useEffect(() => {
    let active = true;
    if (!workspaceId || !url) return undefined;
    if (linkPreviewCache.has(url)) {
      setPreview(linkPreviewCache.get(url));
      setLoaded(true);
      return undefined;
    }
    ChatServices.getLinkPreview(workspaceId, url)
      .then((result) => {
        const value = result?.data?.preview || result?.data || null;
        linkPreviewCache.set(url, value);
        if (active) setPreview(value);
      })
      .catch(() => {
        linkPreviewCache.set(url, null);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [workspaceId, url]);
  const title = preview?.title || preview?.domain || getHost(url);
  const description = preview?.description || url;
  return (
    <Paper
      component="a"
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      variant="outlined"
      sx={{
        display: "flex",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        width: "min(100%, 390px)",
        mt: 1,
        borderRadius: 2,
        borderColor: "#e4ebed",
        bgcolor: "#fff",
        transition: "border-color .15s ease, transform .15s ease",
        "&:hover": { borderColor: "#a8d2ce", transform: "translateY(-1px)" },
      }}
    >
      {" "}
      {preview?.image && (
        <Box
          component="img"
          src={preview.image}
          alt=""
          sx={{ width: 92, objectFit: "cover", bgcolor: "#edf3f4" }}
        />
      )}{" "}
      <Box sx={{ minWidth: 0, p: 1.2 }}>
        {" "}
        <Typography
          variant="caption"
          sx={{ color: "#168d86", fontWeight: 700 }}
        >
          {preview?.siteName || getHost(url)}
        </Typography>{" "}
        <Typography
          noWrap
          sx={{ color: "#263d47", fontSize: 13, fontWeight: 750, mt: 0.25 }}
        >
          {title}
        </Typography>{" "}
        <Typography
          sx={{
            color: "#7f8e95",
            fontSize: 11.5,
            mt: 0.35,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </Typography>{" "}
        {!loaded && (
          <Typography variant="caption" sx={{ color: "#9ca8ad" }}>
            Loading preview…
          </Typography>
        )}{" "}
      </Box>{" "}
    </Paper>
  );
}
function Chat() {
  const [activeTab, setActiveTab] = useState("messages");
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [linkMessages, setLinkMessages] = useState([]);
  const [linksHasMore, setLinksHasMore] = useState(false);
  const [linksNextBefore, setLinksNextBefore] = useState(null);
  const [loadingMoreLinks, setLoadingMoreLinks] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [linksLoading, setLinksLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [connection, setConnection] = useState("disconnected");
  const listEndRef = useRef(null);
  const socketRef = useRef(null);
  const joinedRoomsRef = useRef(new Set());
  const conversationsRef = useRef([]);
  const selectedConversationIdRef = useRef("");
  const { workspace } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const workspaceId = workspace?._id;
  const currentUserId = getId(user);
  const token =
    user?.token || JSON.parse(localStorage.getItem("user") || "{}")?.token;
  const activeConversation =
    !selectedConversation?.workspace ||
      getId(selectedConversation.workspace) === getId(workspaceId)
      ? selectedConversation
      : null;
  const conversationId = getId(activeConversation);
  conversationsRef.current = conversations;
  selectedConversationIdRef.current = conversationId;
  const selectedPeer = useMemo(
    () => getPeer(activeConversation, currentUserId),
    [activeConversation, currentUserId],
  );
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "Y";
  useEffect(() => {
    let active = true;
    setSelectedConversation(null);
    setMessages([]);
    setLinkMessages([]);
    conversationsRef.current = [];
    joinedRoomsRef.current.clear();
    setError("");
    if (!workspaceId) {
      setUsers([]);
      setConversations([]);
      return undefined;
    }
    setLoading(true);
    Promise.all([
      ChatServices.getUsers(workspaceId),
      ChatServices.getConversations(workspaceId),
    ])
      .then(([usersResult, conversationsResult]) => {
        if (!active) return;
        if (usersResult?.status === false)
          throw new Error(
            usersResult.message || "Could not load workspace members.",
          );
        if (conversationsResult?.status === false)
          throw new Error(
            conversationsResult.message || "Could not load conversations.",
          );
        const activeUsers = usersResult?.data?.users || [];
        const threads = conversationsResult?.data?.conversations || [];
        setUsers(activeUsers);
        setConversations(threads);
        setSelectedConversation(threads[0] || null);
      })
      .catch((requestError) => {
        if (active)
          setError(requestError?.message || "Could not load workspace chat.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [workspaceId]);
  useEffect(() => {
    let active = true;
    if (!workspaceId || !conversationId) {
      setMessages([]);
      return undefined;
    }
    setMessages([]);
    setMessagesLoading(true);
    ChatServices.getMessages(workspaceId, conversationId, { limit: 50 })
      .then((result) => {
        if (!active) return;
        if (result?.status === false)
          throw new Error(result.message || "Could not load messages.");
        const history = result?.data?.messages || [];
        setMessages((current) => history.reduce(upsertMessage, current));
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError?.message || "Could not load this conversation.",
          );
      })
      .finally(() => {
        if (active) setMessagesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [workspaceId, conversationId]);
  useEffect(() => {
    if (!workspaceId || !token) {
      setConnection("disconnected");
      return undefined;
    }
    const socket = io(socketUrl, { auth: { token } });
    socketRef.current = socket;
    joinedRoomsRef.current = new Set();
    const joinAvailableConversations = () => {
      conversationsRef.current.forEach((conversation) => {
        const id = getId(conversation);
        if (!id || joinedRoomsRef.current.has(id)) return;
        joinedRoomsRef.current.add(id);
        socket.emit("chat:join", { workspaceId, conversationId: id }, (result) => {
          if (!result?.ok) joinedRoomsRef.current.delete(id);
        });
      });
    };
    setConnection("connecting");
    socket.on("connect", () => {
      setConnection("connected");
      joinAvailableConversations();
    });
    socket.on("disconnect", () => setConnection("disconnected"));
    socket.on("connect_error", () => setConnection("disconnected"));
    socket.on("chat:error", (payload) =>
      setError(payload?.message || "Could not join this conversation."),
    );
    socket.on("chat:new-message", (payload) => {
      const message = payload?.message;
      if (!message) return;
      const messageConversationId = getId(message.conversation);
      if (messageConversationId === selectedConversationIdRef.current) {
        setMessages((current) => upsertMessage(current, message));
      }
      setConversations((current) =>
        current
          .map((conversation) =>
            getId(conversation) === messageConversationId
              ? {
                ...conversation,
                lastMessage: message,
                updatedAt: message.createdAt,
              }
              : conversation,
          )
          .sort(
            (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
          ),
      );
    });
    return () => {
      joinedRoomsRef.current.forEach((id) => {
        socket.emit("chat:leave", { workspaceId, conversationId: id });
      });
      joinedRoomsRef.current.clear();
      socketRef.current = null;
      socket.disconnect();
    };
  }, [workspaceId, token]);
  useEffect(() => {
    const socket = socketRef.current;
    if (!workspaceId || !socket?.connected) return;
    conversations.forEach((conversation) => {
      const id = getId(conversation);
      if (!id || joinedRoomsRef.current.has(id)) return;
      joinedRoomsRef.current.add(id);
      socket.emit("chat:join", { workspaceId, conversationId: id }, (result) => {
        if (!result?.ok) joinedRoomsRef.current.delete(id);
      });
    });
  }, [conversations, workspaceId]);
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, conversationId]);
  useEffect(() => {
    let active = true;
    if (activeTab !== "links" || !workspaceId) {
      setLinkMessages([]);
      return undefined;
    }
    setLinksLoading(true);
    ChatServices.getLinks(workspaceId, { limit: 100 })
      .then((result) => {
        if (!active) return;
        if (result?.status === false)
          throw new Error(result.message || "Could not load shared links.");
        const data = result?.data || {};
        setLinkMessages(
          (data.links || []).map((message) => ({
            ...message,
            conversationPeer: getPeer(message.conversation, currentUserId),
            conversationId: getId(message.conversation),
          })),
        );
        setLinksHasMore(Boolean(data.hasMore));
        setLinksNextBefore(data.nextBefore || null);
      })
      .catch((requestError) => {
        if (active)
          setError(requestError?.message || "Could not load shared links.");
      })
      .finally(() => {
        if (active) setLinksLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeTab, workspaceId, currentUserId]);
  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const peer = getPeer(conversation, currentUserId);
      const summary =
        `${peer?.name || ""} ${peer?.email || ""} ${conversation.lastMessage?.text || ""}`.toLowerCase();
      return !query || summary.includes(query);
    });
  }, [conversations, currentUserId, search]);
  const visibleUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    return users.filter(
      (person) =>
        !query ||
        `${person.name || ""} ${person.email || ""}`
          .toLowerCase()
          .includes(query),
    );
  }, [users, userSearch]);
  const directoryUsers = useMemo(() => {
    const visiblePeerIds = new Set(
      visibleConversations.map((conversation) =>
        getId(getPeer(conversation, currentUserId)),
      ),
    );
    const query = search.trim().toLowerCase();
    return users.filter((person) => {
      const matches =
        !query ||
        `${person.name || ""} ${person.email || ""}`
          .toLowerCase()
          .includes(query);
      return matches && !visiblePeerIds.has(getId(person));
    });
  }, [users, visibleConversations, currentUserId, search]);
  const visibleLinks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return linkMessages
      .filter((message) => {
        const peer = message.conversationPeer;
        const searchable =
          `${message.text || ""} ${peer?.name || ""} ${peer?.email || ""} ${extractLinks(message.text).join(" ")}`.toLowerCase();
        return !query || searchable.includes(query);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [linkMessages, search]);
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setActiveTab("messages");
    setError("");
  };
  const startConversation = async (person) => {
    if (!workspaceId || !person?._id) return;
    setStartingConversation(true);
    setError("");
    try {
      const result = await ChatServices.createConversation(workspaceId, {
        participantId: person._id,
      });
      if (result?.status === false)
        throw new Error(result.message || "Could not start conversation.");
      const conversation = result?.data?.conversation || result?.data;
      if (!conversation?._id)
        throw new Error("The server returned an invalid conversation.");
      setConversations((current) => [
        conversation,
        ...current.filter((item) => getId(item) !== getId(conversation)),
      ]);
      setSelectedConversation(conversation);
      setPickerOpen(false);
      setUserSearch("");
      setActiveTab("messages");
    } catch (requestError) {
      setError(requestError?.message || "Could not start conversation.");
    } finally {
      setStartingConversation(false);
    }
  };
  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = draft.trim();
    if (
      !text ||
      !workspaceId ||
      !conversationId ||
      sending ||
      text.length > 4000
    )
      return;
    setSending(true);
    setError("");
    try {
      const result = await ChatServices.sendMessage(
        workspaceId,
        conversationId,
        { text },
      );
      if (result?.status === false)
        throw new Error(result.message || "Message could not be sent.");
      const message = result?.data?.message || result?.data;
      setMessages((current) => upsertMessage(current, message));
      setConversations((current) =>
        current
          .map((conversation) =>
            getId(conversation) === conversationId
              ? {
                ...conversation,
                lastMessage: message,
                updatedAt: message.createdAt,
              }
              : conversation,
          )
          .sort(
            (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
          ),
      );
      setDraft("");
    } catch (requestError) {
      setError(requestError?.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };
  const loadMoreLinks = async () => {
    if (!workspaceId || !linksHasMore || !linksNextBefore || loadingMoreLinks)
      return;
    setLoadingMoreLinks(true);
    try {
      const result = await ChatServices.getLinks(workspaceId, {
        limit: 100,
        before: linksNextBefore,
      });
      const data = result?.data || {};
      const olderLinks = (data.links || []).map((message) => ({
        ...message,
        conversationPeer: getPeer(message.conversation, currentUserId),
        conversationId: getId(message.conversation),
      }));
      setLinkMessages((current) => [...current, ...olderLinks]);
      setLinksHasMore(Boolean(data.hasMore));
      setLinksNextBefore(data.nextBefore || null);
    } catch (requestError) {
      setError(requestError?.message || "Could not load older links.");
    } finally {
      setLoadingMoreLinks(false);
    }
  };
  const workspaceName = workspace?.name || "No workspace selected";
  return (
    <Grid container spacing={2}>
      {" "}
      <Grid size={12}>
        {" "}
        <Stack
          spacing={2}
          direction={{ xs: "column", sm: "row" }}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          {" "}
          <Box>
            {" "}
            <Typography
              variant="h1"
              sx={{ color: "#172b3a", fontSize: 24, fontWeight: 600 }}
            >
              Chats
            </Typography>{" "}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Private conversations with active workspace members.
            </Typography>{" "}
          </Box>{" "}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              border: paneBorder,
              borderRadius: 2.5,
              px: 1.1,
              py: 0.75,
              bgcolor: "#fff",
              maxWidth: "100%",
              alignItems: "center",
            }}
          >
            {" "}
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 27,
                height: 27,
                borderRadius: 1.3,
                bgcolor: "#eaf5f4",
                color: "#168d86",
              }}
            >
              <Groups2Outlined sx={{ fontSize: 17 }} />
            </Box>{" "}
            <Box sx={{ minWidth: 0 }}>
              {" "}
              <Typography
                variant="caption"
                sx={{ color: "#8a979e", display: "block", lineHeight: 1.1 }}
              >
                Current workspace
              </Typography>{" "}
              <Typography
                noWrap
                variant="body2"
                sx={{ maxWidth: 220, color: "#30444e", fontWeight: 700 }}
              >
                {workspaceName}
              </Typography>{" "}
            </Box>{" "}
          </Stack>{" "}
        </Stack>{" "}
      </Grid>{" "}
      <Grid size={12}>
        <Divider sx={{ borderColor: "#024F6E" }} />
      </Grid>{" "}
      <Grid size={12}>
        {" "}
        <Card
          elevation={0}
          sx={{
            height: "calc(100vh - 132px)",
            minHeight: { xs: 680, md: 550 },
            maxHeight: { xs: "none", md: 900 },
            border: paneBorder,
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            bgcolor: "#fff",
            boxShadow: "0px 0px 15px 5px #EEEEEE80",
          }}
        >
          {" "}
          <Box
            sx={{
              width: { xs: "100%", md: 320 },
              minHeight: { xs: 265, md: 0 },
              flexShrink: 0,
              borderRight: { xs: 0, md: paneBorder },
              borderBottom: { xs: paneBorder, md: 0 },
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            {" "}
            <Stack
              direction="row"
              sx={{
                px: 2,
                py: 2,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {" "}
              <Box>
                {" "}
                <Typography
                  sx={{ fontWeight: 750, color: "#203640", fontSize: 15 }}
                >
                  Your inbox
                </Typography>{" "}
                <Typography variant="caption" sx={{ color: "#94a0a6" }}>
                  Active workspace members only
                </Typography>{" "}
              </Box>{" "}
              <Tooltip title="Start a conversation">
                <span>
                  <IconButton
                    disabled={!workspaceId || users.length === 0}
                    onClick={() => setPickerOpen(true)}
                    sx={{
                      color: "#168d86",
                      bgcolor: "#edf7f6",
                      "&:hover": { bgcolor: "#dff1ef" },
                    }}
                  >
                    <AddRounded />
                  </IconButton>
                </span>
              </Tooltip>{" "}
            </Stack>{" "}
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              {" "}
              <TextField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
                size="small"
                placeholder={
                  activeTab === "links"
                    ? "Search shared links"
                    : "Search people or messages"
                }
                inputProps={{ "aria-label": "Search people or messages" }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded
                          sx={{ color: "#97a3a9", fontSize: 19 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#f8fafb",
                    borderRadius: 2.2,
                    fontSize: 13,
                  },
                  "& fieldset": { borderColor: "#edf0f2" },
                }}
              />{" "}
            </Box>{" "}
            <Stack direction="row" spacing={0.5} sx={{ px: 1.5, pb: 1.5 }}>
              {" "}
              {[
                {
                  key: "messages",
                  label: "Messages",
                  icon: <ChatBubbleOutlineRounded sx={{ fontSize: 16 }} />,
                },
                {
                  key: "links",
                  label: "Links",
                  icon: <LinkOutlined sx={{ fontSize: 17 }} />,
                },
              ].map((tab) => (
                <Button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  startIcon={tab.icon}
                  sx={{
                    px: 1.2,
                    py: 0.7,
                    minWidth: 0,
                    borderRadius: 1.8,
                    textTransform: "none",
                    fontWeight: activeTab === tab.key ? 750 : 600,
                    fontSize: 12.5,
                    color: activeTab === tab.key ? "#147e78" : "#839098",
                    bgcolor: activeTab === tab.key ? "#eaf6f4" : "transparent",
                    "&:hover": {
                      bgcolor: activeTab === tab.key ? "#eaf6f4" : "#f6f8f9",
                    },
                  }}
                >
                  {tab.label}
                </Button>
              ))}{" "}
            </Stack>{" "}
            <Divider sx={{ borderColor: "#edf0f2" }} />{" "}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              {" "}
              {!workspaceId ? (
                <Stack
                  spacing={1}
                  sx={{
                    minHeight: 210,
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                    textAlign: "center",
                  }}
                >
                  <Groups2Outlined sx={{ color: "#8ba7a4" }} />
                  <Typography sx={{ color: "#40535d", fontWeight: 700 }}>
                    Choose a workspace
                  </Typography>
                </Stack>
              ) : loading ? (
                <Box
                  sx={{ display: "grid", placeItems: "center", minHeight: 180 }}
                >
                  <CircularProgress size={26} />
                </Box>
              ) : activeTab === "messages" ? (
                visibleConversations.length || directoryUsers.length ? (
                  <List disablePadding>
                    {visibleConversations.map((conversation) => {
                      const peer = getPeer(conversation, currentUserId);
                      const selected = getId(conversation) === conversationId;
                      return (
                        <ListItemButton
                          key={conversation._id}
                          selected={selected}
                          onClick={() => selectConversation(conversation)}
                          sx={{
                            m: 2,
                            px: 1.2,
                            py: 1.15,
                            borderRadius: 2,
                            alignItems: "center",
                            "&.Mui-selected": { bgcolor: "#edf7f6" },
                            "&.Mui-selected:hover": { bgcolor: "#e6f3f1" },
                          }}
                        >
                          {" "}
                          <Avatar
                            src={peer?.profile_picture || undefined}
                            sx={{
                              width: 42,
                              height: 42,
                              mr: 1.3,
                              bgcolor: "#e4f2f0",
                              color: "#168d86",
                              fontWeight: 700,
                            }}
                          >
                            {peer?.name?.slice(0, 1)?.toUpperCase() || "M"}
                          </Avatar>{" "}
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            {" "}
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              spacing={1}
                            >
                              <Typography
                                noWrap
                                sx={{
                                  color: "#2d424c",
                                  fontWeight: 750,
                                  fontSize: 13,
                                }}
                              >
                                {peer?.name ||
                                  peer?.email ||
                                  "Workspace member"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ flexShrink: 0, color: "#96a1a6" }}
                              >
                                {formatTime(
                                  conversation.lastMessage?.createdAt ||
                                  conversation.updatedAt,
                                )}
                              </Typography>
                            </Stack>{" "}
                            <Typography
                              noWrap
                              variant="body2"
                              sx={{ color: "#829098", mt: 0.25, fontSize: 12 }}
                            >
                              {conversation.lastMessage?.text ||
                                "Start a conversation"}
                            </Typography>{" "}
                          </Box>{" "}
                        </ListItemButton>
                      );
                    })}
                    {directoryUsers.length > 0 && (
                      <>
                        <Typography
                          variant="overline"
                          sx={{
                            display: "block",
                            px: 2,
                            pt: 1.5,
                            color: "#95a1a8",
                            fontWeight: 700,
                          }}
                        >
                          Active members
                        </Typography>
                        {directoryUsers.map((person) => (
                          <ListItemButton
                            key={person._id}
                            onClick={() => startConversation(person)}
                            sx={{
                              mx: 1,
                              my: 0.35,
                              px: 1.2,
                              py: 1.15,
                              borderRadius: 2,
                            }}
                          >
                            <Avatar
                              src={person.profile_picture || undefined}
                              sx={{
                                width: 42,
                                height: 42,
                                mr: 1.3,
                                bgcolor: "#f0f5f5",
                                color: "#168d86",
                                fontWeight: 700,
                              }}
                            >
                              {person.name?.slice(0, 1)?.toUpperCase() || "M"}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                noWrap
                                sx={{
                                  color: "#2d424c",
                                  fontWeight: 700,
                                  fontSize: 13,
                                }}
                              >
                                {person.name ||
                                  person.email ||
                                  "Workspace member"}
                              </Typography>
                              <Typography
                                noWrap
                                variant="body2"
                                sx={{
                                  color: "#829098",
                                  mt: 0.25,
                                  fontSize: 12,
                                }}
                              >
                                Start a conversation
                              </Typography>
                            </Box>
                            <ChatBubbleOutlineRounded
                              sx={{ fontSize: 18, color: "#8aa09e" }}
                            />
                          </ListItemButton>
                        ))}
                      </>
                    )}
                  </List>
                ) : (
                  <Stack
                    spacing={1}
                    sx={{
                      minHeight: 210,
                      alignItems: "center",
                      justifyContent: "center",
                      p: 3,
                      textAlign: "center",
                    }}
                  >
                    <ChatBubbleOutlineRounded sx={{ color: "#8ba7a4" }} />
                    <Typography sx={{ color: "#40535d", fontWeight: 700 }}>
                      {search
                        ? "No matching members or conversations"
                        : "No active members yet"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#95a1a8", lineHeight: 1.6 }}
                    >
                      Once teammates accept their invitations and become active
                      workspace members, they will appear here.
                    </Typography>
                  </Stack>
                )
              ) : linksLoading ? (
                <Box
                  sx={{ display: "grid", placeItems: "center", minHeight: 180 }}
                >
                  <CircularProgress size={26} />
                </Box>
              ) : visibleLinks.length ? (
                <List disablePadding>
                  {visibleLinks.map((message) => (
                    <Box
                      key={`${message.conversationId}-${message._id}`}
                      sx={{
                        px: 1.5,
                        py: 1.25,
                        borderBottom: "1px solid #f0f3f4",
                      }}
                    >
                      <Typography
                        noWrap
                        sx={{ color: "#455963", fontSize: 12, fontWeight: 700 }}
                      >
                        {message.conversationPeer?.name ||
                          message.conversationPeer?.email ||
                          "Workspace member"}{" "}
                        · {formatDate(message.createdAt)}
                      </Typography>
                      {extractLinks(message.text).map((url) => (
                        <LinkPreviewCard
                          key={url}
                          workspaceId={workspaceId}
                          url={url}
                        />
                      ))}
                    </Box>
                  ))}
                  {linksHasMore && (
                    <Box
                      sx={{ display: "grid", placeItems: "center", py: 1.5 }}
                    >
                      <Button
                        size="small"
                        disabled={loadingMoreLinks}
                        onClick={loadMoreLinks}
                        sx={{ color: "#168d86", textTransform: "none" }}
                      >
                        {loadingMoreLinks ? "Loading…" : "Load older links"}
                      </Button>
                    </Box>
                  )}
                </List>
              ) : (
                <Stack
                  spacing={1}
                  sx={{
                    minHeight: 210,
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                    textAlign: "center",
                  }}
                >
                  <InsertLinkRounded sx={{ color: "#8ba7a4" }} />
                  <Typography sx={{ color: "#40535d", fontWeight: 700 }}>
                    {search ? "No matching links" : "No shared links yet"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#95a1a8", lineHeight: 1.6 }}
                  >
                    Links shared in workspace conversations will appear here.
                  </Typography>
                  {linksHasMore && (
                    <Button
                      size="small"
                      disabled={loadingMoreLinks}
                      onClick={loadMoreLinks}
                      sx={{ color: "#168d86", textTransform: "none" }}
                    >
                      Load older links
                    </Button>
                  )}
                </Stack>
              )}{" "}
            </Box>{" "}
            <Divider sx={{ borderColor: "#edf0f2" }} />{" "}
            <Stack
              direction="row"
              spacing={1.2}
              sx={{ p: 1.7, alignItems: "center" }}
            >
              {" "}
              <Avatar
                src={user?.profile_picture || undefined}
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "#dff1ef",
                  color: "#287d77",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {userInitial}
              </Avatar>{" "}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  noWrap
                  variant="body2"
                  sx={{ color: "#354952", fontWeight: 700, fontSize: 12.5 }}
                >
                  {user?.name || "You"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#96a1a6" }}>
                  Your account
                </Typography>
              </Box>{" "}
            </Stack>{" "}
          </Box>{" "}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: { xs: 415, md: 0 },
              display: "flex",
              flexDirection: "column",
              bgcolor: "#fcfdfd",
              position: "relative",
            }}
          >
            {" "}
            <Stack
              direction="row"
              spacing={1.3}
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 1.8,
                borderBottom: paneBorder,
                bgcolor: "#fff",
                alignItems: "center",
              }}
            >
              {" "}
              <Avatar
                src={selectedPeer?.profile_picture || undefined}
                variant="rounded"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.8,
                  bgcolor: "#eaf6f4",
                  color: "#168d86",
                  fontWeight: 700,
                }}
              >
                {selectedPeer?.name?.slice(0, 1)?.toUpperCase() || (
                  <Groups2Outlined sx={{ fontSize: 20 }} />
                )}
              </Avatar>{" "}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {" "}
                <Typography
                  noWrap
                  sx={{ color: "#2d424c", fontWeight: 750, fontSize: 14 }}
                >
                  {selectedPeer?.name ||
                    selectedPeer?.email ||
                    "Select a conversation"}
                </Typography>{" "}
                <Stack
                  direction="row"
                  spacing={0.55}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor:
                        connection === "connected" ? "#31a887" : "#bdc8cc",
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#8e9ba1" }}>
                    {selectedPeer
                      ? connection === "connected"
                        ? "Connected"
                        : connection === "connecting"
                          ? "Connecting…"
                          : "Realtime offline"
                      : workspaceId
                        ? "Active workspace members"
                        : "No workspace selected"}
                  </Typography>
                </Stack>{" "}
              </Box>{" "}
              <Tooltip title="Workspace settings">
                <IconButton
                  onClick={() => navigate("/settings")}
                  size="small"
                  sx={{ color: "#88969c" }}
                >
                  <SettingsOutlined fontSize="small" />
                </IconButton>
              </Tooltip>{" "}
            </Stack>{" "}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{ mx: 2, mt: 1.5 }}
              >
                {error}
              </Alert>
            )}{" "}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                p: { xs: 2, sm: 2.5 },
                display: "flex",
                flexDirection: "column",
              }}
            >
              {" "}
              {!workspaceId ? (
                <EmptyConversation
                  title="Choose a workspace"
                  description="Select a workspace to view its active members and conversations."
                />
              ) : !activeConversation ? (
                <EmptyConversation
                  title="Start a conversation"
                  description={
                    users.length
                      ? "Choose an active workspace member to send your first message."
                      : "Once teammates accept their invitations, you can start a conversation here."
                  }
                />
              ) : messagesLoading ? (
                <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
                  <CircularProgress size={28} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>
                  <EmptyConversation
                    title={`Say hello to ${selectedPeer?.name || "your teammate"}`}
                    description="This is the beginning of your conversation. Messages stay within this workspace."
                  />
                </Box>
              ) : (
                <Stack spacing={1.4} sx={{ mt: "auto" }}>
                  {messages.map((message) => {
                    const ownMessage = getId(message.sender) === currentUserId;
                    const links = extractLinks(message.text);
                    return (
                      <Box
                        key={message._id}
                        sx={{
                          display: "flex",
                          justifyContent: ownMessage
                            ? "flex-end"
                            : "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: { xs: "88%", sm: "76%" },
                            minWidth: 80,
                          }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              px: 1.5,
                              py: 1.1,
                              borderRadius: ownMessage
                                ? "16px 16px 4px 16px"
                                : "16px 16px 16px 4px",
                              bgcolor: ownMessage ? "#e8f5f2" : "#fff",
                              border: ownMessage
                                ? "1px solid #d8eee9"
                                : paneBorder,
                            }}
                          >
                            <Typography
                              sx={{
                                whiteSpace: "pre-wrap",
                                overflowWrap: "anywhere",
                                color: "#30444e",
                                fontSize: 13.5,
                                lineHeight: 1.55,
                              }}
                            >
                              {message.text}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                textAlign: "right",
                                color: "#91a0a5",
                                mt: 0.45,
                              }}
                            >
                              {formatTime(message.createdAt)}
                            </Typography>
                          </Paper>
                          {links.map((url) => (
                            <LinkPreviewCard
                              key={url}
                              workspaceId={workspaceId}
                              url={url}
                            />
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={listEndRef} />
                </Stack>
              )}{" "}
            </Box>{" "}
            <Box
              component="form"
              onSubmit={sendMessage}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderTop: paneBorder,
                bgcolor: "#fff",
              }}
            >
              {" "}
              <TextField
                fullWidth
                multiline
                minRows={1}
                maxRows={4}
                value={draft}
                onChange={(event) =>
                  setDraft(event.target.value.slice(0, 4000))
                }
                disabled={!conversationId || sending}
                placeholder={
                  conversationId
                    ? "Write a message…"
                    : "Choose a teammate to start messaging"
                }
                inputProps={{
                  "aria-label": "Write a message",
                  maxLength: 4000,
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Send message">
                          <span>
                            <IconButton
                              type="submit"
                              disabled={
                                !draft.trim() || !conversationId || sending
                              }
                              size="small"
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 1.7,
                                bgcolor: "#168d86",
                                color: "#fff",
                                "&:hover": { bgcolor: "#107a74" },
                                "&.Mui-disabled": {
                                  bgcolor: "#e3ebeb",
                                  color: "#a0aaaf",
                                },
                              }}
                            >
                              {sending ? (
                                <CircularProgress size={17} color="inherit" />
                              ) : (
                                <ArrowUpwardRounded sx={{ fontSize: 19 }} />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: "#fafcfc",
                    pr: 1,
                    fontSize: 13,
                  },
                  "& fieldset": { borderColor: "#e9eef0" },
                }}
              />{" "}
            </Box>{" "}
          </Box>{" "}
        </Card>{" "}
      </Grid>{" "}
      <Dialog
        open={pickerOpen}
        onClose={() => !startingConversation && setPickerOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        {" "}
        <DialogTitle sx={{ pb: 1 }}>Start a conversation</DialogTitle>{" "}
        <DialogContent sx={{ pt: "8px !important" }}>
          {" "}
          <TextField
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            fullWidth
            size="small"
            autoFocus
            placeholder="Search active workspace members"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: "#91a0a5" }} />
                </InputAdornment>
              ),
            }}
          />{" "}
          <List sx={{ mt: 1, maxHeight: 390, overflowY: "auto" }}>
            {" "}
            {visibleUsers.map((person) => (
              <ListItemButton
                key={person._id}
                disabled={startingConversation}
                onClick={() => startConversation(person)}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <Avatar
                  src={person.profile_picture || undefined}
                  sx={{
                    width: 40,
                    height: 40,
                    mr: 1.4,
                    bgcolor: "#eaf6f4",
                    color: "#168d86",
                  }}
                >
                  {person.name?.slice(0, 1)?.toUpperCase() || "M"}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ color: "#2d424c", fontWeight: 700 }}>
                    {person.name || "Workspace member"}
                  </Typography>
                  <Typography noWrap variant="body2" sx={{ color: "#89969c" }}>
                    {person.email}
                  </Typography>
                </Box>
                {startingConversation && <CircularProgress size={18} />}
              </ListItemButton>
            ))}{" "}
            {visibleUsers.length === 0 && (
              <Typography sx={{ py: 4, textAlign: "center", color: "#87959c" }}>
                {userSearch
                  ? "No matching active members."
                  : "No other active members in this workspace yet."}
              </Typography>
            )}{" "}
          </List>{" "}
        </DialogContent>{" "}
      </Dialog>{" "}
    </Grid>
  );
}
function EmptyConversation({ title, description }) {
  return (
    <Stack
      spacing={1.2}
      sx={{
        textAlign: "center",
        maxWidth: 350,
        alignItems: "center",
        justifySelf: "center",
        alignSelf: "center",
        my: "auto",
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 68,
          height: 68,
          borderRadius: "50%",
          bgcolor: "#eaf6f4",
          color: "#198b83",
        }}
      >
        <ChatBubbleOutlineRounded sx={{ fontSize: 30 }} />
      </Box>
      <Typography sx={{ color: "#273e49", fontWeight: 750, fontSize: 17 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "#87959c", lineHeight: 1.7 }}>
        {description}
      </Typography>
    </Stack>
  );
}
export default Chat;
