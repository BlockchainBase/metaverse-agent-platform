import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { KnowledgeService } from '../services/knowledgeService.js'
import { VectorService, getVectorService } from '../services/vectorService.js'
import multer from 'multer'

const prisma = new PrismaClient()
let knowledgeService: KnowledgeService

// 延迟初始化
function getKnowledgeService(): KnowledgeService {
  if (!knowledgeService) {
    knowledgeService = new KnowledgeService(prisma, getVectorService(prisma))
  }
  return knowledgeService
}

// 配置multer
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
})

// ============================================
// 知识库管理
// ============================================

export const createKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const { name, description, organizationId, vectorDimension, embeddingModel } = req.body
    
    const kb = await getKnowledgeService().createKnowledgeBase({
      name,
      description,
      organizationId,
      vectorDimension,
      embeddingModel
    })
    
    res.json({ success: true, data: kb })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const listKnowledgeBases = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.params
    
    const kbs = await getKnowledgeService().listKnowledgeBases(organizationId as string)
    
    res.json({ success: true, data: kbs })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const getKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const kb = await getKnowledgeService().getKnowledgeBase(id as string)
    
    res.json({ success: true, data: kb })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const deleteKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    await getKnowledgeService().deleteKnowledgeBase(id as string)
    
    res.json({ success: true, message: 'Knowledge base deleted' })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 文档管理
// ============================================

export const uploadDocument = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const { knowledgeBaseId } = req.params
      const { userId } = req.body
      
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' })
      }
      
      const document = await getKnowledgeService().processDocument(
        {
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        },
        knowledgeBaseId as string,
        userId as string
      )
      
      res.json({ success: true, data: document })
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message })
    }
  }
]

export const listDocuments = async (req: Request, res: Response) => {
  try {
    const { knowledgeBaseId } = req.params
    
    const documents = await getKnowledgeService().listDocuments(knowledgeBaseId as string)
    
    res.json({ success: true, data: documents })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const getDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const document = await getKnowledgeService().getDocument(id as string)
    
    res.json({ success: true, data: document })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    await getKnowledgeService().deleteDocument(id as string)
    
    res.json({ success: true, message: 'Document deleted' })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

export const revectorizeDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    await getKnowledgeService().revectorizeDocument(id as string)
    
    res.json({ success: true, message: 'Document revectorization started' })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 语义检索
// ============================================

export const searchKnowledge = async (req: Request, res: Response) => {
  try {
    const { knowledgeBaseId } = req.params
    const { query, topK, minScore } = req.body
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' })
    }
    
    const result = await getKnowledgeService().search(query, knowledgeBaseId as string, {
      topK: topK || 5,
      minScore: minScore || 0.7
    })
    
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}

// ============================================
// 向量化状态
// ============================================

export const getVectorStats = async (req: Request, res: Response) => {
  try {
    const { knowledgeBaseId } = req.params
    
    const stats = await getVectorService(prisma).getStats(knowledgeBaseId as string)
    
    res.json({ success: true, data: stats })
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message })
  }
}