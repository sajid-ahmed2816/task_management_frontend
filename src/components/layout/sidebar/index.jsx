import { Box, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemText, ListItemIcon, Avatar, Badge, FormControl, MenuItem, Select, Tooltip } from '@mui/material'
import MuiDrawer from '@mui/material/Drawer';
import { ChevronLeft, ChevronRight, LogoutOutlined, NotificationsNoneRounded, SchemaOutlined } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import useAuth from '../../../hooks/useAuth';
import menu from './menu';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStore from '../../../config/zustand';
import { useNotifications } from '../../../context/NotificationContext';

const drawerWidth = 290;

const openedMixin = (theme) => ({
  background: "linear-gradient(135deg, #00bbe5, #024F6E)",
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  color: "#FFFFFF",
  borderRight: `1px solid  ${theme.palette.primary.main}`
});

const closedMixin = (theme) => ({
  background: "linear-gradient(135deg, #00bbe5, #024F6E)",
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(8)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9.5)} + 1px)`,
  },
  color: theme.palette.primary.main,
  borderRight: `1px solid  ${theme.palette.primary.main}`
});

const DrawerHeader = styled('div')(({ theme }) => ({
  width: "100%",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, userLogout } = useAuth();
  const { unreadCount } = useNotifications();
  const { name, email, profile_picture } = user || {};
  const {
    isDrawerOpen: open,
    toggleDrawer,
    workspaces,
    workspace,
    setWorkspace,
    refreshAllProjects,
  } = useStore();
  const selectedWorkspaceId = workspaces.some((item) => item._id === workspace?._id)
    ? workspace._id
    : workspaces[0]?._id || "";

  const handleDrawer = () => {
    toggleDrawer();
  };

  const hanldeNavigate = (path) => {
    navigate(path);
  };

  const handleWorkspaceChange = (event) => {
    const nextWorkspace = workspaces.find((item) => item._id === event.target.value);
    if (!nextWorkspace) return;
    setWorkspace(nextWorkspace);
    refreshAllProjects();
  };

  const handleLogout = () => {
    userLogout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        open={open}
      >
        <Box
          sx={{
            padding: "0px 16px",
            height: "100%"
          }}
        >
          <DrawerHeader
            sx={{
              minHeight: "0 !important",
              flexDirection: "column",
              gap: 2,
              display: "flex",
              width: "100%",
              p: "16px 0"
            }}
          >
            <Box
              sx={{
                width: "100%",
                flex: 1,
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <SchemaOutlined />
                <Box component={"span"} sx={{ fontWeight: 700 }}>
                  Flow
                </Box>
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5
                }}
              >
                <IconButton
                  size={"small"}
                  onClick={handleDrawer}
                  sx={{
                    flexShrink: 0,
                    color: "#fff",
                    "&:hover": {
                      bgcolor: "#ffffff2b"
                    },
                  }}
                >
                  {!open ?
                    <ChevronRight sx={{ color: "#FFFFFF" }} /> :
                    <ChevronLeft sx={{ color: "#FFFFFF" }} />
                  }
                </IconButton>
                <Tooltip title="Notifications" placement="right">
                  <IconButton
                    size={"small"}
                    aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                    onClick={() => hanldeNavigate("/notifications")}
                    sx={{
                      flexShrink: 0,
                      color: "#fff",
                      "&:hover": {
                        bgcolor: "#ffffff2b"
                      },
                    }}
                  >
                    <Badge badgeContent={unreadCount} max={99} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 9, minWidth: 16, height: 16, px: .4, border: "1px solid #024F6E" } }}>
                      <NotificationsNoneRounded />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            {workspaces.length > 0 && (
              <Box sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center"
              }}
              >
                <Tooltip
                  title={open ? "Switch workspace" : workspace?.name || "Switch workspace"}
                  placement="right"
                >
                  <FormControl
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      width: open ? "100%" : 54,
                      minHeight: 46,
                      height: 46
                    }}
                  >
                    <Select
                      value={selectedWorkspaceId}
                      onChange={handleWorkspaceChange}
                      displayEmpty
                      inputProps={{ "aria-label": "Switch workspace" }}
                      renderValue={(id) => {
                        const current = workspaces.find((item) => item._id === id);
                        return open ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              minWidth: 0,
                              gap: 1.2
                            }}
                          >
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 30,
                                height: 30,
                                flexShrink: 0,
                                bgcolor: current?.background || "#ffffff33",
                                color: "#fff",
                                fontSize: 13,
                                fontWeight: 800,
                                borderRadius: 2.25
                              }}
                            >
                              {current?.name?.slice(0, 1)?.toUpperCase() || "W"}
                            </Avatar>
                            <Box sx={{ minWidth: 0, textAlign: "left" }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  color: "#cdeaf1",
                                  lineHeight: 1.1
                                }}
                              >
                                WORKSPACE
                              </Typography>
                              <Typography
                                variant="body2"
                                noWrap sx={{
                                  color: "#fff",
                                  fontWeight: 700,
                                  lineHeight: 1.3
                                }}
                              >
                                {current?.name || "Select workspace"}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: current?.background || "#ffffff33",
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 800,
                              borderRadius: 2.25
                            }}
                          >
                            {current?.name?.slice(0, 1)?.toUpperCase() || "W"}
                          </Avatar>
                        );
                      }}
                      sx={{
                        color: "#fff",
                        borderRadius: 4,
                        minHeight: 46,
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          p: open ? 1 : "7px"
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ffffff55"
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ffffffaa"
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#fff"
                        },
                        "& .MuiSelect-icon": {
                          color: "#fff",
                          display: open ? "block" : "none"
                        }
                      }}
                    >
                      {workspaces.map((item) => (
                        <MenuItem key={item._id} value={item._id}>
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 30,
                              height: 30,
                              mr: 1.2,
                              bgcolor: item.background || "#e5f4f1",
                              color: "#168d86",
                              fontSize: 13,
                              fontWeight: 800,
                              borderRadius: 2.25
                            }}
                          >
                            {item.name?.slice(0, 1)?.toUpperCase() || "W"}
                          </Avatar>
                          <ListItemText primary={item.name} secondary={item.role || "Workspace"} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>
              </Box>
            )}
          </DrawerHeader>
          <Divider />
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: open ? "flex-start" : "center",
              height: "calc(100vh - 184px)",
              overflowY: "auto",
              overflowX: "hidden"
            }}
          >
            <List sx={{ width: "100%" }}>
              {menu.slice(0, 3).map((item, index) => (
                <ListItem
                  key={index}
                  disableGutters
                  sx={{
                    display: 'block',
                    py: 0
                  }}
                >
                  <ListItemButton
                    sx={[
                      { minHeight: 48, px: 2.5, },
                      open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                    ]}
                    onClick={() => hanldeNavigate(item.path)}
                  >
                    <ListItemIcon
                      sx={[
                        { minWidth: 0, justifyContent: 'center', color: "#FFFFFF" },
                        open ? { mr: 1, } : { mr: 'auto', },
                      ]}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={[open ? { opacity: 1, } : { opacity: 0, },]}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ width: "100%" }} />
            <List sx={{ width: "100%" }}>
              {menu.slice(3, 5).map((item, index) => (
                <ListItem
                  key={index}
                  disableGutters
                  sx={{
                    display: 'block',
                    py: 0
                  }}
                >
                  <ListItemButton
                    sx={[
                      { minHeight: 48, px: 2.5, },
                      open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                    ]}
                    onClick={(e) => {
                      e.stopPropagation();
                      hanldeNavigate(item.path);
                    }}
                  >
                    <ListItemIcon
                      sx={[
                        { minWidth: 0, justifyContent: 'center', color: "#FFFFFF" },
                        open ? { mr: 1, } : { mr: 'auto', },
                      ]}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={[open ? { opacity: 1, } : { opacity: 0, },]}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ width: "100%" }} />
            <List sx={{ width: "100%" }}>
              {menu.slice(5).map((item, index) => (
                <ListItem
                  key={index}
                  disableGutters
                  sx={{
                    display: 'block',
                    py: 0
                  }}
                >
                  <ListItemButton
                    sx={[
                      { minHeight: 48, px: 2.5, },
                      open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                    ]}
                    onClick={() => hanldeNavigate(item.path)}
                  >
                    <ListItemIcon
                      sx={[
                        { minWidth: 0, justifyContent: 'center', color: "#FFFFFF" },
                        open ? { mr: 1, } : { mr: 'auto', },
                      ]}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={[open ? { opacity: 1, } : { opacity: 0, },]}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%"
            }}
          >
            {open ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%"
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1
                  }}
                >
                  <Avatar
                    src={profile_picture}
                    sx={{ width: "38px", height: "38px" }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    <Typography variant={"body2"} sx={{ lineHeight: 1 }}>{name}</Typography>
                    <Typography variant={"caption"} sx={{ lineHeight: 1 }}>{email}</Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={handleLogout}
                >
                  <LogoutOutlined sx={{ color: "#FFFFFF" }} />
                </IconButton>
              </Box>
            ) : (
              <Avatar src={profile_picture} sx={{ width: "38px", height: "38px" }} />
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
