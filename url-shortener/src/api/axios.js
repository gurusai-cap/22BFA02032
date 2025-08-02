// src/api/axios.js
import axios from 'axios';

// Get the token from localStorage
const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: 'http://20.244.56.144/evaluation-service', // Your API base URL
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

export default api;
