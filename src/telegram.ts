// Telegram client wrapper using gramjs (browser-compatible)
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Logger } from 'telegram/extensions';

Logger.setLevel('none');

export interface TgConfig {
  apiId: number;
  apiHash: string;
}

export interface TgMedia {
  id: string;
  peerId: string;
  chatTitle: string;
  messageId: number;
  type: 'video' | 'audio' | 'photo';
  fileName: string;
  mimeType: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  date: number;
  dcId?: number;
  documentId?: string;
  accessHash?: string;
}

export interface TgChat {
  id: string;
  title: string;
  mediaCount: number;
  lastMessage?: string;
  type: 'channel' | 'group' | 'chat' | 'saved';
}

let client: TelegramClient | null = null;
let phoneCodeHashGlobal = '';

export function loadSession(): string {
  return localStorage.getItem('teletv_session') || '';
}

export function saveSession(session: string) {
  localStorage.setItem('teletv_session', session);
}

export function clearSession() {
  localStorage.removeItem('teletv_session');
  localStorage.removeItem('teletv_config');
  client = null;
}

export function getConfig(): TgConfig | null {
  const raw = localStorage.getItem('teletv_config');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveConfig(config: TgConfig) {
  localStorage.setItem('teletv_config', JSON.stringify(config));
}

function getSession(): StringSession {
  const saved = loadSession();
  return new StringSession(saved);
}

async function createClient(config: TgConfig): Promise<TelegramClient> {
  const session = getSession();
  const tg = new TelegramClient(session, config.apiId, config.apiHash, {
    connectionRetries: 5,
    useWSS: true,
  });
  await tg.connect();
  client = tg;
  return tg;
}

function persistSession(tg: TelegramClient) {
  const s = (tg.session as StringSession);
  if (s && s.save) {
    saveSession(s.save());
  }
}

export async function sendCode(config: TgConfig, phone: string): Promise<string> {
  const tg = await createClient(config);
  const result = await tg.sendCode(
    { apiId: config.apiId, apiHash: config.apiHash },
    phone
  );
  persistSession(tg);
  phoneCodeHashGlobal = (result as any).phoneCodeHash || '';
  return phoneCodeHashGlobal;
}

export async function signIn(code: string, phone: string, config: TgConfig): Promise<{ ok: boolean; needsPassword: boolean }> {
  if (!client) {
    await createClient(config);
  }
  try {
    await client!.invoke(
      new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash: phoneCodeHashGlobal,
        phoneCode: code,
      })
    );
    persistSession(client!);
    return { ok: true, needsPassword: false };
  } catch (e: any) {
    if (e.errorMessage === 'SESSION_PASSWORD_NEEDED') {
      return { ok: false, needsPassword: true };
    }
    throw e;
  }
}

export async function checkPassword(password: string, config: TgConfig): Promise<void> {
  if (!client) await createClient(config);
  
  const pwd = await client!.invoke(new Api.account.GetPassword());
  const passwordInfo = pwd;
  
  // Use client's built-in password check
  const result = await client!.invoke(
    new Api.auth.CheckPassword({
      password: await (client as any).password(passwordInfo, password),
    } as any)
  );
  
  persistSession(client!);
}

