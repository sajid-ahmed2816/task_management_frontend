import React, { Fragment, useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Grid, IconButton, TablePagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, TextField, Popover, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Stack, Divider, } from '@mui/material';
import ProjectServices from '../../api/projects';
import { DeleteOutlineRounded, EditOutlined, SearchRounded } from '@mui/icons-material';
import ProjectDialog from '../../components/project_dialog';
import ConfirmationDialog from '../../components/confirmation_dialog';
import getChipColor from '../../utils/GetChipColor';
import toastify from '../../components/toast';
import useStore from '../../config/zustand';

const tableHead = ["Name", "Project Owner", "Start Date", "Due Date", "Status", "Priority", "Actions"];

function Projects() {
  const [projectsCount, setProjectsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [draftFilters, setDraftFilters] = useState({
    startDate: "",
    dueDate: "",
    status: [],
    priority: [],
  });

  const {
    projects,
    setProjects,
    refreshAllProjects,
    projectsPage: page,
    projectsRowsPerPage: rowsPerPage,
    projectsFilters: filters,
    projectSearch: search,
    setProjectsPage,
    setProjectsRowsPerPage,
    setProjectsFilters,
    setProjectSearch: setSearch,
    resetProjectsFilters,
  } = useStore();

  const isFilterOpen = Boolean(filterAnchor);

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsProjectDialogOpen(true);
  };

  const handleDeleteProject = (project) => {
    setSelectedProject(project);
    setIsConfirmationDialogOpen(true);
  };

  const getProjects = async () => {
    setIsLoading(true);
    const params = {
      page: page + 1,
      limit: rowsPerPage,
      ...(debouncedSearch && {
        search: debouncedSearch,
      }),
      ...(filters.startDate && {
        startDate: filters.startDate,
      }),
      ...(filters.dueDate && {
        dueDate: filters.dueDate,
      }),
      ...(filters.status.length > 0 && {
        status: filters.status,
      }),
      ...(filters.priority.length > 0 && {
        priority: filters.priority,
      }),
    }
    try {
      const result = await ProjectServices.getProjects(params);
      if (result.status) {
        setProjects(result.data.projects);
        setProjectsCount(result.data.pagination.total)
      };
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    };
  };

  const handleSubmitProject = async (formData, editProject) => {
    if (editProject) {
      try {
        setIsUpdatingProject(true);

        const promise = ProjectServices.updateProject(editProject._id, formData);
        const response = await toastify(promise);
        const updatedTask = response?.data;

        if (!updatedTask) {
          throw new Error("Task was not updated");
        };

        if (response.status) {
          setSelectedProject(null);
          setIsProjectDialogOpen(false);
          refreshAllProjects();
          getProjects();
        };
        return true;
      } catch (error) {
        console.error("UPDATE PROJECT ERROR:", error);
        return false;
      } finally {
        setIsUpdatingProject(false);
      }
    };

    try {
      setIsCreatingProject(true);

      const promise = ProjectServices.createProject(formData);
      const response = await toastify(promise);
      const createdProject = response?.data;

      if (!createdProject) {
        throw new Error("Task was not created");
      };

      if (response.status) {
        setIsProjectDialogOpen(false);
        refreshAllProjects();
        getProjects();
      }
      return true;
    } catch (error) {
      console.error("CREATE PROJECT ERROR:", error);
      return false;
    } finally {
      setIsCreatingProject(false);
    };
  };

  const deleteProject = async () => {
    setIsDeletingProject(true);
    try {
      const promise = ProjectServices.deleteProject(selectedProject?._id);
      const result = await toastify(promise);
      if (result.status) {
        getProjects();
        setIsConfirmationDialogOpen(false);
        setSelectedProject(null);
        refreshAllProjects();
      };
    } catch (error) {
      toastify(error);
    } finally {
      setIsDeletingProject(false);
    };
  };

  const handleChangePage = (event, newPage) => {
    setProjectsPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setProjectsRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterOpen = (event) => {
    setDraftFilters({
      ...filters,
      status: [...filters.status],
      priority: [...filters.priority],
    });

    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleDraftFilterChange = (field, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    setProjectsFilters(draftFilters);
    setProjectsPage(0);
    handleFilterClose();
  };

  const handleResetFilters = () => {
    resetProjectsFilters();

    setDraftFilters({
      startDate: "",
      dueDate: "",
      status: [],
      priority: [],
    });

    handleFilterClose();
  };

  useEffect(() => {
    getProjects();
  }, [page, rowsPerPage, filters, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <Fragment>
      <ProjectDialog
        open={isProjectDialogOpen}
        onClose={() => {
          setIsProjectDialogOpen(false);
        }}
        onSubmit={handleSubmitProject}
        loading={selectedProject ? isUpdatingProject : isCreatingProject}
        editProject={selectedProject}
        direction={selectedProject ? "left" : "down"}
      />

      <ConfirmationDialog
        open={isConfirmationDialogOpen}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        title={"Delete project?"}
        content={`This will permanently delete ${selectedProject?.name}.`}
        description={"This can't be undone."}
        handleDelete={deleteProject}
        isDeleting={isDeletingProject}
      />

      <Popover
        open={isFilterOpen}
        anchorEl={filterAnchor}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ p: "24px 16px 20px", width: 320 }}>
          <Stack spacing={2}>
            <TextField
              size="small"
              label="Start Date"
              type="date"
              fullWidth
              value={draftFilters.startDate}
              onChange={(e) =>
                handleDraftFilterChange(
                  "startDate",
                  e.target.value
                )
              }
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />

            <TextField
              size="small"
              label="Due Date"
              type="date"
              fullWidth
              value={draftFilters.dueDate}
              onChange={(e) =>
                handleDraftFilterChange(
                  "dueDate",
                  e.target.value
                )
              }
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel id="status-filter-label">
                Status
              </InputLabel>

              <Select
                labelId="status-filter-label"
                multiple
                value={draftFilters.status}
                label="Status"
                onChange={(e) =>
                  handleDraftFilterChange(
                    "status",
                    e.target.value
                  )
                }
                renderValue={(selected) =>
                  selected.map((value) =>
                    value.charAt(0).toUpperCase() + value.slice(1)
                  ).map((value) => value === "On_hold" ? "On hold" : value).join(", ")
                }
              >
                {[
                  "planning",
                  "active",
                  "completed",
                  "on_hold",
                  "cancelled",
                ].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox
                      checked={draftFilters.status.includes(status)}
                    />
                    <ListItemText
                      primary={
                        status === "on_hold"
                          ? "On hold"
                          : status.charAt(0).toUpperCase() +
                          status.slice(1)
                      }
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel id="priority-filter-label">
                Priority
              </InputLabel>

              <Select
                labelId="priority-filter-label"
                multiple
                value={draftFilters.priority}
                label="Priority"
                onChange={(e) =>
                  handleDraftFilterChange(
                    "priority",
                    e.target.value
                  )
                }
                renderValue={(selected) =>
                  selected.map((value) => value.charAt(0).toUpperCase() + value.slice(1)).join(", ")
                }
              >
                {["low", "medium", "high", "urgent"].map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    <Checkbox
                      checked={draftFilters.priority.includes(
                        priority
                      )}
                    />
                    <ListItemText
                      sx={{ textTransform: "capitalize" }}
                      primary={priority}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                fullWidth
                onClick={handleResetFilters}
              >
                Reset
              </Button>

              <Button
                size="small"
                variant="contained"
                fullWidth
                onClick={handleApplyFilters}
              >
                Apply
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>

      <Grid container spacing={2}>
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h1" sx={{ fontSize: 24, fontWeight: 600 }}>
              Projects
            </Typography>
            <Button
              variant="contained"
              sx={{
                fontSize: "20px",
                lineHeight: 1.2,
              }}
              onClick={() => {
                setSelectedProject(null);
                setIsProjectDialogOpen(true);
              }}
            >
              +
            </Button>
          </Box>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ borderColor: "#024F6E" }} />
        </Grid>

        <Grid size={12}>
          <Grid container spacing={2} sx={{ justifyContent: "flex-end" }}>
            <Grid size={4}>
              <TextField
                slotProps={{
                  input: {
                    startAdornment: <SearchRounded sx={{ color: "#B8B8B8" }} />
                  }
                }}
                placeholder={"Search projects"}
                size={"small"}
                fullWidth
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setProjectsPage(0);
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    gap: 1
                  }
                }}
              />
            </Grid>
            <Grid size={1.25}>
              <Button
                variant={"outlined"}
                fullWidth
                onClick={handleFilterOpen}
                sx={{
                  height: "100%"
                }}
              >
                Filter
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={12}>
          <TableContainer
            sx={{
              height: "calc(100vh - 203px)",
              overflowY: "auto",
              "& .MuiTableCell-head": {
                background: "#024F6E"
              }
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {tableHead.map((el) => (
                    <TableCell
                      key={el}
                      sx={{
                        p: 2,
                        fontSize: "16px",
                        fontWeight: 600
                      }}
                    >
                      {el}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : projects.length > 0 ? (
                  <Fragment>
                    {projects.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <Box
                              sx={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                background: item.color
                              }}
                            />
                            <Typography>
                              {item.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {item?.user?.name}
                        </TableCell>
                        <TableCell>
                          {new Date(item.startDate).toLocaleDateString("en-GB")}
                        </TableCell>
                        <TableCell>
                          {new Date(item.dueDate).toLocaleDateString("en-GB")}
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getChipColor(item.status)}
                            variant="filled"
                            label={item.status === "on_hold" ? "On hold" : item.status}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getChipColor(item.priority)}
                            variant="outlined"
                            label={item.priority}
                          />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <IconButton
                              color="info"
                              onClick={() => handleEditProject(item)}
                            >
                              <EditOutlined />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteProject(item)}
                            >
                              <DeleteOutlineRounded />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={projectsCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage="Rows per page:"
          />
        </Grid>
      </Grid>
    </Fragment>
  );
}

export default Projects