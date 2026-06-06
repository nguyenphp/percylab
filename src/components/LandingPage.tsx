import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Image,
  Smartphone,
  Palette,
  Code,
  Sparkles,
  SmartphoneNfc,
  Layers,
  Sliders,
  FileJson,
  FileText,
  PenLine,
  Scissors,
  QrCode,
  Clock,
  Heart,
  RotateCw,
  Gift,
  Beer,
  Award,
  Camera,
  Wand2,
  Users,
  Timer
} from 'lucide-react';

type ActiveTab = 'web' | 'games' | 'photobooth' | 'story';

interface Tool {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'coming_soon' | 'percy_coming';
  icon: React.ComponentType<any>;
}

interface Category {
  id?: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  tools: Tool[];
}

interface LandingPageProps {
  onSelectTool: (toolId: string) => void;
  initialTab?: ActiveTab;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectTool, initialTab }) => {
  const { t } = useLanguage();
  const categories: Category[] = [
    {
      id: 'design',
      title: t('categories.design.title'),
      description: t('categories.design.desc'),
      icon: Palette,
      tools: [
        {
          id: 'grain',
          name: t('toolNames.grain'),
          description: t('toolDescs.grain'),
          status: 'available',
          icon: Sliders,
        },
        {
          id: 'palette',
          name: t('toolNames.palette'),
          description: t('toolDescs.palette'),
          status: 'available',
          icon: Palette,
        },
        {
          id: 'gradio',
          name: t('toolNames.gradio'),
          description: t('toolDescs.gradio'),
          status: 'available',
          icon: Sparkles,
        },
        {
          id: 'frame',
          name: t('toolNames.frame'),
          description: t('toolDescs.frame'),
          status: 'available',
          icon: Layers,
        },
        {
          id: 'polafiy',
          name: t('toolNames.polafiy'),
          description: t('toolDescs.polafiy'),
          status: 'available',
          icon: Image,
        },
        {
          id: 'bgremove',
          name: t('toolNames.bgremove'),
          description: t('toolDescs.bgremove'),
          status: 'available',
          icon: Scissors,
        },
      ]
    },
    {
      id: 'dev',
      title: t('categories.dev.title'),
      description: t('categories.dev.desc'),
      icon: Code,
      tools: [
        {
          id: 'iconset',
          name: t('toolNames.iconset'),
          description: t('toolDescs.iconset'),
          status: 'available',
          icon: Smartphone,
        },
        {
          id: 'base64',
          name: t('toolNames.base64'),
          description: t('toolDescs.base64'),
          status: 'available',
          icon: Code,
        },
        {
          id: 'deeplink',
          name: t('toolNames.deeplink'),
          description: t('toolDescs.deeplink'),
          status: 'available',
          icon: SmartphoneNfc,
        },
        {
          id: 'splashgen',
          name: t('toolNames.splashgen'),
          description: t('toolDescs.splashgen'),
          status: 'available',
          icon: Image,
        },
        {
          id: 'jsondiff',
          name: t('toolNames.jsondiff'),
          description: t('toolDescs.jsondiff'),
          status: 'available',
          icon: FileJson,
        },
        {
          id: 'timestamp',
          name: t('toolNames.timestamp'),
          description: t('toolDescs.timestamp'),
          status: 'available',
          icon: Clock,
        }
      ]
    },
    {
      id: 'utilities',
      title: t('categories.utilities.title'),
      description: t('categories.utilities.desc'),
      icon: FileText,
      tools: [
        {
          id: 'img2pdf',
          name: t('toolNames.img2pdf'),
          description: t('toolDescs.img2pdf'),
          status: 'available',
          icon: FileText,
        },
        {
          id: 'esign',
          name: t('toolNames.esign'),
          description: t('toolDescs.esign'),
          status: 'available',
          icon: PenLine,
        },
        {
          id: 'qrcode',
          name: t('toolNames.qrcode'),
          description: t('toolDescs.qrcode'),
          status: 'available',
          icon: QrCode,
        }
      ]
    },
    {
      id: 'couple',
      title: t('categories.couple.title'),
      description: t('categories.couple.desc'),
      icon: Heart,
      tools: [
        {
          id: 'foodmatcher',
          name: t('toolNames.foodmatcher'),
          description: t('toolDescs.foodmatcher'),
          status: 'available',
          icon: Heart,
        },
        {
          id: 'deciderwheel',
          name: t('toolNames.deciderwheel'),
          description: t('toolDescs.deciderwheel'),
          status: 'available',
          icon: RotateCw,
        },
        {
          id: 'scratchcard',
          name: t('toolNames.scratchcard'),
          description: t('toolDescs.scratchcard'),
          status: 'available',
          icon: Gift,
        }
      ]
    },
    {
      id: 'drinking_cat',
      title: t('categories.drinking_cat.title'),
      description: t('categories.drinking_cat.desc'),
      icon: Beer,
      tools: [
        {
          id: 'drinkingdice',
          name: t('toolNames.drinkingdice'),
          description: t('toolDescs.drinkingdice'),
          status: 'available',
          icon: Beer,
        },
        {
          id: 'drinkingcards',
          name: t('toolNames.drinkingcards'),
          description: t('toolDescs.drinkingcards'),
          status: 'available',
          icon: Award,
        }
      ]
    },
    {
      id: 'photobooth_studio',
      title: t('categories.photobooth_studio.title'),
      description: t('categories.photobooth_studio.desc'),
      icon: Camera,
      tools: [
        {
          id: 'selfbooth',
          name: t('toolNames.selfbooth'),
          description: t('toolDescs.selfbooth'),
          status: 'available',
          icon: Camera,
        },
        {
          id: 'timerbooth',
          name: t('toolNames.timerbooth'),
          description: t('toolDescs.timerbooth'),
          status: 'available',
          icon: Timer,
        },
        {
          id: 'filterbooth',
          name: t('toolNames.filterbooth'),
          description: t('toolDescs.filterbooth'),
          status: 'available',
          icon: Wand2,
        },
        {
          id: 'groupbooth',
          name: t('toolNames.groupbooth'),
          description: t('toolDescs.groupbooth'),
          status: 'available',
          icon: Users,
        }
      ]
    },
    {
      id: 'story_studio',
      title: t('categories.story_studio.title'),
      description: t('categories.story_studio.desc'),
      icon: Sparkles,
      tools: [
        {
          id: 'storylab',
          name: t('toolNames.storylab'),
          description: t('toolDescs.storylab'),
          status: 'available',
          icon: Sparkles,
        }
      ]
    }
  ];

  const [activeTab, setActiveTab] = React.useState<ActiveTab>(initialTab ?? 'web');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const filteredCategories = categories.filter(category => {
    if (activeTab === 'web')        return ['design', 'dev', 'utilities'].includes(category.id ?? '');
    if (activeTab === 'games')      return ['couple', 'drinking_cat'].includes(category.id ?? '');
    if (activeTab === 'photobooth') return category.id === 'photobooth_studio';
    if (activeTab === 'story')      return category.id === 'story_studio';
    return false;
  });

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <header className="landing-hero animate-fade">
        <div className="logo-badge">
          <span className="logo-dot"></span>
          {t('heroBadge')}
        </div>
        <h1 className="title-primary hero-title">
          {t('heroTitlePre')} <span className="text-gradient">{t('heroTitlePost')}</span>
        </h1>
        <p className="hero-subtitle">
          {t('heroSubtitle')}
        </p>
      </header>

      {/* Tab Switcher */}
      <div className="landing-tabs-container">
        <button 
          onClick={() => setActiveTab('web')}
          className={`landing-tab-btn ${activeTab === 'web' ? 'active' : ''}`}
        >
          {t('tabs.webTools')}
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`landing-tab-btn ${activeTab === 'games' ? 'active' : ''}`}
        >
          {t('tabs.games')}
        </button>
        <button
          onClick={() => setActiveTab('photobooth')}
          className={`landing-tab-btn pb-tab ${activeTab === 'photobooth' ? 'active' : ''}`}
        >
          {t('tabs.photobooth')}
        </button>
        <button
          onClick={() => setActiveTab('story')}
          className={`landing-tab-btn story-tab ${activeTab === 'story' ? 'active' : ''}`}
        >
          {t('tabs.stories')}
        </button>
      </div>

      <main className="categories-grid-row">
        {filteredCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <section 
              key={category.title} 
              className={`category-section glass ${
                category.id === 'couple'             ? 'couple-category-box'      :
                category.id === 'drinking_cat'       ? 'drinking-cat-category-box':
                category.id === 'photobooth_studio'  ? 'photobooth-category-box'  :
                category.id === 'story_studio'       ? 'story-studio-category-box':
                ''
              }`}
            >
              <div className="category-header">
                <div className="category-icon-wrapper">
                  <CategoryIcon size={18} />
                </div>
                <div>
                  <h2 className="category-title">
                    {category.title}
                    {category.id === 'couple' && <span className="blink-heart"> 💖</span>}
                  </h2>
                  <p className="category-desc">{category.description}</p>
                </div>
              </div>

              <div className="tools-list-stack">
                {category.tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const isAvailable = tool.status === 'available';
                  return (
                    <div
                      key={tool.id}
                      onClick={() => isAvailable && onSelectTool(tool.id)}
                      className={`tool-list-item ${isAvailable ? 'clickable' : 'disabled'}`}
                    >
                      <div className="tool-item-left">
                        <div className="tool-icon-box">
                          <ToolIcon size={16} />
                        </div>
                        <div className="tool-text-info">
                          <h3 className="tool-name">{tool.name}</h3>
                          <p className="tool-description">{tool.description}</p>
                        </div>
                      </div>

                      <div className="tool-item-right">
                        {tool.status === 'percy_coming' && (
                          <span className="compact-badge status-percy">{t('status.percy')}</span>
                        )}
                        {tool.status === 'coming_soon' && (
                          <span className="compact-badge status-soon">{t('status.soon')}</span>
                        )}
                        {tool.status === 'available' && (
                          <span className="compact-badge status-active">{t('status.active')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      <style>{`
        .landing-container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          animation: fadeIn 0.4s ease-out;
        }

        .landing-hero {
          text-align: center;
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent-light);
          border: 1.5px solid var(--card-border);
          color: var(--accent);
          padding: 6px 14px;
          border-radius: 99px;
          font-weight: 700;
          font-size: 0.82rem;
          margin-bottom: 16px;
        }

        .logo-dot {
          width: 8px;
          height: 8px;
          background-color: var(--accent-bright);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px var(--accent-bright);
          animation: pulse 2s infinite;
        }

        .hero-title {
          font-size: 2.8rem;
          margin-bottom: 12px;
          line-height: 1.15;
          font-weight: 800;
        }

        .hero-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 500px;
          line-height: 1.5;
        }

        .categories-grid-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }

        @media (min-width: 768px) {
          .categories-grid-row {
            grid-template-columns: repeat(2, 1fr);
            align-items: stretch;
          }
        }

        .category-section {
          padding: 24px 20px;
          background-color: var(--card-bg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1.5px dashed var(--card-border);
          padding-bottom: 14px;
        }

        .category-icon-wrapper {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--card-border);
        }

        .category-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .category-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .tools-list-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .tool-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          border: 1.5px solid transparent;
          background: var(--bg-cream);
          transition: var(--transition-bounce);
          position: relative;
          padding-right: 14px;
        }

        .tool-list-item.clickable {
          cursor: pointer;
          border-color: var(--card-border);
        }

        .tool-list-item.clickable:hover {
          transform: translateY(-2px);
          border-color: var(--accent);
          background: var(--card-bg);
          box-shadow: 2px 2px 0px 0px var(--accent);
        }

        .tool-list-item.disabled {
          opacity: 0.55;
        }

        .tool-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0; /* Prevents overflow */
        }

        .tool-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(30, 107, 63, 0.05);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tool-list-item.clickable:hover .tool-icon-box {
          background: var(--accent);
          color: #ffffff;
        }

        .tool-text-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .tool-name {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .tool-description {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-top: 2px;
          line-height: 1.35;
        }

        .tool-item-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 80px;
          margin-right: 0;
          flex-shrink: 0;
          transition: var(--transition-smooth);
        }

        .compact-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
          letter-spacing: 0.02em;
        }

        .status-active {
          background: var(--accent-light);
          color: var(--accent);
          border: 1px solid var(--card-border);
        }

        .status-soon {
          background: rgba(74, 96, 83, 0.08);
          color: var(--text-secondary);
          border: 1px solid rgba(74, 96, 83, 0.15);
        }

        .status-percy {
          background: #FEF3C7;
          color: #D97706;
          border: 1px solid #FCD34D;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }

        @keyframes pink-glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(244, 63, 94, 0.15), 4px 4px 0px 0px rgba(244, 63, 94, 0.1);
            border-color: rgba(244, 63, 94, 0.25);
          }
          50% {
            box-shadow: 0 0 25px rgba(244, 63, 94, 0.4), 4px 4px 0px 0px rgba(244, 63, 94, 0.15);
            border-color: rgba(244, 63, 94, 0.45);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }

        /* Tab Switcher Styles */
        .landing-tabs-container {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 32px;
          width: 100%;
        }

        .landing-tab-btn {
          padding: 10px 24px;
          border-radius: 99px;
          border: 2px solid var(--card-border);
          background: var(--card-bg);
          color: var(--text-secondary);
          font-family: 'Fredoka', sans-serif;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          transition: var(--transition-bounce);
          box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.03);
        }

        .landing-tab-btn:hover {
          transform: translateY(-2px);
          border-color: var(--accent);
          color: var(--accent);
        }

        .landing-tab-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
          box-shadow: 3px 3px 0px var(--text-primary);
          transform: translateY(-2px);
        }

        /* Softened Couple Category Styles */
        .couple-category-box {
          background: linear-gradient(135deg, rgba(255, 251, 252, 0.9) 0%, rgba(255, 240, 243, 0.9) 100%) !important;
          animation: pink-glow 3s infinite ease-in-out;
          position: relative;
          border-color: rgba(255, 117, 151, 0.25) !important;
        }

        .couple-category-box .tool-list-item {
          background-color: rgba(255, 255, 255, 0.65) !important;
          border-color: rgba(255, 117, 151, 0.15) !important;
        }
        
        .couple-category-box .tool-list-item:hover {
          background-color: rgba(255, 235, 240, 0.9) !important;
          border-color: rgba(255, 117, 151, 0.4) !important;
          transform: translateY(-2px);
          box-shadow: 2px 2px 0px rgba(255, 117, 151, 0.12);
        }

        .couple-category-box .tool-icon-box {
          background: rgba(255, 235, 240, 0.6) !important;
          color: #FF7597 !important;
          border-color: rgba(255, 117, 151, 0.2) !important;
        }

        .couple-category-box .compact-badge.status-active {
          background: #FFEBF0 !important;
          color: #FF7597 !important;
          border-color: rgba(255, 117, 151, 0.2) !important;
        }

        .couple-category-box::before {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 4s infinite linear;
          pointer-events: none;
          border-radius: inherit;
          opacity: 0.6;
          z-index: 1;
        }

        .couple-category-box > * {
          position: relative;
          z-index: 2;
        }

        .blink-heart {
          display: inline-block;
          animation: heartbeat 1.2s infinite ease-in-out;
        }

        /* Drinking Category Box (Purple Theme!) */
        .drinking-cat-category-box {
          background: linear-gradient(135deg, rgba(250, 245, 255, 0.95) 0%, rgba(243, 232, 255, 0.95) 100%) !important;
          border-color: rgba(168, 85, 247, 0.25) !important;
          position: relative;
        }
        .drinking-cat-category-box .tool-list-item {
          background-color: rgba(255, 255, 255, 0.65) !important;
          border-color: rgba(168, 85, 247, 0.15) !important;
        }
        .drinking-cat-category-box .tool-list-item:hover {
          background-color: rgba(243, 232, 255, 0.85) !important;
          border-color: rgba(168, 85, 247, 0.4) !important;
          transform: translateY(-2px);
        }
        .drinking-cat-category-box .tool-icon-box {
          background: rgba(243, 232, 255, 0.6) !important;
          color: #A855F7 !important;
          border-color: rgba(168, 85, 247, 0.2) !important;
        }
        .drinking-cat-category-box .compact-badge.status-active {
          background: rgba(243, 232, 255, 0.8) !important;
          color: #A855F7 !important;
          border-color: rgba(168, 85, 247, 0.2) !important;
        }

        /* Photobooth & Story category — full-width, same green accent as site */
        .photobooth-category-box, .story-studio-category-box {
          grid-column: 1 / -1;
        }

        /* Story Studio Category Box (Sunset Warm Theme!) */
        .story-studio-category-box {
          background: linear-gradient(135deg, rgba(255, 248, 240, 0.95) 0%, rgba(255, 235, 238, 0.95) 100%) !important;
          border-color: rgba(239, 68, 68, 0.25) !important;
          position: relative;
          animation: pink-glow 3s infinite ease-in-out;
        }
        .story-studio-category-box .tool-list-item {
          background-color: rgba(255, 255, 255, 0.65) !important;
          border-color: rgba(239, 68, 68, 0.15) !important;
        }
        .story-studio-category-box .tool-list-item:hover {
          background-color: rgba(255, 235, 238, 0.85) !important;
          border-color: rgba(239, 68, 68, 0.4) !important;
          transform: translateY(-2px);
          box-shadow: 2px 2px 0px rgba(239, 68, 68, 0.12);
        }
        .story-studio-category-box .tool-icon-box {
          background: rgba(255, 235, 238, 0.6) !important;
          color: #EF4444 !important;
          border-color: rgba(239, 68, 68, 0.2) !important;
        }
        .story-studio-category-box .compact-badge.status-active {
          background: rgba(255, 235, 238, 0.8) !important;
          color: #EF4444 !important;
          border-color: rgba(239, 68, 68, 0.2) !important;
        }

        /* ── Mobile responsive ── */
        @media (max-width: 540px) {
          .landing-container {
            padding: 24px 16px 60px;
          }
          .landing-hero {
            margin-bottom: 28px;
          }
          .hero-title {
            font-size: 2rem;
          }
          .hero-subtitle {
            font-size: 0.92rem;
          }
          .landing-tabs-container {
            gap: 8px;
            margin-bottom: 24px;
          }
          .landing-tab-btn {
            flex: 1;
            padding: 9px 8px;
            font-size: 0.82rem;
            white-space: nowrap;
            text-align: center;
          }
          .categories-grid-row {
            gap: 16px;
          }
          .tool-description {
            display: none;
          }
        }

        @media (max-width: 380px) {
          .landing-tab-btn {
            font-size: 0.75rem;
            padding: 8px 6px;
          }
        }
      `}</style>
    </div>
  );
};
