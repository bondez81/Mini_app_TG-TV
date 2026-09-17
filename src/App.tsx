import { useState, useEffect } from 'react';

// ==================== ICONS ====================
const TvIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

const RemoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="7" y="2" width="10" height="20" rx="3" />
    <circle cx="12" cy="7" r="2" />
    <path d="M10 12h4M10 15h4" />
  </svg>
);

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

// ==================== NAVBAR ====================
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-card py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0088cc] to-[#7c4dff] flex items-center justify-center">
            <TvIcon />
          </div>
          <span className="text-xl font-bold">TeleTV <span className="text-[#0088cc]">Player</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
          <a href="#tech" className="text-sm text-gray-300 hover:text-white transition-colors">Tech Stack</a>
          <a href="#roadmap" className="text-sm text-gray-300 hover:text-white transition-colors">Roadmap</a>
          <a href="#devices" className="text-sm text-gray-300 hover:text-white transition-colors">Devices</a>
        </div>
        <a href="#download" className="px-5 py-2 rounded-full bg-gradient-to-r from-[#0088cc] to-[#7c4dff] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          Download APK
        </a>
      </div>
    </nav>
  );
}

// ==================== HERO ====================
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0088cc] rounded-full opacity-5 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#7c4dff] rounded-full opacity-5 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00c9a7] rounded-full opacity-3 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-20">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-gray-300">Version 1.1 • September 2026</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="gradient-text">TeleTV Player</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-4 animate-slide-up max-w-3xl mx-auto" style={{ animationDelay: '0.2s' }}>
          Watch Telegram videos & listen to music on your Android TV
        </p>

        <p className="text-lg text-gray-400 mb-12 animate-slide-up max-w-2xl mx-auto" style={{ animationDelay: '0.3s' }}>
          Native Android TV app with D-pad navigation, playlists, hardware-accelerated playback, 
          and 7-day free trial. No servers needed — direct Telegram client.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <a href="#download" className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#7c4dff] text-white font-semibold text-lg hover:scale-105 transition-transform glow-primary flex items-center gap-3">
            <PlayIcon />
            Get Started Free
          </a>
          <a href="#features" className="px-8 py-4 rounded-2xl glass-card text-white font-semibold text-lg hover:bg-white/10 transition-colors flex items-center gap-3">
            <ListIcon />
            View Features
          </a>
        </div>

        {/* TV Mockup Image */}
        <div className="mt-16 animate-fade-in relative" style={{ animationDelay: '0.5s' }}>
          <div className="relative rounded-2xl overflow-hidden glow-primary max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-transparent to-transparent z-10" />
            <img 
              src="https://image.qwenlm.ai/generated-images/7120ab3b-32a6-4c82-9671-80a2a4b51cef/_result.png" 
              alt="TeleTV Player Interface" 
              className="w-full rounded-2xl border border-white/10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {[
            { value: '10+', label: 'Video Formats' },
            { value: '6+', label: 'Audio Formats' },
            { value: '4K', label: 'Resolution' },
            { value: '7', label: 'Days Free Trial' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-6">
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== FEATURES ====================
function Features() {
  const features = [
    {
      icon: <TelegramIcon />,
      title: 'Telegram Integration',
      description: 'Login via QR code or phone number. Access all your chats, channels, and saved messages with media.',
      color: 'from-[#0088cc] to-[#00c9a7]',
    },
    {
      icon: <PlayIcon />,
      title: 'Universal Player',
      description: 'Hardware-accelerated playback with ExoPlayer. Supports MKV, MP4, AVI, TS, MOV, FLV, 3GP and more.',
      color: 'from-[#7c4dff] to-[#0088cc]',
    },
    {
      icon: <MusicIcon />,
      title: 'Music & Audio',
      description: 'Full audio support: MP3, FLAC, M4A, AAC, OGG. Background playback with notification controls.',
      color: 'from-[#00c9a7] to-[#7c4dff]',
    },
    {
      icon: <ListIcon />,
      title: 'Playlists',
      description: 'Create, edit, and manage playlists. Mix video and audio. Sort by name, date, or manually.',
      color: 'from-[#0088cc] to-[#7c4dff]',
    },
    {
      icon: <RemoteIcon />,
      title: 'D-pad Navigation',
      description: 'Full remote control support. Leanback UI designed for TV. Navigate everything with your remote.',
      color: 'from-[#7c4dff] to-[#00c9a7]',
    },
    {
      icon: <ShieldIcon />,
      title: 'Privacy First',
      description: 'All data stored locally. No servers, no trackers. Encrypted tokens with Android Keystore.',
      color: 'from-[#00c9a7] to-[#0088cc]',
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need for <span className="gradient-text">TV media</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A complete solution for watching Telegram media on your big screen
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card rounded-3xl p-8 hover:scale-[1.02] transition-transform duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== PRICING ====================
function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Basic features after 7-day trial',
      features: [
        { text: 'Watch Telegram videos', included: true },
        { text: 'Listen to audio', included: true },
        { text: 'Chat & channel browsing', included: true },
        { text: 'Saved Messages access', included: true },
        { text: 'D-pad navigation', included: true },
        { text: 'Subtitles support', included: true },
        { text: 'Playlists', included: false },
        { text: 'Background playback', included: false },
        { text: 'Watch progress sync', included: false },
        { text: 'Custom themes', included: false },
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$6.99',
      period: 'one-time',
      description: 'Full access, forever',
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Unlimited playlists', included: true },
        { text: 'Background playback', included: true },
        { text: 'Watch progress sync', included: true },
        { text: '"Continue Watching" section', included: true },
        { text: 'Custom themes & colors', included: true },
        { text: 'Priority support', included: true },
        { text: 'Early beta access', included: true },
        { text: 'No ads', included: true },
        { text: 'Cloud sync (future)', included: true },
      ],
      cta: 'Buy Pro — $6.99',
      highlighted: true,
    },
    {
      name: 'Subscription',
      price: '$1.99',
      period: '/month',
      description: 'Or $19.99/year (save 17%)',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Pay monthly or yearly', included: true },
        { text: 'Cancel anytime', included: true },
        { text: '3-day grace period', included: true },
        { text: 'Restore purchases', included: true },
        { text: 'All future features', included: true },
        { text: 'Cloud sync (future)', included: true },
        { text: 'Multi-device (future)', included: true },
        { text: 'Priority support', included: true },
        { text: 'Early beta access', included: true },
      ],
      cta: 'Subscribe',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 hero-gradient opacity-50" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">fair pricing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            7-day free trial for all features. Then choose what works for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 relative ${
                plan.highlighted
                  ? 'glass-card glow-primary border-2 border-[#0088cc]/30 scale-105'
                  : 'glass-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#0088cc] to-[#7c4dff] text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-gray-400 mt-2 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    <span className={feature.included ? 'text-green-400' : 'text-gray-600'}>
                      {feature.included ? <CheckIcon /> : <XIcon />}
                    </span>
                    <span className={feature.included ? 'text-gray-200' : 'text-gray-500'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-[#0088cc] to-[#7c4dff] text-white hover:opacity-90'
                    : 'glass-card text-white hover:bg-white/10'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== TECH STACK ====================
function TechStack() {
  const stack = [
    { name: 'Kotlin 2.0+', category: 'Language', icon: '🟣' },
    { name: 'Jetpack Compose for TV', category: 'UI Framework', icon: '🎨' },
    { name: 'ExoPlayer (Media3)', category: 'Video Player', icon: '▶️' },
    { name: 'TDLib', category: 'Telegram API', icon: '📨' },
    { name: 'Room Database', category: 'Local Storage', icon: '💾' },
    { name: 'Hilt DI', category: 'Dependency Injection', icon: '💉' },
    { name: 'EncryptedSharedPreferences', category: 'Security', icon: '🔐' },
    { name: 'Google Play Billing 6+', category: 'Monetization', icon: '💰' },
    { name: 'Coroutines + Flow', category: 'Async', icon: '⚡' },
    { name: 'MVVM + Clean Architecture', category: 'Architecture', icon: '🏗️' },
    { name: 'Gradle 8+', category: 'Build System', icon: '🔧' },
    { name: 'GitHub Actions', category: 'CI/CD', icon: '🚀' },
  ];

  const modules = [
    { name: ':app', description: 'Main application module' },
    { name: ':core:player', description: 'ExoPlayer wrapper & media handling' },
    { name: ':core:telegram', description: 'TDLib wrapper & Telegram integration' },
    { name: ':feature:playlists', description: 'Playlist creation & management' },
    { name: ':feature:billing', description: 'Subscription & purchase logic' },
  ];

  return (
    <section id="tech" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built with <span className="gradient-text">modern tech</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Clean architecture, modular design, and best Android practices
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Tech Stack Grid */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#0088cc]/20 flex items-center justify-center text-sm">📦</span>
              Technology Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stack.map((tech) => (
                <div key={tech.name} className="glass-card rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
                  <span className="text-xl">{tech.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{tech.name}</div>
                    <div className="text-xs text-gray-500">{tech.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Structure */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#7c4dff]/20 flex items-center justify-center text-sm">📁</span>
              Project Modules
            </h3>
            <div className="space-y-3">
              {modules.map((mod) => (
                <div key={mod.name} className="glass-card rounded-xl p-5 hover:bg-white/5 transition-colors">
                  <div className="font-mono text-[#00c9a7] text-sm mb-1">{mod.name}</div>
                  <div className="text-gray-400 text-sm">{mod.description}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 glass-card rounded-xl p-5">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <ShieldIcon /> Security
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Local-only data storage</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Android Keystore encryption</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> No trackers or analytics</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Open source (GPL-3.0)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== ROADMAP ====================
function Roadmap() {
  const phases = [
    {
      phase: 'MVP',
      timeline: '1–2 months',
      status: 'current',
      tasks: [
        'Telegram authorization (QR + phone)',
        'Chat/channel media browsing',
        'Basic video player (ExoPlayer)',
        'Basic audio player',
        'D-pad navigation (Leanback)',
        'Saved Messages section',
      ],
    },
    {
      phase: 'v1.0',
      timeline: '3 months',
      status: 'planned',
      tasks: [
        'Playlist creation & management',
        'Advanced search (name, date, type)',
        'Watch progress saving',
        '7-day free trial',
        '"Continue Watching" section',
        'Subtitle support (SRT, ASS)',
      ],
    },
    {
      phase: 'v1.1',
      timeline: '4 months',
      status: 'planned',
      tasks: [
        'Pro features unlock',
        'Custom themes & accent colors',
        'Background audio playback',
        'Notification controls',
        'Google Play Billing integration',
        'Gumroad/PayPal for APK',
      ],
    },
    {
      phase: 'v2.0',
      timeline: '6 months',
      status: 'future',
      tasks: [
        'Mobile version (adaptive UI)',
        'Cloud playlist sync',
        'Multi-device support',
        'Chromecast integration',
        'Advanced audio processing',
        'Community features',
      ],
    },
  ];

  return (
    <section id="roadmap" className="py-24 relative">
      <div className="absolute inset-0 hero-gradient opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Development <span className="gradient-text">Roadmap</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From MVP to full-featured media center
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 timeline-line opacity-30" />

          <div className="space-y-12">
            {phases.map((phase, index) => (
              <div key={phase.phase} className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className={`glass-card rounded-3xl p-8 inline-block max-w-md ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        phase.status === 'current' ? 'bg-green-500/20 text-green-400' :
                        phase.status === 'planned' ? 'bg-[#0088cc]/20 text-[#0088cc]' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {phase.status === 'current' ? '🔵 In Progress' : phase.status === 'planned' ? '📋 Planned' : '🔮 Future'}
                      </span>
                      <span className="text-sm text-gray-500">{phase.timeline}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{phase.phase}</h3>
                    <ul className="space-y-2">
                      {phase.tasks.map((task) => (
                        <li key={task} className="text-gray-400 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0088cc] flex-shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Timeline dot */}
                <div className="hidden md:flex w-4 h-4 rounded-full bg-gradient-to-r from-[#0088cc] to-[#7c4dff] ring-4 ring-[#0088cc]/20 z-10" />

                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== DEVICES ====================
function Devices() {
  const devices = [
    { name: 'Mi TV Stick', resolution: '1080p', icon: '📺' },
    { name: 'Mi Box S', resolution: '4K', icon: '📺' },
    { name: 'NVIDIA Shield', resolution: '4K', icon: '🛡️' },
    { name: 'Chromecast w/ Google TV', resolution: '4K', icon: '🎬' },
    { name: 'Philips Android TV', resolution: '4K', icon: '📺' },
    { name: 'Sony Bravia', resolution: '4K', icon: '📺' },
    { name: 'TCL Android TV', resolution: '1080p', icon: '📺' },
    { name: 'Generic Android TV Box', resolution: '1080p+', icon: '📦' },
  ];

  return (
    <section id="devices" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Works on <span className="gradient-text">your TV</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compatible with all Android TV devices running Android 8.0+
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {devices.map((device) => (
            <div key={device.name} className="glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-3">{device.icon}</div>
              <div className="font-semibold text-sm">{device.name}</div>
              <div className="text-xs text-gray-500 mt-1">{device.resolution}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 glass-card rounded-3xl p-8 text-center">
          <h3 className="text-xl font-bold mb-4">Supported Formats</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['MKV', 'MP4', 'AVI', 'TS', 'MOV', 'FLV', '3GP', 'MP3', 'FLAC', 'M4A', 'AAC', 'OGG', 'SRT', 'ASS'].map((format) => (
              <span key={format} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm font-mono text-gray-300 border border-white/10">
                {format}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== COMPARISON ====================
function Comparison() {
  const solutions = [
    {
      name: 'Tele (GitHub)',
      pros: ['FOSS', 'Android TV', 'Video streaming'],
      cons: ['Video only', 'No playlists', 'No music'],
      license: 'MIT',
    },
    {
      name: 'TMPlayer',
      pros: ['FOSS', 'Video + Audio', 'Streaming', 'Mi TV support'],
      cons: ['No playlists', 'No Pro features'],
      license: 'GPL-3.0',
    },
    {
      name: 'TelePlay',
      pros: ['Playlists', 'Progress tracking', 'Web + TV + Mobile'],
      cons: ['Requires server (Docker)', 'Complex setup'],
      license: 'MIT',
    },
    {
      name: 'TeleTV Player',
      pros: ['Video + Audio', 'Playlists', 'No server needed', 'Direct client', 'Pro features', '7-day trial'],
      cons: ['New project'],
      license: 'GPL-3.0',
      highlighted: true,
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why <span className="gradient-text">TeleTV Player</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The best of existing solutions, combined into one app
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((solution) => (
            <div
              key={solution.name}
              className={`rounded-3xl p-6 ${
                solution.highlighted
                  ? 'glass-card glow-primary border-2 border-[#0088cc]/30'
                  : 'glass-card'
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${solution.highlighted ? 'gradient-text' : ''}`}>
                {solution.name}
              </h3>
              <div className="space-y-2 mb-4">
                {solution.pros.map((pro) => (
                  <div key={pro} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span className="text-gray-300">{pro}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-4">
                {solution.cons.map((con) => (
                  <div key={con} className="flex items-center gap-2 text-sm">
                    <span className="text-red-400 flex-shrink-0">✗</span>
                    <span className="text-gray-500">{con}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-white/10">
                <span className="text-xs text-gray-500">License: {solution.license}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== DOWNLOAD / CTA ====================
function Download() {
  return (
    <section id="download" className="py-24 relative">
      <div className="absolute inset-0 hero-gradient" />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="glass-card rounded-[2rem] p-12 md:p-16 glow-primary">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0088cc] to-[#7c4dff] flex items-center justify-center mx-auto mb-8">
            <TvIcon />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to <span className="gradient-text">watch</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
            Download TeleTV Player and start watching Telegram media on your TV. 
            7-day free trial included.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#7c4dff] text-white font-semibold text-lg hover:scale-105 transition-transform flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M17.523 2H6.477C5.109 2 4 3.109 4 4.477v15.046C4 20.891 5.109 22 6.477 22h11.046C18.891 22 20 20.891 20 19.523V4.477C20 3.109 18.891 2 17.523 2zM12 19.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm5-4H7V5h10v10.5z"/>
              </svg>
              Google Play
            </button>
            <button className="px-8 py-4 rounded-2xl glass-card text-white font-semibold text-lg hover:bg-white/10 transition-colors flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub APK
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <CloudIcon /> No server needed
            </span>
            <span className="flex items-center gap-2">
              <ShieldIcon /> Privacy first
            </span>
            <span className="flex items-center gap-2">
              <StarIcon /> 7-day free trial
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== FOOTER ====================
function Footer() {
  return (
    <footer className="py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0088cc] to-[#7c4dff] flex items-center justify-center">
                <TvIcon />
              </div>
              <span className="text-lg font-bold">TeleTV Player</span>
            </div>
            <p className="text-sm text-gray-500">
              Telegram media player for Android TV. Watch videos, listen to music, create playlists.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a></li>
              <li><a href="#download" className="hover:text-white transition-colors">Download</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="mailto:support@teletv.app" className="hover:text-white transition-colors">📧 support@teletv.app</a></li>
              <li><a href="#" className="hover:text-white transition-colors">💬 @TeleTVSupport</a></li>
              <li><a href="#" className="hover:text-white transition-colors">🐛 GitHub Issues</a></li>
              <li><a href="#" className="hover:text-white transition-colors">📖 FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2026 TeleTV Player. Open source under GPL-3.0.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <TelegramIcon />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  return (
    <div className="min-h-screen bg-[#0f1419] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Comparison />
      <Pricing />
      <TechStack />
      <Roadmap />
      <Devices />
      <Download />
      <Footer />
    </div>
  );
}
