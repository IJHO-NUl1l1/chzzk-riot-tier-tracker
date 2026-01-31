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
        // 'credentials: include'는 CORS 정책을 더 엄격하게 만듬
        // 크롬 익스텐션에서는 필요하지 않으므로 제거
        mode: 'cors', // 명시적으로 CORS 모드 설정
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