import React, { Fragment, useState, useEffect } from 'react';
import { Alert, Avatar, AvatarGroup, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, LinearProgress, ListItemIcon, ListItemText, Menu, MenuItem, Skeleton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { AccountCircleOutlined, AssignmentIndOutlined, BorderColorOutlined, ChangeHistoryRounded, CircleOutlined, DeleteOutlineRounded, AttachFileOutlined, MessageOutlined, MoreHorizOutlined, SearchRounded, StarBorderRounded, VisibilityOutlined } from '@mui/icons-material';
import { DragDropProvider, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/react';
import TaskServices from "../../api/tasks"
import TaskDialog from '../../components/task_dialog';
import TaskDetailsDialog from '../../components/task_details_dialog';
import toastify from '../../components/toast';
import useStore from '../../config/zustand';
import useAuth from '../../hooks/useAuth';
import MemberServices from '../../api/members';
import { toast } from 'react-hot-toast';

function TaskMenu({ anchorEl, open, handleClose, task, onEdit, onDelete, onClick, onAssign, onAssignToMe }) {
  const handleClick = (option) => {
    onClick({ status: option, project: task.project });
    handleClose();
  };

  const statusOptions = [
    {
      value: "in-progress",
      label: "Move to In Progress",
      Icon: CircleOutlined,
    },
    {
      value: "paused",
      label: "Move to Paused",
      Icon: ChangeHistoryRounded,
    },
    {
      value: "done",
      label: "Move to Done",
      Icon: StarBorderRounded,
    },
  ].filter((option) => option.value !== task?.status);

  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      sx={{
        "& .MuiList-root": {
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }
      }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {statusOptions.map(({ value, label, Icon }) => (
        <MenuItem
          key={value}
          onClick={() => handleClick(value)}
          sx={{ gap: 2, py: "3px !important" }}
        >
          <ListItemIcon
            sx={{
              "&.MuiListItemIcon-root": {
                background: "#D4D4D4",
                justifyContent: "center",
                p: "2px",
                borderRadius: "4px",
                width: 24,
                minWidth: 0,
              },
            }}
          >
            <Icon
              fontSize="small"
              sx={{ fill: "#024F6E !important" }}
            />
          </ListItemIcon>

          <ListItemText
            sx={{
              "& .MuiTypography-root": {
                fontSize: "14px",
              },
            }}
            primary={label}
          />
        </MenuItem>
      ))}
      <Divider sx={{ borderColor: "#024F6E" }} />
      <MenuItem
        onClick={() => {
          handleClose();
          onAssign?.(task);
        }}
        sx={{
          gap: 2,
          py: "3px !important"
        }}
      >
        <ListItemIcon sx={{
          "&.MuiListItemIcon-root": {
            background: "#D4D4D4",
            justifyContent: "center",
            p: "2px",
            borderRadius: "4px",
            width: 24,
            minWidth: 0
          }
        }}
        >
          <AssignmentIndOutlined fontSize="small" sx={{ fill: "#024F6E !important" }} />
        </ListItemIcon>
        <ListItemText
          sx={{
            "& .MuiTypography-root": {
              fontSize: "14px"
            }
          }}
          primary={"Assign to ..."}
        />
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleClose();
          onAssignToMe?.(task);
        }}
        sx={{
          gap: 2,
          py: "3px !important"
        }}
      >
        <ListItemIcon sx={{
          "&.MuiListItemIcon-root": {
            background: "#D4D4D4",
            justifyContent: "center",
            p: "2px",
            borderRadius: "4px",
            width: 24,
            minWidth: 0
          }
        }}
        >
          <AccountCircleOutlined fontSize="small" sx={{ fill: "#024F6E !important" }} />
        </ListItemIcon>
        <ListItemText
          sx={{
            "& .MuiTypography-root": {
              fontSize: "14px"
            }
          }}
          primary={"Assign to me"}
        />
      </MenuItem>
      <Divider sx={{ borderColor: "#024F6E" }} />
      <MenuItem sx={{ gap: 2, py: "3px !important" }}
        onClick={() => onEdit(task)}
      >
        <ListItemIcon
          sx={{
            "&.MuiListItemIcon-root": {
              background: "#D4D4D4",
              justifyContent: "center",
              p: "2px",
              borderRadius: "4px",
              width: 24,
              minWidth: 0
            }
          }}
        >
          <BorderColorOutlined fontSize="small" sx={{ fill: "#024F6E !important" }} />
        </ListItemIcon>
        <ListItemText
          sx={{
            "& .MuiTypography-root": {
              fontSize: "14px"
            }
          }}
          primary={"Edit"}
        />
      </MenuItem>
      <MenuItem sx={{ gap: 2, py: "3px !important" }}
        onClick={() => onDelete(task)}
      >
        <ListItemIcon
          sx={{
            "&.MuiListItemIcon-root": {
              background: "#D4D4D4",
              justifyContent: "center",
              p: "2px",
              borderRadius: "4px",
              width: 24,
              minWidth: 0,
            },
          }}
        >
          <DeleteOutlineRounded fontSize="small" sx={{ fill: "#024F6E !important" }} />
        </ListItemIcon>
        <ListItemText
          sx={{
            "& .MuiTypography-root": {
              fontSize: "14px"
            }
          }}
          primary="Delete"
        />
      </MenuItem>
    </Menu>
  );
};

