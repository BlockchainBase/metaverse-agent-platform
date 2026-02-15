import axios from 'axios';
import { logger } from '../utils/logger';

// Feishu API Configuration
const FEISHU_API_BASE = 'https://open.feishu.cn/open-apis';

interface FeishuConfig {
  appId: string;
  appSecret: string;
}

interface MessageCard {
  title: string;
  content: string;
  buttons?: { text: string; url?: string; action?: string }[];
  color?: 'blue' | 'orange' | 'red' | 'green';
}

class FeishuService {
  private appId: string;
  private appSecret: string;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor() {
    this.appId = process.env.FEISHU_APP_ID || '';
    this.appSecret = process.env.FEISHU_APP_SECRET || '';
  }

  // Get access token
  async getAccessToken(): Promise<string> {
    // Return cached token if valid
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${FEISHU_API_BASE}/auth/v3/app_access_token/internal`, {
        app_id: this.appId,
        app_secret: this.appSecret
      });

      this.accessToken = response.data.app_access_token;
      // Token expires in 2 hours, cache for 1.5 hours
      this.tokenExpireTime = Date.now() + (response.data.expire * 1000) - (30 * 60 * 1000);
      
      return this.accessToken!;
    } catch (error) {
      logger.error('Failed to get Feishu access token:', error);
      throw error;
    }
  }

  // Send text message to chat
  async sendTextMessage(chatId: string, text: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      
      await axios.post(
        `${FEISHU_API_BASE}/im/v1/messages?receive_id_type=chat_id`,
        {
          receive_id: chatId,
          content: JSON.stringify({ text }),
          msg_type: 'text'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      logger.info(`Feishu message sent to chat ${chatId}`);
    } catch (error) {
      logger.error('Failed to send Feishu message:', error);
      throw error;
    }
  }

  // Send interactive card message
  async sendCardMessage(chatId: string, card: MessageCard): Promise<void> {
    try {
      const token = await this.getAccessToken();
      
      const cardContent = this.buildCardContent(card);
      
      await axios.post(
        `${FEISHU_API_BASE}/im/v1/messages?receive_id_type=chat_id`,
        {
          receive_id: chatId,
          content: JSON.stringify(cardContent),
          msg_type: 'interactive'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      logger.info(`Feishu card sent to chat ${chatId}`);
    } catch (error) {
      logger.error('Failed to send Feishu card:', error);
      throw error;
    }
  }

  // Send message via webhook (for simple notifications)
  async sendWebhookMessage(webhookUrl: string, message: any): Promise<void> {
    try {
      await axios.post(webhookUrl, message);
      logger.info('Feishu webhook message sent');
    } catch (error) {
      logger.error('Failed to send Feishu webhook:', error);
      throw error;
    }
  }

  // Build card content
  private buildCardContent(card: MessageCard): any {
    const colorMap: Record<string, string> = {
      blue: 'blue',
      orange: 'orange',
      red: 'red',
      green: 'green'
    };

    return {
      config: { wide_screen_mode: true },
      header: {
        title: { tag: 'plain_text', content: card.title },
        template: colorMap[card.color || 'blue']
      },
      elements: [
        {
          tag: 'div',
          text: { tag: 'lark_md', content: card.content }
        },
        ...(card.buttons && card.buttons.length > 0 ? [
          {
            tag: 'action',
            actions: card.buttons.map(btn => ({
              tag: 'button',
              text: { tag: 'plain_text', content: btn.text },
              type: 'primary',
              url: btn.url || undefined
            }))
          }
        ] : [])
      ]
    };
  }

  // Get user info by user ID
  async getUserInfo(userId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${FEISHU_API_BASE}/contact/v3/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get Feishu user info:', error);
      throw error;
    }
  }

  // Send message to user
  async sendMessageToUser(userId: string, message: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      
      await axios.post(
        `${FEISHU_API_BASE}/im/v1/messages?receive_id_type=open_id`,
        {
          receive_id: userId,
          content: JSON.stringify({ text: message }),
          msg_type: 'text'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      logger.info(`Feishu message sent to user ${userId}`);
    } catch (error) {
      logger.error('Failed to send Feishu user message:', error);
      throw error;
    }
  }
}

export const feishuService = new FeishuService();