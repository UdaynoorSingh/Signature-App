import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://signature-app-u9ue.onrender.com',
    withCredentials: true
});

instance.interceptors.request.use(config =>{
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance; 