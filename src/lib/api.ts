const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleAuthError = (response: Response, endpoint: string) => {
    if ((response.status === 401 || response.status === 403) && !endpoint.startsWith('/auth')) {
        localStorage.removeItem('token');
        window.location.href = '/admin';
    }
    throw new Error(`API error: ${response.statusText || 'Unauthorized'}`);
};

export const api = {
    async get(endpoint: string) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: getHeaders(),
        });
        if (!response.ok) handleAuthError(response, endpoint);
        return response.json();
    },
    
    async post(endpoint: string, data: any) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) handleAuthError(response, endpoint);
        return response.json();
    },
    
    async patch(endpoint: string, data: any) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) handleAuthError(response, endpoint);
        return response.json();
    },
    
    async delete(endpoint: string, data?: any) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });
        if (!response.ok) handleAuthError(response, endpoint);
        return response.json();
    }
};
