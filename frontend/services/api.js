import axios from 'axios';

// Create an Axios instance with default configuration
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://139.59.82.174/api', // Use environment variable for baseURL
});

export default API;
