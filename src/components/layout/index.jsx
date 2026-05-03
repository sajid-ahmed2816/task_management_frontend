import { Fragment } from "react";
import Sidebar from "./sidebar";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <Fragment>
      <Box
        sx={{
          display: 'flex',
          height: '100%'
        }}
      >
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Fragment>
  );
};

export default Layout;