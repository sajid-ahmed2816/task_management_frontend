import React, { useEffect } from "react";
import { DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Grid, Typography, IconButton } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Dialog from "../dialog";

const { _id } = JSON.parse(localStorage.getItem("user"));

const defaultValues = {
  name: "",
  description: "",
  startDate: "",
  dueDate: "",
  status: "active",
  priority: "medium",
  color: "",
  link: "",
};

function ProjectDialog({ open, onClose, onSubmit, loading = false, editProject = null, direction }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const handleClose = () => {
    onClose();
    reset(defaultValues);
  };

  const submitHandler = async (data) => {
    const success = await onSubmit({ ...data, user: _id }, editProject);

    if (success) {
      reset(defaultValues);
    };
  };

  useEffect(() => {
    if (editProject) {
      reset({
        name: editProject.name,
        description: editProject.description,
        startDate: editProject.startDate.split("T")[0],
        dueDate: editProject.dueDate.split("T")[0],
        status: editProject.status,
        priority: editProject.priority,
        color: editProject.color,
        link: editProject.link
      });
    }
  }, [editProject]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      direction={direction}
    >
      <DialogTitle>
        {editProject ? "Edit Project" : "Create Project"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Controller
              name="name"
              control={control}
              rules={{
                required: "Title is required",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="description"
              control={control}
              rules={{
                required: "Start date is required",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Grid>

          <Grid size={6}>
            <Controller
              name="startDate"
              control={control}
              rules={{
                required: "Start date is required",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Start Date"
                  slotProps={{
                    inputLabel: {
                      shrink: true
                    }
                  }}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                />
              )}
            />
          </Grid>

          <Grid size={6}>
            <Controller
              name="dueDate"
              control={control}
              rules={{
                required: "Due date is required",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Due Date"
                  slotProps={{
                    inputLabel: {
                      shrink: true
                    }
                  }}
                  error={!!errors.dueDate}
                  helperText={errors.dueDate?.message}
                />
              )}
            />
          </Grid>

          <Grid size={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Status"
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="on_hold">On hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={6}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={1.5}>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="color"
                  fullWidth
                  label="Color"
                />
              )}
            />
          </Grid>

          <Grid size={10.5}>
            <Controller
              name="link"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="text"
                  fullWidth
                  label="URL"
                />
              )}
            />
          </Grid>

        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit(submitHandler)}
          disabled={loading}
        >
          {loading
            ? editProject
              ? "Updating..."
              : "Creating..."
            : editProject
              ? "Update"
              : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;