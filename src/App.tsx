import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Search, Settings, Home, List, Star, Music, Film, Clock,
  Plus, Heart, ChevronRight, X, Check, Trash2,
  Shield, LogOut, Phone, ArrowLeft, User, Loader2, AlertCircle, Inbox, Wifi, WifiOff
} from 'lucide-react';
import * as tg from './telegram';
import type { TgChat, TgMedia, TgConfig } from './telegram';

// ==================== TYPES ====================
type Screen = 'auth' | 'home' | 'chat' | 'player' | 'playlists' | 'settings';

interface Playlist {
  id: string;
  name: string;
  items: string[];
  createdAt: string;
  isFavorite: boolean;
}

// ==================== MAIN APP ====================
export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<{ id: number; firstName: string; username?: string } | null>(null);
  const [chats, setChats] = useState<TgChat[]>([]);
  const [media, setMedia] = useState<TgMedia[]>([]);
  const [selectedChat, setSelectedChat] = useState<TgChat | null>(null);
  const [currentMedia, setCurrentMedia] = useState<TgMedia | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('teletv_playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'audio'>('all');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize app
  useEffect(() => {
    try {
      const w = window as any;
      if (w.Telegram && w.Telegram.WebApp) {
        w.Telegram.WebApp.ready();
        w.Telegram.WebApp.expand();
      }
    } catch (e) {
      // Not in Telegram
    }
    setIsReady(true);
  }, []);

  // Load playlists
  useEffect(() => {
    localStorage.setItem('teletv_playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Notification
  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  }, []);

  // Check if already authorized
  useEffect(() => {
    if (!isReady) return;
    
    const config = tg.getConfig();
    if (config) {
      setLoading(true);
      setLoadingText('Connecting to Telegram...');
      tg.restoreSession(config).then(async (authorized) => {
        if (authorized) {
          const me = await tg.getMe();
          if (me) {
            setUser(me);
            setScreen('home');
            loadChats();
          }
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [isReady]);

  // Load chats
  const loadChats = async () => {
    setLoading(true);
    setLoadingText('Loading chats...');
    try {
      const dialogs = await tg.getDialogs(100);
      setChats(dialogs);
    } catch (e) {
      setError('Failed to load chats');
    }
    setLoading(false);
  };

  // Load media from chat
  const loadMedia = async (chat: TgChat) => {
    setSelectedChat(chat);
    setScreen('chat');
    setLoading(true);
    setLoadingText('Loading media...');
    try {
      const items = await tg.getMediaFromChat(chat.id, 50);
      setMedia(items);
    } catch (e) {
      setError('Failed to load media');
    }
    setLoading(false);
  };

  // Play media
  const playMedia = async (item: TgMedia) => {
    setCurrentMedia(item);
    setScreen('player');
    setDownloadProgress({ loaded: 0, total: item.size });
    setLoading(true);
    setLoadingText('Downloading media...');
    
    const config = tg.getConfig();
    if (!config) return;
    
    try {
      const blob = await tg.downloadFile(item, config, (loaded, total) => {
        setDownloadProgress({ loaded, total });
      });
      
      if (blob) {
        const url = URL.createObjectURL(blob);
        setCurrentMedia({ ...item, fileName: url } as any);
        setIsPlaying(true);
        setPlayProgress(0);
      } else {
        setError('Failed to download media');
      }
    } catch (e) {
      setError('Failed to play media');
    }
    setLoading(false);
    setDownloadProgress(null);
  };

  // Playlist operations
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `p${Date.now()}`,
      name,
      items: [],
      createdAt: new Date().toISOString().split('T')[0],
      isFavorite: false,
    };
    setPlaylists([...playlists, newPlaylist]);
    showNotification('Playlist created!');
  };

  const addToPlaylist = (playlistId: string, mediaId: string) => {
    setPlaylists(playlists.map(p =>
      p.id === playlistId ? { ...p, items: [...p.items, mediaId] } : p
    ));
    showNotification('Added to playlist!');
  };

  const toggleFavorite = (id: string) => {
    setPlaylists(playlists.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(p => p.id !== id));
    showNotification('Playlist deleted');
  };

  // Logout
  const logout = () => {
    tg.disconnect();
    tg.clearSession();
    setUser(null);
    setChats([]);
    setMedia([]);
    setScreen('auth');
  };

  // Filtered media
  const filteredMedia = media.filter(m => {
    const matchesFilter = mediaFilter === 'all' || m.type === mediaFilter;
    const matchesSearch = !searchQuery || m.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ==================== RENDER ====================
  return (
    <div className="w-full h-full bg-[#0a0e14] text-white overflow-hidden">
      {screen === 'auth' && (
        <AuthScreen
          onAuth={(config, userData) => {
            setUser(userData);
            setScreen('home');
            loadChats();
          }}
          loading={loading}
          error={error}
          onError={setError}
        />
      )}

      {screen === 'home' && (
        <HomeScreen
          chats={chats}
          user={user}
          onSelectChat={loadMedia}
          onOpenPlaylists={() => setScreen('playlists')}
          onOpenSettings={() => setScreen('settings')}
          onRefresh={loadChats}
          loading={loading}
        />
      )}

      {screen === 'chat' && selectedChat && (
        <ChatScreen
          chat={selectedChat}
          media={filteredMedia}
          allMedia={media}
          onBack={() => { setScreen('home'); setMedia([]); }}
          onPlay={playMedia}
          filter={mediaFilter}
          onFilterChange={setMediaFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          playlists={playlists}
          onAddToPlaylist={addToPlaylist}
          loading={loading}
        />
      )}

      {screen === 'player' && (
        currentMedia ? (
          <PlayerScreen
            media={currentMedia}
            isPlaying={isPlaying}
            progress={playProgress}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onSeek={setPlayProgress}
            onBack={() => { setScreen('chat'); setIsPlaying(false); }}
            downloadProgress={downloadProgress}
            loading={loading}
          />
        ) : (
          <EmptyPlayerScreen onBack={() => setScreen('home')} />
        )
      )}

      {screen === 'playlists' && (
        <PlaylistsScreen
          playlists={playlists}
          media={media}
          onToggleFavorite={toggleFavorite}
          onDelete={deletePlaylist}
          onCreate={createPlaylist}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          user={user}
          onBack={() => setScreen('home')}
          onLogout={logout}
        />
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-[#229ED9] mx-auto mb-4" />
            <p className="text-base text-white">{loadingText}</p>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className="px-4 py-3 rounded-xl bg-red-500 text-white flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-base flex-1">{error}</span>
            <button onClick={() => setError(null)} className="min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-6 left-4 right-4 z-50">
          <div className="px-5 py-4 rounded-xl bg-[#229ED9] text-white font-medium flex items-center gap-3">
            <Check size={20} />
            <span className="text-base">{notification}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== AUTH SCREEN ====================
function AuthScreen({ onAuth, loading, error, onError }: {
  onAuth: (config: TgConfig, user: { id: number; firstName: string; username?: string }) => void;
  loading: boolean;
  error: string | null;
  onError: (e: string | null) => void;
}) {
  const [step, setStep] = useState<'credentials' | 'phone' | 'code' | 'password'>('credentials');
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleCredentials = async () => {
    if (!apiId || !apiHash) {
      setLocalError('Please enter API ID and Hash');
      return;
    }
    const config: TgConfig = { apiId: Number(apiId), apiHash };
    tg.saveConfig(config);
    setStep('phone');
    setLocalError('');
  };

  const handlePhone = async () => {
    if (!phone) {
      setLocalError('Please enter phone number');
      return;
    }
    setLocalLoading(true);
    setLocalError('');
    
    try {
      const config = tg.getConfig()!;
      await tg.sendCode(config, phone);
      setStep('code');
    } catch (e: any) {
      setLocalError(e.message || 'Failed to send code');
    }
    setLocalLoading(false);
  };

  const handleCode = async () => {
    if (!code) {
      setLocalError('Please enter verification code');
      return;
    }
    setLocalLoading(true);
    setLocalError('');
    
    try {
      const config = tg.getConfig()!;
      const result = await tg.signIn(code, phone, config);
      
      if (result.ok) {
        const me = await tg.getMe();
        if (me) {
          onAuth(config, me);
        }
      } else if (result.needsPassword) {
        setStep('password');
      }
    } catch (e: any) {
      setLocalError(e.message || 'Invalid code');
    }
    setLocalLoading(false);
  };

  const handlePassword = async () => {
    if (!password) {
      setLocalError('Please enter password');
      return;
    }
    setLocalLoading(true);
    setLocalError('');
    
    try {
      const config = tg.getConfig()!;
      await tg.checkPassword(password, config);
      const me = await tg.getMe();
      if (me) {
        onAuth(config, me);
      }
    } catch (e: any) {
      setLocalError(e.message || 'Invalid password');
    }
    setLocalLoading(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[#229ED9] flex items-center justify-center mx-auto mb-4">
            <Film size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TeleTV Player</h1>
          <p className="text-base text-gray-400">Watch Telegram media on your TV</p>
        </div>

        {/* Error */}
        {(localError || error) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-base">{localError || error}</span>
          </div>
        )}

        {/* Step: Credentials */}
        {step === 'credentials' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#131920] border border-white/10">
              <p className="text-base text-gray-300 mb-3">
                To connect to Telegram, you need API credentials.
              </p>
              <a href="https://my.telegram.org/apps" target="_blank" rel="noopener" className="text-base text-[#229ED9] hover:underline flex items-center gap-2">
                Get API ID & Hash →
              </a>
            </div>
            
            <div>
              <label className="text-base text-gray-400 mb-2 block">API ID</label>
              <input
                type="number"
                value={apiId}
                onChange={(e) => setApiId(e.target.value)}
                placeholder="12345678"
                className="w-full px-4 py-3 rounded-xl bg-[#131920] border border-white/10 text-white text-base focus:border-[#229ED9] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-base text-gray-400 mb-2 block">API Hash</label>
              <input
                type="text"
                value={apiHash}
                onChange={(e) => setApiHash(e.target.value)}
                placeholder="0123456789abcdef..."
                className="w-full px-4 py-3 rounded-xl bg-[#131920] border border-white/10 text-white text-base focus:border-[#229ED9] focus:outline-none"
              />
            </div>
            <button
              onClick={handleCredentials}
              disabled={localLoading}
              className="w-full py-4 rounded-xl bg-[#229ED9] text-white text-base font-semibold flex items-center justify-center gap-2 min-h-[44px]"
            >
              {localLoading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
              Continue
            </button>
          </div>
        )}

        {/* Step: Phone */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="text-base text-gray-400 mb-2 block">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-3 rounded-xl bg-[#131920] border border-white/10 text-white text-base focus:border-[#229ED9] focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={handlePhone}
              disabled={localLoading}
              className="w-full py-4 rounded-xl bg-[#229ED9] text-white text-base font-semibold flex items-center justify-center gap-2 min-h-[44px]"
            >
              {localLoading ? <Loader2 size={20} className="animate-spin" /> : <Phone size={20} />}
              Send Code
            </button>
            <button
              onClick={() => setStep('credentials')}
              className="w-full py-4 rounded-xl text-gray-400 text-base min-h-[44px]"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step: Code */}
        {step === 'code' && (
          <div className="space-y-4">
            <p className="text-base text-gray-400 text-center">
              Code sent to <span className="text-white">{phone}</span>
            </p>
            <div>
              <label className="text-base text-gray-400 mb-2 block">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="12345"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl bg-[#131920] border border-white/10 text-white text-2xl text-center tracking-widest focus:border-[#229ED9] focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={handleCode}
              disabled={localLoading}
              className="w-full py-4 rounded-xl bg-[#229ED9] text-white text-base font-semibold flex items-center justify-center gap-2 min-h-[44px]"
            >
              {localLoading ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
              Verify
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full py-4 rounded-xl text-gray-400 text-base min-h-[44px]"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step: Password */}
        {step === 'password' && (
          <div className="space-y-4">
            <p className="text-base text-gray-400 text-center">
              Your account has 2FA enabled
            </p>
            <div>
              <label className="text-base text-gray-400 mb-2 block">Cloud Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#131920] border border-white/10 text-white text-base focus:border-[#229ED9] focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={handlePassword}
              disabled={localLoading}
              className="w-full py-4 rounded-xl bg-[#229ED9] text-white text-base font-semibold flex items-center justify-center gap-2 min-h-[44px]"
            >
              {localLoading ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== HOME SCREEN ====================
function HomeScreen({ chats, user, onSelectChat, onOpenPlaylists, onOpenSettings, onRefresh, loading }: {
  chats: TgChat[];
  user: { id: number; firstName: string; username?: string } | null;
  onSelectChat: (chat: TgChat) => void;
  onOpenPlaylists: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between flex-shrink-0 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#229ED9] flex items-center justify-center flex-shrink-0">
            <Film size={24} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">TeleTV Player</div>
            <div className="text-sm text-gray-400">{user?.firstName || 'User'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onRefresh} 
            className="w-11 h-11 rounded-xl bg-[#131920] border border-white/10 flex items-center justify-center"
            aria-label="Refresh"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
          <button 
            onClick={onOpenSettings} 
            className="w-11 h-11 rounded-xl bg-[#131920] border border-white/10 flex items-center justify-center"
            aria-label="Settings"
          >
            <Settings size={20} className="text-gray-400" />
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="p-4 flex-shrink-0">
        <button 
          onClick={onOpenPlaylists} 
          className="w-full py-4 rounded-xl bg-[#131920] border border-white/10 text-base font-medium flex items-center justify-center gap-3 min-h-[44px]"
        >
          <List size={20} className="text-[#229ED9]" />
          <span className="text-white">Playlists</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h2 className="text-lg font-bold text-white mb-4">
          Chats & Channels
        </h2>
        
        {chats.length === 0 && !loading ? (
          <EmptyState icon={<Inbox size={48} />} title="No chats found" subtitle="Try refreshing" />
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <ChatCard key={chat.id} chat={chat} onClick={() => onSelectChat(chat)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== CHAT CARD ====================
function ChatCard({ chat, onClick }: { chat: TgChat; onClick: () => void }) {
  const getIcon = () => {
    if (chat.title.toLowerCase().includes('music') || chat.title.toLowerCase().includes('музык')) {
      return <Music size={24} className="text-white" />;
    }
    if (chat.title.toLowerCase().includes('кино') || chat.title.toLowerCase().includes('movie') || chat.title.toLowerCase().includes('film')) {
      return <Film size={24} className="text-white" />;
    }
    if (chat.type === 'saved') {
      return <Star size={24} className="text-white" />;
    }
    return <User size={24} className="text-white" />;
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl bg-[#131920] border border-white/10 flex items-center gap-4 min-h-[80px]"
    >
      <div className="w-14 h-14 rounded-xl bg-[#229ED9]/20 flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-base font-semibold text-white truncate mb-1">{chat.title}</div>
        {chat.lastMessage && (
          <div className="text-sm text-gray-400 truncate">{chat.lastMessage}</div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm px-3 py-1 rounded-full bg-[#229ED9]/20 text-[#229ED9]">
          {chat.type}
        </span>
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </button>
  );
}

// ==================== EMPTY STATE ====================
function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-gray-500 mb-4">{icon}</div>
      <p className="text-base text-gray-400 mb-2">{title}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

// ==================== EMPTY PLAYER SCREEN ====================
function EmptyPlayerScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="w-24 h-24 rounded-2xl bg-[#229ED9]/20 flex items-center justify-center mb-6">
        <Play size={48} className="text-[#229ED9]" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3 text-center">Select media to play</h2>
      <p className="text-base text-gray-400 text-center mb-6 max-w-md">
        Go to a channel or chat and select a video or audio file
      </p>
      <button
        onClick={onBack}
        className="px-6 py-4 rounded-xl bg-[#229ED9] text-white text-base font-semibold min-h-[44px]"
      >
        Back to channels
      </button>
    </div>
  );
}

// ==================== CHAT SCREEN ====================
function ChatScreen({ chat, media, allMedia, onBack, onPlay, filter, onFilterChange, searchQuery, onSearchChange, playlists, onAddToPlaylist, loading }: {
  chat: TgChat;
  media: TgMedia[];
  allMedia: TgMedia[];
  onBack: () => void;
  onPlay: (item: TgMedia) => void;
  filter: 'all' | 'video' | 'audio';
  onFilterChange: (f: 'all' | 'video' | 'audio') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  playlists: Playlist[];
  onAddToPlaylist: (pid: string, mid: string) => void;
  loading: boolean;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-3 flex-shrink-0 border-b border-white/10">
        <button onClick={onBack} className="w-11 h-11 rounded-xl bg-[#131920] border border-white/10 flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{chat.title}</h2>
          <p className="text-sm text-gray-400">{allMedia.length} media files</p>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="p-4 flex-shrink-0 space-y-3">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#131920] border border-white/10 text-base text-white focus:border-[#229ED9] focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center">
              <X size={20} className="text-gray-500" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'video', 'audio'] as const).map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`flex-1 py-3 rounded-xl text-base font-medium min-h-[44px] ${
                filter === f
                  ? 'bg-[#229ED9] text-white'
                  : 'bg-[#131920] text-gray-400 border border-white/10'
              }`}
            >
              {f === 'all' ? 'All' : f === 'video' ? 'Video' : 'Audio'}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {media.length === 0 && !loading ? (
          <EmptyState icon={<Film size={48} />} title="No media found" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {media.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onClick={() => onPlay(item)}
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MEDIA CARD ====================
function MediaCard({ item, onClick, playlists, onAddToPlaylist }: {
  item: TgMedia;
  onClick: () => void;
  playlists: Playlist[];
  onAddToPlaylist: (pid: string, mid: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <button
      onClick={onClick}
      className="rounded-xl overflow-hidden bg-[#131920] border border-white/10 text-left relative"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-[#1a2230] flex items-center justify-center relative">
        {item.type === 'video' ? (
          <Film size={32} className="text-gray-500" />
        ) : (
          <Music size={32} className="text-gray-500" />
        )}
        {item.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-sm text-white font-mono">
            {tg.formatDuration(item.duration)}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3">
        <div className="text-sm font-medium text-white truncate mb-1">{item.fileName}</div>
        <div className="text-xs text-gray-500">{tg.formatSize(item.size)}</div>
      </div>
      
      {/* Add to playlist button */}
      {playlists.length > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
        >
          <Plus size={16} className="text-white" />
        </button>
      )}
      
      {/* Playlist menu */}
      {showMenu && (
        <div className="absolute top-12 right-2 z-20 w-48 bg-[#1a2230] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <div className="text-xs text-gray-500 px-2">Add to playlist</div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {playlists.map(p => (
              <button
                key={p.id}
                onClick={(e) => { e.stopPropagation(); onAddToPlaylist(p.id, item.id); setShowMenu(false); }}
                className="w-full px-3 py-3 text-left text-sm text-white hover:bg-white/5 truncate"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}

// ==================== PLAYER SCREEN ====================
function PlayerScreen({ media, isPlaying, progress, onTogglePlay, onSeek, onBack, downloadProgress, loading }: {
  media: TgMedia & { fileName: string };
  isPlaying: boolean;
  progress: number;
  onTogglePlay: () => void;
  onSeek: (p: number) => void;
  onBack: () => void;
  downloadProgress: { loaded: number; total: number } | null;
  loading: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const el = media.type === 'video' ? videoRef.current : audioRef.current;
    if (!el) return;

    const handleTimeUpdate = () => setCurrentTime(el.currentTime);
    const handleLoadedMetadata = () => setDuration(el.duration);

    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('loadedmetadata', handleLoadedMetadata);

    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }

    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isPlaying, media]);

  useEffect(() => {
    const el = media.type === 'video' ? videoRef.current : audioRef.current;
    if (el) el.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    const el = media.type === 'video' ? videoRef.current : audioRef.current;
    if (el && duration) {
      el.currentTime = p * duration;
    }
    onSeek(p * 100);
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : (downloadProgress ? (downloadProgress.loaded / downloadProgress.total) * 100 : 0);

  if (loading && downloadProgress) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#229ED9] mx-auto mb-4" />
          <p className="text-base text-white mb-2">Downloading...</p>
          <div className="w-64 h-2 rounded-full bg-white/10 overflow-hidden mx-auto mb-2">
            <div className="h-full bg-[#229ED9]" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-sm text-gray-400">
            {tg.formatSize(downloadProgress.loaded)} / {tg.formatSize(downloadProgress.total)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Media element */}
      {media.type === 'video' ? (
        <video
          ref={videoRef}
          src={media.fileName}
          className="flex-1 w-full object-contain"
          autoPlay={isPlaying}
          playsInline
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0e14] p-6">
          <div className="w-48 h-48 rounded-2xl bg-[#229ED9]/20 flex items-center justify-center mb-6">
            <Music size={80} className="text-[#229ED9]" />
          </div>
          <h3 className="text-xl font-bold text-white px-6 truncate max-w-sm mb-2 text-center">{media.fileName}</h3>
          <p className="text-base text-gray-400">{media.chatTitle}</p>
          <audio ref={audioRef} src={media.fileName} autoPlay={isPlaying} />
        </div>
      )}

      {/* Controls */}
      <div className="bg-black/90 p-4">
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white truncate">{media.fileName}</h3>
          <p className="text-sm text-gray-400">{media.chatTitle}</p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="w-full h-2 bg-white/20 rounded-full cursor-pointer" onClick={handleSeek}>
            <div className="h-full bg-[#229ED9] rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>{tg.formatDuration(currentTime)}</span>
            <span>{tg.formatDuration(duration || media.duration || 0)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" />
          </button>
          
          <div className="flex items-center gap-4">
            <button className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <SkipBack size={20} className="text-white" />
            </button>
            <button
              onClick={onTogglePlay}
              className="w-14 h-14 rounded-full bg-[#229ED9] flex items-center justify-center"
            >
              {isPlaying ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white ml-1" />}
            </button>
            <button className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              <SkipForward size={20} className="text-white" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsMuted(!isMuted)} className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
              {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== PLAYLISTS SCREEN ====================
function PlaylistsScreen({ playlists, media, onToggleFavorite, onDelete, onCreate, onBack }: {
  playlists: Playlist[];
  media: TgMedia[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: (name: string) => void;
  onBack: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 flex items-center gap-3 flex-shrink-0 border-b border-white/10">
        <button onClick={onBack} className="w-11 h-11 rounded-xl bg-[#131920] border border-white/10 flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h2 className="text-lg font-bold text-white flex-1">Playlists</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="w-11 h-11 rounded-xl bg-[#229ED9] flex items-center justify-center"
        >
          <Plus size={20} className="text-white" />
        </button>
      </header>

      {showCreate && (
        <div className="p-4 border-b border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name..."
              className="flex-1 px-4 py-3 rounded-xl bg-[#131920] border border-white/10 text-base text-white focus:border-[#229ED9] focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) {
                  onCreate(newName);
                  setNewName('');
                  setShowCreate(false);
                }
              }}
            />
            <button
              onClick={() => { if (newName.trim()) { onCreate(newName); setNewName(''); setShowCreate(false); } }}
              className="px-4 py-3 rounded-xl bg-[#229ED9] text-white"
            >
              <Check size={20} />
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName(''); }}
              className="px-4 py-3 rounded-xl bg-white/10 text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {playlists.length === 0 ? (
          <EmptyState icon={<List size={48} />} title="No playlists yet" subtitle="Create your first playlist" />
        ) : (
          <div className="space-y-3">
            {playlists.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-[#131920] border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#229ED9]/20 flex items-center justify-center">
                  <List size={24} className="text-[#229ED9]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-white truncate">{p.name}</div>
                  <div className="text-sm text-gray-400">{p.items.length} items • {p.createdAt}</div>
                </div>
                <button onClick={() => onToggleFavorite(p.id)} className="w-11 h-11 flex items-center justify-center">
                  <Heart size={20} className={p.isFavorite ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-500'} />
                </button>
                <button onClick={() => onDelete(p.id)} className="w-11 h-11 flex items-center justify-center">
                  <Trash2 size={20} className="text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== SETTINGS SCREEN ====================
function SettingsScreen({ user, onBack, onLogout }: {
  user: { id: number; firstName: string; username?: string } | null;
  onBack: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <header className="p-4 flex items-center gap-3 flex-shrink-0 border-b border-white/10">
        <button onClick={onBack} className="w-11 h-11 rounded-xl bg-[#131920] border border-white/10 flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h2 className="text-lg font-bold text-white">Settings</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Account */}
        <div className="p-4 rounded-xl bg-[#131920] border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#229ED9] flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <div className="text-base font-medium text-white">{user?.firstName || 'User'}</div>
              <div className="text-sm text-gray-400">{user?.username ? `@${user.username}` : `ID: ${user?.id}`}</div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-xl bg-[#131920] border border-white/10 space-y-3">
          <h3 className="text-base font-semibold text-gray-400 uppercase">About</h3>
          <div className="flex justify-between text-base">
            <span className="text-gray-400">Version</span>
            <span className="text-white">1.1.0</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-gray-400">Platform</span>
            <span className="text-white">Telegram Mini App</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-gray-400">License</span>
            <span className="text-white">GPL-3.0</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-base font-medium flex items-center justify-center gap-3 min-h-[44px]"
        >
          <LogOut size={20} /> Sign Out
        </button>

        <p className="text-center text-sm text-gray-500 pb-4">
          TeleTV Player © 2026
        </p>
      </div>
    </div>
  );
}
