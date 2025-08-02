// src/components/TestApi.js
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const TestApi = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/your-endpoint') // Replace with your actual API endpoint
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('API call failed:', error);
      });
  }, []);

  return (
    <div>
      <h2>API Response:</h2>
      <pre>{data ? JSON.stringify(data, null, 2) : 'Loading...'}</pre>
    </div>
  );
};

export default TestApi;
