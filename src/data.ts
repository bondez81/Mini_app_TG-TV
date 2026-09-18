export interface Chat {
  id: string;
  name: string;
  avatar: string;
  type: 'channel' | 'chat' | 'saved';
  mediaCount: number;
  lastActivity: string;
}

export interface MediaItem {
  id: string;
  title: string;
  chatId: string;
  chatName: string;
  type: 'video' | 'audio';
  duration: string;
  durationSec: number;
  thumbnail: string;
  date: string;
  size: string;
  format: string;
  progress?: number; // 0-100
}

export interface Playlist {
  id: string;
  name: string;
  items: string[]; // media IDs
  createdAt: string;
  isFavorite: boolean;
}

export const mockChats: Chat[] = [
  { id: '1', name: 'Кинопремьеры 2026', avatar: '🎬', type: 'channel', mediaCount: 234, lastActivity: '2 мин назад' },
  { id: '2', name: 'Music Collection', avatar: '🎵', type: 'channel', mediaCount: 892, lastActivity: '15 мин назад' },
  { id: '3', name: 'Документальное кино', avatar: '📽️', type: 'channel', mediaCount: 156, lastActivity: '1 час назад' },
  { id: '4', name: 'Podcast Daily', avatar: '🎙️', type: 'channel', mediaCount: 445, lastActivity: '3 часа назад' },
  { id: '5', name: 'Anime HD', avatar: '🎌', type: 'channel', mediaCount: 67, lastActivity: '5 часов назад' },
  { id: '6', name: 'Family Chat', avatar: '👨‍👩‍👧', type: 'chat', mediaCount: 45, lastActivity: '30 мин назад' },
  { id: '7', name: 'Work Videos', avatar: '💼', type: 'chat', mediaCount: 23, lastActivity: 'вчера' },
  { id: '8', name: 'Saved Messages', avatar: '⭐', type: 'saved', mediaCount: 178, lastActivity: 'сейчас' },
  { id: '9', name: 'Lo-Fi Beats', avatar: '🎧', type: 'channel', mediaCount: 320, lastActivity: '10 мин назад' },
  { id: '10', name: 'Tech Reviews', avatar: '📱', type: 'channel', mediaCount: 89, lastActivity: '2 часа назад' },
];

