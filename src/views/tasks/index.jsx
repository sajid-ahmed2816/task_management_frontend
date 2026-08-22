import React, { Fragment, useState } from 'react';
import { Box, Button, Grid, Typography, LinearProgress, AvatarGroup, Avatar, IconButton, Menu, MenuItem, ListItemIcon, Divider, ListItemText } from '@mui/material';
import { CircleOutlined, ChangeHistoryRounded, StarBorderRounded, MessageOutlined, AttachFileOutlined, MoreHorizOutlined, DeleteOutlineRounded, AccountCircleOutlined, BorderColorOutlined, AssignmentIndOutlined } from '@mui/icons-material';
import { DragDropProvider, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/react';
import { CSS } from '@dnd-kit/utilities';

const tasks = [
  {
    _id: 'task-1',
    title: 'Redesign Landing Page',
    category: 'UI/UX Design',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit...',
    comments: [ /* ... 3 comments ... */],
    attachments: ['file1', 'file2'],
    assignees: [ /* ... 5 assignees ... */],
    subtasks: { total: 5, completed: 1 },
  },
  {
    _id: 'task-2',
    title: 'Redesign Landing Page',
    category: 'UI/UX Design',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit...',
    comments: [ /* ... */],
    attachments: ['file1', 'file2'],
    assignees: [ /* ... */],
    subtasks: { total: 5, completed: 1 },
  },
  {
    _id: 'task-3',
    title: 'Redesign Landing Page',
    category: 'UI/UX Design',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit...',
    comments: [ /* ... */],
    attachments: ['file1', 'file2'],
    assignees: [ /* ... */],
    subtasks: { total: 5, completed: 1 },
  },
];

const initialColumns = {
  inProgress: [tasks[0]],
  paused: [tasks[1]],
  done: [tasks[2]],
};

// ---------- Task Menu (unchanged) ----------
function TaskMenu({ anchorEl, open, handleClose }) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      onClick={handleClose}
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
      <MenuItem onClick={handleClose} sx={{ fontSize: 14, gap: 2 }}>
        <ListItemIcon sx={{ "&.MuiListItemIcon-root": { background: "#D4D4D4", p: 0.5, borderRadius: "4px", width: 28, minWidth: 0 } }}>
          <ChangeHistoryRounded fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={"Move to Paused"} />
      </MenuItem>
      <MenuItem onClick={handleClose} sx={{ fontSize: 14, gap: 2 }}>
        <ListItemIcon sx={{ "&.MuiListItemIcon-root": { background: "#D4D4D4", p: 0.5, borderRadius: "4px", width: 28, minWidth: 0 } }}>
          <StarBorderRounded fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={"Move to Done"} />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleClose} sx={{ fontSize: 14, gap: 2 }}>
        <ListItemIcon sx={{ "&.MuiListItemIcon-root": { background: "#D4D4D4", p: 0.5, borderRadius: "4px", width: 28, minWidth: 0 } }}>
          <AssignmentIndOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={"Assign to ..."} />
      </MenuItem>
      <MenuItem onClick={handleClose} sx={{ fontSize: 14, gap: 2 }}>
        <ListItemIcon sx={{ "&.MuiListItemIcon-root": { background: "#D4D4D4", p: 0.5, borderRadius: "4px", width: 28, minWidth: 0 } }}>
          <AccountCircleOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={"Assign to me"} />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleClose} sx={{ fontSize: 14, gap: 2 }}>
        <ListItemIcon sx={{ "&.MuiListItemIcon-root": { background: "#D4D4D4", p: 0.5, borderRadius: "4px", width: 28, minWidth: 0 } }}>
          <BorderColorOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={"Edit"} />
      </MenuItem>
      <MenuItem onClick={handleClose} sx={{ fontSize: 14, gap: 2 }}>
        <ListItemIcon sx={{ "&.MuiListItemIcon-root": { background: "#D4D4D4", p: 0.5, borderRadius: "4px", width: 28, minWidth: 0 } }}>
          <DeleteOutlineRounded fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={"Delete"} />
      </MenuItem>
    </Menu>
  );
}