function TaskCard({ item, onMenuClick, onDetailsClick }) {
  const progress = item?.progressPercentage || 0;
  return (
    <Box
      sx={{
        background: '#F5F5F5',
        padding: 2,
        border: '1px solid #E0E0E0',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
          <Typography variant="body1" fontWeight={600}>{item.title}</Typography>
          <Typography variant="body2" color="primary.main">{item.category}</Typography>
          {item.status === "done" && item.completedBy && (
            <Typography variant="caption" color="text.secondary">
              Completed by {item.completedBy.name || item.completedBy.email || "Workspace member"}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <IconButton
            sx={{ padding: 1 }}
            onClick={onDetailsClick}
            aria-label="View task details"
          >
            <VisibilityOutlined sx={{ fill: "#024F6E !important", fontSize: "16px" }} />
          </IconButton>
          <IconButton sx={{ padding: 0 }} onClick={onMenuClick}>
            <MoreHorizOutlined sx={{ fill: "#024F6E !important" }} />
          </IconButton>
        </Box>
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: '#808080', fontWeight: 500,
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'break-word',
        }}
      >
        {item.description}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MessageOutlined sx={{ width: 18, height: 18, fill: "#024F6E !important" }} />
            <Typography variant="body2">{item.commentCount || 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ transform: 'rotate(45deg)', display: 'flex' }}>
              <AttachFileOutlined sx={{ width: 18, height: 18, fill: "#024F6E !important" }} />
            </Box>
            <Typography variant="body2">{item.attachmentCount || 0}</Typography>
          </Box>
        </Box>
        <AvatarGroup
          total={item.assignees?.length || 0}
          slotProps={{ surplus: { sx: { width: 24, height: 24, fontSize: 12 } } }}
        >
          {(item.assignees || []).slice(0, 2).map((assignee, ind) => (
            <Tooltip key={assignee._id || ind} title={assignee.name || assignee.email || "Workspace member"}>
              <Avatar
                alt={assignee.name}
                src={assignee.profile_picture}
                sx={{ width: 24, height: 24 }}
              />
            </Tooltip>
          ))}
        </AvatarGroup>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">{`${progress}%`}</Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ width: '100%', borderRadius: 8 }}
        />
        <Typography variant="body2">
          {`${item.completedSubtasks || 0}/${item.totalSubtasks || 0}`}
        </Typography>
      </Box>
    </Box>
  );
};

function DraggableTask({ task, columnKey, index, onMenuClick, onDetailsClick }) {
  const draggable = useDraggable({
    id: task._id,
    data: {
      projectId: task.project,
      column: columnKey,
      index,
    },
  });

  return (
    <Box
      ref={draggable.ref}
      sx={{
        cursor: draggable.isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      <TaskCard
        item={task}
        onMenuClick={(event) => onMenuClick(event, task)}
        onDetailsClick={() => onDetailsClick(task)}
      />
    </Box>
  );
};

function DroppableColumn({ columnKey, title, Icon, tasks, onMenuClick, onDetailsClick, }) {
  const droppable = useDroppable({
    id: columnKey,
  });

  return (
    <Grid size={4}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ px: 1 }}>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ lineHeight: 0 }}>
              <Icon
                sx={{
                  width: 18,
                  height: 18,
                  fill: "#024F6E !important"
                }}
              />
            </Box>

            <Box component="span" sx={{ lineHeight: 1 }}>
              {title}
            </Box>
          </Typography>
        </Box>

        <Box
          ref={droppable.ref}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            borderRadius: '16px',
            height: 'calc(100vh - 167px)',
            overflowY: 'auto',
            padding: 1,
            transition: 'border 0.2s',
            boxShadow: "0px 0px 15px 5px #EEEEEE80",
            border: droppable.isDropTarget
              ? '1px dashed #006086'
              : '1px solid #E8EDF0',
          }}
        >
          {tasks.length > 0 ? (
            tasks.map((task, idx) => (
              <DraggableTask
                key={task._id}
                task={task}
                columnKey={columnKey}
                index={idx}
                onMenuClick={onMenuClick}
                onDetailsClick={onDetailsClick}
              />
            ))
          ) : (
            <Typography
              sx={{
                textAlign: 'center',
                color: '#aaa',
                mt: 4
              }}
            >
              No tasks
            </Typography>
          )}
        </Box>
      </Box>
    </Grid>
  );
};

