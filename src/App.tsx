import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Search, Settings, List, Star, Music, Film,
  Plus, Heart, ChevronRight, X, Check, Trash2,
  Shield, LogOut, Phone, ArrowLeft, User, Loader2, AlertCircle, Inbox
} from 'lucide-react';
import * as tg from './telegram';
import type { TgChat, TgMedia, TgConfig } from './telegram';

// ==================== DESIGN TOKENS ====================
const tokens = {
  colors: {
    primary: '#229ED9',
    background: '#0a0e14',
    surface: '#131920',
    border: 'rgba(255, 255, 255, 0.1)',
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
      muted: '#6b7280'
    },
    error: '#ef4444',
    success: '#10b981'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px'
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px'
  },
  typography: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px'
  }
};

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

  useEffect(() => {
    try {
      const w = window as any;
      if (w.Telegram && w.Telegram.WebApp) {
        w.Telegram.WebApp.ready();
        w.Telegram.WebApp.expand();
      }
    } catch (e) {}
    setIsReady(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('teletv_playlists', JSON.stringify(playlists));
  }, [playlists]);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  }, []);

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

  const logout = () => {
    tg.disconnect();
    tg.clearSession();
    setUser(null);
    setChats([]);
    setMedia([]);
    setScreen('auth');
  };

  const filteredMedia = media.filter(m => {
    const matchesFilter = mediaFilter === 'all' || m.type === mediaFilter;
    const matchesSearch = !searchQuery || m.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ width: '100%', height: '100%', background: tokens.colors.background, color: tokens.colors.text.primary, overflow: 'hidden' }}>
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

      {loading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={48} className="animate-spin" style={{ color: tokens.colors.primary, margin: '0 auto 16px' }} />
            <p style={{ fontSize: tokens.typography.base, color: tokens.colors.text.primary }}>{loadingText}</p>
          </div>
        </div>
      )}

      {error && (
        <div style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', zIndex: 50 }}>
          <div style={{ padding: '16px', borderRadius: tokens.radius.md, background: tokens.colors.error, color: tokens.colors.text.primary, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: tokens.typography.base, flex: 1 }}>{error}</span>
            <button onClick={() => setError(null)} style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {notification && (
        <div style={{ position: 'fixed', bottom: '24px', left: '16px', right: '16px', zIndex: 50 }}>
          <div style={{ padding: '16px 20px', borderRadius: tokens.radius.md, background: tokens.colors.primary, color: tokens.colors.text.primary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Check size={20} />
            <span style={{ fontSize: tokens.typography.base }}>{notification}</span>
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
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: tokens.spacing['2xl'] }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: tokens.spacing['3xl'] }}>
          <div style={{ width: '80px', height: '80px', borderRadius: tokens.radius.lg, background: tokens.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Film size={40} color={tokens.colors.text.primary} />
          </div>
          <h1 style={{ fontSize: tokens.typography['2xl'], fontWeight: 700, color: tokens.colors.text.primary, marginBottom: tokens.spacing.sm }}>TeleTV Player</h1>
          <p style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary }}>Watch Telegram media on your TV</p>
        </div>

        {(localError || error) && (
          <div style={{ marginBottom: tokens.spacing['2xl'], padding: '16px', borderRadius: tokens.radius.md, background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${tokens.colors.error}30`, color: tokens.colors.error, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: tokens.typography.base }}>{localError || error}</span>
          </div>
        )}

        {step === 'credentials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
            <div style={{ padding: '16px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}` }}>
              <p style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary, marginBottom: '12px' }}>
                To connect to Telegram, you need API credentials.
              </p>
              <a href="https://my.telegram.org/apps" target="_blank" rel="noopener" style={{ fontSize: tokens.typography.base, color: tokens.colors.primary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Get API ID & Hash →
              </a>
            </div>
            
            <div>
              <label style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary, marginBottom: '8px', display: 'block' }}>API ID</label>
              <input
                type="number"
                value={apiId}
                onChange={(e) => setApiId(e.target.value)}
                placeholder="12345678"
                style={{ width: '100%', padding: '12px 16px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.primary, fontSize: tokens.typography.base, outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary, marginBottom: '8px', display: 'block' }}>API Hash</label>
              <input
                type="text"
                value={apiHash}
                onChange={(e) => setApiHash(e.target.value)}
                placeholder="0123456789abcdef..."
                style={{ width: '100%', padding: '12px 16px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.primary, fontSize: tokens.typography.base, outline: 'none' }}
              />
            </div>
            <button
              onClick={handleCredentials}
              disabled={localLoading}
              style={{ width: '100%', padding: '16px', borderRadius: tokens.radius.md, background: tokens.colors.primary, color: tokens.colors.text.primary, fontSize: tokens.typography.base, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px', border: 'none', cursor: 'pointer' }}
            >
              {localLoading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
              Continue
            </button>
          </div>
        )}

        {step === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
            <div>
              <label style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary, marginBottom: '8px', display: 'block' }}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                style={{ width: '100%', padding: '12px 16px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.primary, fontSize: tokens.typography.base, outline: 'none' }}
                autoFocus
              />
            </div>
            <button
              onClick={handlePhone}
              disabled={localLoading}
              style={{ width: '100%', padding: '16px', borderRadius: tokens.radius.md, background: tokens.colors.primary, color: tokens.colors.text.primary, fontSize: tokens.typography.base, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px', border: 'none', cursor: 'pointer' }}
            >
              {localLoading ? <Loader2 size={20} className="animate-spin" /> : <Phone size={20} />}
              Send Code
            </button>
            <button
              onClick={() => setStep('credentials')}
              style={{ width: '100%', padding: '16px', borderRadius: tokens.radius.md, color: tokens.colors.text.secondary, fontSize: tokens.typography.base, minHeight: '44px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ← Back
            </button>
          </div>
        )}

        {step === 'code' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
            <p style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary, textAlign: 'center' }}>
              Code sent to <span style={{ color: tokens.colors.text.primary }}>{phone}</span>
            </p>
            <div>
              <label style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary, marginBottom: '8px', display: 'block' }}>Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="12345"
                maxLength={6}
                style={{ width: '100%', padding: '12px 16px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.primary, fontSize: tokens.typography.xl, textAlign: 'center', letterSpacing: '0.5em', outline: 'none' }}
                autoFocus
              />
            </div>
            <button
              onClick={handleCode}
              disabled={localLoading}
              style={{ width: '100%', padding: '16px', borderRadius: tokens.radius.md, background: tokens.colors.primary, color: tokens.colors.text.primary, fontSize: tokens.typography.base, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px', border: 'none', cursor: 'pointer' }}
            >
              {localLoading ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
              Verify
            </button>
            <button
              onClick={() => setStep('phone')}
              style={{ width: '100%', padding: '16px', borderRadius: tokens.radius.md, color: tokens.colors.text.secondary, fontSize: tokens.typography.base, minHeight: '44px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ← Back
            </button>
          </div>
        )}

        {step === 'password' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
            <p style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary, textAlign: 'center' }}>
              Your account has 2FA enabled
            </p>
            <div>
              <label style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary, marginBottom: '8px', display: 'block' }}>Cloud Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.text.primary, fontSize: tokens.typography.base, outline: 'none' }}
                autoFocus
              />
            </div>
            <button
              onClick={handlePassword}
              disabled={localLoading}
              style={{ width: '100%', padding: '16px', borderRadius: tokens.radius.md, background: tokens.colors.primary, color: tokens.colors.text.primary, fontSize: tokens.typography.base, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px', border: 'none', cursor: 'pointer' }}
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: tokens.spacing.lg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: `1px solid ${tokens.colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
          <div style={{ width: '48px', height: '48px', borderRadius: tokens.radius.md, background: tokens.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Film size={24} color={tokens.colors.text.primary} />
          </div>
          <div>
            <div style={{ fontSize: tokens.typography.lg, fontWeight: 700, color: tokens.colors.text.primary }}>TeleTV Player</div>
            <div style={{ fontSize: tokens.typography.sm, color: tokens.colors.text.secondary }}>{user?.firstName || 'User'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
          <button 
            onClick={onRefresh} 
            style={{ width: '44px', height: '44px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Refresh"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', color: tokens.colors.text.secondary }}>
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
          <button 
            onClick={onOpenSettings} 
            style={{ width: '44px', height: '44px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Settings"
          >
            <Settings size={20} color={tokens.colors.text.secondary} />
          </button>
        </div>
      </header>

      <div style={{ padding: tokens.spacing.lg, flexShrink: 0 }}>
        <button 
          onClick={onOpenPlaylists} 
          style={{ width: '100%', padding: '16px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, fontSize: tokens.typography.base, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '44px', cursor: 'pointer', color: tokens.colors.text.primary }}
        >
          <List size={20} color={tokens.colors.primary} />
          <span>Playlists</span>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${tokens.spacing.lg} ${tokens.spacing.lg}` }}>
        <h2 style={{ fontSize: tokens.typography.lg, fontWeight: 700, color: tokens.colors.text.primary, marginBottom: tokens.spacing.lg }}>
          Chats & Channels
        </h2>
        
        {chats.length === 0 && !loading ? (
          <EmptyState icon={<Inbox size={48} />} title="No chats found" subtitle="Try refreshing" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
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
      return <Music size={24} color={tokens.colors.text.primary} />;
    }
    if (chat.title.toLowerCase().includes('кино') || chat.title.toLowerCase().includes('movie') || chat.title.toLowerCase().includes('film')) {
      return <Film size={24} color={tokens.colors.text.primary} />;
    }
    if (chat.type === 'saved') {
      return <Star size={24} color={tokens.colors.text.primary} />;
    }
    return <User size={24} color={tokens.colors.text.primary} />;
  };

  return (
    <button
      onClick={onClick}
      style={{ width: '100%', padding: tokens.spacing.lg, borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, display: 'flex', alignItems: 'center', gap: tokens.spacing.lg, minHeight: '80px', cursor: 'pointer', textAlign: 'left' }}
    >
      <div style={{ width: '56px', height: '56px', borderRadius: tokens.radius.md, background: `${tokens.colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: tokens.typography.base, fontWeight: 600, color: tokens.colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{chat.title}</div>
        {chat.lastMessage && (
          <div style={{ fontSize: tokens.typography.sm, color: tokens.colors.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.lastMessage}</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, flexShrink: 0 }}>
        <span style={{ fontSize: tokens.typography.sm, padding: '4px 12px', borderRadius: '999px', background: `${tokens.colors.primary}20`, color: tokens.colors.primary }}>
          {chat.type}
        </span>
        <ChevronRight size={20} color={tokens.colors.text.secondary} />
      </div>
    </button>
  );
}

// ==================== EMPTY STATE ====================
function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', textAlign: 'center' }}>
      <div style={{ color: tokens.colors.text.muted, marginBottom: tokens.spacing.lg }}>{icon}</div>
      <p style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary, marginBottom: tokens.spacing.sm }}>{title}</p>
      {subtitle && <p style={{ fontSize: tokens.typography.sm, color: tokens.colors.text.muted }}>{subtitle}</p>}
    </div>
  );
}

// ==================== EMPTY PLAYER SCREEN ====================
function EmptyPlayerScreen({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: tokens.spacing['2xl'] }}>
      <div style={{ width: '96px', height: '96px', borderRadius: tokens.radius.lg, background: `${tokens.colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: tokens.spacing['2xl'] }}>
        <Play size={48} color={tokens.colors.primary} />
      </div>
      <h2 style={{ fontSize: tokens.typography.xl, fontWeight: 700, color: tokens.colors.text.primary, marginBottom: tokens.spacing.md, textAlign: 'center' }}>Select media to play</h2>
      <p style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary, textAlign: 'center', marginBottom: tokens.spacing['2xl'], maxWidth: '400px' }}>
        Go to a channel or chat and select a video or audio file
      </p>
      <button
        onClick={onBack}
        style={{ padding: '16px 24px', borderRadius: tokens.radius.md, background: tokens.colors.primary, color: tokens.colors.text.primary, fontSize: tokens.typography.base, fontWeight: 600, minHeight: '44px', border: 'none', cursor: 'pointer' }}
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: tokens.spacing.lg, display: 'flex', alignItems: 'center', gap: tokens.spacing.md, flexShrink: 0, borderBottom: `1px solid ${tokens.colors.border}` }}>
        <button onClick={onBack} style={{ width: '44px', height: '44px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={20} color={tokens.colors.text.primary} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: tokens.typography.lg, fontWeight: 700, color: tokens.colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</h2>
          <p style={{ fontSize: tokens.typography.sm, color: tokens.colors.text.secondary }}>{allMedia.length} media files</p>
        </div>
      </header>

      <div style={{ padding: tokens.spacing.lg, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: tokens.colors.text.muted }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            style={{ width: '100%', paddingLeft: '48px', paddingRight: '16px', padding: '12px 16px 12px 48px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, fontSize: tokens.typography.base, color: tokens.colors.text.primary, outline: 'none' }}
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color={tokens.colors.text.muted} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
          {(['all', 'video', 'audio'] as const).map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              style={{ flex: 1, padding: '12px', borderRadius: tokens.radius.md, fontSize: tokens.typography.base, fontWeight: 500, minHeight: '44px', background: filter === f ? tokens.colors.primary : tokens.colors.surface, color: filter === f ? tokens.colors.text.primary : tokens.colors.text.secondary, border: filter === f ? 'none' : `1px solid ${tokens.colors.border}`, cursor: 'pointer' }}
            >
              {f === 'all' ? 'All' : f === 'video' ? 'Video' : 'Audio'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${tokens.spacing.lg} ${tokens.spacing.lg}` }}>
        {media.length === 0 && !loading ? (
          <EmptyState icon={<Film size={48} />} title="No media found" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing.md }}>
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
      style={{ borderRadius: tokens.radius.md, overflow: 'hidden', background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, textAlign: 'left', position: 'relative', cursor: 'pointer', width: '100%' }}
    >
      <div style={{ aspectRatio: '16/9', background: tokens.colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {item.type === 'video' ? (
          <Film size={32} color={tokens.colors.text.muted} />
        ) : (
          <Music size={32} color={tokens.colors.text.muted} />
        )}
        {item.duration && (
          <div style={{ position: 'absolute', bottom: '8px', right: '8px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.7)', fontSize: tokens.typography.sm, color: tokens.colors.text.primary, fontFamily: 'monospace' }}>
            {tg.formatDuration(item.duration)}
          </div>
        )}
      </div>
      
      <div style={{ padding: tokens.spacing.md }}>
        <div style={{ fontSize: tokens.typography.sm, fontWeight: 500, color: tokens.colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{item.fileName}</div>
        <div style={{ fontSize: tokens.typography.xs, color: tokens.colors.text.muted }}>{tg.formatSize(item.size)}</div>
      </div>
      
      {playlists.length > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          style={{ position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={16} color={tokens.colors.text.primary} />
        </button>
      )}
      
      {showMenu && (
        <div style={{ position: 'absolute', top: '48px', right: '8px', zIndex: 20, width: '192px', background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, borderRadius: tokens.radius.md, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          <div style={{ padding: '8px', borderBottom: `1px solid ${tokens.colors.border}` }}>
            <div style={{ fontSize: tokens.typography.xs, color: tokens.colors.text.muted, padding: '0 8px' }}>Add to playlist</div>
          </div>
          <div style={{ maxHeight: '192px', overflowY: 'auto' }}>
            {playlists.map(p => (
              <button
                key={p.id}
                onClick={(e) => { e.stopPropagation(); onAddToPlaylist(p.id, item.id); setShowMenu(false); }}
                style={{ width: '100%', padding: '12px', textAlign: 'left', fontSize: tokens.typography.sm, color: tokens.colors.text.primary, background: 'none', border: 'none', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
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
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} className="animate-spin" style={{ color: tokens.colors.primary, margin: '0 auto 16px' }} />
          <p style={{ fontSize: tokens.typography.base, color: tokens.colors.text.primary, marginBottom: '8px' }}>Downloading...</p>
          <div style={{ width: '256px', height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', margin: '0 auto 8px' }}>
            <div style={{ height: '100%', background: tokens.colors.primary, width: `${progressPercent}%` }} />
          </div>
          <p style={{ fontSize: tokens.typography.sm, color: tokens.colors.text.secondary }}>
            {tg.formatSize(downloadProgress.loaded)} / {tg.formatSize(downloadProgress.total)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
      {media.type === 'video' ? (
        <video
          ref={videoRef}
          src={media.fileName}
          style={{ flex: 1, width: '100%', objectFit: 'contain' }}
          autoPlay={isPlaying}
          playsInline
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: tokens.colors.background, padding: tokens.spacing['2xl'] }}>
          <div style={{ width: '192px', height: '192px', borderRadius: tokens.radius.lg, background: `${tokens.colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: tokens.spacing['2xl'] }}>
            <Music size={80} color={tokens.colors.primary} />
          </div>
          <h3 style={{ fontSize: tokens.typography.xl, fontWeight: 700, color: tokens.colors.text.primary, padding: '0 24px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px', marginBottom: '8px', textAlign: 'center' }}>{media.fileName}</h3>
          <p style={{ fontSize: tokens.typography.base, color: tokens.colors.text.secondary }}>{media.chatTitle}</p>
          <audio ref={audioRef} src={media.fileName} autoPlay={isPlaying} />
        </div>
      )}

      <div style={{ background: 'rgba(0,0,0,0.9)', padding: tokens.spacing.lg }}>
        <div style={{ marginBottom: tokens.spacing.lg }}>
          <h3 style={{ fontSize: tokens.typography.lg, fontWeight: 700, color: tokens.colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{media.fileName}</h3>
          <p style={{ fontSize: tokens.typography.sm, color: tokens.colors.text.secondary }}>{media.chatTitle}</p>
        </div>

        <div style={{ marginBottom: tokens.spacing.lg }}>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', cursor: 'pointer' }} onClick={handleSeek}>
            <div style={{ height: '100%', background: tokens.colors.primary, borderRadius: '999px', width: `${progressPercent}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: tokens.typography.sm, color: tokens.colors.text.secondary }}>
            <span>{tg.formatDuration(currentTime)}</span>
            <span>{tg.formatDuration(duration || media.duration || 0)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ width: '44px', height: '44px', borderRadius: tokens.radius.md, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={20} color={tokens.colors.text.primary} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.lg }}>
            <button style={{ width: '44px', height: '44px', borderRadius: tokens.radius.md, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <SkipBack size={20} color={tokens.colors.text.primary} />
            </button>
            <button
              onClick={onTogglePlay}
              style={{ width: '56px', height: '56px', borderRadius: '50%', background: tokens.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            >
              {isPlaying ? <Pause size={28} color={tokens.colors.text.primary} /> : <Play size={28} color={tokens.colors.text.primary} style={{ marginLeft: '4px' }} />}
            </button>
            <button style={{ width: '44px', height: '44px', borderRadius: tokens.radius.md, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <SkipForward size={20} color={tokens.colors.text.primary} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
            <button onClick={() => setIsMuted(!isMuted)} style={{ width: '44px', height: '44px', borderRadius: tokens.radius.md, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              {isMuted ? <VolumeX size={20} color={tokens.colors.text.primary} /> : <Volume2 size={20} color={tokens.colors.text.primary} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
              style={{ width: '96px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== PLAYLISTS SCREEN ====================
function PlaylistsScreen({ playlists, onToggleFavorite, onDelete, onCreate, onBack }: {
  playlists: Playlist[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: (name: string) => void;
  onBack: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: tokens.spacing.lg, display: 'flex', alignItems: 'center', gap: tokens.spacing.md, flexShrink: 0, borderBottom: `1px solid ${tokens.colors.border}` }}>
        <button onClick={onBack} style={{ width: '44px', height: '44px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={20} color={tokens.colors.text.primary} />
        </button>
        <h2 style={{ fontSize: tokens.typography.lg, fontWeight: 700, color: tokens.colors.text.primary, flex: 1 }}>Playlists</h2>
        <button
          onClick={() => setShowCreate(true)}
          style={{ width: '44px', height: '44px', borderRadius: tokens.radius.md, background: tokens.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={20} color={tokens.colors.text.primary} />
        </button>
      </header>

      {showCreate && (
        <div style={{ padding: tokens.spacing.lg, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name..."
              style={{ flex: 1, padding: '12px 16px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, fontSize: tokens.typography.base, color: tokens.colors.text.primary, outline: 'none' }}
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
              style={{ padding: '12px 16px', borderRadius: tokens.radius.md, background: tokens.colors.primary, color: tokens.colors.text.primary, border: 'none', cursor: 'pointer' }}
            >
              <Check size={20} />
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName(''); }}
              style={{ padding: '12px 16px', borderRadius: tokens.radius.md, background: 'rgba(255,255,255,0.1)', color: tokens.colors.text.secondary, border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing.lg }}>
        {playlists.length === 0 ? (
          <EmptyState icon={<List size={48} />} title="No playlists yet" subtitle="Create your first playlist" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
            {playlists.map(p => (
              <div key={p.id} style={{ padding: tokens.spacing.lg, borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, display: 'flex', alignItems: 'center', gap: tokens.spacing.lg }}>
                <div style={{ width: '48px', height: '48px', borderRadius: tokens.radius.md, background: `${tokens.colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <List size={24} color={tokens.colors.primary} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: tokens.typography.base, fontWeight: 500, color: tokens.colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: tokens.typography.sm, color: tokens.colors.text.secondary }}>{p.items.length} items • {p.createdAt}</div>
                </div>
                <button onClick={() => onToggleFavorite(p.id)} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Heart size={20} style={{ color: p.isFavorite ? '#FFD700' : tokens.colors.text.muted, fill: p.isFavorite ? '#FFD700' : 'none' }} />
                </button>
                <button onClick={() => onDelete(p.id)} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={20} color={tokens.colors.text.muted} />
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: tokens.spacing.lg, display: 'flex', alignItems: 'center', gap: tokens.spacing.md, flexShrink: 0, borderBottom: `1px solid ${tokens.colors.border}` }}>
        <button onClick={onBack} style={{ width: '44px', height: '44px', borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={20} color={tokens.colors.text.primary} />
        </button>
        <h2 style={{ fontSize: tokens.typography.lg, fontWeight: 700, color: tokens.colors.text.primary }}>Settings</h2>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing.lg, display: 'flex', flexDirection: 'column', gap: tokens.spacing.lg }}>
        <div style={{ padding: tokens.spacing.lg, borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.lg }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: tokens.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} color={tokens.colors.text.primary} />
            </div>
            <div>
              <div style={{ fontSize: tokens.typography.base, fontWeight: 500, color: tokens.colors.text.primary }}>{user?.firstName || 'User'}</div>
              <div style={{ fontSize: tokens.typography.sm, color: tokens.colors.text.secondary }}>{user?.username ? `@${user.username}` : `ID: ${user?.id}`}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: tokens.spacing.lg, borderRadius: tokens.radius.md, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
          <h3 style={{ fontSize: tokens.typography.base, fontWeight: 600, color: tokens.colors.text.secondary, textTransform: 'uppercase' }}>About</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.base }}>
            <span style={{ color: tokens.colors.text.secondary }}>Version</span>
            <span style={{ color: tokens.colors.text.primary }}>1.1.0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.base }}>
            <span style={{ color: tokens.colors.text.secondary }}>Platform</span>
            <span style={{ color: tokens.colors.text.primary }}>Telegram Mini App</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.base }}>
            <span style={{ color: tokens.colors.text.secondary }}>License</span>
            <span style={{ color: tokens.colors.text.primary }}>GPL-3.0</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{ width: '100%', padding: '16px', borderRadius: tokens.radius.md, background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${tokens.colors.error}30`, color: tokens.colors.error, fontSize: tokens.typography.base, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '44px', cursor: 'pointer' }}
        >
          <LogOut size={20} /> Sign Out
        </button>

        <p style={{ textAlign: 'center', fontSize: tokens.typography.sm, color: tokens.colors.text.muted, paddingBottom: tokens.spacing.lg }}>
          TeleTV Player © 2026
        </p>
      </div>
    </div>
  );
}
