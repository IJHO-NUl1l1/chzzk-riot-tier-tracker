const proxyConfig = {
  development: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 10000
  },
  
  production: {
    baseUrl: 'https://chzzk-riot-tier-tracker-server.vercel.app/api',
    timeout: 30000
  },
  
  get current() {
    return this.production;
    //return this.development;
  }
};

export default proxyConfig;