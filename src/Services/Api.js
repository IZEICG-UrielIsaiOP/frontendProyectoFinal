import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';

const API1 = axios.create({
  baseURL: isProduction
    ? 'https://server1-rate-limit.onrender.com/api'
    : 'http://localhost:5001/api',
});

const API2 = axios.create({
  baseURL: isProduction
    ? 'https://sevidor2.onrender.com/api'
    : 'http://localhost:5002/api',
});

export { API1, API2 };
