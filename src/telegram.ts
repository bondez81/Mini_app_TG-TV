// Telegram client wrapper - DEMO MODE
// Для работы с реальным Telegram нужна библиотека @mtcute/web

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

// Демо-данные
const mockChats: TgChat[] = [
  { id: '1', title: 'Кинопремьеры 2026', type: 'channel', mediaCount: 234, lastMessage: 'Новый трейлер Дюны' },
  { id: '2', title: 'Music Collection', type: 'channel', mediaCount: 892, lastMessage: 'Hans Zimmer - Time' },
  { id: '3', title: 'Документальное кино', type: 'channel', mediaCount: 156, lastMessage: 'Океан: глубины' },
  { id: '4', title: 'Podcast Daily', type: 'channel', mediaCount: 445, lastMessage: 'AI и будущее' },
  { id: '5', title: 'Anime HD', type: 'channel', mediaCount: 67, lastMessage: 'Attack on Titan S5' },
  { id: '6', title: 'Family Chat', type: 'chat', mediaCount: 45, lastMessage: 'Фото с отпуска' },
  { id: '7', title: 'Saved Messages', type: 'saved', mediaCount: 178, lastMessage: 'Важные ссылки' },
];

const mockMedia: Record<string, TgMedia[]> = {
  '1': [
    { id: 'v1', peerId: '1', chatTitle: 'Кинопремьеры 2026', messageId: 1, type: 'video', fileName: 'Interstellar_Trailer_4K.mp4', mimeType: 'video/mp4', size: 245000000, duration: 154, date: Date.now() / 1000 },
    { id: 'v2', peerId: '1', chatTitle: 'Кинопремьеры 2026', messageId: 2, type: 'video', fileName: 'Dune_Part3_Teaser.mkv', mimeType: 'video/x-matroska', size: 120000000, duration: 105, date: Date.now() / 1000 - 86400 },
  ],
  '2': [
    { id: 'a1', peerId: '2', chatTitle: 'Music Collection', messageId: 1, type: 'audio', fileName: 'Hans_Zimmer_Time.flac', mimeType: 'audio/flac', size: 12000000, duration: 275, date: Date.now() / 1000 },
    { id: 'a2', peerId: '2', chatTitle: 'Music Collection', messageId: 2, type: 'audio', fileName: 'Radiohead_Everything.mp3', mimeType: 'audio/mpeg', size: 28000000, duration: 252, date: Date.now() / 1000 - 86400 },
  ],
  '3': [
    { id: 'v3', peerId: '3', chatTitle: 'Документальное кино', messageId: 1, type: 'video', fileName: 'Deep_Ocean_Documentary.mp4', mimeType: 'video/mp4', size: 1200000000, duration: 2892, date: Date.now() / 1000 },
  ],
  '4': [
    { id: 'a3', peerId: '4', chatTitle: 'Podcast Daily', messageId: 1, type: 'audio', fileName: 'Future_of_AI_Ep89.mp3', mimeType: 'audio/mpeg', size: 67000000, duration: 4350, date: Date.now() / 1000 },
  ],
  '5': [
    { id: 'v4', peerId: '5', chatTitle: 'Anime HD', messageId: 1, type: 'video', fileName: 'Attack_on_Titan_S5E12.mkv', mimeType: 'video/x-matroska', size: 890000000, duration: 1445, date: Date.now() / 1000 - 86400 },
  ],
  '6': [
    { id: 'v5', peerId: '6', chatTitle: 'Family Chat', messageId: 1, type: 'video', fileName: 'Vacation_Clips.mov', mimeType: 'video/quicktime', size: 234000000, duration: 342, date: Date.now() / 1000 - 604800 },
  ],
  '7': [
    { id: 'v6', peerId: '7', chatTitle: 'Saved Messages', messageId: 1, type: 'video', fileName: 'Cooking_Masterclass.mkv', mimeType: 'video/x-matroska', size: 780000000, duration: 1938, date: Date.now() / 1000 - 259200 },
    { id: 'a4', peerId: '7', chatTitle: 'Saved Messages', messageId: 2, type: 'audio', fileName: 'Chopin_Nocturnes.flac', mimeType: 'audio/flac', size: 210000000, duration: 6300, date: Date.now() / 1000 - 259200 },
  ],
};

// Функции для работы с демо-данными
export function loadSession(): string {
  return localStorage.getItem('teletv_session') || '';
}

export function saveSession(session: string) {
  localStorage.setItem('teletv_session', session);
}

export function clearSession() {
  localStorage.removeItem('teletv_session');
  localStorage.removeItem('teletv_config');
}

export function getConfig(): TgConfig | null {
  const raw = localStorage.getItem('teletv_config');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveConfig(config: TgConfig) {
  localStorage.setItem('teletv_config', JSON.stringify(config));
}

export async function sendCode(config: TgConfig, phone: string): Promise<string> {
  // Демо-режим: просто сохраняем конфиг
  saveConfig(config);
  saveSession('demo_session_' + Date.now());
  return 'demo_hash';
}

export async function signIn(code: string, phone: string, config: TgConfig): Promise<{ ok: boolean; needsPassword: boolean }> {
  // Демо-режим: всегда успешно
  saveConfig(config);
  return { ok: true, needsPassword: false };
}

export async function checkPassword(password: string, config: TgConfig): Promise<void> {
  // Демо-режим
  saveConfig(config);
}

export async function restoreSession(config: TgConfig): Promise<boolean> {
  const saved = loadSession();
  return saved.length > 0;
}

export async function isAuthorized(): Promise<boolean> {
  return loadSession().length > 0;
}

export async function getMe(): Promise<{ id: number; firstName: string; username?: string; phone?: string } | null> {
  if (!loadSession()) return null;
  return {
    id: 123456789,
    firstName: 'Demo User',
    username: 'demo_user',
    phone: '+1234567890',
  };
}

export async function getDialogs(limit = 100): Promise<TgChat[]> {
  return mockChats;
}

export async function getMediaFromChat(chatId: string, limit = 50): Promise<TgMedia[]> {
  return mockMedia[chatId] || [];
}

export async function downloadFile(
  media: TgMedia,
  config: TgConfig,
  onProgress?: (loaded: number, total: number) => void
): Promise<Blob | null> {
  // Демо-режим: возвращаем пустой blob
  // В реальной версии здесь будет загрузка через MTProto
  console.log('Demo mode: downloadFile called for', media.fileName);
  
  // Имитируем прогресс загрузки
  if (onProgress) {
    let loaded = 0;
    const interval = setInterval(() => {
      loaded += media.size / 10;
      onProgress(loaded, media.size);
      if (loaded >= media.size) {
        clearInterval(interval);
      }
    }, 100);
  }
  
  return new Blob([], { type: media.mimeType });
}

export function disconnect() {
  // Демо-режим
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
