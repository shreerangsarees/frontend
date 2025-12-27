import axios from 'axios';
import { auth } from '@/lib/firebase';

const api = axios.create({
    baseURL: '/api', // Ensure this matches your backend API base URL
});

api.interceptors.request.use(
    async (config) => {
        // Check if there is a current user
        const user = auth.currentUser;
        let token = null;

        if (user) {
            try {
                token = await user.getIdToken();
            } catch (error) {
                console.error("Error fetching token from firebase", error);
            }
        }

        // Fallback to localStorage if Firebase isn't ready or fails
        if (!token) {
            token = localStorage.getItem('tmart_token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Token expired or invalid
            // Ideally we try to refresh, but for now prompt login
            // Preventing infinite loops
            originalRequest._retry = true;
            localStorage.removeItem('tmart_token');
            // Redirect to login if not already there
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
