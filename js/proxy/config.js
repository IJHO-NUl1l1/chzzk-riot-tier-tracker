/**
 * Proxy server configuration for connecting to the Riot API server
 */

const proxyConfig = {
  // Development environment (local server)
  development: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 10000 // 10 seconds
  },
  
  // Production environment (deployed server)
  production: {
    baseUrl: 'https://chzzk-lol-tier-server.vercel.app/api', // 배포된 서버 URL
    timeout: 30000 // 30 seconds
  },
  
  // Get current environment configuration
  get current() {
    // 로컬 테스트를 위해 개발 모드 강제 활성화
    return this.development;
    
    // 배포 시 아래 코드로 변경
    // const isDev = localStorage.getItem('dev_mode') === 'true';
    // return isDev ? this.development : this.production;
  }
};

export default proxyConfig;