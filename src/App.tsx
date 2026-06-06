import { useState, useEffect, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { IconsetTool } from './tools/IconsetTool';
import { PaletteTool } from './tools/PaletteTool';
import { GradioTool } from './tools/GradioTool';
import { Base64Tool } from './tools/Base64Tool';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import {
  Sun,
  Moon,
  Smartphone,
  Palette,
  Code,
  Sparkles,
  Home,
  ChevronDown,
  Search,
  LayoutGrid,
  Globe,
  Sliders,
  Layers,
  Image,
  SmartphoneNfc,
  FileJson,
  FileText,
  Scissors,
  QrCode,
  Clock,
  Heart,
  RotateCw,
  Gift,
  Beer,
  Award,
  Camera
} from 'lucide-react';

import { GrainTool } from './tools/GrainTool';
import { FrameTool } from './tools/FrameTool';
import { PolafiyTool } from './tools/PolafiyTool';
import { StoryLabTool } from './tools/StoryLabTool';
import { DeeplinkTool } from './tools/DeeplinkTool';
import { SplashgenTool } from './tools/SplashgenTool';
import { JsondiffTool } from './tools/JsondiffTool';
import { Img2pdfTool } from './tools/Img2pdfTool';
import { BgRemoveTool } from './tools/BgRemoveTool';
import { EsignTool } from './tools/EsignTool';
import { QRTool } from './tools/QRTool';
import { TimestampTool } from './tools/TimestampTool';
import { FoodMatcherTool } from './tools/FoodMatcherTool';
import { DeciderWheelTool } from './tools/DeciderWheelTool';
import { ScratchCardTool } from './tools/ScratchCardTool';
import { DrinkingDiceTool } from './tools/DrinkingDiceTool';
import { DrinkingCardsTool } from './tools/DrinkingCardsTool';
import { PhotoBoothTool } from './tools/PhotoBoothTool';
import { TimerBoothTool } from './tools/TimerBoothTool';
import { FilterBoothTool } from './tools/FilterBoothTool';
import { GroupBoothTool } from './tools/GroupBoothTool';
import logoImg from './assets/logo.png';

const dropdownTools = [
  { id: 'grain', icon: Sliders, statusClass: 'active', available: true },
  { id: 'palette', icon: Palette, statusClass: 'active', available: true },
  { id: 'gradio', icon: Sparkles, statusClass: 'active', available: true },
  { id: 'frame', icon: Layers, statusClass: 'active', available: true },
  { id: 'polafiy', icon: Image, statusClass: 'active', available: true },
  { id: 'storylab', icon: Sparkles, statusClass: 'active', available: true },
  { id: 'iconset', icon: Smartphone, statusClass: 'active', available: true },
  { id: 'base64', icon: Code, statusClass: 'active', available: true },
  { id: 'deeplink', icon: SmartphoneNfc, statusClass: 'active', available: true },
  { id: 'splashgen', icon: Image, statusClass: 'active', available: true },
  { id: 'jsondiff', icon: FileJson, statusClass: 'active', available: true },
  { id: 'img2pdf', icon: FileText, statusClass: 'active', available: true },
  { id: 'esign', icon: FileText, statusClass: 'active', available: true },
  { id: 'bgremove', icon: Scissors, statusClass: 'active', available: true },
  { id: 'qrcode', icon: QrCode, statusClass: 'active', available: true },
  { id: 'timestamp', icon: Clock, statusClass: 'active', available: true },
  { id: 'foodmatcher', icon: Heart, statusClass: 'active', available: true },
  { id: 'deciderwheel', icon: RotateCw, statusClass: 'active', available: true },
  { id: 'scratchcard', icon: Gift, statusClass: 'active', available: true },
  { id: 'drinkingdice', icon: Beer, statusClass: 'active', available: true },
  { id: 'drinkingcards', icon: Award,   statusClass: 'active', available: true },
  { id: 'filterbooth',  icon: Camera,  statusClass: 'active', available: true }
];

function AppContent() {
  const { lang, setLang, t } = useLanguage();
  const [activeTool, setActiveTool] = useState<string>('landing');
  const [initialTab, setInitialTab] = useState<'web' | 'games' | 'photobooth' | 'story'>('web');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('percylab-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light';
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle URL hash changes for clean routing
  useEffect(() => {
    // Disable automatic browser scroll restoration on refresh
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTools = [
        'iconset', 'palette', 'gradio', 'base64', 
        'grain', 'frame', 'polafiy', 'deeplink', 
        'splashgen', 'jsondiff', 'img2pdf',
        'esign', 'bgremove', 'qrcode', 'timestamp',
        'foodmatcher', 'deciderwheel', 'scratchcard', 'drinkingdice', 'drinkingcards',
        'selfbooth', 'timerbooth', 'filterbooth', 'groupbooth', 'storylab'
      ];
      if (hash === 'photobooth') {
        setActiveTool('landing');
        setInitialTab('photobooth');
      } else if (hash === 'story') {
        setActiveTool('landing');
        setInitialTab('story');
      } else if (validTools.includes(hash)) {
        setActiveTool(hash);
        setInitialTab('web');
      } else {
        setActiveTool('landing');
        setInitialTab('web');
      }
      // Reset scroll position to top
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Init on load
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update theme on HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('percylab-theme', theme);
  }, [theme]);

  const selectTool = (toolId: string) => {
    window.location.hash = toolId;
  };

  const handleSelectTool = (toolId: string) => {
    selectTool(toolId);
    setDropdownOpen(false);
    setSearchQuery('');
  };

  const goHome = () => {
    window.location.hash = '';
    setDropdownOpen(false);
    setSearchQuery('');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const filteredTools = dropdownTools.filter(tool => {
    const name = t(`toolNames.${tool.id}`).toLowerCase();
    const desc = t(`toolDescs.${tool.id}`).toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || desc.includes(query);
  });

  const isGameActive = ['foodmatcher', 'deciderwheel', 'scratchcard', 'drinkingdice', 'drinkingcards'].includes(activeTool);

  return (
    <div className="app-shell">
      {/* Top Navbar */}
      <nav className={`navbar glass ${isGameActive ? 'game-mode' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo" onClick={goHome}>
            <div className="logo-icon">
              <img src={logoImg} alt="percylab logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span className="logo-text">percy<span>lab</span></span>
          </div>

          {/* Quick Nav Links */}
          <div className="nav-tabs">
            <button 
              onClick={goHome} 
              className={`nav-tab-btn ${activeTool === 'landing' ? 'active' : ''}`}
            >
              <Home size={16} />
              <span>{t('home')}</span>
            </button>
            
            <div className={`nav-dropdown-wrapper ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className={`nav-tab-btn ${activeTool !== 'landing' ? 'active' : ''}`}
              >
                <LayoutGrid size={16} />
                <span>{t('tools')}</span>
                <ChevronDown size={14} className="chevron-icon" />
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown-menu glass">
                  <div className="dropdown-search-box">
                    <Search size={14} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="dropdown-items-list">
                    {filteredTools.length > 0 ? (
                      filteredTools.map(tool => (
                        <div 
                          key={tool.id}
                          className={`dropdown-item ${tool.available ? 'active' : 'disabled'}`}
                          onClick={() => tool.available && handleSelectTool(tool.id)}
                        >
                          <div className="dropdown-item-icon">
                            <tool.icon size={16} />
                          </div>
                          <div className="dropdown-item-info">
                            <div className="dropdown-item-header">
                              <span className="dropdown-item-name">{t(`toolNames.${tool.id}`)}</span>
                              <span className={`compact-badge status-${tool.statusClass}`}>
                                {t(`status.${tool.statusClass}`)}
                              </span>
                            </div>
                            <span className="dropdown-item-desc">{t(`toolDescs.${tool.id}`)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-no-results">{t('noResults')}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="nav-actions">
            <button 
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} 
              className="lang-toggle-btn"
              aria-label="Toggle Language"
            >
              <Globe size={16} />
              <span>{lang === 'vi' ? 'EN' : 'VI'}</span>
            </button>

            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="main-content">
        {activeTool === 'landing' && <LandingPage onSelectTool={selectTool} initialTab={initialTab} />}
        
        {activeTool === 'iconset' && <IconsetTool />}
        {activeTool === 'palette' && <PaletteTool />}
        {activeTool === 'gradio' && <GradioTool />}
        {activeTool === 'base64' && <Base64Tool />}
        {activeTool === 'grain' && <GrainTool />}
        {activeTool === 'frame' && <FrameTool />}
        {activeTool === 'polafiy' && <PolafiyTool />}
        {activeTool === 'deeplink' && <DeeplinkTool />}
        {activeTool === 'splashgen' && <SplashgenTool />}
        {activeTool === 'jsondiff' && <JsondiffTool />}
        {activeTool === 'img2pdf' && <Img2pdfTool />}
        {activeTool === 'esign' && <EsignTool />}
        {activeTool === 'bgremove' && <BgRemoveTool />}
        {activeTool === 'qrcode' && <QRTool />}
        {activeTool === 'timestamp' && <TimestampTool />}
        {activeTool === 'foodmatcher' && <FoodMatcherTool />}
        {activeTool === 'deciderwheel' && <DeciderWheelTool />}
        {activeTool === 'scratchcard' && <ScratchCardTool />}
        {activeTool === 'drinkingdice' && <DrinkingDiceTool />}
        {activeTool === 'drinkingcards' && <DrinkingCardsTool />}
        {activeTool === 'selfbooth' && <PhotoBoothTool />}
        {activeTool === 'timerbooth' && <TimerBoothTool />}
        {activeTool === 'filterbooth' && <FilterBoothTool />}
        {activeTool === 'groupbooth' && <GroupBoothTool />}
        {activeTool === 'storylab' && <StoryLabTool />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} PercyLab. {t('footerBuiltBy')} 💚 <strong>Percy</strong></p>
          <div className="footer-links">
            <span className="footer-badge">V1.0.0</span>
            <span className="footer-badge">React & TS</span>
          </div>
        </div>
      </footer>

      {/* Styled JSX for navigation and footer layout */}
      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          border-radius: 0;
          border-top: none;
          border-left: none;
          border-right: none;
          padding: 12px 0;
          transition: var(--transition-smooth);
        }

        .nav-container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .logo-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: transparent;
        }

        .logo-text {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .logo-text span {
          color: var(--accent);
        }

        .nav-tabs {
          display: flex;
          background: rgba(46, 125, 96, 0.05);
          border: 1px solid rgba(46, 125, 96, 0.08);
          padding: 4px;
          border-radius: var(--radius-md);
          gap: 2px;
        }

        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          outline: none;
          padding: 8px 14px;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: 10px;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .nav-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(46, 125, 96, 0.04);
        }

        .nav-tab-btn.active {
          color: var(--accent);
          background: var(--card-bg);
          box-shadow: 0 2px 8px rgba(46, 125, 96, 0.08);
        }

        .nav-dropdown-wrapper {
          position: relative;
          display: inline-block;
        }

        .nav-tab-btn .chevron-icon {
          transition: transform 0.2s ease;
        }

        .nav-dropdown-wrapper.open .chevron-icon {
          transform: rotate(180deg);
        }

        .nav-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          width: 320px;
          max-height: 400px;
          background: var(--card-bg);
          border: 1.5px solid var(--card-border);
          border-radius: var(--radius-md);
          box-shadow: 4px 4px 0px 0px var(--card-border);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .dropdown-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-bottom: 1.5px dashed var(--card-border);
          background: rgba(46, 125, 96, 0.02);
        }

        .dropdown-search-box .search-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .dropdown-search-box input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.82rem;
          color: var(--text-primary);
          font-family: inherit;
        }

        .dropdown-search-box input::placeholder {
          color: var(--text-secondary);
          opacity: 0.8;
        }

        .dropdown-items-list {
          overflow-y: auto;
          flex: 1;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-bounce);
          text-align: left;
        }

        .dropdown-item.active:hover {
          background: rgba(46, 125, 96, 0.05);
        }

        .dropdown-item.disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .dropdown-item-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(46, 125, 96, 0.05);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dropdown-item.active:hover .dropdown-item-icon {
          background: var(--accent);
          color: #ffffff;
        }

        .dropdown-item-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .dropdown-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .dropdown-item-name {
          font-family: var(--font-heading);
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .dropdown-item-desc {
          font-size: 0.72rem;
          color: var(--text-secondary);
          margin-top: 1px;
          line-height: 1.35;
        }

        .dropdown-no-results {
          padding: 20px;
          text-align: center;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lang-toggle-btn {
          height: 40px;
          padding: 0 12px;
          border-radius: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--card-border);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-family: var(--font-heading);
          font-size: 0.82rem;
          font-weight: 700;
          transition: var(--transition-bounce);
        }

        .lang-toggle-btn:hover {
          transform: scale(1.05);
          border-color: var(--accent);
          color: var(--accent);
        }

        .theme-toggle-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--card-border);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .theme-toggle-btn:hover {
          transform: scale(1.05);
          border-color: var(--accent);
          color: var(--accent);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .footer {
          border-top: 1px solid var(--card-border);
          background: var(--glass-bg);
          padding: 24px 0;
          margin-top: auto;
        }

        .footer-container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .footer-container {
            flex-direction: row;
          }
        }

        .footer p {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .footer p strong {
          color: var(--text-primary);
        }

        .footer-links {
          display: flex;
          gap: 8px;
        }

        .footer-badge {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent);
          background: rgba(46, 125, 96, 0.06);
          border: 1px solid rgba(46, 125, 96, 0.12);
          padding: 4px 10px;
          border-radius: 6px;
        }

        /* Game Mode Styles */
        .navbar.game-mode {
          border-bottom: 2px dashed rgba(244, 63, 94, 0.25) !important;
          background: rgba(255, 245, 246, 0.7) !important;
          backdrop-filter: blur(12px) !important;
        }

        .navbar.game-mode .logo-text {
          font-family: 'Fredoka', sans-serif !important;
          color: #FF7597 !important;
        }

        .navbar.game-mode .logo-text span {
          color: #E05476 !important;
        }

        .navbar.game-mode .nav-tab-btn.active {
          background: #FFE4E6 !important;
          border: 1.5px solid rgba(244, 63, 94, 0.25) !important;
          color: #FF7597 !important;
          font-family: 'Fredoka', sans-serif !important;
          box-shadow: 2px 2px 0px 0px rgba(244, 63, 94, 0.1) !important;
          border-radius: 99px !important;
        }

        .navbar.game-mode .nav-dropdown-menu {
          background: rgba(255, 251, 252, 0.98) !important;
          border: 2px solid rgba(244, 63, 94, 0.2) !important;
          box-shadow: 0 10px 30px rgba(244, 63, 94, 0.08), 4px 4px 0px rgba(244, 63, 94, 0.1) !important;
          border-radius: 20px !important;
        }

        .navbar.game-mode .dropdown-search-box input {
          border-color: rgba(244, 63, 94, 0.12) !important;
        }

        .navbar.game-mode .dropdown-search-box input:focus {
          border-color: rgba(244, 63, 94, 0.3) !important;
        }

        .navbar.game-mode .dropdown-item.active {
          border-radius: 12px !important;
          margin: 2px 6px !important;
          padding: 8px 10px !important;
          transition: var(--transition-bounce) !important;
        }

        .navbar.game-mode .dropdown-item.active:hover {
          background: #FFE4E6 !important;
          color: #FF7597 !important;
          transform: translateX(3px) scale(1.02) !important;
        }

        .navbar.game-mode .dropdown-item-name {
          font-family: 'Fredoka', sans-serif !important;
          font-weight: 700 !important;
        }

        /* ── Mobile navbar ── */
        @media (max-width: 600px) {
          .nav-container { padding: 0 14px; gap: 6px; }
          .nav-tabs { padding: 3px; gap: 1px; }
          .nav-tab-btn { padding: 8px 10px; gap: 4px; }
          .nav-tab-btn span { display: none; }
          .nav-actions { gap: 8px; }
          .lang-toggle-btn { width: 38px; padding: 0; justify-content: center; }
          .lang-toggle-btn span { display: none; }
          .theme-toggle-btn { width: 38px; height: 38px; }
          .lang-toggle-btn { height: 38px; }
          .logo-text { font-size: 1.1rem; }
        }

      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
