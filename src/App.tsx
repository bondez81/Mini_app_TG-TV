import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tv, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Search, Settings, Home, List, Star, Music, Film, Clock,
  Plus, Heart, ChevronRight, ChevronLeft, X, Check,
  Shield, Crown, Bell, Palette, LogOut, Phone, QrCode,
  Maximize2, Subtitles, Repeat, Shuffle, MoreVertical,
  Download, Trash2, Edit3, ArrowLeft, User, Zap
} from 'lucide-react';
import { mockChats, mockMedia, mockPlaylists, getMediaColor, type MediaItem, type Playlist } from './data';

// ==================== TYPES ====================
type Screen = 'auth' | 'home' | 'player' | 'playlists' | 'settings' | 'paywall' | 'search';
type SidebarItem = 'home' | 'channels' | 'saved' | 'playlists' | 'continue' | 'settings';

// ==================== MAIN APP ====================
export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [trialDays, setTrialDays] = useState(7);
  const [activeSidebar, setActiveSidebar] = useState<SidebarItem>('home');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'audio'>('all');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  // Notification helper
  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  }, []);

  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying || !currentMedia) return;
    const interval = setInterval(() => {
      setPlayProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + (100 / currentMedia.durationSec) * 2;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, currentMedia]);

  // Auth handler
  const handleAuth = () => {
    setIsAuthenticated(true);
    setScreen('home');
    showNotification('Welcome to TeleTV Player!');
  };

  // Play media
  const handlePlay = (media: MediaItem) => {
    setCurrentMedia(media);
    setPlayProgress(media.progress || 0);
    setIsPlaying(true);
    setScreen('player');
  };

  // Create playlist
  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist: Playlist = {
      id: `p${Date.now()}`,
      name: newPlaylistName,
      items: [],
      createdAt: new Date().toISOString().split('T')[0],
      isFavorite: false,
    };
    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setShowCreatePlaylist(false);
    showNotification('Playlist created!');
  };

  // Add to playlist
  const handleAddToPlaylist = (playlistId: string, mediaId: string) => {
    setPlaylists(playlists.map(p =>
      p.id === playlistId ? { ...p, items: [...p.items, mediaId] } : p
    ));
    showNotification('Added to playlist!');
  };

  // Toggle favorite playlist
  const toggleFavorite = (playlistId: string) => {
    setPlaylists(playlists.map(p =>
      p.id === playlistId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  // Delete playlist
  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
    showNotification('Playlist deleted');
  };

  // Filtered media
  const filteredMedia = mockMedia.filter(m => {
    const matchesChat = !selectedChat || m.chatId === selectedChat;
    const matchesFilter = mediaFilter === 'all' || m.type === mediaFilter;
    const matchesSearch = !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChat && matchesFilter && matchesSearch;
  });

  const continueWatching = mockMedia.filter(m => m.progress && m.progress > 0 && m.progress < 95);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen === 'auth') return;
      
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => prev + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          // Handled by focused elements
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          if (screen === 'player') {
            setScreen('home');
            setIsPlaying(false);
          } else if (screen === 'search') {
            setScreen('home');
            setSearchQuery('');
          } else if (selectedChat) {
            setSelectedChat(null);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, selectedChat]);

  // ==================== RENDER ====================
  if (screen === 'auth') {
    return <AuthScreen onAuth={handleAuth} />;
  }

  if (screen === 'player' && currentMedia) {
    return (
      <PlayerScreen
        media={currentMedia}
        isPlaying={isPlaying}
        progress={playProgress}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onSeek={(p) => setPlayProgress(p)}
        onBack={() => { setScreen('home'); setIsPlaying(false); }}
        onNext={() => {
          const idx = filteredMedia.findIndex(m => m.id === currentMedia.id);
          const next = filteredMedia[(idx + 1) % filteredMedia.length];
          if (next) handlePlay(next);
        }}
        onPrev={() => {
          const idx = filteredMedia.findIndex(m => m.id === currentMedia.id);
          const prev = filteredMedia[(idx - 1 + filteredMedia.length) % filteredMedia.length];
          if (prev) handlePlay(prev);
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex relative">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeSidebar}
        onSelect={(item) => {
          setActiveSidebar(item);
          setSelectedChat(null);
          if (item === 'playlists') setScreen('playlists');
          else if (item === 'settings') setScreen('settings');
          else setScreen('home');
        }}
        isPro={isPro}
        trialDays={trialDays}
      />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden">
        {screen === 'home' && (
          <HomeScreen
            chats={mockChats}
            media={filteredMedia}
            continueWatching={continueWatching}
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
            onPlayMedia={handlePlay}
            mediaFilter={mediaFilter}
            onFilterChange={setMediaFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenSearch={() => setScreen('search')}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
            isPro={isPro}
          />
        )}
        {screen === 'search' && (
          <SearchScreen
            query={searchQuery}
            onQueryChange={setSearchQuery}
            media={mockMedia.filter(m => !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()))}
            onPlayMedia={handlePlay}
            onBack={() => { setScreen('home'); setSearchQuery(''); }}
          />
        )}
        {screen === 'playlists' && (
          <PlaylistsScreen
            playlists={playlists}
            media={mockMedia}
            onToggleFavorite={toggleFavorite}
            onDelete={deletePlaylist}
            onPlayMedia={handlePlay}
            onCreateNew={() => setShowCreatePlaylist(true)}
            showCreate={showCreatePlaylist}
            newName={newPlaylistName}
            onNewNameChange={setNewPlaylistName}
            onCreate={handleCreatePlaylist}
            onCancelCreate={() => setShowCreatePlaylist(false)}
            isPro={isPro}
            onShowPaywall={() => setScreen('paywall')}
          />
        )}
        {screen === 'settings' && (
          <SettingsScreen
            isPro={isPro}
            onTogglePro={() => { setIsPro(!isPro); showNotification(isPro ? 'Pro disabled' : 'Pro activated!'); }}
            onShowPaywall={() => setScreen('paywall')}
            onLogout={() => { setIsAuthenticated(false); setScreen('auth'); }}
          />
        )}
        {screen === 'paywall' && (
          <PaywallScreen
            onPurchase={() => { setIsPro(true); setScreen('settings'); showNotification('Welcome to Pro! 🎉'); }}
            onBack={() => setScreen('settings')}
          />
        )}
      </main>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
          <div className="px-6 py-3 rounded-2xl bg-[#2AABEE] text-white font-medium shadow-2xl flex items-center gap-3">
            <Check size={18} />
            {notification}
          </div>
        </div>
      )}

      {/* D-pad hint */}
      <div className="fixed bottom-4 right-4 z-40 text-xs text-[var(--tv-muted)] bg-[var(--tv-surface)] px-3 py-2 rounded-lg border border-[var(--tv-border)]">
        ← → ↑ ↓ Navigate • Enter Select • Esc Back
      </div>
    </div>
  );
}

