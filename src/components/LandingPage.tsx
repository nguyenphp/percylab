import React from 'react';
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
  Clock
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'coming_soon' | 'percy_coming';
  icon: React.ComponentType<any>;
}

interface Category {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  tools: Tool[];
}

interface LandingPageProps {
  onSelectTool: (toolId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectTool }) => {
  const { t } = useLanguage();
  const categories: Category[] = [
    {
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
        }
      ]
    },
    {
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
    }
  ];

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

      {/* Grid of Categories - 2 Columns Layout for screen-fit compactness */}
      <main className="categories-grid-row">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <section key={category.title} className="category-section glass">
              <div className="category-header">
                <div className="category-icon-wrapper">
                  <CategoryIcon size={18} />
                </div>
                <div>
                  <h2 className="category-title">{category.title}</h2>
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

        @media (min-width: 992px) {
          .categories-grid-row {
            grid-template-columns: repeat(3, 1fr);
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
      `}</style>
    </div>
  );
};
