import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import publicRoutes from './routes/public/routes';
import adminRoutes from './routes/admin/routes';
import useAuth from './hooks/useAuth';
import Layout from './components/layout';
import useStore from './config/zustand';
import ProjectServices from './api/projects';
import theme from './assets/theme';
import './App.css';
import WorkspaceServices from './api/workspaces';
import toastify from './components/toast';
import WorkspaceDialog from './components/workspace_dialog';

function App() {
  const [isCreating, setIsCreating] = useState(false);
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false);

  const { user } = useAuth();
  const { token } = user || {};

  const {
    workspace,
    setAllProjects,
    setWorkspaces,
    setWorkspace,
    setAllProjectsLoading,
    setAllProjectsError,
    setWorkspacesLoading,
    setWorkspacesError,
    projectsRefreshKey,
    workspacesRefreshKey,
    refreshWorkspaces
  } = useStore();

  const createWorkspace = async (formdata) => {
    setIsCreating(true);
    const obj = { name: formdata.workspace, description: formdata.description };
    try {
      const promise = WorkspaceServices.createWorkspace(obj);
      const response = await toastify(promise);
      if (response.status) {
        setIsWorkspaceDialogOpen(false);
        refreshWorkspaces();
        setWorkspace(response.data);
      };
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreating(false);
    };
  };

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchProjects = async () => {
      try {
        setAllProjectsLoading(true);
        setAllProjectsError(null);

        const result = await ProjectServices.getProjects(workspace?._id, { page: 1, limit: "all" });

        if (!isMounted) return;

        const projects = result?.data?.projects

        if (result.status) {
          setAllProjects(projects);
        };

      } catch (error) {
        if (!isMounted) return;

        setAllProjectsError(error?.message);
      } finally {
        if (isMounted) {
          setAllProjectsLoading(false);
        };
      };
    };

    const getWorkspaces = async () => {
      try {
        setWorkspacesLoading(true);
        setWorkspacesError(null);

        const response = await WorkspaceServices.getWorkspaces();

        if (!isMounted) return;

        if (response?.status) {
          setWorkspaces(response?.data?.workspaces);
          if (response?.data?.workspaces?.length === 0) {
            setIsWorkspaceDialogOpen(true);
          }
        };

      } catch (error) {
        if (!isMounted) return;

        setWorkspacesError(error?.message);
      } finally {
        if (isMounted) {
          setWorkspacesLoading(false);
        };
      };
    };

    fetchProjects();
    getWorkspaces();

    return () => {
      isMounted = false;
    };
  }, [
    token,
    setAllProjects,
    setAllProjectsLoading,
    setAllProjectsError,
    projectsRefreshKey,
    workspacesRefreshKey
  ]);

  return (
    <ThemeProvider theme={theme}>
      <WorkspaceDialog
        isOpen={isWorkspaceDialogOpen}
        handleClose={() => setIsWorkspaceDialogOpen(false)}
        onSubmit={createWorkspace}
        isCreating={isCreating}
      />
      <CssBaseline />
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path={"/"} element={token ? <Layout /> : <Navigate to={"/login"} />}>
            {adminRoutes.map((r, i) => (
              <Route key={i} path={r.path} element={r.component} />
            ))}
          </Route>
          <Route path={"/"} element={token ? <Navigate to={"/dashboard"} /> : <Outlet />}>
            {publicRoutes.map((r, i) => (
              <Route key={i} path={r.path} element={r.component} />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
