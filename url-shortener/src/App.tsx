import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Box, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import logger from './utils/logger';
import UrlShortener from './components/UrlShortener';
import Statistics from './components/Statistics';
import RedirectHandler from './components/RedirectHandler';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

function App() {
  React.useEffect(() => {
    logger.info('Application started', { version: '1.0.0' }, 'App');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                URL Shortener
              </Typography>
              <Link 
                component={RouterLink} 
                to="/" 
                color="inherit" 
                sx={{ textDecoration: 'none', mr: 2 }}
              >
                Shorten URLs
              </Link>
              <Link 
                component={RouterLink} 
                to="/statistics" 
                color="inherit" 
                sx={{ textDecoration: 'none' }}
              >
                Statistics
              </Link>
            </Toolbar>
          </AppBar>
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/" element={<UrlShortener />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/:shortCode" element={<RedirectHandler />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
