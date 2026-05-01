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
        }
      },
    },
  },
});

export default theme;