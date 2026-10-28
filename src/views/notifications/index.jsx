import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  AssignmentIndOutlined,
  ChatBubbleOutlineRounded,
  DoneAllRounded,
  NotificationsNoneRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import NotificationServices from "../../api/notifications";
import { useNotifications } from "../../context/NotificationContext";
import useStore from "../../config/zustand";

const formatRelative = (date) => {
  if (!date) return "Just now";
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(date));
};

const getIsUnread = (item) => (typeof item?.isRead === "boolean" ? !item.isRead : !item?.readAt);

function NotificationRow({ notification, onOpen }) {
  const isTask = ["task.assigned", "task_assigned"].includes(notification.type);
  const actor = notification.actor || {};
  return (
    <ListItemButton
      onClick={() => onOpen(notification)}
      sx={{ px: { xs: 1.5, sm: 2 }, py: 1.7, alignItems: "flex-start", bgcolor: getIsUnread(notification) ? "#f3faf8" : "#fff", "&:hover": { bgcolor: getIsUnread(notification) ? "#ebf6f3" : "#f8fafb" } }}
    >
      <ListItemAvatar sx={{ minWidth: 52 }}>
        <Box sx={{ position: "relative", width: 40, height: 40 }}>
          <Avatar
            src={actor.profile_picture || undefined}
            alt={actor.name || ""}
            sx={{
              width: 40,
              height: 40,
              bgcolor: isTask ? "#fff2df" : "#e7f2fb",
              color: isTask ? "#b47725" : "#36749b",
              fontWeight: 700
            }}
          >
            {actor.name?.trim()?.[0]?.toUpperCase() || (isTask ?
              <AssignmentIndOutlined fontSize="small" /> :
              <ChatBubbleOutlineRounded fontSize="small" />
            )}
          </Avatar>
          <Box
            sx={{
              position: "absolute",
              right: -3,
              bottom: -3,
              display: "grid",
              placeItems: "center",
              width: 19,
              height: 19,
              borderRadius: "50%",
              border: "2px solid #fff",
              bgcolor: isTask ? "#fff0d7" : "#e4f1fb",
              color: isTask ? "#b47725" : "#36749b"
            }}
          >
            {isTask ? (
              <AssignmentIndOutlined sx={{ fontSize: 11 }} />
            ) : (
              <ChatBubbleOutlineRounded sx={{ fontSize: 11 }} />
            )}
          </Box>
        </Box>
      </ListItemAvatar>
      <ListItemText
        primary={(
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: "wrap",
              alignItems: "center"
            }}
          >
            <Typography
              sx={{
                color: "#273e49",
                fontSize: 14,
                fontWeight: getIsUnread(notification) ? 800 : 700
              }}
            >
              {notification.title || (isTask ? "Task assigned to you" : "New message")}
            </Typography>
            {getIsUnread(notification) && (
              <Box
                aria-label="Unread"
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#168d86"
                }}
              />
            )}
          </Stack>
        )}
        secondary={
          <Box
            component="span"
            sx={{ display: "block" }}
          >
            <Typography
              component="span"
              variant="body2"
              sx={{
                display: "block",
                color: "#65777f",
                lineHeight: 1.45,
                mt: .4
              }}
            >
              {notification.body || (isTask ? `${actor.name || "Someone"} assigned “${notification.task?.title || "a task"}” to you.` : `${actor.name || "A teammate"}: ${notification.message?.text || "sent you a message"}`)}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              sx={{
                display: "block",
                color: "#98a4a9",
                mt: .65
              }}
            >
              {notification.workspace?.name || "Workspace"} · {formatRelative(notification.createdAt)}
            </Typography>
          </Box>
        }
      />
    </ListItemButton>
  );
}

NotificationRow.propTypes = {
  notification: PropTypes.object.isRequired,
  onOpen: PropTypes.func.isRequired,
};

