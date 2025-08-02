import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  IconButton,
  Paper
} from '@mui/material';

import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import urlService from '../services/urlService';
import { UrlFormData, UrlFormErrors, ShortenedUrl } from '../types';

interface UrlFormState {
  forms: UrlFormData[];
  errors: UrlFormErrors[];
  results: (ShortenedUrl | null)[];
  loading: boolean;
  copiedIndex: number | null;
}

const initialFormData: UrlFormData = {
  originalUrl: '',
  validityMinutes: 30,
  customShortCode: ''
};

const UrlShortener: React.FC = () => {
  const [state, setState] = useState<UrlFormState>({
    forms: [initialFormData],
    errors: [{}],
    results: [],
    loading: false,
    copiedIndex: null
  });

  const addForm = () => {
    if (state.forms.length < 5) {
      setState(prev => ({
        ...prev,
        forms: [...prev.forms, initialFormData],
        errors: [...prev.errors, {}]
      }));
    }
  };

  const removeForm = (index: number) => {
    if (state.forms.length > 1) {
      setState(prev => ({
        ...prev,
        forms: prev.forms.filter((_, i) => i !== index),
        errors: prev.errors.filter((_, i) => i !== index),
        results: prev.results.filter((_, i) => i !== index)
      }));
    }
  };

  const updateForm = (index: number, field: keyof UrlFormData, value: string | number) => {
    setState(prev => ({
      ...prev,
      forms: prev.forms.map((form, i) => 
        i === index ? { ...form, [field]: value } : form
      ),
      errors: prev.errors.map((error, i) => 
        i === index ? { ...error, [field]: undefined } : error
      )
    }));
  };

  const validateForm = (form: UrlFormData): UrlFormErrors => {
    const errors: UrlFormErrors = {};

    if (!form.originalUrl.trim()) {
      errors.originalUrl = 'URL is required';
    } else {
      try {
        new URL(form.originalUrl);
      } catch {
        errors.originalUrl = 'Please enter a valid URL (e.g., https://example.com)';
      }
    }

    if (form.validityMinutes < 1 || form.validityMinutes > 525600) {
      errors.validityMinutes = 'Validity must be between 1 minute and 1 year';
    }

    if (form.customShortCode.trim()) {
      if (form.customShortCode.length < 3 || form.customShortCode.length > 20) {
        errors.customShortCode = 'Short code must be between 3 and 20 characters';
      } else if (!/^[a-zA-Z0-9]+$/.test(form.customShortCode)) {
        errors.customShortCode = 'Short code can only contain letters and numbers';
      }
    }

    return errors;
  };

  const handleSubmit = async () => {
    setState(prev => ({ ...prev, loading: true, results: [] }));

    const allErrors = state.forms.map(validateForm);
    const hasErrors = allErrors.some(error => Object.keys(error).length > 0);

    if (hasErrors) {
      setState(prev => ({ ...prev, errors: allErrors, loading: false }));
      return;
    }

    try {
      const requests = state.forms.map(form => ({
        originalUrl: form.originalUrl.trim(),
        validityMinutes: form.validityMinutes,
        customShortCode: form.customShortCode.trim() || undefined
      }));

      const responses = await urlService.shortenMultipleUrls(requests);
      const results = responses.map(response => response.success ? response.data || null : null);

      setState(prev => ({
        ...prev,
        results,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setState(prev => ({ ...prev, copiedIndex: index }));
      setTimeout(() => setState(prev => ({ ...prev, copiedIndex: null })), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Shorten up to 5 URLs at once. Each URL will be valid for 30 minutes by default.
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            URLs to Shorten ({state.forms.length}/5)
          </Typography>
          
          {state.forms.map((form, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  URL #{index + 1}
                </Typography>
                {state.forms.length > 1 && (
                  <IconButton 
                    onClick={() => removeForm(index)}
                    color="error"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Original URL"
                  value={form.originalUrl}
                  onChange={(e) => updateForm(index, 'originalUrl', e.target.value)}
                  error={!!state.errors[index]?.originalUrl}
                  helperText={state.errors[index]?.originalUrl}
                  placeholder="https://example.com"
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    type="number"
                    value={form.validityMinutes}
                    onChange={(e) => updateForm(index, 'validityMinutes', parseInt(e.target.value) || 30)}
                    error={!!state.errors[index]?.validityMinutes}
                    helperText={state.errors[index]?.validityMinutes}
                    inputProps={{ min: 1, max: 525600 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Custom Short Code (optional)"
                    value={form.customShortCode}
                    onChange={(e) => updateForm(index, 'customShortCode', e.target.value)}
                    error={!!state.errors[index]?.customShortCode}
                    helperText={state.errors[index]?.customShortCode}
                    placeholder="mycustom"
                  />
                </Box>
              </Box>
            </Paper>
          ))}

          {state.forms.length < 5 && (
            <Button
              startIcon={<AddIcon />}
              onClick={addForm}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Another URL
            </Button>
          )}

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={state.loading}
              fullWidth
            >
              {state.loading ? 'Shortening URLs...' : 'Shorten URLs'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {state.results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Shortened URLs
            </Typography>
            
            {state.results.map((result, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                {result ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Original: {result.originalUrl}
                      </Typography>
                      <IconButton
                        onClick={() => copyToClipboard(result.shortUrl, index)}
                        size="small"
                        color={state.copiedIndex === index ? "success" : "primary"}
                      >
                        {state.copiedIndex === index ? <CheckIcon /> : <CopyIcon />}
                      </IconButton>
                    </Box>
                    
                    <Typography variant="h6" sx={{ mb: 1, wordBreak: 'break-all' }}>
                      {result.shortUrl}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`Expires: ${formatDate(result.expiresAt)}`}
                        size="small"
                        color="warning"
                      />
                      <Chip 
                        label={`Clicks: ${result.clickCount}`}
                        size="small"
                        color="info"
                      />
                    </Box>
                  </>
                ) : (
                  <Alert severity="error">
                    Failed to shorten URL #{index + 1}
                  </Alert>
                )}
              </Paper>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UrlShortener; 