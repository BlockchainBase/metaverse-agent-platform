import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // mTLS
  mtls: {
    enabled: process.env.MTLS_ENABLED === 'true',
    caCertPath: process.env.MTLS_CA_CERT_PATH || './certs/ca.crt',
    serverCertPath: process.env.MTLS_SERVER_CERT_PATH || './certs/server.crt',
    serverKeyPath: process.env.MTLS_SERVER_KEY_PATH || './certs/server.key',
  },
  
  // WebSocket
  websocket: {
    pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000', 10),
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000', 10),
  },
  
  // Heartbeat
  heartbeat: {
    intervalMs: parseInt(process.env.HEARTBEAT_INTERVAL_MS || '30000', 10),
    timeoutMs: parseInt(process.env.HEARTBEAT_TIMEOUT_MS || '90000', 10),
    statusTtlSeconds: parseInt(process.env.AGENT_STATUS_TTL_SECONDS || '120', 10),
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'combined',
} as const;

export default config;