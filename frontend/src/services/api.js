const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// API utility functions
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.setToken(null);
    }
  }

  async verifyToken() {
    try {
      return await this.get('/auth/verify');
    } catch (error) {
      this.setToken(null);
      throw error;
    }
  }

  // User management methods
  async getUserProfile() {
    return this.get('/users/profile');
  }

  async updateUserProfile(userData) {
    return this.put('/users/profile', userData);
  }

  async changePassword(passwordData) {
    return this.put('/users/password', passwordData);
  }

  async getUserDashboard() {
    return this.get('/users/dashboard');
  }

  async deleteAccount(password) {
    return this.delete('/users/account', { password });
  }

  // Assessment methods
  async getPackages() {
    return this.get('/assessments/packages');
  }

  async getFilteredPackages() {
    return this.get('/assessments/packages/filtered');
  }

  async getPackageDetails(packageId) {
    return this.get(`/assessments/packages/${packageId}`);
  }

  async createAssessment(packageId) {
    return this.post('/assessments/create', { packageId });
  }

  async getUserAssessments() {
    return this.get('/assessments/my-assessments');
  }

  async updateAssessmentStatus(assessmentId, status) {
    return this.put(`/assessments/${assessmentId}/status`, { status });
  }

  async saveAssessmentResults(assessmentId, results) {
    return this.put(`/assessments/${assessmentId}/results`, { results });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'ERROR', message: 'Backend not accessible' };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;