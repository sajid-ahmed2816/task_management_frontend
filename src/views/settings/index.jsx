import { Fragment, useState } from "react";
import { Box, Divider, Grid, Stack, Typography, Tabs, Tab, } from "@mui/material";
import PropTypes from 'prop-types';
import toastify from "../../components/toast";
import WorkspaceServices from "../../api/workspaces";
import ConfirmationDialog from "../../components/confirmation_dialog";
import useStore from "../../config/zustand";
import WorkspaceDialog from "../../components/workspace_dialog";
import WorkspacePanel from "./workspace_panel";
import MembersPanel from "./member_panel";
import useAuth from "../../hooks/useAuth";
import InvitationDialog from "../../components/invitation_dialog";
import MemberServices from "../../api/members";

function CustomTabPanel(props) {
  const { children, value, tab, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== tab}
      tabIndex={0}
      id={`settings-panel-${tab}`}
      aria-labelledby={`settings-tab-${tab}`}
      {...other}
    >
      {value === tab && (
        <Box sx={{ pt: "16px" }}>
          {children}
        </Box>
      )}
    </div>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  tab: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

function a11yProps(tab) {
  return {
    id: `settings-tab-${tab}`,
    'aria-controls': `settings-panel-${tab}`,
  };
};

function Setting() {
  const [activeId, setActiveId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [tabValue, setTabValue] = useState("workspace");
  const [section, setSection] = useState("active");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const {
    workspace,
    workspaces,
    setWorkspace,
    refreshWorkspaces
  } = useStore();
  const { user } = useAuth();

  const workspaceName = workspace?.name || "Selected workspace";

  const activeWorkspace = workspaces.find((item) => item._id === activeId)
    || workspaces.find((item) => item._id === workspace?._id)
    || workspace;

  const activeWorkspaceOwnerId = activeWorkspace?.owner?._id || activeWorkspace?.owner;

  const isWorkspaceOwner = activeWorkspace?.role === "Owner"
    || Boolean(activeWorkspaceOwnerId && user?._id && String(activeWorkspaceOwnerId) === String(user._id));

  const hasActiveWorkspace = Boolean(activeWorkspace?._id);

  const settingTabs = hasActiveWorkspace ? [
    ...(isWorkspaceOwner ? [{ key: "workspace", label: "Workspace" }] : []),
    { key: "members", label: "Members" },
    { key: "profile", label: "Profile" },
  ] : [
    { key: "workspace", label: "Workspace" },
    { key: "profile", label: "Profile" }
  ];
  const visibleTabValue = settingTabs.some((tab) => tab.key === tabValue) ? tabValue : settingTabs[0].key;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openCreate = () => {
    setIsWorkspaceDialogOpen(true);
  };

  const createWorkspace = async (formdata) => {
    setIsCreating(true);
    const obj = { name: formdata.workspace, description: formdata.description };
    try {
      const promise = WorkspaceServices.createWorkspace(obj);
      const response = await toastify(promise);
      if (response.status) {
        setIsWorkspaceDialogOpen(false);
        refreshWorkspaces();
      };
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreating(false);
    };
  };

  const saveWorkspace = async (formdata) => {
    setIsSaving(true);
    const obj = { name: formdata.workspace, description: formdata.description };
    try {
      const promise = WorkspaceServices.updateWorkspace(activeId, obj);
      const response = await toastify(promise);
      if (response?.status) {
        setWorkspace(response?.data);
        refreshWorkspaces();
      };
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    };
  };

  const removeWorkspace = (workspace) => {
    setIsConfirmationDialogOpen(true);
    setSelectedWorkspace(workspace);
  };

  const deleteWorkspace = async () => {
    setIsDeleting(true);
    try {
      const promise = WorkspaceServices.deleteWorkspace(selectedWorkspace?._id);
      const result = await toastify(promise);
      if (result.status) {
        refreshWorkspaces();
        setIsConfirmationDialogOpen(false);
        if (selectedWorkspace?._id === workspace?._id) {
          setWorkspace({});
        };
        setSelectedWorkspace(null);
      };
    } catch (error) {
      console.log("🚀 ~ deleteWorkspace ~ error:", error)
    } finally {
      setIsDeleting(false);
    };
  };

  const createInvitation = async (formdata) => {
    setIsSending(true);
    try {
      const promise = MemberServices.createInvitation(workspace?._id, formdata);
      const result = await toastify(promise);
      if (result.status) {
        setIsInviteDialogOpen(false);
      };
    } catch (error) {
      console.log("🚀 ~ createInvitation ~ error:", error)
    } finally {
      setIsSending(false);
    };
  };

  return (
    <Fragment>
      <WorkspaceDialog
        isOpen={isWorkspaceDialogOpen}
        handleClose={() => setIsWorkspaceDialogOpen(false)}
        onSubmit={createWorkspace}
        isCreating={isCreating}
      />

      <InvitationDialog
        isInviteDialogOpen={isInviteDialogOpen}
        setIsInviteDialogOpen={setIsInviteDialogOpen}
        workspaceName={workspaceName}
        onSubmit={createInvitation}
        isSending={isSending}
      />

      <ConfirmationDialog
        open={isConfirmationDialogOpen}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        title={"Delete workspace?"}
        content={`This will permanently delete ${selectedWorkspace?.name}.`}
        description={"This can't be undone."}
        handleDelete={deleteWorkspace}
        isDeleting={isDeleting}
      />

      <Grid container spacing={2}>
        <Grid size={12}>
          <Stack
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography
                variant="h1"
                sx={{
                  color: "#172b3a",
                  fontSize: 24,
                  fontWeight: 600
                }}
              >
                Settings
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Organize the workspaces and your profile.
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ borderColor: "#024F6E" }} />
        </Grid>

        <Grid size={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={visibleTabValue} onChange={handleTabChange} aria-label="Settings">
              {settingTabs.map((tab) => (
                <Tab
                  key={tab.key}
                  value={tab.key}
                  sx={{ textTransform: "capitalize" }}
                  label={tab.label}
                  {...a11yProps(tab.key)}
                />
              ))}
            </Tabs>
          </Box>
          <CustomTabPanel value={visibleTabValue} tab="workspace">
            <WorkspacePanel
              workspace={workspace}
              workspaces={workspaces}
              activeId={activeId}
              setActiveId={setActiveId}
              setWorkspace={setWorkspace}
              openCreate={openCreate}
              saveWorkspace={saveWorkspace}
              removeWorkspace={removeWorkspace}
              isSaving={isSaving}
            />
          </CustomTabPanel>
          <CustomTabPanel value={visibleTabValue} tab="members">
            <MembersPanel
              workspace={activeWorkspace}
              isOwner={isWorkspaceOwner}
              section={section}
              setSection={setSection}
              setIsInviteDialogOpen={setIsInviteDialogOpen}
            />
          </CustomTabPanel>
          <CustomTabPanel value={visibleTabValue} tab="profile">
            Item Two
          </CustomTabPanel>
        </Grid>
      </Grid >
    </Fragment >
  );
}

export default Setting;
