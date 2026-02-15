import { Pinecone } from '@pinecone-database/pinecone'
import { PrismaClient } from '@prisma/client'
import { llmService, LLMEmbedding } from './llmService.js'

// 向量文档接口
export interface VectorDocument {
  id: string
  content: string
  metadata: {
    documentId: string
    chunkIndex: number
    title: string
    source: string
    knowledgeBaseId: string
    organizationId: string
    [key: string]: any
  }
}

// 向量搜索结果接口
export interface VectorSearchResult {
  id: string
  score: number
  content: string
  metadata: VectorDocument['metadata']
}

// 向量存储配置
export interface VectorStoreConfig {
  provider: 'pinecone' | 'qdrant' | 'sqlite' | 'memory'
  dimension: number
  pineconeApiKey?: string
  pineconeIndexName?: string
  qdrantUrl?: string
  qdrantApiKey?: string
}

/**
 * 向量存储服务 - 支持多种向量数据库
 */
export class VectorService {
  private config: VectorStoreConfig
  private pinecone?: Pinecone
  private index?: any
  private prisma: PrismaClient
  private memoryStore: Map<string, { vector: number[]; document: VectorDocument }> = new Map()
  
  constructor(config: VectorStoreConfig, prisma: PrismaClient) {
    this.config = {
      dimension: 1536,
      ...config
    }
    this.prisma = prisma
    
    if (config.provider === 'pinecone') {
      this.initPinecone()
    }
  }
  
  /**
   * 创建默认配置的向量服务
   */
  static createDefault(prisma: PrismaClient): VectorService {
    const provider = (process.env.VECTOR_PROVIDER as 'pinecone' | 'qdrant' | 'sqlite' | 'memory') || 'sqlite'
    const dimension = parseInt(process.env.VECTOR_DIMENSION || '1536')
    
    return new VectorService({
      provider,
      dimension,
      pineconeApiKey: process.env.PINECONE_API_KEY,
      pineconeIndexName: process.env.PINECONE_INDEX_NAME,
      qdrantUrl: process.env.QDRANT_URL,
      qdrantApiKey: process.env.QDRANT_API_KEY
    }, prisma)
  }
  
  /**
   * 初始化Pinecone
   */
  private async initPinecone() {
    if (!this.config.pineconeApiKey) {
      throw new Error('Pinecone API key not configured')
    }
    
    this.pinecone = new Pinecone({
      apiKey: this.config.pineconeApiKey
    })
    
    const indexName = this.config.pineconeIndexName || 'metaverse-knowledge'
    this.index = this.pinecone.index(indexName)
  }
  
  /**
   * 确保命名空间存在
   */
  private getNamespace(knowledgeBaseId: string): string {
    return `kb_${knowledgeBaseId}`
  }
  
  /**
   * 添加文档到向量存储
   */
  async addDocuments(docs: VectorDocument[]): Promise<void> {
    if (docs.length === 0) return
    
    // 获取嵌入向量
    const texts = docs.map(d => d.content)
    const embeddings = await llmService.embedBatch(texts)
    
    switch (this.config.provider) {
      case 'pinecone':
        await this.addToPinecone(docs, embeddings)
        break
      case 'sqlite':
        await this.addToSQLite(docs, embeddings)
        break
      case 'memory':
        this.addToMemory(docs, embeddings)
        break
      default:
        throw new Error(`Unsupported vector provider: ${this.config.provider}`)
    }
  }
  