const mapTasksToColumns = (tasks = []) => {
  return {
    inProgress: tasks.filter((task) => task.status === 'in-progress'),
    paused: tasks.filter((task) => task.status === 'paused'),
    done: tasks.filter((task) => task.status === 'done'),
  };
};

const mergeUpdatedTask = (oldTask, updatedTask) => {
  if (!updatedTask) return oldTask;
  if (!oldTask) return updatedTask;

  return {
    ...oldTask,
    ...updatedTask,
    commentCount: updatedTask?.commentCount ?? oldTask.commentCount ?? 0,
    attachmentCount: updatedTask?.attachmentCount ?? oldTask.attachmentCount ?? 0,
  }
};

export default function Tasks() {
  const [columns, setColumns] = useState({
    inProgress: [],
    paused: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);
  const [assigningTask, setAssigningTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState([]);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const { user } = useAuth();
  const { workspace } = useStore();

  const open = Boolean(anchorEl);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await TaskServices.getTasks(workspace._id);
      const tasks = response?.data || [];
      setColumns(mapTasksToColumns(tasks));
    } catch (error) {
      console.error("FETCH TASKS ERROR:", error);
      setError(error?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [workspace?._id]);

  const getTaskById = (id) => {
    for (const colKey of Object.keys(columns)) {
      const found = columns[colKey].find(t => t._id === id);
      if (found) return found;
    }
    return null;
  };

  const activeTask = activeId ? getTaskById(activeId) : null;

  const findColumnOfTask = (id) => {
    if (columns.inProgress.find(t => t._id === id)) return 'inProgress';
    if (columns.paused.find(t => t._id === id)) return 'paused';
    if (columns.done.find(t => t._id === id)) return 'done';
    return null;
  };

  const columnStatusMap = {
    inProgress: "in-progress",
    paused: "paused",
    done: "done",
  };

  const handleMenuClick = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleDragStart = (event) => {
    const sourceId = event.operation.source?.id;
    setActiveId(sourceId);
  };

  const handleDragEnd = async (event) => {
    if (event.canceled) {
      setActiveId(null);
      return;
    };

    const { source, target, source: { data: { projectId } } } = event.operation;

    setActiveId(null);

    if (!source || !target) {
      return;
    };

    const activeId = source.id;
    const destinationColumnKey = target.id;
    const sourceColumnKey = findColumnOfTask(activeId);

    if (!sourceColumnKey || !destinationColumnKey) {
      return;
    }

    if (sourceColumnKey === destinationColumnKey) {
      return;
    }

    const newStatus = columnStatusMap[destinationColumnKey];

    if (!newStatus) {
      return;
    }

    const sourceTasks = [...columns[sourceColumnKey]];

    const taskIndex = sourceTasks.findIndex(
      (task) => task._id === activeId
    );

    if (taskIndex === -1) {
      return;
    };

    try {
      const promise = TaskServices.updateTask(workspace?._id, activeId, {
        status: newStatus,
        project: projectId
      });

      const response = await toastify(promise);
      const updatedTask = response?.data;

      if (!updatedTask) {
        throw new Error("Task status was not updated");
      }

      sourceTasks.splice(taskIndex, 1);

      const oldTask = columns[sourceColumnKey].find((task) => task._id === activeId);
      const mergedTask = mergeUpdatedTask(oldTask, updatedTask);

      sourceTasks.splice(taskIndex, 1);

      const destinationTasks = [
        ...columns[destinationColumnKey],
        mergedTask,
      ];

      setColumns((prev) => ({
        ...prev,
        [sourceColumnKey]: prev[sourceColumnKey].filter(
          (task) => task._id !== activeId
        ),
        [destinationColumnKey]: [
          ...prev[destinationColumnKey],
          mergedTask,
        ],
      }));

      setColumns((prev) => ({
        ...prev,
        [sourceColumnKey]: sourceTasks,
        [destinationColumnKey]: destinationTasks,
      }));
    } catch (error) {
      console.error("❌ DRAG STATUS UPDATE ERROR:", error);
    }
  };

  const handleSubmitTask = async (formData, editTask) => {
    if (editTask) {
      try {
        setUpdatingTask(true);

        const promise = await TaskServices.updateTask(workspace?._id, editTask._id, formData);
        const response = await toastify(promise);
        const updatedTask = response?.data;

        if (!updatedTask) {
          throw new Error("Task was not updated");
        };

        setColumns((prev) => {
          const newColumns = {
            inProgress: [],
            paused: [],
            done: [],
          };

          Object.values(prev)
            .flat()
            .map((task) =>
              task._id === updatedTask._id
                ? mergeUpdatedTask(task, updatedTask)
                : task
            ).forEach((task) => {
              if (task.status === "in-progress") {
                newColumns.inProgress.push(task);
              } else if (task.status === "paused") {
                newColumns.paused.push(task);
              } else if (task.status === "done") {
                newColumns.done.push(task);
              }
            });

          return newColumns;
        });

        setEditingTask(null);
        setCreateTaskOpen(false);

        return true;
      } catch (error) {
        toastify(error);
        return false;
      } finally {
        setUpdatingTask(false);
      }
    }

    try {
      setCreatingTask(true);

      const promise = TaskServices.createTask(workspace?._id, formData);
      const response = await toastify(promise);

      const createdTask = response?.data;

      if (!createdTask) {
        throw new Error("Task was not created");
      };

      const normalizedTask = {
        ...createdTask,
        attachmentCount: createdTask.attachments?.length ?? 0,
        commentCount: createdTask.comments?.length ?? 0,
      };

      setColumns((prev) => {
        const columnMap = {
          "in-progress": "inProgress",
          paused: "paused",
          done: "done",
        };

        const columnKey = columnMap[createdTask.status] || "inProgress";

        return {
          ...prev,
          [columnKey]: [
            ...prev[columnKey],
            normalizedTask,
          ],
        };
      });

      setCreateTaskOpen(false);

      return true;
    } catch (error) {
      console.error("CREATE TASK ERROR:", error);
      return false;
    } finally {
      setCreatingTask(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    handleMenuClose();
    setCreateTaskOpen(true);
  };

  const handleDeleteTask = async (task) => {
    if (!task?._id) return;

    try {
      setDeletingTask(true);

      const promise = TaskServices.deleteTask(task._id);
      await toastify(promise);

      setColumns((prev) => ({
        inProgress: prev.inProgress.filter(
          (item) => item._id !== task._id
        ),
        paused: prev.paused.filter(
          (item) => item._id !== task._id
        ),
        done: prev.done.filter(
          (item) => item._id !== task._id
        ),
      }));

      handleMenuClose();
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);
    } finally {
      setDeletingTask(false);
    }
  };

  const handleClick = async (status) => {
    if (!selectedTask?._id) return;
    try {
      const promise = TaskServices.updateTask(workspace?._id, selectedTask._id, status);
      const response = await toastify(promise);
      const updatedTask = response?.data;

      if (!updatedTask) {
        throw new Error("Task status was not updated");
      };

      setColumns((prev) => {
        const newColumns = {
          inProgress: [],
          paused: [],
          done: [],
        };

        const columnMap = {
          "in-progress": "inProgress",
          paused: "paused",
          done: "done",
        };

        Object.values(prev).flat().map((task) =>
          task._id === updatedTask._id
            ? mergeUpdatedTask(task, updatedTask)
            : task
        ).forEach((task) => {
          const columnKey = columnMap[task.status];

          if (columnKey) {
            newColumns[columnKey].push(task);
          };
        });
        return newColumns;
      });

      handleMenuClose();
    } catch (error) {
      console.error("MENU STATUS UPDATE ERROR:", error);
    };
  };

  const openAssigneePicker = async (task) => {
    if (!workspace?._id || !task?._id) return;
    setAssigningTask(task);
    setMemberSearch("");
    setAssignmentError("");
    setSelectedAssigneeIds((task.assignees || []).map((member) => String(member?._id || member)));
    setMembersLoading(true);
    try {
      const response = await MemberServices.getMembers(workspace._id);
      const records = Array.isArray(response?.data) ? response.data : [];
      setMembers(records.map((record) => record.user || record).filter((member) => member?._id));
    } catch (requestError) {
      setAssignmentError(requestError?.message || "Could not load workspace members.");
    } finally {
      setMembersLoading(false);
    }
  };

  const saveAssignees = async (assigneeIds = selectedAssigneeIds, taskOverride = null) => {
    const targetTask = taskOverride || assigningTask;
    if (!targetTask?._id || !workspace?._id) return;
    try {
      setAssignmentSaving(true);
      setAssignmentError("");
      const response = await toastify(TaskServices.updateTask(workspace._id, targetTask._id, {
        project: targetTask.project?._id || targetTask.project,
        assignees: assigneeIds,
      }));
      const updatedTask = response?.data;
      if (!updatedTask) throw new Error("Task assignment was not updated");
      setColumns((prev) => Object.fromEntries(Object.entries(prev).map(([key, items]) => [
        key,
        items.map((item) => item._id === updatedTask._id ? mergeUpdatedTask(item, updatedTask) : item),
      ])));
      setTaskDetails((prev) => prev?._id === updatedTask._id ? { ...prev, ...updatedTask } : prev);
      setAssigningTask(null);
    } catch (requestError) {
      if (taskOverride) toast.error(requestError?.message || "Could not assign this task.");
      else setAssignmentError(requestError?.message || "Could not save task assignment.");
    } finally {
      setAssignmentSaving(false);
    }
  };

  const filteredMembers = members.filter((member) =>
    `${member.name || ""} ${member.email || ""}`.toLowerCase().includes(memberSearch.trim().toLowerCase())
  );

  if (error) {
    return (
      <Typography color="error">
        {error}
      </Typography>
    )
  };

  return (
    <Fragment>
      <TaskDialog
        open={createTaskOpen}
        onClose={() => {
          setEditingTask(null);
          setCreateTaskOpen(false);
        }}
        onSubmit={handleSubmitTask}
        loading={editingTask ? updatingTask : creatingTask}
        editTask={editingTask}
      />
      <TaskMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleMenuClose}
        task={selectedTask}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
        onClick={(o) => handleClick(o)}
        onAssign={openAssigneePicker}
        onAssignToMe={(task) => {
          if (user?._id) {
            saveAssignees([String(user._id)], task);
          }
        }}
      />
      <Dialog
        open={Boolean(assigningTask)}
        onClose={() => !assignmentSaving && setAssigningTask(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Assign task</DialogTitle>
        <DialogContent>
          {assignmentError && (
            <Alert severity="error" sx={{ mt: 1 }}>{assignmentError}</Alert>
          )}
          <TextField
            fullWidth
            size="small"
            placeholder="Search workspace members"
            value={memberSearch}
            onChange={(event) => setMemberSearch(event.target.value)}
            sx={{ mt: 1, mb: 1.5 }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              }
            }}
          />
          {membersLoading ? (
            <Box
              sx={{
                py: 4,
                display: "flex",
                justifyContent: "center"
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box sx={{ maxHeight: 340, overflowY: "auto" }}>
              {filteredMembers.map((member) => {
                const memberId = String(member._id);
                const checked = selectedAssigneeIds.includes(memberId);
                return (
                  <Box
                    key={memberId}
                    onClick={() => setSelectedAssigneeIds((prev) => checked ?
                      prev.filter((id) => id !== memberId) :
                      [...prev, memberId]
                    )}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      py: 0.75,
                      px: 0.5,
                      borderRadius: 1,
                      "&:hover": {
                        bgcolor: "action.hover"
                      }
                    }}
                  >
                    <Checkbox checked={checked} tabIndex={-1} />
                    <Avatar
                      src={member.profile_picture}
                      alt={member.name}
                      sx={{ width: 34, height: 34, mr: 1.25 }}>
                      {member.name?.[0]}
                    </Avatar>
                    <Box
                      sx={{ minWidth: 0 }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}>
                        {member.name || "Workspace member"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {member.email}
                      </Typography>
                    </Box>
                  </Box>
                )
              })}
              {!filteredMembers.length && (
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ py: 3, textAlign: "center" }}>
                  No active workspace members found.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setAssigningTask(null)}
            disabled={assignmentSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => saveAssignees()}
            disabled={assignmentSaving || membersLoading}
          >
            {assignmentSaving ?
              <CircularProgress size={18} color="inherit" /> :
              "Save assignment"
            }
          </Button>
        </DialogActions>
      </Dialog>
      <TaskDetailsDialog
        open={Boolean(taskDetails)}
        task={taskDetails}
        onClose={() => setTaskDetails(null)}
        onTaskUpdated={(taskId, changes) => {
          setColumns((prev) => {
            const updateColumn = (items) =>
              items.map((item) =>
                item._id === taskId
                  ? { ...item, ...changes }
                  : item
              );

            return {
              inProgress: updateColumn(prev.inProgress),
              paused: updateColumn(prev.paused),
              done: updateColumn(prev.done),
            };
          });
        }}
        workspaceId={workspace?._id}
      />

      <Grid container spacing={2}>
        <Grid size={12}>
          <Stack
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="h1" sx={{ fontSize: 24, fontWeight: 600 }}>
                Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage your project's tasks.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => {
                setEditingTask(null);
                setCreateTaskOpen(true);
              }}
              sx={{
                fontSize: "20px",
                lineHeight: 1.2,
              }}
            >
              +
            </Button>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ borderColor: "#024F6E" }} />
        </Grid>

        <Grid size={12}>
          {loading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Grid key={i} size={4} >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant='rounded' />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        borderRadius: '16px',
                        height: 'calc(100vh - 167px)',
                        overflowY: 'auto',
                        padding: 1,
                        transition: 'border 0.2s',
                        boxShadow: "0px 0px 5px 3px #40404020",
                      }}
                    >
                      {Array.from({ length: 3 }).map((_, j) => (
                        <Skeleton
                          key={j}
                          variant='rounded'
                          sx={{
                            width: "100%",
                            height: "173.94px",
                            borderRadius: "12px"
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <DragDropProvider
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <Grid container spacing={2}>
                <DroppableColumn
                  columnKey="inProgress"
                  title="In Progress"
                  Icon={CircleOutlined}
                  tasks={columns.inProgress}
                  onMenuClick={handleMenuClick}
                  onDetailsClick={(task) => setTaskDetails(task)}
                />
                <DroppableColumn
                  columnKey="paused"
                  title="Paused"
                  Icon={ChangeHistoryRounded}
                  tasks={columns.paused}
                  onMenuClick={handleMenuClick}
                  onDetailsClick={(task) => setTaskDetails(task)}
                />
                <DroppableColumn
                  columnKey="done"
                  title="Done"
                  Icon={StarBorderRounded}
                  tasks={columns.done}
                  onMenuClick={handleMenuClick}
                  onDetailsClick={(task) => setTaskDetails(task)}
                />
              </Grid>

              <DragOverlay dropAnimation={null}>
                {activeTask ? (
                  <Box
                    sx={{
                      transform: 'rotate(15deg)',
                      transformOrigin: 'center center',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                      borderRadius: '12px',
                    }}
                  >
                    <TaskCard
                      item={activeTask}
                    />
                  </Box>
                ) : null}
              </DragOverlay>
            </DragDropProvider>
          )}
        </Grid>
      </Grid>
    </Fragment>
  );
};
