import React, { useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";

const defaultValues = {
  title: "",
  category: "",
  description: "",
  status: "in-progress",
  priority: "medium",
  dueDate: "",
};

function CreateTask({ open, onClose, onSubmit, loading = false, editTask = null, }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const submitHandler = async (data) => {
    const success = await onSubmit(data, editTask);

    if (success) {
      reset(defaultValues);
    }
  };

  useEffect(() => {
    if (editTask) {
      reset({
        title: editTask.title || "",
        category: editTask.category || "",
        description: editTask.description || "",
        status: editTask.status || "in-progress",
        priority: editTask.priority || "medium",
        dueDate: editTask.dueDate
          ? editTask.dueDate.substring(0, 10)
          : "",
      });
    } else {
      reset(defaultValues);
    }
  }, [editTask, reset]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{editTask ? "Edit Task" : "Create Task"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <Controller
              name="title"
              control={control}
              rules={{
                required: "Title is required",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Task Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
          </Grid>

          <Grid size={6}>
            <Controller
              name="category"
              control={control}
              rules={{
                required: "Category is required",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Category"
                  error={!!errors.category}
                  helperText={errors.category?.message}
                />
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
                </TextField>
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
                  <MenuItem value="in-progress">
                    In Progress
                  </MenuItem>
                  <MenuItem value="paused">
                    Paused
                  </MenuItem>
                  <MenuItem value="done">
                    Done
                  </MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid size={6}>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Due Date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
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
            ? editTask
              ? "Updating..."
              : "Creating..."
            : editTask
              ? "Update Task"
              : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTask;