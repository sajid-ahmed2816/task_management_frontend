import '@fontsource-variable/nunito-sans';
import { createTheme } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: "Nunito Sans Variable"
  },
  palette: {
    primary: {
      main: "#024F6E",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "Nunito Sans Variable",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          borderRadius: "12px"
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
        },
        "backdrop": {
          backdropFilter: "blur(2px)"
        }
      },
    },
    MuiButton: {
      styleOverrides: {
        loadingIndicator: {
          color: '#024F6E'
        },
        "& .Mui-disabled": {
          color: '#000000B3'
        },
        root: {
          borderRadius: "12px",
          textTransform: "capitalize",
          border: "1px solid #024F6E",
          whiteSpace: "nowrap"
        }
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "capitalize",
          border: "1px solid #024F6E",
          whiteSpace: "nowrap",
          fontSize: "14px",
          padding: "5px 15px"
        }
      },
    },
    MuiDivider: {
      styleOverrides: {
        "root": {
          borderColor: '#FFFFFF'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          textTransform: "capitalize"
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          background: "#FFFFFF",
          padding: "24px !important"
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          paddingInline: 24,
          paddingBottom: 24,
          paddingTop: 0,
          background: "#FFFFFF"
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: "#FFFFFF",
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          background: "#024F6E",
          color: "#FFFFFF"
        }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: "12px"
        }
      }
    }
  },
});

export default theme;