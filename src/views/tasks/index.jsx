import React, { Fragment, useState, useEffect } from 'react';
import { Box, Button, Grid, Typography, LinearProgress, AvatarGroup, Avatar, IconButton, Menu, MenuItem, ListItemIcon, Divider, ListItemText, CircularProgress } from '@mui/material';
import { CircleOutlined, ChangeHistoryRounded, StarBorderRounded, MessageOutlined, AttachFileOutlined, MoreHorizOutlined, DeleteOutlineRounded, AccountCircleOutlined, BorderColorOutlined, AssignmentIndOutlined } from '@mui/icons-material';
import { DragDropProvider, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/react';
import TaskServices from "../../api/tasks"
import CreateTask from '../../components/create_task';

function TaskMenu({ anchorEl, open, handleClose, task, onEdit, onDelete }) {
  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      onClick={handleClose}
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
      <MenuItem onClick={handleClose} sx={{ gap: 2, py: "3px !important" }}>
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
          <ChangeHistoryRounded fontSize="small" sx={{ fill: "#024F6E !important" }} />
        </ListItemIcon>
        <ListItemText
          sx={{
            "& .MuiTypography-root": {
              fontSize: "14px"
            }
          }}
          primary={"Move to Paused"}
        />
      </MenuItem>
      <MenuItem onClick={handleClose} sx={{ gap: 2, py: "3px !important" }}>
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
          <StarBorderRounded fontSize="small" sx={{ fill: "#024F6E !important" }} />
        </ListItemIcon>
        <ListItemText
          sx={{
            "& .MuiTypography-root": {
              fontSize: "14px"
            }
          }}
          primary={"Move to Done"}
        />
      </MenuItem>
      <Divider sx={{ borderColor: "#024F6E" }} />
      <MenuItem onClick={handleClose} sx={{ gap: 2, py: "3px !important" }}>
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
      <MenuItem onClick={handleClose} sx={{ gap: 2, py: "3px !important" }}>
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

function TaskCard({ item, onMenuClick }) {
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
        </Box>
        <IconButton sx={{ padding: 0 }} onClick={onMenuClick}>
          <MoreHorizOutlined sx={{ fill: "#024F6E !important" }} />
        </IconButton>
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: '#808080', fontWeight: 500,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
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
            <Avatar
              key={assignee._id || ind}
              alt={assignee.name}
              src={assignee.profile_picture}
              sx={{ width: 24, height: 24 }}
            />
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

function DraggableTask({ task, columnKey, index, onMenuClick }) {
  const draggable = useDraggable({
    id: task._id,
    data: {
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
      />
    </Box>
  );
};

function DroppableColumn({ columnKey, title, Icon, tasks, onMenuClick }) {
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
            height: 'calc(100vh - 136px)',
            overflowY: 'auto',
            padding: 1,
            transition: 'border 0.2s',
            boxShadow: "0px 0px 5px 3px #40404020",
            border: droppable.isDropTarget
              ? '2px dashed #024F6E'
              : '2px solid transparent',
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

  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await TaskServices.getTasks();
        const tasks = response?.data || [];
        setColumns(mapTasksToColumns(tasks));
      } catch (error) {
        console.error("FETCH TASKS ERROR:", error);
        setError(error?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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

    const { source, target } = event.operation;

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
      const response = await TaskServices.updateTask(activeId, {
        status: newStatus,
      });

      const updatedTask = response?.data;

      if (!updatedTask) {
        throw new Error("Task status was not updated");
      }

      sourceTasks.splice(taskIndex, 1);

      const destinationTasks = [
        ...columns[destinationColumnKey],
        updatedTask,
      ];
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

        const response = await TaskServices.updateTask(
          editTask._id,
          formData
        );

        const updatedTask = response?.data;

        if (!updatedTask) {
          throw new Error("Task was not updated");
        }

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
                ? updatedTask
                : task
            )
            .forEach((task) => {
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
        console.error("UPDATE TASK ERROR:", error);
        return false;
      } finally {
        setUpdatingTask(false);
      }
    }

    try {
      setCreatingTask(true);

      const response = await TaskServices.createTask(formData);

      const createdTask = response?.data;

      if (!createdTask) {
        throw new Error("Task was not created");
      }

      setColumns((prev) => {
        const columnMap = {
          "in-progress": "inProgress",
          paused: "paused",
          done: "done",
        };

        const columnKey =
          columnMap[createdTask.status] || "inProgress";

        return {
          ...prev,
          [columnKey]: [
            ...prev[columnKey],
            createdTask,
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

      await TaskServices.deleteTask(task._id);

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

  if (loading) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  };

  if (error) {
    return (
      <Typography color="error">
        {error}
      </Typography>
    )
  };

  return (
    <Fragment>
      <CreateTask
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
      />

      <Grid container spacing={2}>
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h1" sx={{ fontSize: 24, fontWeight: 600 }}>
              Tasks
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setEditingTask(null);
                setCreateTaskOpen(true);
              }}
              sx={{
                borderRadius: "12px",
                fontSize: "20px",
                lineHeight: 1.2,
              }}
            >
              +
            </Button>
          </Box>
        </Grid>

        <Grid size={12}>
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
              />
              <DroppableColumn
                columnKey="paused"
                title="Paused"
                Icon={ChangeHistoryRounded}
                tasks={columns.paused}
                onMenuClick={handleMenuClick}
              />
              <DroppableColumn
                columnKey="done"
                title="Done"
                Icon={StarBorderRounded}
                tasks={columns.done}
                onMenuClick={handleMenuClick}
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
        </Grid>
      </Grid>
    </Fragment>
  );
};