import { Fragment, useEffect, useMemo, useState } from "react";
import { AddCircle, AddRounded, CheckRounded, DeleteOutlineRounded, EditOutlined, Groups2Outlined, LayersOutlined, WorkspacePremiumOutlined, } from "@mui/icons-material";
import { Avatar, Box, Button, Card, Chip, Divider, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack, TextField, Tooltip, Typography, Tabs, Tab, } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import PropTypes from 'prop-types';
import Dialog from "../../components/dialog";
import useAuth from "../../hooks/useAuth";
import toastify from "../../components/toast";
import WorkspaceServices from "../../api/workspaces";
import ConfirmationDialog from "../../components/confirmation_dialog";
import useStore from "../../config/zustand";

const COLORS = ["#158a87", "#5c6ac4", "#d18a45", "#bc6581", "#477b9e"];

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      tabIndex={0}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: "16px 0" }}>
          {children}
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

const defaultValues = {
  workspace: "",
  description: ""
};

function Setting() {
  const [activeId, setActiveId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const {
    workspace,
    workspaces,
    setWorkspace,
    refreshWorkspaces
  } = useStore();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues })
  const {
    control: control2,
    handleSubmit: handleSubmit2,
    watch: watch2,
    setValues,
    formState: { errors2 },
  } = useForm({ defaultValues });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };


  const openCreate = () => {
    reset();
    setDialogOpen(true);
  };

  const createWorkspace = async (formdata) => {
    setIsCreating(true);
    const obj = { name: formdata.workspace, description: formdata.description };
    try {
      const promise = WorkspaceServices.createWorkspace(obj);
      const response = await toastify(promise);
      if (response.status) {
        setDialogOpen(false);
        reset();
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

  return (
    <Fragment>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Create a workspace</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#788892", mb: 2 }}>Give this workspace a name and a little context for what belongs here.</Typography>
          <Stack spacing={2}>
            <Controller
              name="workspace"
              control={control}
              rules={{
                required: "Project is required",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Workspace name"
                  placeholder="e.g. Product team"
                  error={!!errors.workspace}
                  helperText={errors.workspace?.message}
                  size="small"
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={2}
                  label="Description"
                  placeholder="A space for your team's work"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ textTransform: "none", color: "#6e7d86" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(createWorkspace)}
            disabled={!watch("workspace").trim() || isCreating}
            variant="contained"
          >
            Create workspace
          </Button>
        </DialogActions>
      </Dialog>

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
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
              <Tab sx={{ textTransform: "capitalize" }} label="Workspace" {...a11yProps(0)} />
              <Tab sx={{ textTransform: "capitalize" }} label="Profile" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid #e7edf0",
                    borderRadius: 3,
                    background: "linear-gradient(115deg, #f2faf9 0%, #ffffff 72%)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      width: 230,
                      height: 230,
                      borderRadius: "50%",
                      bgcolor: "#dff2ef",
                      right: -85,
                      top: -130,
                      opacity: .65
                    }}
                  />
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      position: "relative",
                      alignItems: "center"
                    }}
                  >
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 2.5,
                        bgcolor: workspace?.background || COLORS[0],
                        fontSize: 22,
                        fontWeight: 800,
                        boxShadow: "0 5px 12px #152c351a"
                      }}
                    >
                      {workspace?.name?.slice(0, 1).toUpperCase() || "W"}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems: "center",
                          flexWrap: "wrap"
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#19333e",
                            fontWeight: 750,
                            fontSize: 18
                          }}
                        >
                          {workspace?.name || "No workspace selected"}
                        </Typography>
                        {workspace?._id && (
                          <Chip
                            size="small"
                            label="Current workspace"
                            sx={{
                              height: 23,
                              bgcolor: "#e2f4ef",
                              color: "#16776e",
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          />
                        )}
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: .35,
                          color: "#71828d"
                        }}
                      >
                        {workspace?.description || "No description available."}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2, borderColor: "#e6efed" }} />
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2.5}
                    divider={
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                          borderColor: "#e6efed",
                          display: { xs: "none", sm: "block" }
                        }}
                      />
                    }
                  >
                    <Stack
                      direction="row"
                      spacing={1.1}
                      sx={{
                        flex: 1,
                        alignItems: "center"
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          placeItems: "center",
                          width: 35,
                          height: 35,
                          borderRadius: 2,
                          bgcolor: "#edf5f5",
                          color: "#397d79"
                        }}
                      >
                        <Groups2Outlined sx={{ fontSize: 19 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#85939b", display: "block" }}
                        >
                          Members
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: "#30434d" }}
                        >
                          {workspace?._id ? "Just you" : "N/A"}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1.1}
                      sx={{
                        flex: 1,
                        alignItems: "center"
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          placeItems: "center",
                          width: 35,
                          height: 35,
                          borderRadius: 2,
                          bgcolor: "#f3f1fb",
                          color: "#7265a8"
                        }}
                      >
                        <LayersOutlined sx={{ fontSize: 19 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#85939b", display: "block" }}
                        >
                          Projects
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: "#30434d" }}
                        >
                          {workspace?._id ? "Ready to organize" : "N/A"}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1.1}
                      sx={{
                        flex: 1,
                        alignItems: "center"
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          placeItems: "center",
                          width: 35,
                          height: 35,
                          borderRadius: 2,
                          bgcolor: "#fff5e8",
                          color: "#b47b32"
                        }}
                      >
                        <WorkspacePremiumOutlined sx={{ fontSize: 19 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#85939b", display: "block" }}
                        >
                          Plan
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: "#30434d" }}
                        >
                          {workspace?._id ? "Free plan" : "N/A"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>

              <Grid size={12}>
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={4}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.25
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 750,
                            color: "#243844",
                            fontSize: 14
                          }}
                        >
                          Your workspaces
                          <Typography
                            component="span"
                            sx={{
                              color: "#91a0a9",
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            ({workspaces.length})
                          </Typography>
                        </Typography>
                        <IconButton
                          onClick={openCreate}
                          size="small"
                          sx={{
                            color: "#71818c",
                            "&:hover": {
                              bgcolor: "#f3f7f7",
                              color: "#168d86"
                            }
                          }}
                        >
                          <AddCircle />
                        </IconButton>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          height: "calc(100vh - 403px)",
                          overflowY: "auto",
                        }}
                      >
                        {workspaces.map((item) => {
                          const isActive = item._id === activeId;
                          return (
                            <Card
                              key={item._id}
                              elevation={0}
                              onClick={() => {
                                setActiveId(item._id);
                                setWorkspace(item);
                                setValues({
                                  workspace: item?.name,
                                  description: item?.description
                                })
                              }}
                              sx={{
                                overflow: "visible",
                                cursor: "pointer",
                                p: 1.4,
                                borderRadius: 2.5,
                                border: isActive ? "1px solid #9bd2cd" : "1px solid #e8edf0",
                                bgcolor: isActive ? "#f2faf8" : "#fff",
                                transition: "all .18s ease",
                                "&:hover": {
                                  borderColor: "#b3d8d5",
                                  bgcolor: "#f8fbfb"
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5
                                }}
                              >
                                <Avatar
                                  variant="rounded"
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 1.8,
                                    bgcolor: item.background,
                                    fontSize: 15,
                                    fontWeight: 800
                                  }}
                                >
                                  {item.name.slice(0, 1).toUpperCase()}
                                </Avatar>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    minWidth: 0,
                                    flex: 1
                                  }}
                                >
                                  <Typography
                                    noWrap
                                    sx={{
                                      fontWeight: 700,
                                      color: "#2b414d",
                                      fontSize: 13
                                    }}
                                  >
                                    {item.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: "inline-block",
                                      color: "#87959e",
                                      width: "100%",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden"
                                    }}
                                  >
                                    {item.description || "No description"}
                                  </Typography>
                                </Box>
                                {workspaces.length > 1 && (
                                  <Tooltip title="Remove workspace">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeWorkspace(item);
                                      }}
                                      sx={{
                                        flexShrink: 0,
                                        color: "#a0aab0",
                                        "&:hover": {
                                          color: "#c45252"
                                        }
                                      }}
                                    >
                                      <DeleteOutlineRounded sx={{ fontSize: 17 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </Card>
                          );
                        })}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={8}>
                    <Card
                      elevation={0}
                      sx={{
                        width: "100%",
                        p: 2.4,
                        border: "1px solid #e7edf0", borderRadius: 3
                      }}
                    >
                      <Grid
                        container
                        spacing={2}
                      >
                        <Grid size={12}>
                          <Stack direction={"row"} spacing={2}>
                            <Box
                              sx={{
                                display: "grid",
                                placeItems: "center",
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                bgcolor: "#eaf5f4",
                                color: "#168d86"
                              }}
                            >
                              <EditOutlined sx={{ fontSize: 19 }} />
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column"
                              }}
                            >
                              <Typography
                                sx={{ fontWeight: 750, color: "#233944" }}
                              >
                                Workspace details
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#87949c" }}
                              >
                                Update the name and description for this space.
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid size={12}>
                          <Controller
                            name="workspace"
                            control={control2}
                            rules={{
                              required: "Workspace name is required",
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Workspace name"
                                placeholder="e.g. Product team"
                                error={!!errors2?.workspace}
                                helperText={errors2?.workspace?.message}
                                size="small"
                                inputProps={{ maxLength: 48 }}
                                slotProps={{
                                  inputLabel: {
                                    shrink: true
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={12}>
                          <Controller
                            name="description"
                            control={control2}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                multiline
                                minRows={3}
                                label="Description"
                                placeholder="A space for your team's work"
                                inputProps={{ maxLength: 160, }}
                                helperText={`${watch2("description")?.length || 0}/160`}
                                slotProps={{
                                  inputLabel: {
                                    shrink: true
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={12} sx={{ textAlign: "end" }}>
                          <Button
                            onClick={handleSubmit2(saveWorkspace)}
                            disabled={!watch2("workspace")?.trim() || isSaving}
                            variant="contained"
                            startIcon={<CheckRounded />}
                            sx={{ fontWeight: 700 }}
                          >
                            Save changes
                          </Button>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={1}>
            Item Two
          </CustomTabPanel>
        </Grid>
      </Grid >
    </Fragment >
  );
}

export default Setting;
