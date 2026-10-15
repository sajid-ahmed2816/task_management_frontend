import React from 'react'
import Dialog from '../dialog';
import { Box, Button, CircularProgress, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, Typography } from '@mui/material';
import { CloseRounded, DeleteOutlineRounded, WarningRounded } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


function ConfirmationDialog({ open, handleClose, handleDelete, title, description, content, isDeleting }) {

  return (
    <Dialog
      open={open}
      slots={{
        transition: Transition,
      }}
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      role="alertdialog"
      fullWidth
      maxWidth={"xs"}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <WarningRounded sx={{ fontSize: 60 }} color="warning" />
          <Box>
            <Typography sx={{ fontSize: "18px" }}>{content}</Typography>
            <DialogContentText id="alert-dialog-slide-description">
              {description}
            </DialogContentText>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          variant="outlined"
          startIcon={<CloseRounded />}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          color="error"
          variant='contained'
          startIcon={isDeleting ?
            <CircularProgress size="18px" sx={{ color: "#FFFFFF" }} /> :
            <DeleteOutlineRounded />
          }
          onClick={handleDelete}
          disabled={isDeleting}
          sx={{
            border: "none"
          }}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog