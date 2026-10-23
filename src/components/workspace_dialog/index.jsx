import React from 'react';
import { Button, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import Dialog from '../dialog';
import { useForm, Controller } from 'react-hook-form';

const defaultValues = {
  workspace: "",
  description: ""
};

function WorkspaceDialog({ isOpen, handleClose, onSubmit, isCreating }) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  const submitHandler = async (data) => {
    const success = await onSubmit(data);
    if (success) {
      reset(defaultValues);
    };
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Create a workspace</DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          sx={{ color: "#788892", mb: 2 }}
        >
          Give this workspace a name and a little context for what belongs here.
        </Typography>
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
          onClick={handleClose}
          sx={{ textTransform: "none", color: "#6e7d86" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(submitHandler)}
          disabled={!watch("workspace").trim() || isCreating}
          variant="contained"
        >
          Create workspace
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkspaceDialog;