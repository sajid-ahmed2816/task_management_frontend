import MuiDialog from "@mui/material/Dialog";

function Dialog(props) {
  return (
    <MuiDialog
      {...props}
      slotProps={{
        paper: {
          sx: {
            background: "#024F6E",
            borderRadius: "12px"
          }
        }
      }}
    >
      {...props.children}
    </MuiDialog>
  );
};

export default Dialog;