function Notifications() {
  const navigate = useNavigate();
  const { workspace, workspaces, setWorkspace, refreshAllProjects } = useStore();
  const { unreadCount, setUnreadCount, refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async (cursor, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const result = await NotificationServices.getNotifications({ limit: 20, ...(cursor ? { before: cursor } : {}) });
      if (!result?.status) throw new Error(result?.message || "Could not load notifications.");
      const data = result.data || {};
      const next = data.notifications || [];
      setNotifications((current) => append ? [...current, ...next.filter((item) => !current.some((entry) => entry._id === item._id))] : next);
      setNextCursor(data.nextCursor || null);
      if (Number.isFinite(Number(data.unreadCount))) setUnreadCount(Math.max(0, Number(data.unreadCount)));
    } catch (requestError) {
      setError(requestError?.message || "Could not load notifications.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [setUnreadCount]);

  useEffect(() => { loadNotifications(null); }, [loadNotifications]);

  const markRead = async (item) => {
    if (!getIsUnread(item)) return;
    try {
      await NotificationServices.markRead(item._id);
      setNotifications((current) => current.map((notification) => notification._id === item._id ? { ...notification, isRead: true, readAt: new Date().toISOString() } : notification));
      await refreshUnreadCount();
    } catch (requestError) {
      setError(requestError?.message || "Could not update notification status.");
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setError("");
    try {
      const result = await NotificationServices.markAllRead();
      if (!result?.status) throw new Error(result?.message || "Could not mark notifications as read.");
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true, readAt: item.readAt || readAt })));
      await refreshUnreadCount();
    } catch (requestError) {
      setError(requestError?.message || "Could not mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = async (item) => {
    await markRead(item);
    const targetWorkspace = workspaces.find((candidate) => candidate._id === item.workspace?._id) || item.workspace;
    if (targetWorkspace?._id && targetWorkspace._id !== workspace?._id) {
      setWorkspace(targetWorkspace);
      refreshAllProjects();
    }
    if (["task.assigned", "task_assigned"].includes(item.type)) {
      navigate(item.task?._id ? `/tasks?taskId=${encodeURIComponent(item.task._id)}` : "/tasks");
    } else {
      navigate(item.conversation?._id ? `/chats?conversationId=${encodeURIComponent(item.conversation._id)}` : "/chats");
    }
  };

  return (
    <Grid
      container
      spacing={2}
    >
      <Grid size={12}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" }
          }}
        >
          <Box>
            <Typography
              variant="h1"
              sx={{ fontSize: 24, fontWeight: 600 }}
            >
              Notifications
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: .5 }}
            >
              Task assignments and messages from your workspaces.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={markingAll ? <CircularProgress size={16} /> : <DoneAllRounded />}
            onClick={markAllRead}
            disabled={!unreadCount || markingAll}
          >
            {markingAll ? "Updating…" : "Mark all as read"}
          </Button>
        </Stack>
      </Grid>

      <Grid size={12}>
        <Divider sx={{ borderColor: "#024F6E" }} />
      </Grid>

      {error && (
        <Grid size={12}>
          <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
        </Grid>
      )}
      <Grid size={12}>
        <Card
          elevation={0}
          sx={{
            border: "1px solid #E7EDF0",
            borderRadius: 4,
            overflow: "hidden"
          }}
        >
          <Stack
            direction="row"
            sx={{
              px: 2,
              py: 1.6,
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center"
              }}
            >
              <NotificationsNoneRounded sx={{ color: "#397d79" }} />
              <Typography sx={{ color: "#243844", fontWeight: 800 }}>
                Recent activity
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={{
                color: "#71828d",
                fontWeight: 700
              }}
            >
              {unreadCount} unread
            </Typography>
          </Stack>
          <Divider sx={{ borderColor: "#edf1f2" }} />
          {loading ? (
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                py: 7
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : notifications.length ? (
            <>
              <List
                disablePadding
              >
                {notifications.map((item, index) => (
                  <Box key={item._id}>
                    <NotificationRow
                      notification={item}
                      onOpen={openNotification}
                    />
                    {index < notifications.length - 1 && (
                      <Divider component="li" sx={{ borderColor: "#f0f3f4" }} />
                    )}
                  </Box>
                ))}
              </List>
              {nextCursor && (
                <Box
                  sx={{
                    p: 1.5,
                    borderTop: "1px solid #EDF1F2",
                    textAlign: "center"
                  }}
                >
                  <Button
                    onClick={() => loadNotifications(nextCursor, true)}
                    disabled={loadingMore}
                  >
                    {loadingMore ?
                      <CircularProgress size={18} /> :
                      "Load older notifications"
                    }
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Stack
              spacing={1}
              sx={{
                py: 7,
                px: 2,
                textAlign: "center",
                alignItems: "center"
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 54,
                  height: 54,
                  borderRadius: 4,
                  bgcolor: "#F1F7F6",
                  color: "#4D8980"
                }}
              >
                <NotificationsNoneRounded sx={{ fontSize: 27 }} />
              </Box>
              <Typography
                sx={{
                  color: "#30434d",
                  fontWeight: 750
                }}
              >
                You’re all caught up
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                New task assignments and messages will show up here.
              </Typography>
            </Stack>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}

export default Notifications;