export async function restoreSession(config: TgConfig): Promise<boolean> {
  const saved = loadSession();
  if (!saved) return false;
  
  try {
    const tg = await createClient(config);
    const authorized = await tg.isUserAuthorized();
    if (authorized) {
      persistSession(tg);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function isAuthorized(): Promise<boolean> {
  if (!client) return false;
  try {
    return await client.isUserAuthorized();
  } catch {
    return false;
  }
}

export async function getMe(): Promise<{ id: number; firstName: string; lastName?: string; username?: string; phone?: string } | null> {
  if (!client) return null;
  try {
    const me = await client.getMe();
    return {
      id: Number(me.id),
      firstName: me.firstName || '',
      lastName: me.lastName || undefined,
      username: (me as any).username || undefined,
      phone: (me as any).phone || undefined,
    };
  } catch {
    return null;
  }
}

export async function getDialogs(limit = 100): Promise<TgChat[]> {
  if (!client) return [];
  
  try {
    const result = await client.getDialogs({ limit });
    const chats: TgChat[] = [];
    
    for (const dialog of result) {
      const entity = dialog.entity;
      if (!entity) continue;
      
      let type: TgChat['type'] = 'chat';
      if (entity.className === 'Channel') type = 'channel';
      else if (entity.className === 'Chat') type = 'group';
      
      const title = (entity as any).title || (entity as any).firstName || 'Unknown';
      
      chats.push({
        id: String(dialog.id),
        title,
        mediaCount: 0,
        lastMessage: dialog.message?.message?.substring(0, 60),
        type,
      });
    }
    
    return chats;
  } catch (e) {
    console.error('Error getting dialogs:', e);
    return [];
  }
}

export async function getMediaFromChat(chatId: string, limit = 50): Promise<TgMedia[]> {
  if (!client) return [];
  
  try {
    const peer = await client.getEntity(chatId);
    if (!peer) return [];
    
    const messages = await client.getMessages(peer, { limit });
    const media: TgMedia[] = [];
    
    for (const msg of messages) {
      if (!msg.media) continue;
      
      const className = msg.media.className;
      
      if (className === 'MessageMediaDocument') {
        const doc = (msg.media as any).document;
        if (!doc) continue;
        
        const mimeType: string = doc.mimeType || '';
        if (!mimeType.startsWith('video/') && !mimeType.startsWith('audio/')) continue;
        
        const type = mimeType.startsWith('video/') ? 'video' : 'audio';
        let duration: number | undefined;
        let width: number | undefined;
        let height: number | undefined;
        let fileName = '';
        
        for (const attr of (doc.attributes || [])) {
          if (attr.className === 'DocumentAttributeVideo') {
            duration = attr.duration;
            width = attr.w;
            height = attr.h;
          } else if (attr.className === 'DocumentAttributeAudio') {
            duration = attr.duration;
          } else if (attr.className === 'DocumentAttributeFilename') {
            fileName = attr.fileName || '';
          }
        }
        
        media.push({
          id: `${msg.id}_${chatId}`,
          peerId: chatId,
          chatTitle: (peer as any).title || (peer as any).firstName || 'Unknown',
          messageId: msg.id,
          type: type as 'video' | 'audio',
          fileName: fileName || `${type}_${msg.id}`,
          mimeType,
          size: Number(doc.size) || 0,
          duration,
          width,
          height,
          date: msg.date,
          dcId: doc.dcId,
          documentId: String(doc.id),
          accessHash: String(doc.accessHash),
        });
      } else if (className === 'MessageMediaPhoto') {
        const photo = (msg.media as any).photo;
        if (!photo) continue;
        
        media.push({
          id: `${msg.id}_${chatId}`,
          peerId: chatId,
          chatTitle: (peer as any).title || (peer as any).firstName || 'Unknown',
          messageId: msg.id,
          type: 'photo',
          fileName: `photo_${photo.id}.jpg`,
          mimeType: 'image/jpeg',
          size: 0,
          date: msg.date,
          dcId: photo.dcId,
          documentId: String(photo.id),
          accessHash: String(photo.accessHash),
        });
      }
    }
    
    return media;
  } catch (e) {
    console.error('Error getting media:', e);
    return [];
  }
}

export async function downloadFile(
  media: TgMedia,
  config: TgConfig,
  onProgress?: (loaded: number, total: number) => void
): Promise<Blob | null> {
  if (!client) {
    await createClient(config);
  }
  if (!client || !media.documentId || !media.accessHash) return null;
  
  try {
    let inputLocation: any;
    
    if (media.type === 'photo') {
      inputLocation = new Api.InputPhotoFileLocation({
        id: BigInt(media.documentId) as any,
        accessHash: BigInt(media.accessHash) as any,
        fileReference: new Uint8Array(0) as any,
        thumbSize: 'x',
      });
    } else {
      inputLocation = new Api.InputDocumentFileLocation({
        id: BigInt(media.documentId) as any,
        accessHash: BigInt(media.accessHash) as any,
        fileReference: new Uint8Array(0) as any,
        thumbSize: '',
      });
    }
    
    const result = await client.downloadMedia(inputLocation, {
      dcId: media.dcId,
      progressCallback: onProgress ? (loaded: number | bigint, total: number | bigint) => {
        onProgress(Number(loaded), Number(total));
      } : undefined,
    } as any);
    
    if (!result) return null;
    
    if (result instanceof Uint8Array) {
      return new Blob([new Uint8Array(result as any) as any], { type: media.mimeType });
    }
    
    if (typeof result === 'string') {
      return new Blob([result], { type: media.mimeType });
    }
    
    // Try to convert Buffer to Uint8Array
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(result)) {
      const arr = new Uint8Array((result as any).buffer || result);
      return new Blob([arr], { type: media.mimeType });
    }
    
    // Fallback: try to extract ArrayBuffer
    if (result && typeof result === 'object' && 'buffer' in result) {
      return new Blob([new Uint8Array((result as any).buffer)], { type: media.mimeType });
    }
    
    return null;
  } catch (e) {
    console.error('Error downloading:', e);
    return null;
  }
}

export function disconnect() {
  if (client) {
    client.disconnect();
    client = null;
  }
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