  /**
   * 添加到Pinecone
   */
  private async addToPinecone(docs: VectorDocument[], embeddings: LLMEmbedding[]) {
    if (!this.index) {
      await this.initPinecone()
    }
    
    // 按knowledgeBaseId分组
    const groupedByKB = new Map<string, Array<{ doc: VectorDocument; embedding: number[] }>>()
    
    for (let i = 0; i < docs.length; i++) {
      const kbId = docs[i].metadata.knowledgeBaseId
      if (!groupedByKB.has(kbId)) {
        groupedByKB.set(kbId, [])
      }
      groupedByKB.get(kbId)!.push({ doc: docs[i], embedding: embeddings[i].embedding })
    }
    
    // 批量上传
    for (const [kbId, items] of groupedByKB) {
      const namespace = this.getNamespace(kbId)
      const vectors = items.map(item => ({
        id: item.doc.id,
        values: item.embedding,
        metadata: {
          content: item.doc.content,
          ...item.doc.metadata
        }
      }))
      
      // 分批上传 (Pinecone限制每批100个)
      const batchSize = 100
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize)
        await this.index!.namespace(namespace).upsert(batch)
      }
    }
  }
  
  /**
   * 添加到SQLite (通过Prisma)
   */
  private async addToSQLite(docs: VectorDocument[], embeddings: LLMEmbedding[]) {
    // 更新document_chunks表中的embedding字段
    for (let i = 0; i < docs.length; i++) {
      await this.prisma.documentChunk.update({
        where: { id: docs[i].id },
        data: {
          embedding: JSON.stringify(embeddings[i].embedding)
        }
      })
    }
  }
  
  /**
   * 添加到内存存储
   */
  private addToMemory(docs: VectorDocument[], embeddings: LLMEmbedding[]) {
    for (let i = 0; i < docs.length; i++) {
      this.memoryStore.set(docs[i].id, {
        vector: embeddings[i].embedding,
        document: docs[i]
      })
    }
  }
  
  /**
   * 相似性搜索
   */
  async search(
    query: string,
    knowledgeBaseId: string,
    options: {
      topK?: number
      filter?: Record<string, any>
      minScore?: number
    } = {}
  ): Promise<VectorSearchResult[]> {
    const { topK = 5, filter, minScore = 0.7 } = options
    
    // 获取查询向量
    const queryEmbedding = await llmService.embed(query)
    
    switch (this.config.provider) {
      case 'pinecone':
        return this.searchPinecone(queryEmbedding.embedding, knowledgeBaseId, { topK, filter, minScore })
      case 'sqlite':
        return this.searchSQLite(queryEmbedding.embedding, knowledgeBaseId, { topK, minScore })
      case 'memory':
        return this.searchMemory(queryEmbedding.embedding, knowledgeBaseId, { topK, minScore })
      default:
        throw new Error(`Unsupported vector provider: ${this.config.provider}`)
    }
  }
  
  /**
   * Pinecone搜索
   */
  private async searchPinecone(
    queryVector: number[],
    knowledgeBaseId: string,
    options: { topK: number; filter?: Record<string, any>; minScore: number }
  ): Promise<VectorSearchResult[]> {
    if (!this.index) {
      await this.initPinecone()
    }
    
    const namespace = this.getNamespace(knowledgeBaseId)
    
    const filter: any = { knowledgeBaseId }
    if (options.filter) {
      Object.assign(filter, options.filter)
    }
    
    const results = await this.index!.namespace(namespace).query({
      vector: queryVector,
      topK: options.topK,
      filter,
      includeMetadata: true
    })
    
    return results.matches
      .filter((m: any) => m.score >= options.minScore)
      .map((m: any) => ({
        id: m.id,
        score: m.score,
        content: m.metadata.content,
        metadata: {
          documentId: m.metadata.documentId,
          chunkIndex: m.metadata.chunkIndex,
          title: m.metadata.title,
          source: m.metadata.source,
          knowledgeBaseId: m.metadata.knowledgeBaseId,
          organizationId: m.metadata.organizationId
        }
      }))
  }
  
  /**
   * SQLite本地搜索 - 使用余弦相似度
   */
  private async searchSQLite(
    queryVector: number[],
    knowledgeBaseId: string,
    options: { topK: number; minScore: number }
  ): Promise<VectorSearchResult[]> {
    // 获取该知识库的所有分块
    const chunks = await this.prisma.documentChunk.findMany({
      where: {
        document: {
          knowledgeBaseId
        },
        embedding: { not: null }
      },
      include: {
        document: true
      }
    })
    
    // 计算余弦相似度
    const results: VectorSearchResult[] = []
    
    for (const chunk of chunks) {
      if (!chunk.embedding) continue
      
      const vector = JSON.parse(chunk.embedding) as number[]
      const similarity = this.cosineSimilarity(queryVector, vector)
      
      if (similarity >= options.minScore) {
        results.push({
          id: chunk.id,
          score: similarity,
          content: chunk.content,
          metadata: {
            documentId: chunk.documentId,
            chunkIndex: chunk.chunkIndex,
            title: chunk.document.title,
            source: chunk.document.fileUrl || '',
            knowledgeBaseId: chunk.document.knowledgeBaseId,
            organizationId: '' // 需要从knowledgeBase关联获取
          }
        })
      }
    }
    
    // 排序并返回topK
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, options.topK)
  }
  
  /**
   * 内存搜索
   */
  private searchMemory(
    queryVector: number[],
    knowledgeBaseId: string,
    options: { topK: number; minScore: number }
  ): VectorSearchResult[] {
    const results: VectorSearchResult[] = []
    
    for (const [id, item] of this.memoryStore) {
      if (item.document.metadata.knowledgeBaseId !== knowledgeBaseId) continue
      
      const similarity = this.cosineSimilarity(queryVector, item.vector)
      
      if (similarity >= options.minScore) {
        results.push({
          id,
          score: similarity,
          content: item.document.content,
          metadata: item.document.metadata
        })
      }
    }
    
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, options.topK)
  }
  
  /**
   * 余弦相似度计算
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
  
  /**
   * 删除文档向量
   */
  async deleteDocument(documentId: string, knowledgeBaseId: string): Promise<void> {
    const chunks = await this.prisma.documentChunk.findMany({
      where: { documentId }
    })
    
    const chunkIds = chunks.map(c => c.id)
    
    switch (this.config.provider) {
      case 'pinecone':
        if (this.index) {
          const namespace = this.getNamespace(knowledgeBaseId)
          await this.index.namespace(namespace).deleteMany(chunkIds)
        }
        break
      case 'memory':
        for (const id of chunkIds) {
          this.memoryStore.delete(id)
        }
        break
    }
    
    // 删除数据库记录
    await this.prisma.documentChunk.deleteMany({
      where: { documentId }
    })
  }
  
  /**
   * 获取知识库统计
   */
  async getStats(knowledgeBaseId: string): Promise<{
    documentCount: number
    chunkCount: number
    vectorizedChunkCount: number
  }> {
    const [docCount, chunkCount, vectorizedCount] = await Promise.all([
      this.prisma.knowledgeDocument.count({
        where: { knowledgeBaseId }
      }),
      this.prisma.documentChunk.count({
        where: { document: { knowledgeBaseId } }
      }),
      this.prisma.documentChunk.count({
        where: {
          document: { knowledgeBaseId },
          vectorId: { not: null }
        }
      })
    ])
    
    return {
      documentCount: docCount,
      chunkCount,
      vectorizedChunkCount: vectorizedCount
    }
  }
}

// 导出单例
let vectorServiceInstance: VectorService | null = null

export function getVectorService(prisma: PrismaClient): VectorService {
  if (!vectorServiceInstance) {
    vectorServiceInstance = VectorService.createDefault(prisma)
  }
  return vectorServiceInstance
}