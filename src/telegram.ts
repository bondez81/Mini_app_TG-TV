// Telegram client wrapper - REAL MODE with @mtcute/web
import { TelegramClient } from '@mtcute/web'
import { Long } from '@mtcute/core'

export interface TgConfig {
  apiId: number
  apiHash: string
}

export interface TgMedia {
  id: string
  peerId: string
  chatTitle: string
  messageId: number
  type: 'video' | 'audio' | 'photo'
  fileName: string
  mimeType: string
  size: number
  duration?: number
  width?: number
  height?: number
  date: number
  dcId?: number
  documentId?: string
  accessHash?: string
}

export interface TgChat {
  id: string
  title: string
  mediaCount: number
  lastMessage?: string
  type: 'channel' | 'group' | 'chat' | 'saved'
}

let client: TelegramClient | null = null
let sentCode: any = null
let currentPhone = ''

// Storage functions
export function loadSession(): string {
  return localStorage.getItem('teletv_session') || ''
}

export function saveSession(session: string) {
  localStorage.setItem('teletv_session', session)
}

export function clearSession() {
  localStorage.removeItem('teletv_session')
  localStorage.removeItem('teletv_config')
  client = null
}

export function getConfig(): TgConfig | null {
  const raw = localStorage.getItem('teletv_config')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function saveConfig(config: TgConfig) {
  localStorage.setItem('teletv_config', JSON.stringify(config))
}

// Initialize client
function initClient(config: TgConfig): TelegramClient {
  if (client) return client
  
  client = new TelegramClient({
    apiId: config.apiId,
    apiHash: config.apiHash,
    storage: 'teletv-session',
  })
  
  return client
}

// Send authentication code
export async function sendCode(config: TgConfig, phone: string): Promise<string> {
  saveConfig(config)
  currentPhone = phone
  
  const tg = initClient(config)
  
  try {
    sentCode = await tg.sendCode({ phone })
    return sentCode.phoneCodeHash
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send code')
  }
}

// Sign in with code
export async function signIn(code: string, phone: string, config: TgConfig): Promise<{ ok: boolean; needsPassword: boolean }> {
  const tg = initClient(config)
  
  try {
    const user = await tg.signIn({
      phone,
      phoneCodeHash: sentCode.phoneCodeHash,
      phoneCode: code,
    })
    
    if (user) {
      saveSession('authenticated')
      return { ok: true, needsPassword: false }
    }
    
    return { ok: false, needsPassword: false }
  } catch (error: any) {
    if (error.message?.includes('SESSION_PASSWORD_NEEDED')) {
      return { ok: false, needsPassword: true }
    }
    throw error
  }
}

// Check 2FA password
export async function checkPassword(password: string, config: TgConfig): Promise<void> {
  const tg = initClient(config)
  
  try {
    const user = await tg.checkPassword(password)
    if (user) {
      saveSession('authenticated')
    }
  } catch (error: any) {
    throw new Error(error.message || 'Invalid password')
  }
}

// Restore session
export async function restoreSession(config: TgConfig): Promise<boolean> {
  const saved = loadSession()
  if (!saved) return false
  
  try {
    const tg = initClient(config)
    const user = await tg.getMe()
    return !!user
  } catch {
    return false
  }
}

// Check if authorized
export async function isAuthorized(): Promise<boolean> {
  const config = getConfig()
  if (!config) return false
  return restoreSession(config)
}

// Get current user
export async function getMe(): Promise<{ id: number; firstName: string; username?: string; phone?: string } | null> {
  const config = getConfig()
  if (!config) return null
  
  try {
    const tg = initClient(config)
    const user = await tg.getMe()
    
    if (!user) return null
    
    return {
      id: user.id,
      firstName: user.displayName || user.firstName || '',
      username: user.username || undefined,
      phone: undefined, // Phone not available in User type
    }
  } catch {
    return null
  }
}

// Get dialogs (chats)
export async function getDialogs(limit = 100): Promise<TgChat[]> {
  const config = getConfig()
  if (!config) return []
  
  try {
    const tg = initClient(config)
    
    const chats: TgChat[] = []
    let count = 0
    
    // Use iterDialogs
    for await (const dialog of tg.iterDialogs({ limit })) {
      if (count >= limit) break
      
      let type: TgChat['type'] = 'chat'
      
      // Check peer type - use peer object properties
      if ('channelId' in dialog.peer) {
        type = 'channel'
      } else if ('chatId' in dialog.peer) {
        type = 'chat'
      }
      
      // Get title from dialog
      const title = (dialog as any).title || (dialog as any).chat?.title || 'Unknown'
      
      chats.push({
        id: String(dialog.peer.id),
        title,
        mediaCount: 0,
        lastMessage: (dialog as any).lastMessage?.text || undefined,
        type,
      })
      
      count++
    }
    
    return chats
  } catch (error) {
    console.error('Failed to get dialogs:', error)
    return []
  }
}

// Get media from chat
export async function getMediaFromChat(chatId: string, limit = 50): Promise<TgMedia[]> {
  const config = getConfig()
  if (!config) return []
  
  try {
    const tg = initClient(config)
    
    // Get chat history - use chat ID directly
    const messages = await tg.getHistory(parseInt(chatId), { limit })
    
    const media: TgMedia[] = []
    
    for (const msg of messages) {
      if (!msg.media || msg.media.type !== 'document') continue
      
      const doc = (msg.media as any).document
      
      let type: 'video' | 'audio' = 'video'
      let duration: number | undefined
      let fileName = ''
      
      // Check document attributes
      if (doc.isVideo) {
        type = 'video'
        duration = doc.duration
      } else if (doc.isAudio) {
        type = 'audio'
        duration = doc.duration
      }
      
      fileName = doc.fileName || `${type}_${msg.id}`
      
      media.push({
        id: `${msg.id}_${chatId}`,
        peerId: chatId,
        chatTitle: '',
        messageId: msg.id,
        type,
        fileName,
        mimeType: doc.mimeType || 'application/octet-stream',
        size: doc.size,
        duration,
        date: msg.date.getTime() / 1000,
        dcId: doc.dcId,
        documentId: String(doc.id),
        accessHash: String(doc.accessHash),
      })
    }
    
    return media
  } catch (error) {
    console.error('Failed to get media:', error)
    return []
  }
}

// Download file
export async function downloadFile(
  media: TgMedia,
  config: TgConfig,
  onProgress?: (loaded: number, total: number) => void
): Promise<Blob | null> {
  if (!media.documentId || !media.accessHash) return null
  
  try {
    const tg = initClient(config)
    
    // Download file using document ID
    const buffer = await tg.downloadAsBuffer(media as any, {
      progressCallback: onProgress ? (loaded: number, total: number) => {
        onProgress(loaded, total)
      } : undefined,
    })
    
    // Convert buffer to ArrayBuffer for Blob
    return new Blob([buffer as any], { type: media.mimeType })
  } catch (error) {
    console.error('Failed to download file:', error)
    return null
  }
}

// Disconnect
export function disconnect() {
  client = null
}

// Utility functions
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}
