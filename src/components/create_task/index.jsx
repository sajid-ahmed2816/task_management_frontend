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
    onClose();
    reset(defaultValues);
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
    }
  }, [editTask]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            background: "#024F6E"
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          background: "#024F6E",
          color: "#FFFFFF",
        }}
      >
        {editTask ? "Edit Task" : "Create Task"}
      </DialogTitle>
      <DialogContent
        sx={{
          background: "#FFFFFF",
          p: "24px !important"
        }}
      >
        <Grid container spacing={2}>
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
      <DialogActions
        sx={{
          px: 3, pb: 3, pt: 0,
          background: "#FFFFFF"
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            borderRadius: "12px",
            textTransform: "capitalize",
            border: "1px solid #024F6E"
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit(submitHandler)}
          disabled={loading}
          sx={{
            borderRadius: "12px",
            textTransform: "capitalize",
            border: "1px solid #024F6E"
          }}
        >
          {loading
            ? editTask
              ? "Updating..."
              : "Creating..."
            : editTask
              ? "Update"
              : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTask;