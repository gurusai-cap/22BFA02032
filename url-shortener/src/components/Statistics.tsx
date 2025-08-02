import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import urlService from '../services/urlService';
import { ShortenedUrl } from '../types';

interface StatisticsState {
  urls: ShortenedUrl[];
  loading: boolean;
  expandedRows: Set<string>;
  copiedUrl: string | null;
}

const Statistics: React.FC = () => {
  const [state, setState] = useState<StatisticsState>({
    urls: [],
    loading: true,
    expandedRows: new Set(),
    copiedUrl: null
  });

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const urls = urlService.getAllShortenedUrls();
      setState(prev => ({ 
        ...prev, 
        urls: urls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const toggleRowExpansion = (urlId: string) => {
    setState(prev => {
      const newExpandedRows = new Set(prev.expandedRows);
      if (newExpandedRows.has(urlId)) {
        newExpandedRows.delete(urlId);
      } else {
        newExpandedRows.add(urlId);
      }
      return { ...prev, expandedRows: newExpandedRows };
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState(prev => ({ ...prev, copiedUrl: text }));
      setTimeout(() => setState(prev => ({ ...prev, copiedUrl: null })), 2000);
    } catch (error) {
      console.error('Failed to copy URL from statistics:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt);
  };

  const getStatusColor = (expiresAt: string) => {
    if (isExpired(expiresAt)) return 'error';
    const timeLeft = new Date(expiresAt).getTime() - new Date().getTime();
    if (timeLeft < 5 * 60 * 1000) return 'warning';
    return 'success';
  };

  const getStatusText = (expiresAt: string) => {
    if (isExpired(expiresAt)) return 'Expired';
    const timeLeft = new Date(expiresAt).getTime() - new Date().getTime();
    if (timeLeft < 5 * 60 * 1000) return 'Expiring soon';
    return 'Active';
  };

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading statistics...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          URL Statistics
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadUrls}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {state.urls.length === 0 ? (
        <Card>
          <CardContent>
            <Alert severity="info">
              No shortened URLs found. Create some URLs first!
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Shortened URLs ({state.urls.length})
            </Typography>
            
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Short URL</TableCell>
                    <TableCell>Original URL</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Clicks</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.urls.map((url) => (
                    <React.Fragment key={url.id}>
                      <TableRow>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: 'monospace',
                                color: 'primary.main',
                                cursor: 'pointer'
                              }}
                              onClick={() => copyToClipboard(url.shortUrl)}
                            >
                              {url.shortUrl}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(url.shortUrl)}
                              color={state.copiedUrl === url.shortUrl ? "success" : "primary"}
                            >
                              {state.copiedUrl === url.shortUrl ? <CheckIcon /> : <CopyIcon />}
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={url.originalUrl}
                          >
                            {url.originalUrl}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(url.createdAt)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(url.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(url.expiresAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusText(url.expiresAt)}
                            color={getStatusColor(url.expiresAt) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {url.clickCount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleRowExpansion(url.id)}
                          >
                            {state.expandedRows.has(url.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      
                                        <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                          <Collapse in={state.expandedRows.has(url.id)} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Typography variant="h6" gutterBottom component="div">
                                Click Details
                              </Typography>
                              
                              {url.clicks.length === 0 ? (
                                <Alert severity="info">
                                  No clicks recorded yet.
                                </Alert>
                              ) : (
                                <List dense>
                                  {url.clicks.map((click, index) => (
                                    <React.Fragment key={click.id}>
                                      <ListItem>
                                        <ListItemText
                                          primary={`${formatDate(click.timestamp)} - ${click.source}`}
                                          secondary={`Location: ${click.location}`}
                                        />
                                      </ListItem>
                                      {index < url.clicks.length - 1 && <Divider />}
                                    </React.Fragment>
                                  ))}
                                </List>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Statistics; 