import React, { useEffect } from "react";
import { Box, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Grid, Typography, IconButton } from "@mui/material";
import { ArchiveRounded, AttachFileOutlined, Close, CodeRounded, DescriptionRounded, ImageRounded, InsertDriveFileRounded, PictureAsPdfRounded, SlideshowRounded, TableChartRounded } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import Dialog from "../dialog";
import useStore from "../../config/zustand";

const defaultValues = {
  title: "",
  project: "",
  description: "",
  status: "in-progress",
  priority: "medium",
  dueDate: "",
  attachments: [],
};

function TaskDialog({ open, onClose, onSubmit, loading = false, editTask = null, }) {
  const { allProjects } = useStore();

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

  const getFileIcon = (filename = "") => {
    const extension = filename.split(".").pop()?.toLowerCase();

    const iconProps = { sx: { fontSize: 40 } };

    switch (extension) {
      case "pdf":
        return <PictureAsPdfRounded {...iconProps} sx={{ ...iconProps.sx, color: "#E53935" }} />;

      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
      case "svg":
        return <ImageRounded {...iconProps} sx={{ ...iconProps.sx, color: "#2E7D32" }} />;

      case "doc":
      case "docx":
      case "txt":
      case "rtf":
        return <DescriptionRounded {...iconProps} sx={{ ...iconProps.sx, color: "#1976D2" }} />;

      case "xls":
      case "xlsx":
      case "csv":
        return <TableChartRounded {...iconProps} sx={{ ...iconProps.sx, color: "#188038" }} />;

      case "ppt":
      case "pptx":
        return <SlideshowRounded {...iconProps} sx={{ ...iconProps.sx, color: "#E65100" }} />;

      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "json":
      case "html":
      case "css":
      case "py":
        return <CodeRounded {...iconProps} sx={{ ...iconProps.sx, color: "#6A1B9A" }} />;

      case "zip":
      case "rar":
      case "7z":
        return <ArchiveRounded {...iconProps} sx={{ ...iconProps.sx, color: "#795548" }} />;

      default:
        return <InsertDriveFileRounded {...iconProps} sx={{ ...iconProps.sx, color: "#757575" }} />;
    }
  };

  const submitHandler = async (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "attachments") {
        (value || []).forEach((file) => {
          formData.append("files", file);
        });
      } else {
        formData.append(key, value);
      };
    });

    const success = await onSubmit(formData, editTask);

    if (success) {
      reset(defaultValues);
    };
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
    >
      <DialogTitle>
        {editTask ? "Edit Task" : "Create Task"}
      </DialogTitle>

      <DialogContent>
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
              name="project"
              control={control}
              rules={{
                required: "Project is required",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Project"
                  error={!!errors.project}
                  helperText={errors.project?.message}
                >
                  {allProjects?.length > 0 ? allProjects?.map((project) => (
                    <MenuItem
                      key={project?._id}
                      value={project?._id}
                    >
                      {project?.name}
                    </MenuItem>
                  )) : (
                    <MenuItem value="" disabled>
                      No project available
                    </MenuItem>
                  )}
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

          <Grid size={12}>
            <Controller
              name="attachments"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    component="label"
                    variant="outlined"
                  >
                    <AttachFileOutlined sx={{ mr: 1 }} />
                    Select Attachments

                    <input
                      {...field}
                      hidden
                      type="file"
                      multiple
                      onChange={(event) => {
                        onChange(Array.from(event.target.files || []));
                      }}
                    />
                  </Button>

                  {(value || []).length > 0 && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      {(value || []).map((file, index) => (
                        <Grid
                          key={`${file.name}-${file.lastModified}-${index}`}
                          size={{ xs: 3, sm: 3, md: 2 }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1.5,
                              p: 1,
                              minWidth: 0,
                              minHeight: 70,
                              border: "1px solid #E0E0E0",
                              borderRadius: "12px",
                              backgroundColor: "#FAFAFA",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                borderColor: "#024F6E",
                              },
                            }}
                          >
                            <IconButton
                              edge="end"
                              aria-label={`Remove ${file.name}`}
                              sx={{
                                p: 0.5,
                                border: "1px solid transparent",
                                background: "#d32f2f",
                                "& .MuiSvgIcon-root": {
                                  color: "#FFFFFF",
                                },
                                position: "absolute",
                                top: -10,
                                right: 0,
                                ":hover": {
                                  border: "1px solid #d32f2f",
                                  background: "white",
                                  "& .MuiSvgIcon-root": {
                                    color: "#d32f2f"
                                  }
                                }
                              }}
                              onClick={() => {
                                onChange(value.filter((_, i) => i !== index))
                              }}
                            >
                              <Close sx={{ fontSize: "16px" }} />
                            </IconButton>

                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 0.5,
                                width: "100%",
                                overflow: "hidden",
                              }}
                            >
                              {getFileIcon(file.name)}
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    Maximum 10 files per request.
                  </Typography>
                </Box>
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

export default TaskDialog;