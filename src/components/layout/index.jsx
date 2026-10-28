import Sidebar from "./sidebar";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { NotificationProvider } from "../../context/NotificationProvider";

function Layout() {
  return (
    <NotificationProvider>
      <Box
        sx={{
          display: 'flex',
          height: '100%'
        }}
      >
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, background: "#FFFFFF" }}>
          <Outlet />
        </Box>
      </Box>
    </NotificationProvider>
  );
};

export default Layout;
