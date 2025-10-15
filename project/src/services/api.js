import axios from 'axios';
import { jwtDecode } from "jwt-decode";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://productix-backend-v1rk.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  signup: async (userData) => {
    const response = await api.post('/signup', userData);
    return response.data;
  },



  login: async (credentials) => {
    const response = await api.post("/login/login", credentials);
    if (response.data.access_token) {
      const token = response.data.access_token;
      localStorage.setItem("token", token);

      // decode token to get role
      const decoded = jwtDecode(token);
      localStorage.setItem("role", decoded.role);
    }
    return response.data;
  },


  logout: () => {
    localStorage.removeItem('token');
  },

  getRole: () => {
    return localStorage.getItem('role');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Productivity calculation services
export const productivityService = {
  calculate: async (data) => {
    
    const response = await api.post('/productivity/calculate', data);
    console.log(response.data);
    return response.data;

  },
  getAnalysisCount: async () => {
    try {
      const response = await api.get('/analysis-count'); // use api instance!
      return response.data; // { analysis_count: 5 }
    } catch (error) {
      console.error('Error fetching analysis count:', error);
      return { analysis_count: 0 };
    }
  }
  ,

  getRecords: async () => {
    try {
      const response = await api.get('/analytics/productivity-records');
      return response.data;
    } catch (error) {
      // Return empty array if endpoint doesn't exist yet
      console.warn('Productivity records endpoint not available:', error.message);
      return [];
    }
  }
};

// AI Analysis services
export const analysisService = {
  analyze: async (data) => {
    const response = await api.post('/ai/analyze', data);
    return response.data;
  }
};

// Chatbot services
export const chatbotService = {
  sendMessage: async (data) => {
    const response = await api.post('/chatbot/rag', data);
    return response.data;
  }
};

// AI Agent services
export const agentService = {
  generateReport: async (data) => {
    const response = await api.post('/agent', data);
    return response.data;
  },
  downloadReport: (reportId) => {
    return `${import.meta.env.VITE_API_URL}/agent/${reportId}/download`;
  },
};

export const ragChatbotService = {
  sendMessage: async (data) => {
    const response = await api.post("/rag_chat", data);
    return response.data; // ✅ returns plain string
  },
};


export default api;