export const mockMedia: MediaItem[] = [
  // Videos
  { id: 'v1', title: 'Interstellar — Official Trailer 4K', chatId: '1', chatName: 'Кинопремьеры 2026', type: 'video', duration: '2:34', durationSec: 154, thumbnail: '', date: 'Сегодня', size: '245 MB', format: 'MKV', progress: 45 },
  { id: 'v2', title: 'Nature Documentary: Deep Ocean', chatId: '3', chatName: 'Документальное кино', type: 'video', duration: '48:12', durationSec: 2892, thumbnail: '', date: 'Сегодня', size: '1.2 GB', format: 'MP4', progress: 72 },
  { id: 'v3', title: 'Attack on Titan — S5 E12 [1080p]', chatId: '5', chatName: 'Anime HD', type: 'video', duration: '24:05', durationSec: 1445, thumbnail: '', date: 'Вчера', size: '890 MB', format: 'MKV' },
  { id: 'v4', title: 'iPhone 18 Pro — Full Review', chatId: '10', chatName: 'Tech Reviews', type: 'video', duration: '15:30', durationSec: 930, thumbnail: '', date: 'Вчера', size: '456 MB', format: 'MP4' },
  { id: 'v5', title: 'Dune: Part Three — Teaser', chatId: '1', chatName: 'Кинопремьеры 2026', type: 'video', duration: '1:45', durationSec: 105, thumbnail: '', date: '2 дня назад', size: '120 MB', format: 'MP4' },
  { id: 'v6', title: 'Cooking Masterclass: Italian', chatId: '8', chatName: 'Saved Messages', type: 'video', duration: '32:18', durationSec: 1938, thumbnail: '', date: '3 дня назад', size: '780 MB', format: 'MKV' },
  { id: 'v7', title: 'SpaceX Starship Launch — Full', chatId: '3', chatName: 'Документальное кино', type: 'video', duration: '1:24:00', durationSec: 5040, thumbnail: '', date: '4 дня назад', size: '2.1 GB', format: 'TS' },
  { id: 'v8', title: 'Family Vacation Clips', chatId: '6', chatName: 'Family Chat', type: 'video', duration: '5:42', durationSec: 342, thumbnail: '', date: 'Неделю назад', size: '234 MB', format: 'MOV' },
  // Audio
  { id: 'a1', title: 'Hans Zimmer — Time (Inception)', chatId: '2', chatName: 'Music Collection', type: 'audio', duration: '4:35', durationSec: 275, thumbnail: '', date: 'Сегодня', size: '12 MB', format: 'FLAC' },
  { id: 'a2', title: 'Podcast: Future of AI — Ep. 89', chatId: '4', chatName: 'Podcast Daily', type: 'audio', duration: '1:12:30', durationSec: 4350, thumbnail: '', date: 'Сегодня', size: '67 MB', format: 'MP3', progress: 23 },
  { id: 'a3', title: 'Lo-Fi Study Session Vol. 42', chatId: '9', chatName: 'Lo-Fi Beats', type: 'audio', duration: '2:00:00', durationSec: 7200, thumbnail: '', date: 'Вчера', size: '134 MB', format: 'M4A' },
  { id: 'a4', title: 'Radiohead — Everything In Its Right Place', chatId: '2', chatName: 'Music Collection', type: 'audio', duration: '4:12', durationSec: 252, thumbnail: '', date: 'Вчера', size: '28 MB', format: 'FLAC' },
  { id: 'a5', title: 'Tech Talk: Weekly Roundup #156', chatId: '4', chatName: 'Podcast Daily', type: 'audio', duration: '58:45', durationSec: 3525, thumbnail: '', date: '2 дня назад', size: '54 MB', format: 'MP3' },
  { id: 'a6', title: 'Classical Piano — Chopin Nocturnes', chatId: '8', chatName: 'Saved Messages', type: 'audio', duration: '1:45:00', durationSec: 6300, thumbnail: '', date: '3 дня назад', size: '210 MB', format: 'FLAC' },
  { id: 'a7', title: 'Ambient Space Music — Deep Focus', chatId: '9', chatName: 'Lo-Fi Beats', type: 'audio', duration: '3:00:00', durationSec: 10800, thumbnail: '', date: '4 дня назад', size: '198 MB', format: 'OGG' },
  { id: 'a8', title: 'Interview: Elon Musk — Full', chatId: '4', chatName: 'Podcast Daily', type: 'audio', duration: '2:15:00', durationSec: 8100, thumbnail: '', date: 'Неделю назад', size: '124 MB', format: 'M4A' },
];

export const mockPlaylists: Playlist[] = [
  { id: 'p1', name: '🎬 Movie Night', items: ['v1', 'v2', 'v5', 'v7'], createdAt: '2026-09-10', isFavorite: true },
  { id: 'p2', name: '🎵 Chill Vibes', items: ['a1', 'a3', 'a4', 'a7'], createdAt: '2026-09-08', isFavorite: true },
  { id: 'p3', name: '📚 Learning', items: ['v4', 'v6', 'a2', 'a5'], createdAt: '2026-09-05', isFavorite: false },
  { id: 'p4', name: '🏃 Workout Mix', items: ['a1', 'a4', 'a7', 'a8'], createdAt: '2026-09-01', isFavorite: false },
];

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const getMediaColor = (id: string): string => {
  const colors = [
    'from-blue-600 to-purple-600',
    'from-emerald-600 to-teal-600',
    'from-orange-600 to-red-600',
    'from-pink-600 to-rose-600',
    'from-cyan-600 to-blue-600',
    'from-violet-600 to-indigo-600',
    'from-amber-600 to-orange-600',
    'from-green-600 to-emerald-600',
  ];
  const index = id.charCodeAt(1) % colors.length;
  return colors[index];
};
