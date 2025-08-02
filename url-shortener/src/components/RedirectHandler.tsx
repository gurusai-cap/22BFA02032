import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import urlService from '../services/urlService';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    originalUrl: string | null;
    redirecting: boolean;
  }>({
    loading: true,
    error: null,
    originalUrl: null,
    redirecting: false
  });

  useEffect(() => {
    if (!shortCode) {
      setState(prev => ({ ...prev, loading: false, error: 'Invalid short code' }));
      return;
    }

    urlService.recordClick(shortCode, 'direct');

    const shortenedUrl = urlService.getShortenedUrl(shortCode);

    if (!shortenedUrl) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'URL not found or has expired' 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      loading: false, 
      originalUrl: shortenedUrl.originalUrl 
    }));

    const redirectTimer = setTimeout(() => {
      setState(prev => ({ ...prev, redirecting: true }));
      
      window.open(shortenedUrl.originalUrl, '_blank');
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [shortCode, navigate]);

  const handleManualRedirect = () => {
    if (state.originalUrl) {
      setState(prev => ({ ...prev, redirecting: true }));
      
      window.open(state.originalUrl, '_blank');
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (state.loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6">
          Processing your request...
        </Typography>
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        gap: 3
      }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.error}
            </Alert>
            <Typography variant="h6" gutterBottom>
              URL Not Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The shortened URL you're looking for doesn't exist or has expired.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
            >
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (state.redirecting) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6">
          Redirecting you to the destination...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You will be redirected back to the home page shortly.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '400px',
      gap: 3
    }}>
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Redirecting...
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            You're being redirected to:
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: 'grey.100', 
            borderRadius: 1, 
            mb: 3,
            wordBreak: 'break-all'
          }}>
            <Typography variant="body2" fontFamily="monospace">
              {state.originalUrl}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You will be automatically redirected in a few seconds, or click the button below to go now.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<OpenInNewIcon />}
              onClick={handleManualRedirect}
            >
              Go Now
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
            >
              Go Back
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RedirectHandler; 