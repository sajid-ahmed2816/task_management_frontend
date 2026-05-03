import React, { useState } from 'react'
import { Box, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemText, ListItemIcon, Avatar, Collapse } from '@mui/material'
import MuiDrawer from '@mui/material/Drawer';
import { ChevronLeft, ChevronRight, LogoutOutlined, SchemaOutlined } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import useAuth from '../../../hooks/useAuth';
import menu from './menu';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const drawerWidth = 290;

const openedMixin = (theme) => ({
  background: "#F0F0F0",
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  color: theme.palette.primary.main,
  borderRight: `1px solid  ${theme.palette.primary.main}`
});

const closedMixin = (theme) => ({
  background: "#F0F0F0",
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(8)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
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
  const [open, setOpen] = useState(true);
  const [expand, setExpand] = useState({});

  const navigate = useNavigate();

  const { user, userLogout } = useAuth();
  const { name, email } = user || {};

  const handleDrawer = () => {
    setOpen((prev) => !prev);
  };

  const hanldeNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    userLogout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" open={open}>
        <Box
          sx={{
            padding: "0px 16px",
            height: "100%"
          }}
        >
          <DrawerHeader>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                marginLeft: open ? "20px" : 0
              }}
            >
              <SchemaOutlined />
              <Box component={"span"} sx={{ fontWeight: 700 }}>
                Flow
              </Box>
            </Typography>
            <IconButton
              onClick={handleDrawer}>
              {!open ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: open ? "flex-start" : "center",
              height: "calc(100vh - 121px)",
              overflowY: "auto",
              overflowX: "hidden"
            }}
          >
            <List sx={{ width: "100%" }}>
              {menu.slice(0, 3).map((item, index) => (
                <ListItem key={index} sx={{ display: 'block' }} disableGutters>
                  <ListItemButton
                    sx={[
                      { minHeight: 48, px: 2.5, },
                      open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                    ]}
                    onClick={() => hanldeNavigate(item.path)}
                  >
                    <ListItemIcon
                      sx={[
                        { minWidth: 0, justifyContent: 'center', },
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
                <ListItem key={index} sx={{ display: 'block' }} disableGutters>
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
                        { minWidth: 0, justifyContent: 'center', },
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
                <ListItem key={index} sx={{ display: 'block' }} disableGutters>
                  <ListItemButton
                    sx={[
                      { minHeight: 48, px: 2.5, },
                      open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                    ]}
                    onClick={() => hanldeNavigate(item.path)}
                  >
                    <ListItemIcon
                      sx={[
                        { minWidth: 0, justifyContent: 'center', },
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
              padding: "0 0px 16px",
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
                  <Avatar sx={{ width: "38px", height: "38px" }} />
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
                  <LogoutOutlined />
                </IconButton>
              </Box>
            ) : (
              <Avatar sx={{ width: "38px", height: "38px" }} />
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;