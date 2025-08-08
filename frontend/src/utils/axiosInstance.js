// File: frontend/src/utils/axiosInstance.js

import axios from 'axios';

const baseURL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
    config => {
        const authTokens = localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null;

        if (authTokens) {
            config.headers['Authorization'] = `Bearer ${authTokens.access}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;