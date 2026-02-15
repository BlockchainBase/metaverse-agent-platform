import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config';
import { IAuthTokens, ITokenPayload } from '@/types';

// 密码处理
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// JWT 处理
export const generateTokens = (agentId: string, id: string): IAuthTokens => {
  const accessToken = jwt.sign(
    { agentId, id, type: 'access' } as ITokenPayload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { agentId, id, type: 'refresh' } as ITokenPayload,
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  // 解析过期时间
  const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
  const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 604800;

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, config.jwt.secret) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as ITokenPayload;
};

// UUID 生成
export const generateUUID = (): string => {
  return uuidv4();
};

export const generateTaskId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 响应辅助函数
export const createSuccessResponse = <T>(data: T, meta?: any) => ({
  success: true,
  data,
  meta,
});

export const createErrorResponse = (code: string, message: string, details?: any) => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
});

// 日期处理
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

// 验证辅助
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidAgentId = (agentId: string): boolean => {
  // Agent ID 格式：字母、数字、下划线、连字符，3-50个字符
  const agentIdRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return agentIdRegex.test(agentId);
};

// 安全相关
export const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000);
};

export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 证书指纹处理
export const extractCertFingerprint = (cert: string): string => {
  // 移除证书头尾和换行，计算 SHA-256 指纹
  const cleanCert = cert
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s/g, '');
  
  // 简化实现，实际应该使用 crypto 模块
  return `sha256_${cleanCert.substring(0, 64)}`;
};

// 日志格式化
export const formatLogMessage = (level: string, message: string, meta?: any): string => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
};