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
        if (error.response && error.response.status === 401) {
            // Cookie expirada o inválida — la sesión ya no existe, limpiar y redirigir
            localStorage.removeItem('role');
            localStorage.removeItem('isAuthenticated');
            window.location.href = '/login';
        }
        // 403: la sesión sigue siendo válida, solo falta permiso para esta acción puntual.
        // No desloguear — dejar que el componente que hizo la llamada maneje el error.
        return Promise.reject(error);
    }
);

export default api;
