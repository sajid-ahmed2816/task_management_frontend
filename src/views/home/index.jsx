import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  AccessTimeRounded,
  ArrowForwardRounded,
  AssignmentTurnedInRounded,
  CalendarMonthRounded,
  CheckCircleOutlineRounded,
  ErrorOutlineRounded,
  ForumOutlined,
  FolderOpenRounded,
  Groups2Outlined,
  RefreshRounded,
  TaskAltRounded,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import WorkspaceServices from "../../api/workspaces";
import useAuth from "../../hooks/useAuth";
import useStore from "../../config/zustand";

const taskStatusLabels = {
  "in-progress": "In progress",
  paused: "Paused",
  done: "Done",
};

const taskStatusColors = {
  "in-progress": "info",
  paused: "warning",
  done: "success",
};

const projectStatusLabels = {
  planning: "Planning",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

const numberFormat = new Intl.NumberFormat();

function getGreeting(name = "") {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${greeting}${name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}`;
}

function formatDate(value, options = { month: "short", day: "numeric" }) {
  if (!value) return "No due date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No due date" : new Intl.DateTimeFormat(undefined, options).format(date);
}

function getConversationTitle(conversation, currentUserId) {
  const otherPeople = (conversation?.participants || []).filter(
    (person) => String(person?._id || person) !== String(currentUserId),
  );
  if (!otherPeople.length) return "Workspace chat";
  const names = otherPeople.map((person) => person?.name || person?.email).filter(Boolean);
  if (names.length > 2) return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
  return names.join(", ") || "Workspace chat";
}

function MetricCard({ label, value, helper, Icon, tint, onClick }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid #e8edf0",
        borderRadius: 4,
        bgcolor: "#fff"
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ height: "100%", p: 2.25 }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between"
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 800,
                color: "#163b4a"
              }}
            >
              {numberFormat.format(Number(value) || 0)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {helper}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: 2,
              color: tint,
              bgcolor: `${tint}14`
            }}
          >
            <Icon />
          </Box>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  helper: PropTypes.string.isRequired,
  Icon: PropTypes.elementType.isRequired,
  tint: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

function SectionHeader({ title, caption, action, onAction }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        mb: 1.75,
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{
            color: "#173a49",
            fontWeight: 750
          }}
        >
          {title}
        </Typography>
        {caption && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {caption}
          </Typography>
        )}
      </Box>
      {action && (
        <Button
          size="small"
          endIcon={<ArrowForwardRounded />}
          onClick={onAction}
        >
          {action}
        </Button>
      )}
    </Stack>
  );
}

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  caption: PropTypes.string,
  action: PropTypes.string,
  onAction: PropTypes.func,
};

function TaskRow({ task, onClick, dateMode = "due" }) {
  const status = taskStatusLabels[task.status] || "Task";
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = dueDate && !Number.isNaN(dueDate.getTime()) && dueDate < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== "done";
  const dateLabel = dateMode === "updated"
    ? `Updated ${formatDate(task.updatedAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
    : overdue ? "Overdue" : formatDate(task.dueDate);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.25,
        cursor: "pointer",
        "&:hover .task-name": {
          color: "primary.main"
        }
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: 2,
          color: overdue ? "error.main" : "#34798c",
          bgcolor: overdue ? "#fff0ee" : "#eaf5f7"
        }}
      >
        {overdue ? <ErrorOutlineRounded fontSize="small" /> : <TaskAltRounded fontSize="small" />}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          className="task-name"
          variant="body2"
          noWrap
          sx={{
            transition: "color .15s",
            fontWeight: 700
          }}
        >
          {task.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
        >
          {task.project?.name || "No project"} · {dateLabel}
        </Typography>
      </Box>
      <Chip
        size="small"
        label={status}
        color={taskStatusColors[task.status] || "default"}
        variant="outlined"
        sx={{
          textTransform: "capitalize",
          flexShrink: 0
        }}
      />
    </Box>
  );
}

TaskRow.propTypes = {
  task: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    status: PropTypes.string,
    dueDate: PropTypes.string,
    updatedAt: PropTypes.string,
    project: PropTypes.shape({ name: PropTypes.string }),
  }).isRequired,
  onClick: PropTypes.func,
  dateMode: PropTypes.oneOf(["due", "updated"]),
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspace } = useStore();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const workspaceId = workspace?._id;

  const loadDashboard = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    if (!workspaceId) {
      setDashboard(null);
      setLoading(false);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    setDashboard(null);
    try {
      const response = await WorkspaceServices.getDashboard(workspaceId);
      if (!response?.status || !response?.data) throw new Error(response?.message || "Could not load dashboard.");
      if (requestId.current === currentRequestId) setDashboard(response.data);
    } catch (requestError) {
      if (requestId.current === currentRequestId) setError(requestError?.message || "Could not load dashboard.");
    } finally {
      if (requestId.current === currentRequestId) setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = dashboard?.summary || {};
  const tasks = summary.tasks || {};
  const projects = summary.projects || {};
  const upcomingTasks = dashboard?.upcomingTasks || [];
  const myTasks = dashboard?.myTasks || [];
  const recentTasks = dashboard?.recentTasks || [];
  const recentConversations = dashboard?.recentConversations || [];
  const currentUserId = user?._id;
  const taskTotal = Number(tasks.total) || 0;
  const taskStatuses = useMemo(() => [
    { key: "in-progress", label: "In progress", color: "#1686a0" },
    { key: "paused", label: "Paused", color: "#d28a1f" },
    { key: "done", label: "Done", color: "#28966b" },
  ], []);

  const viewTask = () => navigate("/tasks");

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between"
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItem: "flex-start",
              gap: 1
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                >
                  {getGreeting(user?.name)}
                </Typography>
                <Chip
                  icon={<Groups2Outlined />}
                  label={`${numberFormat.format(summary.members?.active || 0)} active members`}
                  variant="outlined"
                  sx={{
                    bgcolor: "#fff",
                    borderColor: "#dbe6ea"
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Here&apos;s what&apos;s happening in&nbsp;
                <Box
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: "#024f6e"
                  }}
                >
                  {workspace?.name || "your workspace"}
                </Box>.
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={loadDashboard} aria-label="Refresh dashboard" disabled={loading} sx={{ border: "1px solid #dbe6ea", bgcolor: "#fff" }}>
              {loading ? <CircularProgress size={20} /> : <RefreshRounded />}
            </IconButton>
          </Stack>
        </Stack>
      </Grid>

      <Grid size={12}>
        <Divider sx={{ borderColor: "#024F6E" }} />
      </Grid>

      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={loadDashboard}>Retry</Button>} sx={{ mb: 2 }}>{error}</Alert>}
      {!workspaceId && !loading && <Alert severity="info" sx={{ mb: 2 }}>Select or create a workspace to see its dashboard.</Alert>}


      <Grid size={12}>
        <Box
          sx={{
            height: "calc(100vh - 137px)",
            overflowY: "auto",
            pr: 2,
          }}
        >
          <Grid container spacing={2}>
            <Grid size={12}>
              <Grid container spacing={2}>
                {loading ? Array.from({ length: 4 }).map((_, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, xl: 3 }}><Skeleton variant="rounded" height={125} sx={{ borderRadius: 3 }} /></Grid>
                )) : (
                  <>
                    <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard label="In progress" value={tasks.byStatus?.["in-progress"]} helper={`${tasks.total || 0} tasks across this workspace`} Icon={AccessTimeRounded} tint="#1686a0" onClick={viewTask} /></Grid>
                    <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard label="Completed tasks" value={tasks.byStatus?.done} helper="Tasks marked as done" Icon={AssignmentTurnedInRounded} tint="#28966b" onClick={viewTask} /></Grid>
                    <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard label="Overdue" value={tasks.overdue} helper="Open tasks past their due date" Icon={ErrorOutlineRounded} tint="#d45445" onClick={viewTask} /></Grid>
                    <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard label="Active projects" value={projects.active} helper={`${projects.total || 0} total projects`} Icon={FolderOpenRounded} tint="#7553b5" onClick={() => navigate("/projects")} /></Grid>
                  </>
                )}
              </Grid>
            </Grid>

            <Grid size={12}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Card elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, height: "100%", border: "1px solid #e8edf0", borderRadius: 3 }}>
                    <SectionHeader
                      title="My tasks"
                      caption="Your next items across this workspace"
                      action="View all"
                      onAction={viewTask}
                    />
                    {loading ? (
                      <Stack
                        spacing={1}
                      >
                        {Array.from({ length: 4 }).map((_, index) => (
                          <Skeleton key={index} height={52} />
                        ))}
                      </Stack>
                    ) : myTasks.length ? (
                      <Stack
                        divider={<Divider flexItem />}
                      >
                        {myTasks.slice(0, 5).map((task) => (
                          <TaskRow key={task._id} task={task} onClick={viewTask} />
                        ))}
                      </Stack>
                    ) : (
                      <EmptyState
                        Icon={CheckCircleOutlineRounded}
                        text="You’re all caught up. Tasks assigned to you will show here."
                      />
                    )}
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      height: "100%",
                      border: "1px solid #E8EDF0",
                      borderRadius: 4
                    }}
                  >
                    <SectionHeader
                      title="Task overview"
                      caption="Current workspace progress"
                      action="Open tasks"
                      onAction={viewTask}
                    />
                    {loading ? (
                      <Stack spacing={1.5}>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <Skeleton key={index} height={30} />
                        ))}
                      </Stack>
                    ) : (
                      <Stack
                        spacing={1.75}
                        sx={{ mt: 2.75 }}
                      >
                        {taskStatuses.map((status) => {
                          const count = Number(tasks.byStatus?.[status.key]) || 0;
                          const percentage = taskTotal ? Math.min(100, (count / taskTotal) * 100) : 0;
                          return (
                            <Box key={status.key}>
                              <Stack
                                direction="row"
                                sx={{
                                  mb: 0.75,
                                  justifyContent: "space-between"
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600
                                  }}
                                >
                                  {status.label}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary">
                                  {numberFormat.format(count)}
                                </Typography>
                              </Stack>
                              <Box
                                sx={{
                                  height: 8,
                                  borderRadius: 99,
                                  bgcolor: "#EDF1F3",
                                  overflow: "hidden"
                                }}
                              >
                                <Box
                                  sx={{
                                    height: "100%",
                                    width: `${percentage}%`,
                                    borderRadius: 99,
                                    bgcolor: status.color,
                                    transition: "width .3s ease"
                                  }}
                                />
                              </Box>
                            </Box>
                          );
                        })}
                        <Divider />
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Due in the next 7 days</Typography>
                          <Chip size="small" icon={<CalendarMonthRounded />} label={numberFormat.format(tasks.upcoming || 0)} variant="outlined" />
                        </Stack>
                      </Stack>
                    )}
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 7 }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      height: "100%",
                      border: "1px solid #E8EDF0",
                      borderRadius: 3
                    }}
                  >
                    <SectionHeader
                      title="Upcoming deadlines"
                      caption="Due within the next 7 days"
                      action="View tasks"
                      onAction={viewTask}
                    />
                    {loading ? (
                      <Stack spacing={1}>
                        {Array.from({ length: 4 }).map((_, index) => (
                          <Skeleton key={index} height={52} />
                        ))}
                      </Stack>
                    ) : upcomingTasks.length ? (
                      <Stack divider={<Divider flexItem />}>
                        {upcomingTasks.slice(0, 5).map((task) => <TaskRow key={task._id} task={task} onClick={viewTask} />)}
                      </Stack>
                    ) : (
                      <EmptyState
                        Icon={CalendarMonthRounded}
                        text="No upcoming deadlines in the next 7 days."
                      />
                    )}
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      height: "100%",
                      border: "1px solid #E8EDF0",
                      borderRadius: 4
                    }}
                  >
                    <SectionHeader
                      title="Projects"
                      caption="Breakdown by status"
                      action="View projects"
                      onAction={() => navigate("/projects")}
                    />
                    {loading ? (
                      <Stack spacing={1}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Skeleton key={index} height={30} />
                        ))}
                      </Stack>
                    ) : (
                      <Stack spacing={0.35}>
                        {Object.entries(projectStatusLabels).map(([key, label]) => (
                          <Stack
                            key={key}
                            direction="row"
                            sx={{
                              py: 0.75,
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
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: key === "active" ?
                                    "#28966b" : key === "completed" ?
                                      "#1686a0" : key === "on_hold" ?
                                        "#d28a1f" : key === "cancelled" ?
                                          "#9aa9ae" : "#7553b5"
                                }} />
                              <Typography variant="body2">{label}</Typography>
                            </Stack>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700
                              }}
                            >
                              {numberFormat.format(Number(projects.byStatus?.[key]) || 0)}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      height: "100%",
                      border: "1px solid #E8EDF0",
                      borderRadius: 4
                    }}
                  >
                    <SectionHeader
                      title="Recently updated"
                      caption="The latest task changes in this workspace"
                      action="View tasks"
                      onAction={viewTask}
                    />
                    {loading ? (
                      <Stack spacing={1}>{Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} height={52} />
                      ))}
                      </Stack>
                    ) : recentTasks.length ? (
                      <Stack divider={<Divider flexItem />}>
                        {recentTasks.slice(0, 5).map((task) => (
                          <TaskRow key={task._id} task={task} onClick={viewTask} dateMode="updated" />
                        ))}
                      </Stack>
                    ) : (
                      <EmptyState
                        Icon={TaskAltRounded}
                        text="Your recently updated tasks will show here."
                      />
                    )}
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      height: "100%",
                      border: "1px solid #E8EDF0",
                      borderRadius: 4
                    }}
                  >
                    <SectionHeader
                      title="Recent chats"
                      caption="Latest conversations in this workspace"
                      action="Open chats"
                      onAction={() => navigate("/chats")}
                    />
                    {loading ? (
                      <Stack spacing={1}>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <Skeleton key={index} height={56} />
                        ))}
                      </Stack>
                    ) : recentConversations.length ? (
                      <Stack divider={<Divider flexItem />}>
                        {recentConversations.slice(0, 5).map((conversation) => {
                          const peers = (conversation.participants || []).filter((person) => String(person?._id || person) !== String(currentUserId));
                          const lastMessage = conversation.lastMessage;
                          return (
                            <Box
                              key={conversation._id}
                              onClick={() => navigate("/chats")}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.25,
                                py: 1.1,
                                cursor: "pointer"
                              }}
                            >
                              <AvatarGroup
                                max={2}
                                sx={{
                                  flexShrink: 0,
                                  "& .MuiAvatar-root": {
                                    width: 36,
                                    height: 36,
                                    fontSize: 13
                                  }
                                }}
                              >
                                {peers.map((person, index) => (
                                  <Avatar
                                    key={person?._id || index}
                                    src={person?.profile_picture}
                                  >
                                    {person?.name?.[0]?.toUpperCase()}
                                  </Avatar>
                                ))}
                              </AvatarGroup>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  noWrap
                                  sx={{
                                    fontWeight: 700
                                  }}
                                >
                                  {getConversationTitle(conversation, currentUserId)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                >
                                  {lastMessage?.text || "No messages yet"}
                                </Typography>
                              </Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ flexShrink: 0 }}
                              >
                                {lastMessage?.createdAt ?
                                  formatDate(lastMessage.createdAt, { hour: "numeric", minute: "2-digit" }) :
                                  ""
                                }
                              </Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    ) : (
                      <EmptyState Icon={ForumOutlined}
                        text="Start a conversation with your workspace members."
                        action="Go to chats"
                        onAction={() => navigate("/chats")}
                      />
                    )}
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}

function EmptyState({ Icon, text, action, onAction }) {
  return (
    <Stack
      spacing={1}
      sx={{
        minHeight: 150,
        textAlign: "center",
        color: "text.secondary",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          bgcolor: "#f0f6f7",
          color: "#56818d"
        }}
      >
        <Icon />
      </Box>
      <Typography
        variant="body2"
        sx={{ maxWidth: 300 }}
      >
        {text}
      </Typography>
      {action && (
        <Button size="small"
          endIcon={<ArrowForwardRounded />}
          onClick={onAction}>
          {action}
        </Button>
      )}
    </Stack>
  );
};

EmptyState.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  text: PropTypes.string.isRequired,
  action: PropTypes.string,
  onAction: PropTypes.func,
};
