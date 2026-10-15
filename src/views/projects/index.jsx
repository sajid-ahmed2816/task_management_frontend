import React, { Fragment, useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ProjectServices from '../../api/projects';
import { DeleteOutlineRounded, EditOutlined } from '@mui/icons-material';
import ProjectDialog from '../../components/project_dialog';
import ConfirmationDialog from '../../components/confirmation_dialog';
import getChipColor from '../../utils/GetChipColor';
import toastify from '../../components/toast';

const tableHead = ["Name", "Project Owner", "Due Date", "Status", "Priority", "Actions"];

function Projects() {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

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
    try {
      const result = await ProjectServices.getProjects();
      if (result.status) {
        setProjects(result.data.projects);
      }
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
      };
    } catch (error) {
      toastify(error);
    } finally {
      setIsDeletingProject(false);
    };
  };

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <Fragment>
      <ProjectDialog
        open={isProjectDialogOpen}
        onClose={() => {
          setSelectedProject(null);
          setIsProjectDialogOpen(false);
        }}
        onSubmit={handleSubmitProject}
        loading={selectedProject ? isUpdatingProject : isCreatingProject}
        editProject={selectedProject}
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
          <TableContainer>
            <Table size="small">
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
                    <TableCell colSpan={6} sx={{ textAlign: "center" }}>
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
                          {new Date(item.dueDate).toLocaleDateString("en-GB")}
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={getChipColor(item.status)}
                            variant="filled"
                            label={item.status}
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
                    <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Fragment>
  )
}

export default Projects