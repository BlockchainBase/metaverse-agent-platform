import OpenAI from 'openai'

// LLM配置接口
export interface LLMConfig {
  provider: 'openai' | 'openrouter' | 'local'
  apiKey: string
  baseURL?: string
  model: string
  temperature?: number
  maxTokens?: number
}

// 消息接口
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'function'
  content: string
  name?: string
}

// 完成响应接口
export interface LLMCompletion {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
}

// 嵌入向量接口
export interface LLMEmbedding {
  embedding: number[]
  usage?: {
    promptTokens: number
    totalTokens: number
  }
}

/**
 * LLM服务 - 支持OpenAI/OpenRouter/本地模型
 */
export class LLMService {
  private client: OpenAI
  private config: LLMConfig
  
  constructor(config: LLMConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2000,
      ...config
    }
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    })
  }
  
  /**
   * 创建默认配置的LLM服务实例
   */
  static createDefault(): LLMService {
    const provider = (process.env.LLM_PROVIDER as 'openai' | 'openrouter' | 'local') || 'openai'
    const apiKey = process.env.LLM_API_KEY || ''
    const baseURL = process.env.LLM_BASE_URL
    const model = process.env.LLM_MODEL || 'gpt-4o-mini'
    
    return new LLMService({
      provider,
      apiKey,
      baseURL,
      model
    })
  }
  
  /**
   * 获取当前模型
   */
  getModel(): string {
    return this.config.model
  }
  
  /**
   * 将消息转换为OpenAI格式
   */
  private convertMessages(messages: LLMMessage[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map(m => {
      if (m.role === 'function') {
        return {
          role: m.role,
          content: m.content,
          name: m.name || 'default'
        } as OpenAI.Chat.ChatCompletionFunctionMessageParam
      }
      return {
        role: m.role,
        content: m.content
      } as OpenAI.Chat.ChatCompletionSystemMessageParam | OpenAI.Chat.ChatCompletionUserMessageParam | OpenAI.Chat.ChatCompletionAssistantMessageParam
    })
  }
  
  /**
   * 文本生成 - 非流式
   */
  async complete(messages: LLMMessage[]): Promise<LLMCompletion> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: this.convertMessages(messages),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
      
      const choice = response.choices[0]
      return {
        content: choice.message.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        },
        model: response.model
      }
    } catch (error) {
      console.error('LLM completion error:', error)
      throw new Error(`LLM completion failed: ${error}`)
    }
  }
  
  /**
   * 文本生成 - 流式
   */
  async *streamComplete(messages: LLMMessage[]): AsyncGenerator<string> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages: this.convertMessages(messages),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true
      })
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      }
    } catch (error) {
      console.error('LLM stream error:', error)
      throw new Error(`LLM stream failed: ${error}`)
    }
  }
  
  /**
   * 获取文本嵌入向量
   */
  async embed(text: string): Promise<LLMEmbedding> {
    try {
      // 使用text-embedding模型
      const embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'
      
      const response = await this.client.embeddings.create({
        model: embeddingModel,
        input: text
      })
      
      return {
        embedding: response.data[0].embedding,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('LLM embedding error:', error)
      throw new Error(`LLM embedding failed: ${error}`)
    }
  }
  
  /**
   * 批量获取嵌入向量
   */
  async embedBatch(texts: string[]): Promise<LLMEmbedding[]> {
    try {
      const embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'
      
      const response = await this.client.embeddings.create({
        model: embeddingModel,
        input: texts
      })
      
      return response.data.map(d => ({
        embedding: d.embedding,
        usage: {
          promptTokens: Math.floor((response.usage?.prompt_tokens || 0) / texts.length),
          totalTokens: Math.floor((response.usage?.total_tokens || 0) / texts.length)
        }
      }))
    } catch (error) {
      console.error('LLM batch embedding error:', error)
      throw new Error(`LLM batch embedding failed: ${error}`)
    }
  }
  
  /**
   * 结构化输出 - 使用JSON模式
   */
  async completeStructured<T>(
    messages: LLMMessage[],
    schema: Record<string, any>
  ): Promise<{ content: T; usage: LLMCompletion['usage']; model: string }> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: this.convertMessages(messages),
        temperature: 0.1, // 结构化输出使用较低温度
        response_format: { type: 'json_object' }
      })
      
      const content = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        content: content as T,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        },
        model: response.model
      }
    } catch (error) {
      console.error('LLM structured completion error:', error)
      throw new Error(`LLM structured completion failed: ${error}`)
    }
  }
  
  /**
   * 函数调用
   */
  async functionCall(
    messages: LLMMessage[],
    functions: Array<{
      name: string
      description: string
      parameters: Record<string, any>
    }>
  ): Promise<{
    name: string
    arguments: Record<string, any>
    usage: LLMCompletion['usage']
  }> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: this.convertMessages(messages),
        functions,
        function_call: 'auto'
      })
      
      const functionCall = response.choices[0].message.function_call
      
      if (!functionCall) {
        throw new Error('No function call in response')
      }
      
      return {
        name: functionCall.name,
        arguments: JSON.parse(functionCall.arguments || '{}'),
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('LLM function call error:', error)
      throw new Error(`LLM function call failed: ${error}`)
    }
  }
}

// 导出单例
export const llmService = LLMService.createDefault()