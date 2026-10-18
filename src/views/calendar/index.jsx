
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Paper, Typography, Stack, Chip, Grid, Divider, Box, CircularProgress, Alert, Drawer, IconButton, } from "@mui/material";
import { CloseRounded, CalendarMonthRounded, FolderRounded, TaskAltRounded, FlagRounded, AccessTimeRounded, } from "@mui/icons-material";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import EventCalendar from '@fullcalendar/mui/pulse/EventCalendar';
import ProjectServices from "../../api/projects";
import TaskServices from "../../api/tasks";
import toastify from "../../components/toast";
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/mui/pulse/theme.css';
import './calendar.css';
import getChipColor from "../../utils/GetChipColor";

const extractProjects = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.projects)) {
    return response.data.projects;
  }
  if (Array.isArray(response?.projects)) {
    return response.projects;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
};

// API response se tasks ki array nikalna
const extractTasks = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.tasks)) {
    return response.data.tasks;
  }
  if (Array.isArray(response?.tasks)) {
    return response.tasks;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
};

// Date ko calendar-friendly YYYY-MM-DD format mein convert karna
const toCalendarDate = (value) => {
  if (!value) return null;

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// FullCalendar ka end exclusive hota hai.
// Project ki due date ko bhi calendar par include karna hai.
const getExclusiveEndDate = (value) => {
  const dateString = toCalendarDate(value);
  if (!dateString) return null;

  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
};

const renderEventContent = (eventInfo) => {
  const type = eventInfo.event.extendedProps.type;
  const isProject = type === "project";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        overflow: "hidden",
        px: 0.5,
        py: 0.25,
        borderRadius: "6px",
        background: isProject ? "#DCEAFE" : "#DDF5E5",
        width: "100%"
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          minWidth: 8,
          borderRadius: "50%",
          background: isProject ? "#174EA6" : "#176B3A",
        }}
      />

      <Typography
        variant="caption"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontWeight: 600,
          width: "100%"
        }}
      >
        {eventInfo.event.title}
      </Typography>
    </Box>
  );
};