// ==================== AUTH SCREEN ====================
function AuthScreen({ onAuth }: { onAuth: () => void }) {
  const [method, setMethod] = useState<'qr' | 'phone'>('qr');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'input' | 'code'>('input');

  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--tv-bg)] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2AABEE] rounded-full opacity-5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6C5CE7] rounded-full opacity-5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full mx-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#2AABEE] to-[#6C5CE7] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#2AABEE]/20">
            <Tv size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">TeleTV Player</span>
          </h1>
          <p className="text-[var(--tv-muted)] text-lg">Sign in with your Telegram account</p>
        </div>

        {/* Method Toggle */}
        <div className="flex gap-2 mb-8 bg-[var(--tv-surface)] rounded-2xl p-2">
          <button
            onClick={() => { setMethod('qr'); setStep('input'); }}
            className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              method === 'qr' ? 'bg-[#2AABEE]/20 text-[#2AABEE]' : 'text-[var(--tv-muted)] hover:text-white'
            }`}
          >
            <QrCode size={18} /> QR Code
          </button>
          <button
            onClick={() => { setMethod('phone'); setStep('input'); }}
            className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              method === 'phone' ? 'bg-[#2AABEE]/20 text-[#2AABEE]' : 'text-[var(--tv-muted)] hover:text-white'
            }`}
          >
            <Phone size={18} /> Phone Number
          </button>
        </div>

        {/* QR Method */}
        {method === 'qr' && (
          <div className="text-center">
            <div className="w-64 h-64 mx-auto bg-white rounded-3xl p-4 mb-6 flex items-center justify-center">
              {/* Simulated QR code */}
              <div className="grid grid-cols-8 gap-1 w-48 h-48">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      [0,1,2,4,5,6,8,10,12,14,16,18,20,22,24,25,26,28,30,32,33,34,36,38,40,42,44,46,48,49,50,52,54,56,57,58,60,61,62].includes(i)
                        ? 'bg-black' : 'bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[var(--tv-muted)] mb-2">Scan with Telegram app on your phone</p>
            <p className="text-sm text-[var(--tv-muted)]">Settings → Devices → Link Desktop</p>
            <button
              onClick={onAuth}
              className="mt-6 tv-button tv-button-primary"
            >
              <Check size={18} /> Simulate Login
            </button>
          </div>
        )}

        {/* Phone Method */}
        {method === 'phone' && (
          <div>
            {step === 'input' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[var(--tv-muted)] mb-2 block">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (234) 567-8900"
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--tv-surface)] border border-[var(--tv-border)] text-white text-lg focus:border-[#2AABEE] focus:outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={() => setStep('code')}
                  className="w-full tv-button tv-button-primary justify-center"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[var(--tv-muted)] text-center mb-4">
                  Code sent to {phone || '+1 (234) 567-8900'}
                </p>
                <div>
                  <label className="text-sm text-[var(--tv-muted)] mb-2 block">Verification Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="12345"
                    maxLength={5}
                    className="w-full px-5 py-4 rounded-2xl bg-[var(--tv-surface)] border border-[var(--tv-border)] text-white text-2xl text-center tracking-[1em] focus:border-[#2AABEE] focus:outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={onAuth}
                  className="w-full tv-button tv-button-primary justify-center"
                >
                  <Shield size={18} /> Verify & Sign In
                </button>
                <button
                  onClick={() => setStep('input')}
                  className="w-full tv-button tv-button-secondary justify-center"
                >
                  <ChevronLeft size={18} /> Back
                </button>
              </div>
            )}
          </div>
        )}

        {/* Trial Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--tv-surface)] border border-[var(--tv-border)]">
            <Zap size={14} className="text-[#2AABEE]" />
            <span className="text-sm text-[var(--tv-muted)]">7-day free trial of Pro features</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SIDEBAR ====================
function Sidebar({ activeItem, onSelect, isPro, trialDays }: {
  activeItem: SidebarItem;
  onSelect: (item: SidebarItem) => void;
  isPro: boolean;
  trialDays: number;
}) {
  const items: { id: SidebarItem; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <Home size={22} />, label: 'Home' },
    { id: 'channels', icon: <Film size={22} />, label: 'Channels' },
    { id: 'saved', icon: <Star size={22} />, label: 'Saved' },
    { id: 'continue', icon: <Clock size={22} />, label: 'Continue' },
    { id: 'playlists', icon: <List size={22} />, label: 'Playlists' },
    { id: 'settings', icon: <Settings size={22} />, label: 'Settings' },
  ];

  return (
    <aside className="w-72 h-full bg-[var(--tv-surface)] border-r border-[var(--tv-border)] flex flex-col p-5">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2AABEE] to-[#6C5CE7] flex items-center justify-center">
          <Tv size={24} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-lg">TeleTV</div>
          <div className="text-xs text-[var(--tv-muted)]">Player v1.1</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`tv-sidebar-item w-full tv-focusable ${activeItem === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.id === 'playlists' && !isPro && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#6C5CE7]/20 text-[#6C5CE7]">PRO</span>
            )}
          </button>
        ))}
      </nav>

      {/* Trial / Pro Status */}
      <div className="mt-auto">
        {!isPro ? (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2AABEE]/10 to-[#6C5CE7]/10 border border-[#2AABEE]/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} className="text-[#2AABEE]" />
              <span className="text-sm font-medium">Free Trial</span>
            </div>
            <div className="text-xs text-[var(--tv-muted)]">{trialDays} days remaining</div>
            <div className="mt-2 h-1.5 rounded-full bg-[var(--tv-surface)] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#2AABEE] to-[#6C5CE7]" style={{ width: `${(trialDays / 7) * 100}%` }} />
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2AABEE]/10 to-[#6C5CE7]/10 border border-[#2AABEE]/20">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-[#FFD700]" />
              <span className="text-sm font-bold gradient-text">PRO Active</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ==================== HOME SCREEN ====================
function HomeScreen({ chats, media, continueWatching, selectedChat, onSelectChat, onPlayMedia, mediaFilter, onFilterChange, searchQuery, onSearchChange, onOpenSearch, playlists, onAddToPlaylist, isPro }: {
  chats: typeof mockChats;
  media: MediaItem[];
  continueWatching: MediaItem[];
  selectedChat: string | null;
  onSelectChat: (id: string | null) => void;
  onPlayMedia: (m: MediaItem) => void;
  mediaFilter: 'all' | 'video' | 'audio';
  onFilterChange: (f: 'all' | 'video' | 'audio') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSearch: () => void;
  playlists: Playlist[];
  onAddToPlaylist: (pid: string, mid: string) => void;
  isPro: boolean;
}) {
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);

  if (selectedChat) {
    const chat = chats.find(c => c.id === selectedChat);
    return (
      <div className="h-full flex flex-col animate-slide-in">
        {/* Chat Header */}
        <div className="p-8 pb-4 flex items-center gap-4">
          <button onClick={() => onSelectChat(null)} className="tv-button tv-button-secondary !p-3">
            <ArrowLeft size={20} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-[var(--tv-surface-2)] flex items-center justify-center text-3xl">
            {chat?.avatar}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{chat?.name}</h2>
            <p className="text-[var(--tv-muted)]">{chat?.mediaCount} media files</p>
          </div>
        </div>

        {/* Filter */}
        <div className="px-8 pb-4 flex gap-2">
          {(['all', 'video', 'audio'] as const).map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mediaFilter === f
                  ? 'bg-[#2AABEE]/20 text-[#2AABEE] border border-[#2AABEE]/30'
                  : 'bg-[var(--tv-surface)] text-[var(--tv-muted)] border border-[var(--tv-border)] hover:text-white'
              }`}
            >
              {f === 'all' ? '📁 All' : f === 'video' ? '🎬 Videos' : '🎵 Audio'}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-8 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {media.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onPlay={() => onPlayMedia(item)}
                onMore={() => setShowPlaylistMenu(showPlaylistMenu === item.id ? null : item.id)}
                showMenu={showPlaylistMenu === item.id}
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
                onCloseMenu={() => setShowPlaylistMenu(null)}
                isPro={isPro}
              />
            ))}
          </div>
          {media.length === 0 && (
            <div className="text-center py-20 text-[var(--tv-muted)]">
              <Film size={48} className="mx-auto mb-4 opacity-50" />
              <p>No media found in this chat</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--tv-bg)]/90 backdrop-blur-xl p-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {continueWatching.length > 0 ? 'Welcome back 👋' : 'TeleTV Player'}
          </h1>
          <button
            onClick={onOpenSearch}
            className="tv-button tv-button-secondary"
          >
            <Search size={18} /> Search
          </button>
        </div>

        {/* Quick Search */}
        {searchQuery && (
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search media..."
              className="w-full px-5 py-3 rounded-2xl bg-[var(--tv-surface)] border border-[var(--tv-border)] text-white focus:border-[#2AABEE] focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--tv-muted)]">
                <X size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-8 pb-8 space-y-8">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-[#2AABEE]" /> Continue Watching
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {continueWatching.map(item => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onPlay={() => onPlayMedia(item)}
                  onMore={() => {}}
                  showMenu={false}
                  playlists={[]}
                  onAddToPlaylist={() => {}}
                  onCloseMenu={() => {}}
                  isPro={isPro}
                />
              ))}
            </div>
          </section>
        )}

        {/* Chats/Channels */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Film size={20} className="text-[#6C5CE7]" /> Your Channels & Chats
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="tv-card tv-focusable p-5 text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--tv-surface-2)] flex items-center justify-center text-3xl mb-3">
                  {chat.avatar}
                </div>
                <div className="font-medium text-sm truncate">{chat.name}</div>
                <div className="text-xs text-[var(--tv-muted)] mt-1">{chat.mediaCount} files</div>
                <div className="text-xs text-[var(--tv-muted)] mt-0.5">{chat.lastActivity}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Media */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star size={20} className="text-[#FFD700]" /> Recent Media
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockMedia.slice(0, 8).map(item => (
              <MediaCard
                key={item.id}
                item={item}
                onPlay={() => onPlayMedia(item)}
                onMore={() => setShowPlaylistMenu(showPlaylistMenu === item.id ? null : item.id)}
                showMenu={showPlaylistMenu === item.id}
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
                onCloseMenu={() => setShowPlaylistMenu(null)}
                isPro={isPro}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ==================== MEDIA CARD ====================
function MediaCard({ item, onPlay, onMore, showMenu, playlists, onAddToPlaylist, onCloseMenu, isPro }: {
  item: MediaItem;
  onPlay: () => void;
  onMore: () => void;
  showMenu: boolean;
  playlists: Playlist[];
  onAddToPlaylist: (pid: string, mid: string) => void;
  onCloseMenu: () => void;
  isPro: boolean;
}) {
  return (
    <div className="tv-card tv-focusable overflow-hidden group relative">
      {/* Thumbnail */}
      <div
        className={`relative aspect-video bg-gradient-to-br ${getMediaColor(item.id)} flex items-center justify-center cursor-pointer`}
        onClick={onPlay}
      >
        {item.type === 'video' ? (
          <Film size={32} className="text-white/80" />
        ) : (
          <div className="relative">
            <Music size={32} className="text-white/80" />
            <div className="absolute inset-0 animate-spin-slow">
              <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white/80" />
            </div>
          </div>
        )}
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-xs text-white font-mono">
          {item.duration}
        </div>
        {/* Type badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 text-xs text-white/80 uppercase">
          {item.format}
        </div>
        {/* Progress bar */}
        {item.progress && item.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div className="h-full bg-[#2AABEE]" style={{ width: `${item.progress}%` }} />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-14 h-14 rounded-full bg-[#2AABEE]/90 flex items-center justify-center">
            <Play size={24} className="text-white ml-1" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-medium text-sm truncate mb-1">{item.title}</div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-[var(--tv-muted)] truncate">{item.chatName}</div>
          <div className="text-xs text-[var(--tv-muted)]">{item.size}</div>
        </div>
      </div>

      {/* More button */}
      <button
        onClick={(e) => { e.stopPropagation(); onMore(); }}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
      >
        <MoreVertical size={14} className="text-white" />
      </button>

      {/* Playlist menu */}
      {showMenu && isPro && (
        <div className="absolute top-10 right-2 z-30 w-56 bg-[var(--tv-surface-2)] border border-[var(--tv-border)] rounded-xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="p-2 border-b border-[var(--tv-border)]">
            <div className="text-xs text-[var(--tv-muted)] px-2 py-1">Add to playlist</div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {playlists.map(p => (
              <button
                key={p.id}
                onClick={() => { onAddToPlaylist(p.id, item.id); onCloseMenu(); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--tv-surface)] transition-colors flex items-center gap-2"
              >
                <List size={14} className="text-[var(--tv-muted)]" />
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {showMenu && !isPro && (
        <div className="absolute top-10 right-2 z-30 w-56 bg-[var(--tv-surface-2)] border border-[var(--tv-border)] rounded-xl shadow-2xl p-4 animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={16} className="text-[#6C5CE7]" />
            <span className="text-sm font-medium">Pro Feature</span>
          </div>
          <p className="text-xs text-[var(--tv-muted)]">Add to playlists with Pro</p>
        </div>
      )}
    </div>
  );
}

// ==================== PLAYER SCREEN ====================
function PlayerScreen({ media, isPlaying, progress, onTogglePlay, onSeek, onBack, onNext, onPrev }: {
  media: MediaItem;
  isPlaying: boolean;
  progress: number;
  onTogglePlay: () => void;
  onSeek: (p: number) => void;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowControls(false), 4000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const currentTime = Math.floor((progress / 100) * media.durationSec);

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      {/* Video/Audio Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getMediaColor(media.id)} opacity-20`} />
      
      {media.type === 'audio' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className={`w-64 h-64 rounded-full bg-gradient-to-br ${getMediaColor(media.id)} opacity-60 ${isPlaying ? 'animate-spin-slow' : ''}`} />
            <div className="absolute inset-4 rounded-full bg-[var(--tv-bg)] flex items-center justify-center">
              <Music size={64} className="text-white/60" />
            </div>
          </div>
        </div>
      )}

      {media.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-full h-full bg-gradient-to-br ${getMediaColor(media.id)} opacity-30 flex items-center justify-center`}>
            <Film size={120} className="text-white/10" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={24} />
              <div>
                <div className="font-medium truncate max-w-md">{media.title}</div>
                <div className="text-sm text-white/60">{media.chatName}</div>
              </div>
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`p-2 rounded-lg transition-colors ${showSubtitles ? 'bg-[#2AABEE]/30 text-[#2AABEE]' : 'text-white/60 hover:text-white'}`}
              >
                <Subtitles size={22} />
              </button>
              <button className="p-2 rounded-lg text-white/60 hover:text-white transition-colors">
                <Maximize2 size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Center controls */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-8">
            <button onClick={onPrev} className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <SkipBack size={24} className="text-white" />
            </button>
            <button
              onClick={onTogglePlay}
              className="w-20 h-20 rounded-full bg-[#2AABEE] hover:bg-[#2AABEE]/80 flex items-center justify-center transition-all hover:scale-110 shadow-2xl shadow-[#2AABEE]/30"
            >
              {isPlaying ? <Pause size={32} className="text-white" /> : <Play size={32} className="text-white ml-1" />}
            </button>
            <button onClick={onNext} className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <SkipForward size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          {/* Progress bar */}
          <div className="mb-4">
            <div
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const p = ((e.clientX - rect.left) / rect.width) * 100;
                onSeek(Math.max(0, Math.min(100, p)));
              }}
            >
              <div className="h-full bg-[#2AABEE] rounded-full relative transition-all" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>{media.duration}</span>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors">
                {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                className="w-24 accent-[#2AABEE]"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60">{media.format} • {media.size}</span>
              <button className="text-white/60 hover:text-white transition-colors">
                <Repeat size={20} />
              </button>
              <button className="text-white/60 hover:text-white transition-colors">
                <Shuffle size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtitles overlay */}
      {showSubtitles && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg bg-black/80 text-white text-lg text-center max-w-xl">
          [Sample subtitle text would appear here]
        </div>
      )}
    </div>
  );
}

// ==================== SEARCH SCREEN ====================
function SearchScreen({ query, onQueryChange, media, onPlayMedia, onBack }: {
  query: string;
  onQueryChange: (q: string) => void;
  media: MediaItem[];
  onPlayMedia: (m: MediaItem) => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="p-8 pb-4 flex items-center gap-4">
        <button onClick={onBack} className="tv-button tv-button-secondary !p-3">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--tv-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search videos, audio, channels..."
            className="w-full pl-12 pr-5 py-4 rounded-2xl bg-[var(--tv-surface)] border border-[var(--tv-border)] text-white text-lg focus:border-[#2AABEE] focus:outline-none"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-8 pb-8">
        {query ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {media.map(item => (
              <div key={item.id} onClick={() => onPlayMedia(item)} className="tv-card tv-focusable overflow-hidden cursor-pointer group">
                <div className={`relative aspect-video bg-gradient-to-br ${getMediaColor(item.id)} flex items-center justify-center`}>
                  {item.type === 'video' ? <Film size={32} className="text-white/80" /> : <Music size={32} className="text-white/80" />}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-xs text-white font-mono">{item.duration}</div>
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm truncate">{item.title}</div>
                  <div className="text-xs text-[var(--tv-muted)] mt-1">{item.chatName}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto mb-4 text-[var(--tv-muted)] opacity-50" />
            <p className="text-[var(--tv-muted)] text-lg">Start typing to search your media</p>
            <p className="text-[var(--tv-muted)] text-sm mt-2">Search by title, channel name, or format</p>
          </div>
        )}
        {query && media.length === 0 && (
          <div className="text-center py-20">
            <X size={48} className="mx-auto mb-4 text-[var(--tv-muted)] opacity-50" />
            <p className="text-[var(--tv-muted)] text-lg">No results for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PLAYLISTS SCREEN ====================
function PlaylistsScreen({ playlists, media, onToggleFavorite, onDelete, onPlayMedia, onCreateNew, showCreate, newName, onNewNameChange, onCreate, onCancelCreate, isPro, onShowPaywall }: {
  playlists: Playlist[];
  media: MediaItem[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onPlayMedia: (m: MediaItem) => void;
  onCreateNew: () => void;
  showCreate: boolean;
  newName: string;
  onNewNameChange: (n: string) => void;
  onCreate: () => void;
  onCancelCreate: () => void;
  isPro: boolean;
  onShowPaywall: () => void;
}) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  if (!isPro) {
    return (
      <div className="h-full flex items-center justify-center animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#6C5CE7]/20 to-[#2AABEE]/20 flex items-center justify-center mx-auto mb-6">
            <Crown size={40} className="text-[#6C5CE7]" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Playlists are a Pro feature</h2>
          <p className="text-[var(--tv-muted)] mb-6">Create unlimited playlists, mix video and audio, sort and organize your media.</p>
          <button onClick={onShowPaywall} className="tv-button tv-button-primary">
            <Crown size={18} /> Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  if (selectedPlaylist) {
    const playlist = playlists.find(p => p.id === selectedPlaylist);
    const playlistMedia = playlist ? media.filter(m => playlist.items.includes(m.id)) : [];

    return (
      <div className="h-full flex flex-col animate-slide-in">
        <div className="p-8 pb-4 flex items-center gap-4">
          <button onClick={() => setSelectedPlaylist(null)} className="tv-button tv-button-secondary !p-3">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{playlist?.name}</h2>
            <p className="text-[var(--tv-muted)]">{playlistMedia.length} items</p>
          </div>
          {playlistMedia.length > 0 && (
            <button
              onClick={() => onPlayMedia(playlistMedia[0])}
              className="ml-auto tv-button tv-button-primary"
            >
              <Play size={18} /> Play All
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-8 pb-8">
          {playlistMedia.length > 0 ? (
            <div className="space-y-2">
              {playlistMedia.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => onPlayMedia(item)}
                  className="tv-card tv-focusable p-4 flex items-center gap-4 cursor-pointer"
                >
                  <span className="text-[var(--tv-muted)] w-8 text-center">{idx + 1}</span>
                  <div className={`w-16 h-10 rounded-lg bg-gradient-to-br ${getMediaColor(item.id)} flex items-center justify-center flex-shrink-0`}>
                    {item.type === 'video' ? <Film size={16} className="text-white/80" /> : <Music size={16} className="text-white/80" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="text-sm text-[var(--tv-muted)]">{item.chatName}</div>
                  </div>
                  <div className="text-sm text-[var(--tv-muted)]">{item.duration}</div>
                  <div className="text-xs text-[var(--tv-muted)] px-2 py-1 rounded bg-[var(--tv-surface-2)]">{item.format}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-[var(--tv-muted)]">
              <List size={48} className="mx-auto mb-4 opacity-50" />
              <p>This playlist is empty</p>
              <p className="text-sm mt-2">Add media from the home screen</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="p-8 pb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <List size={28} className="text-[#6C5CE7]" /> Playlists
        </h1>
        <button onClick={onCreateNew} className="tv-button tv-button-primary">
          <Plus size={18} /> New Playlist
        </button>
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="px-8 pb-4 animate-scale-in">
          <div className="tv-card p-6 flex items-center gap-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => onNewNameChange(e.target.value)}
              placeholder="Playlist name..."
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--tv-surface-2)] border border-[var(--tv-border)] text-white focus:border-[#2AABEE] focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && onCreate()}
            />
            <button onClick={onCreate} className="tv-button tv-button-primary !py-3">
              <Check size={18} /> Create
            </button>
            <button onClick={onCancelCreate} className="tv-button tv-button-secondary !py-3">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide px-8 pb-8">
        {/* Favorites first */}
        {playlists.filter(p => p.isFavorite).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[var(--tv-muted)] mb-3 uppercase tracking-wider">⭐ Favorites</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {playlists.filter(p => p.isFavorite).map(playlist => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  media={media}
                  onClick={() => setSelectedPlaylist(playlist.id)}
                  onToggleFavorite={() => onToggleFavorite(playlist.id)}
                  onDelete={() => onDelete(playlist.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All playlists */}
        <div>
          <h3 className="text-sm font-medium text-[var(--tv-muted)] mb-3 uppercase tracking-wider">All Playlists</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {playlists.filter(p => !p.isFavorite).map(playlist => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                media={media}
                onClick={() => setSelectedPlaylist(playlist.id)}
                onToggleFavorite={() => onToggleFavorite(playlist.id)}
                onDelete={() => onDelete(playlist.id)}
              />
            ))}
          </div>
        </div>

        {playlists.length === 0 && (
          <div className="text-center py-20 text-[var(--tv-muted)]">
            <List size={48} className="mx-auto mb-4 opacity-50" />
            <p>No playlists yet</p>
            <p className="text-sm mt-2">Create your first playlist to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaylistCard({ playlist, media, onClick, onToggleFavorite, onDelete }: {
  playlist: Playlist;
  media: MediaItem[];
  onClick: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const playlistMedia = media.filter(m => playlist.items.includes(m.id));
  const colors = playlist.items.slice(0, 4).map(id => getMediaColor(id));

  return (
    <div className="tv-card tv-focusable overflow-hidden group">
      <div className="aspect-video grid grid-cols-2 gap-0.5 cursor-pointer" onClick={onClick}>
        {colors.length > 0 ? (
          colors.concat(colors).slice(0, 4).map((color, i) => (
            <div key={i} className={`bg-gradient-to-br ${color} flex items-center justify-center`}>
              {i === 0 && <Film size={16} className="text-white/60" />}
              {i === 1 && <Music size={16} className="text-white/60" />}
            </div>
          ))
        ) : (
          <div className="col-span-2 row-span-2 bg-[var(--tv-surface-2)] flex items-center justify-center">
            <List size={32} className="text-[var(--tv-muted)] opacity-50" />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm truncate">{playlist.name}</div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className="p-1 hover:text-[#FFD700] transition-colors">
              <Heart size={14} className={playlist.isFavorite ? 'fill-[#FFD700] text-[#FFD700]' : ''} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="text-xs text-[var(--tv-muted)] mt-1">{playlistMedia.length} items • {playlist.createdAt}</div>
      </div>
    </div>
  );
}

// ==================== SETTINGS SCREEN ====================
function SettingsScreen({ isPro, onTogglePro, onShowPaywall, onLogout }: {
  isPro: boolean;
  onTogglePro: () => void;
  onShowPaywall: () => void;
  onLogout: () => void;
}) {
  const [theme, setTheme] = useState<'dark' | 'auto'>('dark');

  return (
    <div className="h-full overflow-y-auto scrollbar-hide animate-fade-in">
      <div className="p-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Settings size={28} className="text-[var(--tv-muted)]" /> Settings
        </h1>

        {/* Account */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[var(--tv-muted)]">Account</h2>
          <div className="tv-card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2AABEE] to-[#6C5CE7] flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Telegram User</div>
              <div className="text-sm text-[var(--tv-muted)]">@teletv_user</div>
            </div>
            <button onClick={onLogout} className="tv-button tv-button-secondary !py-2 !px-4 text-red-400">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </section>

        {/* Subscription */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[var(--tv-muted)]">Subscription</h2>
          <div className={`tv-card p-5 ${isPro ? 'border-[#2AABEE]/30' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown size={24} className={isPro ? 'text-[#FFD700]' : 'text-[var(--tv-muted)]'} />
                <div>
                  <div className="font-medium">{isPro ? 'Pro Active' : 'Free Plan'}</div>
                  <div className="text-sm text-[var(--tv-muted)]">
                    {isPro ? 'All features unlocked' : 'Basic features • 7-day trial'}
                  </div>
                </div>
              </div>
              {!isPro && (
                <button onClick={onShowPaywall} className="tv-button tv-button-primary !py-2">
                  <Crown size={16} /> Upgrade
                </button>
              )}
            </div>
            {isPro && (
              <div className="flex gap-3">
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check size={16} /> Playlists
                </div>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check size={16} /> Background Play
                </div>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check size={16} /> Themes
                </div>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <Check size={16} /> No Ads
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Appearance */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[var(--tv-muted)]">Appearance</h2>
          <div className="tv-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Palette size={20} className="text-[var(--tv-muted)]" />
                <span>Theme</span>
              </div>
              <div className="flex gap-2">
                {(['dark', 'auto'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      theme === t
                        ? 'bg-[#2AABEE]/20 text-[#2AABEE] border border-[#2AABEE]/30'
                        : 'bg-[var(--tv-surface-2)] text-[var(--tv-muted)] border border-[var(--tv-border)]'
                    }`}
                  >
                    {t === 'dark' ? '🌙 Dark' : '⚙️ System'}
                  </button>
                ))}
              </div>
            </div>
            {!isPro && (
              <div className="text-sm text-[var(--tv-muted)] flex items-center gap-2 mt-2 pt-3 border-t border-[var(--tv-border)]">
                <Crown size={14} className="text-[#6C5CE7]" />
                Custom accent colors available in Pro
              </div>
            )}
          </div>
        </section>

        {/* Player */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[var(--tv-muted)]">Player</h2>
          <div className="tv-card divide-y divide-[var(--tv-border)]">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Maximize2 size={20} className="text-[var(--tv-muted)]" />
                <span>Hardware Acceleration</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">Enabled</div>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Subtitles size={20} className="text-[var(--tv-muted)]" />
                <span>Subtitles</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-[var(--tv-surface-2)] text-[var(--tv-muted)] text-sm">SRT, ASS, Embedded</div>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-[var(--tv-muted)]" />
                <span>Background Audio</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${isPro ? 'bg-green-500/20 text-green-400' : 'bg-[var(--tv-surface-2)] text-[var(--tv-muted)]'}`}>
                {isPro ? 'Enabled' : 'Pro only'}
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-[var(--tv-muted)]">About</h2>
          <div className="tv-card p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--tv-muted)]">Version</span>
              <span>1.1.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--tv-muted)]">Build</span>
              <span className="font-mono">2026.09.17</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--tv-muted)]">TDLib Version</span>
              <span>1.8.32</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--tv-muted)]">License</span>
              <span>GPL-3.0</span>
            </div>
          </div>
        </section>

        {/* Debug: Toggle Pro */}
        <section>
          <button onClick={onTogglePro} className="tv-button tv-button-secondary w-full justify-center opacity-50 hover:opacity-100">
            [Dev] Toggle Pro Status
          </button>
        </section>
      </div>
    </div>
  );
}

