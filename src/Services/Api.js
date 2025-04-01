import axios from 'axios';

const API1 = axios.create({
  baseURL: 'http://localhost:5001/api',
});

const API2 = axios.create({
  baseURL: 'http://localhost:5002/api',
});

export { API1, API2 };