function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isDrawerOpen = Boolean(selectedEvent);

  useEffect(() => {
    let isMounted = true;

    const fetchCalendarData = async () => {
      setLoading(true);
      setError("");

      try {
        // Projects aur tasks ko independently fetch karna
        const results = await Promise.allSettled([
          ProjectServices.getProjects({ limit: "all" }),
          TaskServices.getTasks(),
        ]);

        if (!isMounted) return;

        const [projectResult, taskResult] = results;

        const projects =
          projectResult.status === "fulfilled"
            ? extractProjects(projectResult.value)
            : [];

        const tasks =
          taskResult.status === "fulfilled"
            ? extractTasks(taskResult.value)
            : [];

        const calendarEvents = [];

        // Project events
        projects.forEach((project) => {
          const id = project._id || project.id;
          const start = toCalendarDate(project.startDate);
          const dueDate = toCalendarDate(project.dueDate);

          if (!id || (!start && !dueDate)) return;

          // Start date na ho to due date ko single-day event rakhein
          const eventStart = start || dueDate;

          calendarEvents.push({
            id: `project-${id}`,
            title: project.name || "Untitled Project",
            start: eventStart,
            ...(start && dueDate && start <= dueDate
              ? { end: getExclusiveEndDate(dueDate) }
              : {}),
            allDay: true,
            backgroundColor: "#DCEAFE",
            borderColor: "#DCEAFE",
            textColor: "#174EA6",
            extendedProps: {
              type: "project",
              status: project.status || "unknown",
              priority: project.priority || "",
              description: project.description || "",
              startDate: start,
              dueDate,
            },
          });
        });

        // Task events
        tasks.forEach((task) => {
          const id = task._id || task.id;
          const dueDate = toCalendarDate(task.dueDate);

          if (!id || !dueDate) return;

          const taskColors = {
            "in-progress": {
              backgroundColor: "#DDF5E5",
              borderColor: "#DDF5E5",
              textColor: "#176B3A",
            },
            paused: {
              backgroundColor: "#FCE8D5",
              borderColor: "#FCE8D5",
              textColor: "#934B08",
            },
            done: {
              backgroundColor: "#E8EAF0",
              borderColor: "#E8EAF0",
              textColor: "#424B5A",
            },
          };

          const colors = taskColors[task.status] || taskColors["in-progress"];

          calendarEvents.push({
            id: `task-${id}`,
            title: task.title || "Untitled Task",
            start: dueDate,
            allDay: true,
            ...colors,
            extendedProps: {
              type: "task",
              status: task.status || "unknown",
              priority: task.priority || "",
              description: task.description || "",
              dueDate,
            },
          });
        });

        setEvents(calendarEvents);

        const failedRequests = [];

        if (projectResult.status === "rejected") {
          failedRequests.push("Projects could not be loaded.");
          console.error("Projects API error:", projectResult.reason);
        }

        if (taskResult.status === "rejected") {
          failedRequests.push("Tasks could not be loaded.");
          console.error("Tasks API error:", taskResult.reason);
        }

        if (failedRequests.length) {
          setError(failedRequests.join(" "));
        }
      } catch (err) {
        console.error("Calendar data error:", err);

        if (isMounted) {
          setError("Calendar data load nahi ho saka. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCalendarData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEventClick = (info) => {
    const { event } = info;
    const { type } = event.extendedProps;
    const id = event.id.split("-")[1];
    getDetailsById(id, type);
  };

  const formatDate = (value) => {
    if (!value) return "Not set";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not set";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDetailsById = async (id, type) => {
    try {
      const promise = type === "project" ? ProjectServices.getProjectById(id) : TaskServices.getTaskById(id);
      const result = await toastify(promise);

      if (!result?.status || !result?.data) return;

      const data = result.data;

      setSelectedEvent({
        id: data._id,
        title: type === "project" ? data.name : data.title,
        type,
        status: data.status,
        priority: data.priority,
        description: data.description,
        startDate: data.startDate,
        dueDate: data.dueDate,
        tasks: type === "project" ? (data.task || data.tasks || []) : [],
        project: type === "task" ? (data.project && typeof data.project === "object" ? data.project : null) : null,
        link: type === "project" ? data.link : null,
        color: type === "project" ? data.color : null,
      });
    } catch (error) {
      toastify(error);
    };
  };

  return (
    <Fragment>
      <Drawer
        open={isDrawerOpen}
        onClose={() => setSelectedEvent(null)}
        anchor="right"
        slotProps={{
          paper: {
            sx: {
              width: 420,
              maxWidth: "100%",
              bgcolor: "#F8FAFC",
            },
          }
        }}
      >
        {/* Drawer header */}
        <Box
          sx={{
            p: 3,
            bgcolor: "#FFFFFF",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            sx={{
              alignItems: "flex-start",
              justifyContent: "space-between"
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor:
                    selectedEvent?.type === "project"
                      ? "#DCEAFE"
                      : "#DDF5E5",
                  color:
                    selectedEvent?.type === "project"
                      ? "#174EA6"
                      : "#176B3A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {selectedEvent?.type === "project" ? (
                  <FolderRounded />
                ) : (
                  <TaskAltRounded />
                )}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 700,
                  }}
                >
                  {selectedEvent?.type === "project"
                    ? "Project details"
                    : "Task details"}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    overflowWrap: "anywhere",
                    mt: 0.25,
                  }}
                >
                  {selectedEvent?.title || "Untitled"}
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={() => setSelectedEvent(null)}
              aria-label="Close details"
              size="small"
              sx={{
                width: 40,
                height: 40,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#FFFFFF",
              }}
            >
              <CloseRounded />
            </IconButton>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ mt: 2, flexWrap: "wrap" }}
          >
            <Chip
              size="small"
              label={
                selectedEvent?.type === "project" ? "Project" : "Task"
              }
              sx={{
                bgcolor:
                  selectedEvent?.type === "project"
                    ? "#DCEAFE"
                    : "#DDF5E5",
                color:
                  selectedEvent?.type === "project"
                    ? "#174EA6"
                    : "#176B3A",
                fontWeight: 600,
              }}
            />

            {selectedEvent?.status && (
              <Chip
                size="small"
                variant="filled"
                color={getChipColor(selectedEvent.status)}
                label={selectedEvent.status.replaceAll(/[-_]/g, " ")}
                sx={{
                  fontWeight: 600,
                }}
              />
            )}

            {selectedEvent?.priority && (
              <Chip
                size="small"
                variant="outlined"
                color={getChipColor(selectedEvent.priority)}
                icon={<FlagRounded />}
                label={selectedEvent.priority}
                sx={{
                  fontWeight: 600,
                  "& .MuiChip-icon": {
                    color: "inherit",
                  },
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Drawer content */}
        <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Description
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2.5,
                bgcolor: "#FFFFFF",
              }}
            >
              <Typography
                variant="body2"
                color={
                  selectedEvent?.description
                    ? "text.primary"
                    : "text.secondary"
                }
                sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
              >
                {selectedEvent?.description || "No description provided."}
              </Typography>
            </Paper>
          </Box>

          {/* Dates */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Timeline
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2.5,
                bgcolor: "#FFFFFF",
              }}
            >
              {selectedEvent?.type === "project" ? (
                <Stack>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <CalendarMonthRounded
                      sx={{ color: "#024F6E" }}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Start date
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(selectedEvent?.startDate)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2, borderColor: "#D0D0D0" }} />

                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <AccessTimeRounded
                      sx={{ color: "#024F6E" }}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Due date
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(selectedEvent?.dueDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <CalendarMonthRounded sx={{ color: "#024F6E" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Task deadline
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {formatDate(selectedEvent?.dueDate)}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Paper>
          </Box>

          {/* Related project for task */}
          {selectedEvent?.type === "task" && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Related project
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2.5,
                  bgcolor: "#FFFFFF",
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <FolderRounded sx={{ color: "#174EA6" }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ overflowWrap: "anywhere" }}
                    >
                      {selectedEvent?.project?.name || "No linked project"}
                    </Typography>

                    {selectedEvent?.project?.dueDate && (
                      <Typography variant="caption" color="text.secondary">
                        Due {formatDate(selectedEvent.project.dueDate)}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Box>
          )}

          {/* Tasks associated with project */}
          {selectedEvent?.type === "project" && (
            <Box sx={{ mb: 2 }}>
              <Stack
                direction="row"
                sx={{
                  mb: 1,
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700 }}
                >
                  Project tasks
                </Typography>

                <Chip
                  size="small"
                  label={selectedEvent?.tasks?.length || 0}
                />
              </Stack>

              {selectedEvent?.tasks?.length > 0 ? (
                <Stack spacing={1}>
                  {selectedEvent.tasks.map((task) => (
                    <Paper
                      key={task._id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "#FFFFFF",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                      >
                        <TaskAltRounded
                          sx={{
                            mt: 0.2,
                            fontSize: 19,
                            color: "#176B3A",
                          }}
                        />

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ overflowWrap: "anywhere" }}
                          >
                            {task.title || "Untitled task"}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            sx={{ mt: 0.75, flexWrap: "wrap" }}
                          >
                            {task.status && (
                              <Chip
                                size="small"
                                variant="outlined"
                                label={task.status.replaceAll("-", " ")}
                              />
                            )}

                            {task.dueDate && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ alignSelf: "center" }}
                              >
                                Due {formatDate(task.dueDate)}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2.5,
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <TaskAltRounded
                    sx={{ color: "text.disabled", fontSize: 28, mb: 0.5 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    No tasks are linked to this project.
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Project link */}
          {selectedEvent?.type === "project" && selectedEvent?.link && (
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Project link
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2.5,
                  bgcolor: "#FFFFFF",
                }}
              >
                <Typography
                  component="a"
                  href={
                    /^https?:\/\//i.test(selectedEvent.link)
                      ? selectedEvent.link
                      : `https://${selectedEvent.link}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{
                    color: "#024F6E",
                    overflowWrap: "anywhere",
                  }}
                >
                  {selectedEvent.link}
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Drawer>

      <Grid container spacing={2}>
        <Grid size={12}>
          <Stack
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="h1" sx={{ fontSize: 24, fontWeight: 600 }}>
                Calendar
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage your project timelines and task deadlines.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              <Chip
                label={"Projects"}
                icon={<Box
                  sx={{
                    width: 8,
                    height: 8,
                    minWidth: 8,
                    borderRadius: "50%",
                    background: "#174EA6"
                  }}
                />}
                sx={{
                  bgcolor: "#DCEAFE",
                  color: "#174EA6",
                  "&.MuiChip-root": {
                    "& .MuiChip-icon": {
                      marginLeft: "10px"
                    }
                  }
                }}
              />
              <Chip
                label="Tasks"
                icon={<Box
                  sx={{
                    width: 8,
                    height: 8,
                    minWidth: 8,
                    borderRadius: "50%",
                    background: "#176B3A"
                  }}
                />}
                sx={{
                  bgcolor: "#DDF5E5",
                  color: "#176B3A",
                  "&.MuiChip-root": {
                    "& .MuiChip-icon": {
                      marginLeft: "10px"
                    }
                  }
                }}
              />
            </Stack>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ borderColor: "#024F6E" }} />
        </Grid>

        <Grid size={12}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1, sm: 2 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "24px",
              minWidth: 0,
              height: "calc(100vh - 132px)"
            }}
          >
            {loading ? (
              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 2,
                }}
              >
                <CircularProgress size={26} />
              </Box>
            ) : (
              <EventCalendar
                height={512}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                availableViews={['dayGridMonth', 'dayGridWeek', 'listWeek']}
                editable
                selectable
                nowIndicator
                navLinks
                events={events}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default Calendar;