// ==================== PAYWALL SCREEN ====================
function PaywallScreen({ onPurchase, onBack }: { onPurchase: () => void; onBack: () => void }) {
  return (
    <div className="h-full overflow-y-auto scrollbar-hide animate-fade-in">
      <div className="p-8 max-w-4xl mx-auto">
        <button onClick={onBack} className="tv-button tv-button-secondary mb-8">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#2AABEE] to-[#6C5CE7] flex items-center justify-center mx-auto mb-6">
            <Crown size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Upgrade to <span className="gradient-text">Pro</span></h1>
          <p className="text-xl text-[var(--tv-muted)]">Unlock the full power of TeleTV Player</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {[
            { icon: <List size={24} />, title: 'Unlimited Playlists', desc: 'Create and manage playlists with video & audio' },
            { icon: <Music size={24} />, title: 'Background Playback', desc: 'Audio keeps playing when you navigate away' },
            { icon: <Clock size={24} />, title: 'Watch Progress', desc: 'Resume where you left off on any device' },
            { icon: <Palette size={24} />, title: 'Custom Themes', desc: 'Personalize colors and appearance' },
            { icon: <Shield size={24} />, title: 'No Ads', desc: 'Clean, uninterrupted experience' },
            { icon: <Zap size={24} />, title: 'Early Access', desc: 'Get new features before anyone else' },
          ].map(f => (
            <div key={f.title} className="tv-card p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#2AABEE]/10 flex items-center justify-center text-[#2AABEE] flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="font-semibold mb-1">{f.title}</div>
                <div className="text-sm text-[var(--tv-muted)]">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="tv-card p-8 text-center border-2 border-[#2AABEE]/30 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#2AABEE] text-white text-xs font-bold">
              BEST VALUE
            </div>
            <h3 className="text-xl font-bold mb-2">Lifetime</h3>
            <div className="text-4xl font-bold mb-1">$6.99</div>
            <div className="text-[var(--tv-muted)] mb-6">one-time payment</div>
            <button onClick={onPurchase} className="w-full tv-button tv-button-primary justify-center">
              <Crown size={18} /> Buy Now
            </button>
          </div>
          <div className="tv-card p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Subscription</h3>
            <div className="text-4xl font-bold mb-1">$1.99<span className="text-lg text-[var(--tv-muted)]">/mo</span></div>
            <div className="text-[var(--tv-muted)] mb-2">or $19.99/year (save 17%)</div>
            <div className="text-[var(--tv-muted)] text-sm mb-6">Cancel anytime</div>
            <button onClick={onPurchase} className="w-full tv-button tv-button-secondary justify-center">
              Subscribe
            </button>
          </div>
        </div>

        {/* Trust */}
        <div className="text-center text-sm text-[var(--tv-muted)] space-y-2">
          <p>✓ 7-day free trial • Cancel anytime • Restore purchases</p>
          <p>Payment via Google Play Billing or PayPal</p>
        </div>
      </div>
    </div>
  );
}

// ==================== HELPERS ====================
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
