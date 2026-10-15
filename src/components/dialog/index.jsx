import React from "react";
import MuiDialog from "@mui/material/Dialog";
import { Slide } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide ref={ref} {...props} />;
});

function Dialog(props) {
  console.log(props);
  return (
    <MuiDialog
      {...props}
      slots={{
        transition: Transition
      }}
      slotProps={{
        transition: {
          direction: props.direction
        },
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