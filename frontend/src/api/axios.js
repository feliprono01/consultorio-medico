import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // Envía la cookie HttpOnly automáticamente en cada request (el navegador la gestiona)
    withCredentials: true,
});

// Interceptor de respuesta — manejar sesión expirada o no autorizado
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Cookie expirada o inválida — limpiar estado local y redirigir al login
            localStorage.removeItem('role');
            localStorage.removeItem('isAuthenticated');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