// ---------- Shared Task Card (used in both list and drag overlay) ----------
function TaskCard({ draggable, item, progress = 20, onMenuClick }) {
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
        // When used in drag overlay, additional styles will be added outside
      }}
      draggable={draggable}
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
            <Typography variant="body2">{item.comments.length}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ transform: 'rotate(45deg)', display: 'flex' }}>
              <AttachFileOutlined sx={{ width: 18, height: 18, fill: "#024F6E !important" }} />
            </Box>
            <Typography variant="body2">{item.attachments.length}</Typography>
          </Box>
        </Box>
        <AvatarGroup
          total={item.assignees.length}
          slotProps={{ surplus: { sx: { width: 24, height: 24, fontSize: 12 } } }}
        >
          {item.assignees.slice(0, 2).map((assignee, ind) => (
            <Avatar key={ind} alt={assignee.name} sx={{ width: 24, height: 24 }} />
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
        <Typography variant="body2">{`${item.subtasks.completed}/${item.subtasks.total}`}</Typography>
      </Box>
    </Box>
  );
}

// ---------- Draggable Task Item ----------
function DraggableTask({ task, columnKey, index, onMenuClick, draggable }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { column: columnKey, index },
  });

  const style = {
    // use CSS.Translate for smooth movement
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
    >
      <TaskCard draggable={draggable} item={task} progress={20} onMenuClick={onMenuClick} />
    </Box>
  );
}

// ---------- Droppable Column ----------
function DroppableColumn({ columnKey, title, Icon, tasks, onMenuClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnKey,
  });

  return (
    <Grid size={4}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ px: 1 }}>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ lineHeight: 0 }}>
              <Icon sx={{ width: 18, height: 18, fill: "#024F6E !important" }} />
            </Box>
            <Box component="span" sx={{ lineHeight: 1 }}>{title}</Box>
          </Typography>
        </Box>
        <Box
          ref={setNodeRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            borderRadius: '16px',
            height: 'calc(100vh - 136px)',
            overflowY: 'auto',
            padding: 1,
            transition: 'border 0.2s',
            boxShadow: "0px 0px 5px 3px #40404020"
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
                draggable={true}
              />
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', color: '#aaa', mt: 4 }}>
              No tasks
            </Typography>
          )}
        </Box>
      </Box>
    </Grid>
  );
}

// ---------- Main Tasks Component ----------
export default function Tasks() {
  const [columns, setColumns] = useState(initialColumns);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeId, setActiveId] = useState(null);  // id of dragged task

  const open = Boolean(anchorEl);

  // Get active task object from columns
  const getTaskById = (id) => {
    for (const colKey of Object.keys(columns)) {
      const found = columns[colKey].find(t => t._id === id);
      if (found) return found;
    }
    return null;
  };
  const activeTask = activeId ? getTaskById(activeId) : null;

  // Find which column contains a given taskId
  const findColumnOfTask = (id) => {
    if (columns.inProgress.find(t => t._id === id)) return 'inProgress';
    if (columns.paused.find(t => t._id === id)) return 'paused';
    if (columns.done.find(t => t._id === id)) return 'done';
    return null;
  };

  // Menu handlers
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // DnD handlers
  const handleDragStart = (event) => {
    console.log("🚀 ~ handleDragStart ~ event:", event)
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return; // dropped outside

    const sourceColumnKey = findColumnOfTask(active.id);
    const destinationColumnKey = over.id; // droppable id = column key

    if (!sourceColumnKey || !destinationColumnKey) return;
    if (sourceColumnKey === destinationColumnKey) return; // same column, for now skip reordering

    // Perform move
    const sourceTasks = [...columns[sourceColumnKey]];
    const taskIndex = sourceTasks.findIndex(t => t._id === active.id);
    if (taskIndex === -1) return;
    const [movedTask] = sourceTasks.splice(taskIndex, 1);

    const destTasks = [...columns[destinationColumnKey], movedTask];

    setColumns(prev => ({
      ...prev,
      [sourceColumnKey]: sourceTasks,
      [destinationColumnKey]: destTasks,
    }));
  };

  const handleDragCancel = () => setActiveId(null);

  return (
    <Fragment>
      <TaskMenu anchorEl={anchorEl} open={open} handleClose={handleMenuClose} />

      <Grid container spacing={2}>
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h1" sx={{ fontSize: 24, fontWeight: 600 }}>
              Tasks
            </Typography>
            <Button variant="contained" sx={{ borderRadius: '12px', fontSize: '20px', lineHeight: 1.2 }}>
              +
            </Button>
          </Box>
        </Grid>

        <Grid size={12}>
          <DragDropProvider
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
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
                    // No opacity = solid
                  }}
                >
                  {/* Render the same TaskCard without the menu button (optional) */}
                  <TaskCard
                    item={activeTask}
                    progress={20}
                    onMenuClick={() => { }} // noop in overlay
                  />
                </Box>
              ) : null}
            </DragOverlay>
          </DragDropProvider>
        </Grid>
      </Grid>
    </Fragment>
  );
}