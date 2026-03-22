/**
 * Proxy client for communicating with the proxy server
 */

import proxyConfig from './config.js';

class ProxyClient {
  /**
   * Get the current base URL
   * @returns {string} Base URL
   */
  getBaseUrl() {
    return proxyConfig.current.baseUrl;
  }
  
  /**
   * Make a GET request to the proxy server
   * @param {string} endpoint - API endpoint
   * @param {Object} params - URL parameters
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${proxyConfig.current.baseUrl}${endpoint}`);

    // Add URL parameters
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), proxyConfig.current.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Make a POST request to the proxy server
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, body = {}, options = {}) {
    const url = `${proxyConfig.current.baseUrl}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), proxyConfig.current.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        body: JSON.stringify(body),
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      console.error('API request failed:', error);
      throw error;
    }
  }
  /**
   * Make a DELETE request to the proxy server
   * @param {string} endpoint - API endpoint
   * @param {Object} params - URL parameters
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint, params = {}, options = {}) {
    const url = new URL(`${proxyConfig.current.baseUrl}${endpoint}`);

    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), proxyConfig.current.timeout);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      console.error('API request failed:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const proxyClient = new ProxyClient();
export default proxyClient;