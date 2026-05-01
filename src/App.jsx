import './App.css';
import theme from './assets/theme';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import publicRoutes from './routes/public/routes';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster />
      <BrowserRouter>
        <Routes>
          {publicRoutes.map((r, i) => (
            <Route key={i} path={r.path} element={r.component} />
          ))}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
