// API Configuration
// Backend URL from environment or default to production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://capstone-production-7059.up.railway.app';

export const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

export default API_BASE_URL;
