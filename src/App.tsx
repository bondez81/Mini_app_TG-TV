import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Search, Settings, Home, List, Star, Music, Film, Clock,
  Plus, Heart, ChevronRight, X, Check,
  Shield, Crown, Bell, LogOut, Phone, QrCode,
  Maximize2, Subtitles, MoreVertical,
  Download, Trash2, ArrowLeft, User, Zap, Loader2, AlertCircle
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
    // Try to initialize Telegram WebApp if available
    try {
      const w = window as any;
      if (w.Telegram && w.Telegram.WebApp) {
        w.Telegram.WebApp.ready();
        w.Telegram.WebApp.expand();
      }
    } catch (e) {
      // Not in Telegram, continue anyway
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
    try { 
      const w = window as any;
      if (w.Telegram && w.Telegram.WebApp) {
        w.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch {}
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
    <div className="w-full h-full bg-[var(--tg-theme-bg-color,#0a0e14)] text-[var(--tg-theme-text-color,#e8edf2)] overflow-hidden">
      {/* Mobile Back Button */}
      {screen !== 'auth' && screen !== 'player' && (
        <button
          onClick={() => {
            if (screen === 'chat') {
              setScreen('home');
              setSelectedChat(null);
              setMedia([]);
            } else {
              setScreen('home');
            }
          }}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Назад"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
      )}

      {screen === 'auth' && (
        <AuthScreen
          onAuth={(config, userData) => {
            setUser(userData);
            setScreen('home');
            loadChats();
          }}
          loading={loading}
          loadingText={loadingText}
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

      {screen === 'player' && currentMedia && (
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-[#2AABEE] mx-auto mb-4" />
            <p className="text-sm text-gray-300">{loadingText}</p>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-scale-in">
          <div className="px-4 py-3 rounded-2xl bg-red-500/90 text-white flex items-center gap-3">
            <AlertCircle size={18} />
            <span className="text-sm flex-1">{error}</span>
            <button onClick={() => setError(null)}><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
          <div className="px-5 py-3 rounded-2xl bg-[#2AABEE] text-white font-medium shadow-2xl flex items-center gap-2">
            <Check size={16} />
            {notification}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== AUTH SCREEN ====================
function AuthScreen({ onAuth, loading, loadingText, error, onError }: {
  onAuth: (config: TgConfig, user: { id: number; firstName: string; username?: string }) => void;
  loading: boolean;
  loadingText: string;
  error: string | null;
  onError: (e: string | null) => void;
}) {
  const [step, setStep] = useState<'credentials' | 'phone' | 'code' | 'password'>('credentials');
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
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
      const hash = await tg.sendCode(config, phone);
      setPhoneCodeHash(hash);
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
    <div className="w-full h-full flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2AABEE] rounded-full opacity-5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6C5CE7] rounded-full opacity-5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#2AABEE] to-[#6C5CE7] flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-[#2AABEE]/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-10 h-10">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">TeleTV Player</span>
          </h1>
          <p className="text-gray-400">Watch Telegram media on your TV</p>
        </div>

        {/* Error */}
        {(localError || error) && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {localError || error}
          </div>
        )}

        {/* Step: Credentials */}
        {step === 'credentials' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#131920] border border-white/5 mb-4">
              <p className="text-sm text-gray-400 mb-2">
                To connect to Telegram, you need API credentials.
              </p>
              <a href="https://my.telegram.org/apps" target="_blank" rel="noopener" className="text-sm text-[#2AABEE] hover:underline flex items-center gap-1">
                Get API ID & Hash →
              </a>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">API ID</label>
              <input
                type="number"
                value={apiId}
                onChange={(e) => setApiId(e.target.value)}
                placeholder="12345678"
                className="w-full px-4 py-3.5 rounded-xl bg-[#131920] border border-white/10 text-white focus:border-[#2AABEE] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">API Hash</label>
              <input
                type="text"
                value={apiHash}
                onChange={(e) => setApiHash(e.target.value)}
                placeholder="0123456789abcdef..."
                className="w-full px-4 py-3.5 rounded-xl bg-[#131920] border border-white/10 text-white focus:border-[#2AABEE] focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleCredentials}
              disabled={localLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2AABEE] to-[#6C5CE7] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {localLoading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
              Continue
            </button>
          </div>
        )}

        {/* Step: Phone */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Phone Number (with country code)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-3.5 rounded-xl bg-[#131920] border border-white/10 text-white text-lg focus:border-[#2AABEE] focus:outline-none transition-colors"
                autoFocus
              />
            </div>
            <button
              onClick={handlePhone}
              disabled={localLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2AABEE] to-[#6C5CE7] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {localLoading ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />}
              Send Code
            </button>
            <button
              onClick={() => setStep('credentials')}
              className="w-full py-3 rounded-xl text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step: Code */}
        {step === 'code' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-center text-sm">
              Code sent to <span className="text-white">{phone}</span>
            </p>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="12345"
                maxLength={6}
                className="w-full px-4 py-3.5 rounded-xl bg-[#131920] border border-white/10 text-white text-2xl text-center tracking-[0.5em] focus:border-[#2AABEE] focus:outline-none transition-colors"
                autoFocus
              />
            </div>
            <button
              onClick={handleCode}
              disabled={localLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2AABEE] to-[#6C5CE7] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {localLoading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
              Verify
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full py-3 rounded-xl text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step: Password (2FA) */}
        {step === 'password' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-center text-sm">
              Your account has 2FA enabled
            </p>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Cloud Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl bg-[#131920] border border-white/10 text-white text-lg focus:border-[#2AABEE] focus:outline-none transition-colors"
                autoFocus
              />
            </div>
            <button
              onClick={handlePassword}
              disabled={localLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#2AABEE] to-[#6C5CE7] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {localLoading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
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
  // Функция для получения градиента на основе ID
  const getGradient = (id: string) => {
    const gradients = [
      'gradient-blue',
      'gradient-purple', 
      'gradient-green',
      'gradient-orange',
      'gradient-teal',
      'gradient-pink',
      'gradient-sunset',
      'gradient-ocean'
    ];
    const index = Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="p-4 pb-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2AABEE] to-[#6C5CE7] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-5 h-5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm">TeleTV Player</div>
            <div className="text-xs text-gray-500">{user?.firstName || 'User'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-2.5 rounded-xl gradient-green hover:opacity-90 transition-opacity shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
          <button onClick={onOpenSettings} className="p-2.5 rounded-xl gradient-orange hover:opacity-90 transition-opacity shadow-md">
            <Settings size={16} className="text-white" />
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="px-4 py-2 flex gap-2 flex-shrink-0">
        <button onClick={onOpenPlaylists} className="flex-1 py-3 rounded-xl gradient-purple text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md">
          <List size={16} className="text-white" /> Playlists
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollable">
        <h2 className="text-sm font-semibold gradient-text uppercase tracking-wider mb-4 mt-2">
          Chats & Channels
        </h2>
        <div className="space-y-3">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className="w-full p-4 rounded-2xl bg-[#131920] border border-white/10 flex items-center gap-4 hover:bg-[#1a2230] hover:border-[#2AABEE]/30 transition-all text-left active:scale-[0.98] shadow-lg"
            >
              <div className={`w-14 h-14 rounded-2xl ${getGradient(chat.id)} flex items-center justify-center flex-shrink-0 shadow-md`}>
                {chat.type === 'channel' ? (
                  <Film size={22} className="text-white" />
                ) : chat.type === 'saved' ? (
                  <Star size={22} className="text-white" />
                ) : (
                  <User size={22} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base truncate">{chat.title}</div>
                {chat.lastMessage && (
                  <div className="text-sm text-gray-400 truncate mt-1">{chat.lastMessage}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium text-white shadow-sm ${
                  chat.type === 'channel' ? 'gradient-blue' :
                  chat.type === 'saved' ? 'gradient-orange' :
                  'gradient-teal'
                }`}>
                  {chat.type}
                </span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        {chats.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-500">
            <Film size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No chats found</p>
            <p className="text-xs mt-1">Try refreshing</p>
          </div>
        )}
      </div>
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
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-3 flex-shrink-0 border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base truncate">{chat.title}</h2>
          <p className="text-xs text-gray-500">{allMedia.length} media files</p>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="p-4 pb-2 flex-shrink-0 space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#131920] border border-white/5 text-sm text-white focus:border-[#2AABEE] focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {(['all', 'video', 'audio'] as const).map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-[#2AABEE]/20 text-[#2AABEE] border border-[#2AABEE]/30'
                  : 'bg-[#131920] text-gray-400 border border-white/5'
              }`}
            >
              {f === 'all' ? '📁 All' : f === 'video' ? '🎬 Video' : '🎵 Audio'}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollable">
        <div className="grid grid-cols-2 gap-3">
          {media.map((item) => (
            <button
              key={item.id}
              onClick={() => onPlay(item)}
              className="rounded-xl overflow-hidden bg-[#131920] border border-white/5 hover:border-[#2AABEE]/20 transition-all text-left active:scale-[0.97] relative group"
            >
              {/* Thumbnail */}
              <div className={`aspect-video bg-gradient-to-br ${getMediaColor(item.id)} flex items-center justify-center relative`}>
                {item.type === 'video' ? (
                  <Film size={28} className="text-white/60" />
                ) : (
                  <Music size={28} className="text-white/60" />
                )}
                {item.duration && (
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-mono">
                    {tg.formatDuration(item.duration)}
                  </div>
                )}
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-white/80 uppercase">
                  {item.mimeType.split('/')[1]?.substring(0, 4) || item.type}
                </div>
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-10 h-10 rounded-full bg-[#2AABEE]/90 flex items-center justify-center">
                    <Play size={18} className="text-white ml-0.5" />
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-2.5">
                <div className="text-xs font-medium truncate">{item.fileName}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{tg.formatSize(item.size)}</div>
              </div>
              
              {/* Add to playlist button */}
              {playlists.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(showPlaylistMenu === item.id ? null : item.id); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus size={12} className="text-white" />
                </button>
              )}
              
              {/* Playlist menu */}
              {showPlaylistMenu === item.id && (
                <div className="absolute top-8 right-2 z-20 w-40 bg-[#1a2230] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-scale-in">
                  <div className="p-2 border-b border-white/5">
                    <div className="text-[10px] text-gray-500 px-1">Add to playlist</div>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {playlists.map(p => (
                      <button
                        key={p.id}
                        onClick={(e) => { e.stopPropagation(); onAddToPlaylist(p.id, item.id); setShowPlaylistMenu(null); }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors truncate"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {media.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-500">
            <Film size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No media found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== AUDIO VISUALIZER ====================
function AudioVisualizer({ isPlaying, audioContext }: { isPlaying: boolean; audioContext: AudioContext | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioContext || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Создаём анализатор
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Очистка canvas
      ctx.fillStyle = 'rgba(10, 14, 20, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Градиент для каждого бара
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Рисуем статичную визуализацию когда пауза
      ctx.fillStyle = 'rgba(10, 14, 20, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioContext]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      className="w-full max-w-md h-32 rounded-2xl"
    />
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  // Инициализация Web Audio API для демо-звука
  useEffect(() => {
    if (media.type === 'audio' && isPlaying) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      
      // Создаём осциллятор для генерации тестового звука
      if (!oscillatorRef.current) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4 note
        
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillatorRef.current = oscillator;
        oscillator.start();
      }
    } else {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    };
  }, [isPlaying, media.type]);

  useEffect(() => {
    const el = media.type === 'video' ? videoRef.current : audioRef.current;
    if (!el) return;

    const handleTimeUpdate = () => setCurrentTime(el.currentTime);
    const handleLoadedMetadata = () => setDuration(el.duration);
    const handleEnded = () => onTogglePlay();

    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('loadedmetadata', handleLoadedMetadata);
    el.addEventListener('ended', handleEnded);

    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }

    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('loadedmetadata', handleLoadedMetadata);
      el.removeEventListener('ended', handleEnded);
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

  // Download progress
  if (loading && downloadProgress) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#2AABEE] mx-auto mb-4" />
          <p className="text-sm text-gray-300 mb-2">Downloading...</p>
          <div className="w-48 h-2 rounded-full bg-white/10 overflow-hidden mx-auto">
            <div
              className="h-full bg-[#2AABEE] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {tg.formatSize(downloadProgress.loaded)} / {tg.formatSize(downloadProgress.total)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black relative">
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
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#131920] via-[#0a0e14] to-[#1a1a2e] p-6">
          {/* Аудио-визуализатор */}
          <div className="w-full max-w-md mb-8">
            <AudioVisualizer isPlaying={isPlaying} audioContext={audioContextRef.current} />
          </div>

          {/* Информация о треке */}
          <div className="text-center mb-8">
            <div className={`w-32 h-32 rounded-3xl ${getMediaColor(media.id)} mx-auto mb-6 flex items-center justify-center shadow-2xl`}>
              <Music size={48} className="text-white" />
            </div>
            <h3 className="text-xl font-bold px-6 truncate max-w-sm mb-2">{media.fileName}</h3>
            <p className="text-sm text-gray-400">{media.chatTitle}</p>
          </div>

          <audio
            ref={audioRef}
            src={media.fileName}
            autoPlay={isPlaying}
          />
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
        {/* Progress */}
        <div className="mb-3">
          <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer" onClick={handleSeek}>
            <div className="h-full bg-[#2AABEE] rounded-full relative" style={{ width: `${progressPercent}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg" />
            </div>
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-white/60">
            <span>{tg.formatDuration(currentTime)}</span>
            <span>{tg.formatDuration(duration || media.duration || 0)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 text-white/60 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          
          <div className="flex items-center gap-6">
            <button className="p-2 text-white/60 hover:text-white">
              <SkipBack size={22} />
            </button>
            <button
              onClick={onTogglePlay}
              className="w-14 h-14 rounded-full bg-[#2AABEE] flex items-center justify-center hover:bg-[#2AABEE]/80 transition-colors"
            >
              {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-0.5" />}
            </button>
            <button className="p-2 text-white/60 hover:text-white">
              <SkipForward size={22} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white/60 hover:text-white">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
              className="w-16 accent-[#2AABEE]"
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
      <header className="p-4 flex items-center gap-3 flex-shrink-0 border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg flex-1">Playlists</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="p-2 rounded-xl bg-[#2AABEE]/20 text-[#2AABEE] hover:bg-[#2AABEE]/30"
        >
          <Plus size={20} />
        </button>
      </header>

      {showCreate && (
        <div className="p-4 border-b border-white/5 animate-scale-in">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name..."
              className="flex-1 px-3 py-2.5 rounded-xl bg-[#131920] border border-white/10 text-sm text-white focus:border-[#2AABEE] focus:outline-none"
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
              className="px-4 py-2.5 rounded-xl bg-[#2AABEE] text-white text-sm font-medium"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName(''); }}
              className="px-3 py-2.5 rounded-xl bg-white/5 text-gray-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 scrollable">
        {playlists.length > 0 ? (
          <div className="space-y-2">
            {playlists.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-[#131920] border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6C5CE7]/20 to-[#2AABEE]/20 flex items-center justify-center">
                  <List size={18} className="text-[#6C5CE7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.items.length} items • {p.createdAt}</div>
                </div>
                <button onClick={() => onToggleFavorite(p.id)} className="p-2">
                  <Heart size={16} className={p.isFavorite ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-500'} />
                </button>
                <button onClick={() => onDelete(p.id)} className="p-2 text-gray-500 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <List size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No playlists yet</p>
            <p className="text-xs mt-1">Create your first playlist</p>
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
      <header className="p-4 flex items-center gap-3 flex-shrink-0 border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg">Settings</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Account */}
        <div className="p-4 rounded-xl bg-[#131920] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2AABEE] to-[#6C5CE7] flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <div className="font-medium">{user?.firstName || 'User'}</div>
              <div className="text-sm text-gray-500">{user?.username ? `@${user.username}` : `ID: ${user?.id}`}</div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-xl bg-[#131920] border border-white/5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">About</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Version</span>
            <span>1.1.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Platform</span>
            <span>Telegram Mini App</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Protocol</span>
            <span className="font-mono text-xs">MTProto 2.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">License</span>
            <span>GPL-3.0</span>
          </div>
        </div>

        {/* Features */}
        <div className="p-4 rounded-xl bg-[#131920] border border-white/5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Features</h3>
          <div className="flex items-center gap-2 text-sm">
            <Check size={14} className="text-green-400" /> Video playback
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check size={14} className="text-green-400" /> Audio playback
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check size={14} className="text-green-400" /> Playlists
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check size={14} className="text-green-400" /> Direct Telegram connection
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check size={14} className="text-green-400" /> No server required
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>

        <p className="text-center text-xs text-gray-600 pb-4">
          TeleTV Player © 2026
        </p>
      </div>
    </div>
  );
}

// ==================== HELPERS ====================
function getMediaColor(id: string): string {
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
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}
