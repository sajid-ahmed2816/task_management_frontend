import React from 'react';
import { Box, Button, DialogActions, DialogContent, DialogTitle, InputAdornment, TextField, Typography } from '@mui/material';
import { MailOutlineRounded } from '@mui/icons-material';
import Dialog from '../dialog';
import { useForm, Controller } from 'react-hook-form';

function InvitationDialog({
  isInviteDialogOpen,
  setIsInviteDialogOpen,
  workspaceName,
  onSubmit,
  isSending
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: { email: "" }
  });

  const submitHandler = async (formdata) => {
    const result = await onSubmit(formdata);
    if (result.status) {
      reset()
    };
  };

  return (
    <Dialog
      open={isInviteDialogOpen}
      onClose={() => setIsInviteDialogOpen(false)}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Invite to {workspaceName}</DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          sx={{ color: "#72818a", mb: 2 }}
        >
          Send an invitation link. They will join only after signing in or registering and accepting it.
        </Typography>
        <Box>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required"
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                type="email"
                label="Email address"
                placeholder="name@example.com"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineRounded sx={{ fontSize: 18, color: "#8c9ba1" }} />
                      </InputAdornment>
                    )
                  }
                }}
                error={!!errors?.email}
                helperText={errors?.email?.message}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setIsInviteDialogOpen(false);
            reset();
          }}
          sx={{
            textTransform: "none",
            color: "#6e7d86"
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={!/^\S+@\S+\.\S+$/.test(watch("email")?.trim()) || isSending}
          variant="contained"
          startIcon={<MailOutlineRounded />}
          sx={{ textTransform: "none" }}
          onClick={handleSubmit(submitHandler)}
        >
          Send invitation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitationDialog;