import { PrismaClient, KnowledgeBase, KnowledgeDocument, DocumentChunk } from '@prisma/client'
import { llmService } from './llmService.js'
import { VectorService, VectorDocument } from './vectorService.js'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { v4 as uuidv4 } from 'uuid'

// 文档处理选项
export interface DocumentProcessOptions {
  chunkSize?: number
  chunkOverlap?: number
  maxFileSize?: number
  allowedTypes?: string[]
}

// 搜索结果接口
export interface KnowledgeSearchResult {
  answer: string
  sources: Array<{
    documentId: string
    documentTitle: string
    chunkIndex: number
    content: string
    relevance: number
  }>
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// 问答历史
export interface QAPair {
  question: string
  answer: string
  sources: string[]
  timestamp: Date
}

/**
 * 知识库服务 - RAG核心功能
 */
export class KnowledgeService {
  private prisma: PrismaClient
  private vectorService: VectorService
  private options: DocumentProcessOptions
  
  constructor(prisma: PrismaClient, vectorService: VectorService) {
    this.prisma = prisma
    this.vectorService = vectorService
    this.options = {
      chunkSize: 1000,
      chunkOverlap: 200,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['pdf', 'txt', 'md', 'docx', 'json']
    }
  }
  
  // ============================================
  // 知识库管理
  // ============================================
  
  /**
   * 创建知识库
   */
  async createKnowledgeBase(data: {
    name: string
    description?: string
    organizationId: string
    vectorDimension?: number
    embeddingModel?: string
  }): Promise<KnowledgeBase> {
    return this.prisma.knowledgeBase.create({
      data: {
        name: data.name,
        description: data.description,
        organizationId: data.organizationId,
        vectorDimension: data.vectorDimension || 1536,
        embeddingModel: data.embeddingModel || 'text-embedding-3-small'
      }
    })
  }
  
  /**
   * 获取知识库列表
   */
  async listKnowledgeBases(organizationId: string): Promise<KnowledgeBase[]> {
    return this.prisma.knowledgeBase.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
  
  /**
   * 获取知识库详情
   */
  async getKnowledgeBase(id: string): Promise<KnowledgeBase & { stats: any }> {
    const kb = await this.prisma.knowledgeBase.findUnique({
      where: { id }
    })
    
    if (!kb) {
      throw new Error('Knowledge base not found')
    }
    
    const stats = await this.vectorService.getStats(id)
    
    return { ...kb, stats }
  }
  
  /**
   * 删除知识库
   */
  async deleteKnowledgeBase(id: string): Promise<void> {
    await this.prisma.knowledgeBase.delete({
      where: { id }
    })
  }
  
  // ============================================
  // 文档处理
  // ============================================
  
  /**
   * 处理上传的文档
   */
  async processDocument(
    file: {
      buffer: Buffer
      originalname: string
      mimetype: string
      size: number
    },
    knowledgeBaseId: string,
    userId: string
  ): Promise<KnowledgeDocument> {
    // 验证文件类型
    const fileType = this.getFileType(file.originalname, file.mimetype)
    if (!this.options.allowedTypes?.includes(fileType)) {
      throw new Error(`File type not supported: ${fileType}`)
    }
    
    // 验证文件大小
    if (file.size > (this.options.maxFileSize || 50 * 1024 * 1024)) {
      throw new Error('File too large')
    }
    
    // 提取文本内容
    const content = await this.extractText(file.buffer, fileType)
    
    // 创建文档记录
    const document = await this.prisma.knowledgeDocument.create({
      data: {
        title: file.originalname,
        content,
        fileType,
        fileSize: file.size,
        knowledgeBaseId,
        createdBy: userId,
        vectorStatus: 'processing'
      }
    })
    
    // 异步处理分块和向量化
    this.processChunks(document).catch(error => {
      console.error('Chunk processing error:', error)
      this.prisma.knowledgeDocument.update({
        where: { id: document.id },
        data: { vectorStatus: 'failed' }
      })
    })
    
    return document
  }
  
  /**
   * 提取文件文本
   */
  private async extractText(buffer: Buffer, fileType: string): Promise<string> {
    switch (fileType) {
      case 'pdf':
        const pdfData = await pdfParse(buffer)
        return pdfData.text
        
      case 'docx':
        const docxResult = await mammoth.extractRawText({ buffer })
        return docxResult.value
        
      case 'txt':
      case 'md':
      case 'json':
        return buffer.toString('utf-8')
        
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  }
  
  /**
   * 获取文件类型
   */
  private getFileType(filename: string, mimetype: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (ext && ['pdf', 'txt', 'md', 'docx', 'json'].includes(ext)) {
      return ext
    }
    
    // 从mimetype推断
    const mimeMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'text/markdown': 'md',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/json': 'json'
    }
    
    return mimeMap[mimetype] || 'txt'
  }
  
  /**
   * 处理文档分块
   */
  private async processChunks(document: KnowledgeDocument): Promise<void> {
    try {
      // 文本分块
      const chunks = this.chunkText(document.content)
      
      // 创建分块记录
      const chunkRecords = await Promise.all(
        chunks.map(async (chunk, index) => {
          return this.prisma.documentChunk.create({
            data: {
              documentId: document.id,
              content: chunk.content,
              chunkIndex: index,
              tokenCount: chunk.tokenCount,
              metadata: JSON.stringify({
                documentId: document.id,
                position: chunk.position
              })
            }
          })
        })
      )
      
      // 准备向量文档
      const vectorDocs: VectorDocument[] = chunkRecords.map((chunk, index) => ({
        id: chunk.id,
        content: chunk.content,
        metadata: {
          documentId: document.id,
          chunkIndex: index,
          title: document.title,
          source: document.fileUrl || document.title,
          knowledgeBaseId: document.knowledgeBaseId,
          organizationId: '' // 需要通过知识库查询获取
        }
      }))
      
      // 添加到向量存储
      await this.vectorService.addDocuments(vectorDocs)
      
      // 更新向量ID
      await Promise.all(
        chunkRecords.map((chunk, index) => 
          this.prisma.documentChunk.update({
            where: { id: chunk.id },
            data: { vectorId: chunk.id }
          })
        )
      )
      
      // 更新文档状态
      await this.prisma.knowledgeDocument.update({
        where: { id: document.id },
        data: {
          vectorStatus: 'completed',
          chunkCount: chunks.length
        }
      })
      
    } catch (error) {
      console.error('Process chunks error:', error)
      await this.prisma.knowledgeDocument.update({
        where: { id: document.id },
        data: { vectorStatus: 'failed' }
      })
      throw error
    }
  }
  
  /**
   * 文本分块
   */
  private chunkText(text: string): Array<{ content: string; tokenCount: number; position: number }> {
    const chunks: Array<{ content: string; tokenCount: number; position: number }> = []
    const chunkSize = this.options.chunkSize || 1000
    const overlap = this.options.chunkOverlap || 200
    
    // 按段落分割
    const paragraphs = text.split(/\n\s*\n/)
    let currentChunk = ''
    let position = 0
    
    for (const para of paragraphs) {
      const trimmed = para.trim()
      if (!trimmed) continue
      
      // 如果当前块加上新段落超过限制，保存当前块
      if (currentChunk.length + trimmed.length > chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          tokenCount: this.estimateTokens(currentChunk),
          position
        })
        position += currentChunk.length - overlap
        // 保留重叠部分
        currentChunk = currentChunk.slice(-overlap) + '\n\n' + trimmed
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmed
      }
    }
    
    // 添加最后一个块
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        tokenCount: this.estimateTokens(currentChunk),
        position
      })
    }
    
    return chunks
  }
  
  /**
   * 估算token数量 (简化估算: 1 token ≈ 4 字符)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }
  
  // ============================================
  // 语义检索
  // ============================================
  
  /**
   * 语义搜索
   */
  async search(
    query: string,
    knowledgeBaseId: string,
    options: {
      topK?: number
      minScore?: number
      contextWindow?: number
    } = {}
  ): Promise<KnowledgeSearchResult> {
    const { topK = 5, minScore = 0.7, contextWindow = 2 } = options
    
    // 向量检索
    const vectorResults = await this.vectorService.search(query, knowledgeBaseId, {
      topK: topK * 2, // 获取更多以便筛选
      minScore
    })
    
    if (vectorResults.length === 0) {
      return {
        answer: '未找到相关信息。',
        sources: [],
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      }
    }
    
    // 获取上下文
    const contexts = await this.getContexts(vectorResults, contextWindow)
    
    // 构建提示
    const prompt = this.buildRAGPrompt(query, contexts)
    
    // 生成回答
    const completion = await llmService.complete([
      { role: 'system', content: '你是一个知识库助手。基于提供的参考文档回答用户问题。如果参考文档中没有相关信息，请明确说明。回答应简洁准确，并引用来源。' },
      { role: 'user', content: prompt }
    ])
    
    // 构建来源
    const sources = contexts.map(ctx => ({
      documentId: ctx.metadata.documentId,
      documentTitle: ctx.metadata.title,
      chunkIndex: ctx.metadata.chunkIndex,
      content: ctx.content.substring(0, 200) + '...',
      relevance: ctx.score
    }))
    
    return {
      answer: completion.content,
      sources,
      usage: completion.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    }
  }
  
  /**
   * 获取上下文（包括相邻块）
   */
  private async getContexts(
    results: Array<{ id: string; score: number; content: string; metadata: any }>,
    windowSize: number
  ): Promise<Array<{ content: string; score: number; metadata: any }>> {
    const contexts: Array<{ content: string; score: number; metadata: any }> = []
    
    for (const result of results.slice(0, 5)) {
      const { documentId, chunkIndex } = result.metadata
      
      // 获取相邻块
      const adjacentChunks = await this.prisma.documentChunk.findMany({
        where: {
          documentId,
          chunkIndex: {
            gte: Math.max(0, chunkIndex - windowSize),
            lte: chunkIndex + windowSize
          }
        },
        orderBy: { chunkIndex: 'asc' }
      })
      
      // 合并上下文
      const contextContent = adjacentChunks.map(c => c.content).join('\n\n')
      
      contexts.push({
        content: contextContent,
        score: result.score,
        metadata: result.metadata
      })
    }
    
    return contexts
  }
  
  /**
   * 构建RAG提示
   */
  private buildRAGPrompt(query: string, contexts: Array<{ content: string; metadata: any }>): string {
    const contextText = contexts.map((ctx, index) => {
      return `[${index + 1}] 来源: ${ctx.metadata.title}\n${ctx.content}`
    }).join('\n\n---\n\n')
    
    return `参考文档:\n\n${contextText}\n\n---\n\n问题: ${query}\n\n请基于以上参考文档回答问题。在回答中引用来源编号（如[1]、[2]）。如果文档中没有相关信息，请说明。`
  }
  
  // ============================================
  // 文档管理
  // ============================================
  
  /**
   * 获取文档列表
   */
  async listDocuments(knowledgeBaseId: string): Promise<KnowledgeDocument[]> {
    return this.prisma.knowledgeDocument.findMany({
      where: { knowledgeBaseId },
      orderBy: { createdAt: 'desc' }
    })
  }
  
  /**
   * 获取文档详情
   */
  async getDocument(id: string): Promise<KnowledgeDocument & { chunks: DocumentChunk[] }> {
    const doc = await this.prisma.knowledgeDocument.findUnique({
      where: { id },
      include: { chunks: true }
    })
    
    if (!doc) {
      throw new Error('Document not found')
    }
    
    return doc
  }
  
  /**
   * 删除文档
   */
  async deleteDocument(id: string): Promise<void> {
    const doc = await this.prisma.knowledgeDocument.findUnique({
      where: { id }
    })
    
    if (!doc) {
      throw new Error('Document not found')
    }
    
    // 删除向量
    await this.vectorService.deleteDocument(id, doc.knowledgeBaseId)
    
    // 删除记录
    await this.prisma.knowledgeDocument.delete({
      where: { id }
    })
  }
  
  /**
   * 重新向量化文档
   */
  async revectorizeDocument(id: string): Promise<void> {
    const doc = await this.prisma.knowledgeDocument.findUnique({
      where: { id }
    })
    
    if (!doc) {
      throw new Error('Document not found')
    }
    
    // 删除旧向量
    await this.vectorService.deleteDocument(id, doc.knowledgeBaseId)
    
    // 删除旧分块
    await this.prisma.documentChunk.deleteMany({
      where: { documentId: id }
    })
    
    // 重新处理
    await this.processChunks(doc)
  }
}