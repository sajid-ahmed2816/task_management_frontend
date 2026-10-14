
import React, { useEffect, useState } from "react";
import { Avatar, Box, Button, Checkbox, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, LinearProgress, List, ListItem, ListItemAvatar, ListItemText, TextField, Typography } from "@mui/material";
import { Adjust, AttachFileOutlined, ChangeHistoryRounded, CircleOutlined, PictureAsPdfRounded, ImageRounded, DescriptionRounded, TableChartRounded, SlideshowRounded, CodeRounded, ArchiveRounded, InsertDriveFileRounded, Description, Event, PriorityHigh, Sell, SendRounded, StarBorderRounded, Close, DeleteOutlineOutlined } from "@mui/icons-material";
import TaskServices from "../../api/tasks";

export default function TaskDetailsDialog({
  open,
  task,
  onClose,
  onTaskUpdated,
}) {
  const [details, setDetails] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [subTaskTitle, setSubTaskTitle] = useState("");
  const [subTaskLoading, setSubTaskLoading] = useState(false);
  const [subTaskActionId, setSubTaskActionId] = useState(null);
  const [deletingSubTaskId, setDeletingSubTaskId] = useState(null);

  useEffect(() => {
    if (!open || !task?._id) {
      setDetails(null);
      setCommentText("");
      setFiles([]);
      setError("");
      return;
    }

    let cancelled = false;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await TaskServices.getTaskById(task._id);
        const taskDetails = response?.data;

        if (!taskDetails) {
          throw new Error("Task details not found");
        }

        if (!cancelled) {
          setDetails(taskDetails);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
            err?.message ||
            "Failed to load task details"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [open, task?._id]);

  const handleAddComment = async () => {
    const text = commentText.trim();

    if (!text || !details?._id) return;

    try {
      setCommentLoading(true);
      setError("");

      const response = await TaskServices.addComment(details._id, {
        text,
      });

      const addedComment = response?.data;

      if (!addedComment) {
        throw new Error("Comment was not added");
      }

      setDetails((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), addedComment],
        commentCount: (prev.commentCount || 0) + 1,
      }));

      setCommentText("");
      onTaskUpdated?.(details._id, {
        commentCount: (details.commentCount || 0) + 1,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add comment"
      );
    } finally {
      setCommentLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!files.length || !details?._id) return;

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      setUploadLoading(true);
      setError("");

      const response = await TaskServices.addAttachment(
        details._id,
        formData
      );

      const attachments = response?.data;

      if (!Array.isArray(attachments)) {
        throw new Error("Attachments were not uploaded");
      }

      setDetails((prev) => ({
        ...prev,
        attachments,
        attachmentCount: attachments.length,
      }));

      setFiles([]);

      onTaskUpdated?.(details._id, {
        attachmentCount: attachments.length,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload attachments"
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!details?._id || !attachmentId) return;

    try {
      setDeletingId(attachmentId);
      setError("");

      const response = await TaskServices.deleteAttachment(details._id, attachmentId);
      const attachments = response?.data;

      if (!Array.isArray(attachments)) {
        throw new Error("Attachment was not deleted");
      };

      setDetails((prev) => ({
        ...prev,
        attachments,
        attachmentCount: attachments.length,
      }));

      onTaskUpdated?.(details._id, {
        attachmentCount: attachments.length,
      });
    } catch (err) {
      setError(
        err ||
        err?.message ||
        err?.response?.data?.message ||
        "Failed to delete attachment"
      );
    } finally {
      setDeletingId(null);
    }
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

  const handleDownloadAttachment = async (attachment) => {
    let blobUrl;

    try {
      const response = await TaskServices.downloadAttachment(
        details._id,
        attachment._id
      );

      const blob =
        response instanceof Blob
          ? response
          : response?.data instanceof Blob
            ? response.data
            : new Blob([response?.data ?? response]);

      blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = attachment.filename || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      setError("File download failed. Please try again.");
    } finally {
      if (blobUrl) {
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 1000);
      }
    }
  };

  const handleAddSubTask = async () => {
    const title = subTaskTitle.trim();

    if (!title || !details?._id) return;

    try {
      setSubTaskLoading(true);
      setError("");

      const response = await TaskServices.addSubTask(details._id, {
        title,
      });

      if (!response?.data) {
        throw new Error("Subtask was not added");
      }

      syncSubTaskResponse(response.data);
      setSubTaskTitle("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add subtask"
      );
    } finally {
      setSubTaskLoading(false);
    }
  };

  const handleToggleSubTask = async (subTask, isCompleted) => {
    if (!details?._id || !subTask?._id) return;

    try {
      setSubTaskActionId(subTask._id);
      setError("");

      const response = await TaskServices.updateSubTask(
        details._id,
        subTask._id,
        { isCompleted }
      );

      if (!response?.data) {
        throw new Error("Subtask was not updated");
      }

      syncSubTaskResponse(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update subtask"
      );
    } finally {
      setSubTaskActionId(null);
    }
  };

  const handleDeleteSubTask = async (subTaskId) => {
    if (!details?._id || !subTaskId) return;

    try {
      setDeletingSubTaskId(subTaskId);
      setError("");

      const response = await TaskServices.deleteSubTask(
        details._id,
        subTaskId
      );

      if (!response?.data) {
        throw new Error("Subtask was not deleted");
      }

      syncSubTaskResponse(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete subtask"
      );
    } finally {
      setDeletingSubTaskId(null);
    }
  };

  const syncSubTaskResponse = (updatedTask) => {
    setDetails((prev) => ({
      ...prev,
      subTasks: updatedTask.subTasks || [],
      status: updatedTask.status,
      progressPercentage: updatedTask.progressPercentage ?? 0,
      completedSubtasks: updatedTask.completedSubtasks ?? 0,
      totalSubtasks: updatedTask.totalSubtasks ?? 0,
    }));

    onTaskUpdated?.(details._id, {
      status: updatedTask.status,
      progressPercentage: updatedTask.progressPercentage ?? 0,
      completedSubtasks: updatedTask.completedSubtasks ?? 0,
      totalSubtasks: updatedTask.totalSubtasks ?? 0,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            background: "#024F6E",
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          color: "#FFFFFF",
        }}
      >
        Task Details
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          pt: "24px !important",
          background: "#FFFFFF"
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error && !details ? (
          <Typography color="error">{error}</Typography>
        ) : details ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {details.title}
              </Typography>

              <Box
                sx={{
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <Adjust sx={{ fill: "#8A8A8A", fontSize: "18px" }} />
                  <Typography variant="body2" sx={{ color: "#8A8A8A" }}>Status</Typography>
                </Box>
                <Chip
                  sx={{
                    textTransform: "capitalize",
                    background: "#024F6E",
                    color: "#FFFFFF",
                    "&.MuiChip-root": {
                      "& .MuiChip-icon": {
                        ml: 1,
                        color: "#FFFFFF"
                      }
                    }
                  }}
                  icon={details.status === "in-progress"
                    ? <CircleOutlined sx={{ fontSize: "16px" }} /> : details.status === "paused"
                      ? <ChangeHistoryRounded sx={{ fontSize: "16px" }} />
                      : <StarBorderRounded sx={{ fontSize: "16px" }} />
                  }
                  variant="filled"
                  label={details.status}
                />
              </Box>

              <Box
                sx={{
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <PriorityHigh sx={{ fill: "#8A8A8A", fontSize: "18px" }} />
                  <Typography variant="body2" sx={{ color: "#8A8A8A" }}>Priority</Typography>
                </Box>
                <Chip
                  color={details.priority === "high"
                    ? "error" : details?.priority === "medium"
                      ? "warning" : "success"
                  }
                  variant="outlined"
                  label={details.priority}
                  sx={{
                    px: 1.2,
                    textTransform: "capitalize"
                  }}
                />
              </Box>

              <Box
                sx={{
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <Event sx={{ fill: "#8A8A8A", fontSize: "17px" }} />
                  <Typography variant="body2" sx={{ color: "#8A8A8A" }}>Due date</Typography>
                </Box>
                <Typography variant="body2">
                  {details.dueDate
                    ? new Date(details.dueDate).toLocaleDateString()
                    : "Not set"}
                </Typography>
              </Box>

              <Box
                sx={{
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <Sell sx={{ fill: "#8A8A8A", fontSize: "17px" }} />
                  <Typography variant="body2" sx={{ color: "#8A8A8A" }}>Category</Typography>
                </Box>
                <Typography variant="body2">{details.category || "Uncategorized"}</Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  flexDirection: "column",
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <Description sx={{ fill: "#8A8A8A", fontSize: "17px" }} />
                  <Typography variant="body2" sx={{ color: "#8A8A8A" }}>Description</Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    p: 2,
                    border: "1px solid #D1D1D1",
                    borderRadius: "8px"
                  }}
                >
                  <Typography variant="body2">
                    {details.description || "No description provided."}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "#adadad" }} />

            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
                Subtasks ({details.completedSubtasks || 0}/
                {details.totalSubtasks || 0})
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add a subtask"
                  placeholder="e.g. Create responsive layout"
                  value={subTaskTitle}
                  onChange={(event) => setSubTaskTitle(event.target.value)}
                  disabled={subTaskLoading}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddSubTask();
                    }
                  }}
                />

                <Button
                  variant="contained"
                  onClick={handleAddSubTask}
                  disabled={!subTaskTitle.trim() || subTaskLoading}
                  sx={{ textTransform: "capitalize", whiteSpace: "nowrap" }}
                >
                  {subTaskLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Add"
                  )}
                </Button>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={details.progressPercentage || 0}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: "#E0E0E0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#024F6E",
                      borderRadius: 5,
                    },
                  }}
                />

                <Typography variant="body2" fontWeight={600}>
                  {details.progressPercentage || 0}%
                </Typography>
              </Box>

              {(details.subTasks || []).map((subTask) => (
                <Box
                  key={subTask._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderBottom: "1px solid #EEEEEE",
                    py: 0.5,
                  }}
                >
                  <Checkbox
                    checked={Boolean(subTask.isCompleted)}
                    disabled={subTaskActionId === subTask._id}
                    onChange={(event) =>
                      handleToggleSubTask(subTask, event.target.checked)
                    }
                    sx={{
                      color: "#024F6E",
                      "&.Mui-checked": { color: "#024F6E" },
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      overflowWrap: "anywhere",
                      textDecoration: subTask.isCompleted ? "line-through" : "none",
                      color: subTask.isCompleted ? "text.secondary" : "text.primary",
                    }}
                  >
                    {subTask.title}
                  </Typography>

                  {subTaskActionId === subTask._id && (
                    <CircularProgress size={18} />
                  )}

                  <IconButton
                    color="error"
                    size="small"
                    aria-label={`Delete ${subTask.title}`}
                    disabled={
                      deletingSubTaskId === subTask._id ||
                      subTaskActionId === subTask._id
                    }
                    onClick={() => handleDeleteSubTask(subTask._id)}
                  >
                    {deletingSubTaskId === subTask._id ? (
                      <CircularProgress size={18} />
                    ) : (
                      <DeleteOutlineOutlined fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              ))}

              {(!details.subTasks || details.subTasks.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  No subtasks yet. Add one above to track your progress.
                </Typography>
              )}
            </Box>

            <Divider sx={{ borderColor: "#adadad" }} />

            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Comments ({details.comments?.length || 0})
              </Typography>

              <List disablePadding>
                {(details.comments || []).map((comment) => (
                  <ListItem
                    key={comment._id}
                    alignItems="flex-start"
                    disableGutters
                  >
                    <ListItemAvatar>
                      <Avatar src={comment.user?.profile_picture}>
                        {comment.user?.name?.charAt(0) || "U"}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography fontWeight={600} variant="body2">
                            {comment.user?.name || "User"}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{ color: "#686868" }}
                          >
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleString()
                              : ""}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                            mt: 0.5,
                          }}
                        >
                          {comment.text}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {(!details.comments || details.comments.length === 0) && (
                <Typography color="text.secondary" variant="body2">
                  No comments yet.
                </Typography>
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  mt: 2,
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={5}
                  label="Write a comment"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  disabled={commentLoading}
                  slotProps={{
                    input: {
                      sx: {
                        flexDirection: "column",
                        alignItems: "flex-end"
                      },
                      endAdornment: (
                        <IconButton
                          color="primary"
                          onClick={handleAddComment}
                          disabled={!commentText.trim() || commentLoading}
                          aria-label="Add comment"
                        >
                          {commentLoading ? (
                            <CircularProgress size={22} />
                          ) : (
                            <SendRounded sx={{ fill: "#024F6E !important" }} />
                          )}
                        </IconButton>
                      )
                    }
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ borderColor: "#adadad" }} />

            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Attachments ({details.attachments?.length || 0})
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AttachFileOutlined sx={{ fill: "#024F6E !important" }} />}
                  sx={{ textTransform: "capitalize" }}
                >
                  Select Files
                  <input
                    hidden
                    type="file"
                    multiple
                    onChange={(event) => {
                      setFiles((prev) => [
                        ...prev,
                        ...Array.from(event.target.files || []),
                      ]);

                      // Allow selecting the same file again.
                      event.target.value = "";
                    }}
                  />
                </Button>

                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={!files.length || uploadLoading}
                  sx={{ textTransform: "capitalize" }}
                >
                  {uploadLoading ? "Uploading..." : "Upload"}
                </Button>
              </Box>

              {files.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {Array.from(files).map((file, index) => (
                    <Grid
                      key={`${file.name}-${file.lastModified}-${index}`}
                      size={{ xs: 3, sm: 2, md: 1.2 }}
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
                            setFiles((prev) =>
                              Array.from(prev).filter((_, i) => i !== index)
                            );
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

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {(details.attachments || []).map((attachment) => (
                  <Grid
                    key={attachment._id}
                    size={{ xs: 3, sm: 2, md: 1.2 }}
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
                        aria-label="Delete attachment"
                        disabled={deletingId === attachment._id}
                        sx={{
                          p: 0.5,
                          border: "1px solid transparent",
                          background: "#d32f2f",
                          "&.Mui-disabled": {
                            background: "#909090"
                          },
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
                        onClick={() => handleDeleteAttachment(attachment._id)}
                      >
                        {deletingId === attachment._id ? (
                          <CircularProgress size={16} sx={{ color: "white" }} />
                        ) : (
                          <Close sx={{ fontSize: "16px" }} />
                        )}
                      </IconButton>

                      <Box
                        component="a"
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${attachment.filename || "attachment"}`}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                          width: "100%",
                          color: "inherit",
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          handleDownloadAttachment(attachment);
                        }}
                      >
                        {getFileIcon(attachment.filename)}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {(!details.attachments || details.attachments.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  No attachments yet.
                </Typography>
              )}
            </Box>

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary">
            Select a task to view its details.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pt: 0, pb: 3, background: "#FFFFFF" }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ textTransform: "capitalize" }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog >
  );
};