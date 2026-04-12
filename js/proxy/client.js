import proxyConfig from './config.js';

class ProxyClient {
  getBaseUrl() {
    return proxyConfig.current.baseUrl;
  }
  
  async get(endpoint, params = {}) {
    const url = new URL(`${proxyConfig.current.baseUrl}${endpoint}`);

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

const proxyClient = new ProxyClient();
export default proxyClient;