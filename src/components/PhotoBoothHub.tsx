import React from 'react';
import { Camera, Timer, Wand2, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PhotoBoothHubProps {
  onSelectTool: (toolId: string) => void;
}

export const PhotoBoothHub: React.FC<PhotoBoothHubProps> = ({ onSelectTool }) => {
  const { lang } = useLanguage();

  const tools = [
    {
      id: 'selfbooth',
      icon: Timer,
      name: lang === 'vi' ? 'selfbooth' : 'selfbooth',
      desc: lang === 'vi'
        ? 'Tự động đếm ngược và chụp liên tiếp nhiều tấm, xuất thành dải film strip retro.'
        : 'Auto-countdown and capture a sequence of shots — exported as a retro film strip.',
      status: 'active' as const,
    },
    {
      id: 'pb_coming_1',
      icon: Wand2,
      name: lang === 'vi' ? 'filterbooth' : 'filterbooth',
      desc: lang === 'vi'
        ? 'Chụp selfie tức thì với các bộ lọc màu film đặc trưng theo phong cách retro.'
        : 'Instant selfies with cinematic film LUT filters and retro-style color grading.',
      status: 'soon' as const,
    },
    {
      id: 'pb_coming_2',
      icon: Users,
      name: lang === 'vi' ? 'groupbooth' : 'groupbooth',
      desc: lang === 'vi'
        ? 'Chụp ảnh nhóm tự động với hẹn giờ, ghép layout đôi hoặc lưới 4 người.'
        : 'Group photo timer with duo or 4-up grid layouts — perfect for parties.',
      status: 'soon' as const,
    },
  ];

  return (
    <div className="pbhub-root">
      {/* ── Hero ─── */}
      <div className="pbhub-hero">
        <div className="pbhub-badge">
          <Camera size={15} />
          <span>PHOTOBOOTH STUDIO</span>
        </div>
        <h1 className="pbhub-title">
          percy<span>booth</span>
        </h1>
        <p className="pbhub-subtitle">
          {lang === 'vi'
            ? 'Bộ công cụ chụp ảnh tự động ngay trên trình duyệt — không cần cài đặt, không cần máy ảnh chuyên nghiệp.'
            : 'Browser-based photo booth tools — no installation, no special gear needed.'}
        </p>
      </div>

      {/* ── Tool Cards ─── */}
      <div className="pbhub-grid">
        {tools.map(tool => (
          <div
            key={tool.id}
            className={`pbhub-card glass ${tool.status === 'active' ? 'pbhub-card-active' : 'pbhub-card-soon'}`}
            onClick={() => tool.status === 'active' && onSelectTool(tool.id)}
          >
            <div className="pbhub-card-icon">
              <tool.icon size={22} />
            </div>
            <div className="pbhub-card-body">
              <div className="pbhub-card-header">
                <span className="pbhub-card-name">{tool.name}</span>
                <span className={`compact-badge ${tool.status === 'active' ? 'status-active' : 'status-soon'}`}>
                  {tool.status === 'active'
                    ? (lang === 'vi' ? 'Sẵn sàng' : 'Active')
                    : (lang === 'vi' ? 'Sắp ra mắt' : 'Coming soon')}
                </span>
              </div>
              <p className="pbhub-card-desc">{tool.desc}</p>
            </div>
            {tool.status === 'active' && (
              <div className="pbhub-card-arrow">→</div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .pbhub-root {
          max-width: 760px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        /* Hero */
        .pbhub-hero {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .pbhub-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 999px;
          background: rgba(46,125,96,0.08);
          border: 1px solid rgba(46,125,96,0.18);
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          font-family: var(--font-heading);
        }
        .pbhub-title {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 6vw, 3.4rem);
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1;
          margin: 0;
        }
        .pbhub-title span { color: var(--accent); }
        .pbhub-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          max-width: 500px;
          line-height: 1.6;
          margin: 0;
        }

        /* Grid */
        .pbhub-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Card */
        .pbhub-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--card-border);
          transition: var(--transition-bounce);
        }
        .pbhub-card-active {
          cursor: pointer;
        }
        .pbhub-card-active:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(46,125,96,0.10);
        }
        .pbhub-card-active:hover .pbhub-card-icon {
          background: var(--accent);
          color: #fff;
        }
        .pbhub-card-soon {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .pbhub-card-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: rgba(46,125,96,0.06);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: var(--transition-bounce);
        }
        .pbhub-card-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .pbhub-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pbhub-card-name {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .pbhub-card-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin: 0;
        }
        .pbhub-card-arrow {
          font-size: 1.1rem;
          color: var(--accent);
          opacity: 0.6;
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .pbhub-card-active:hover .pbhub-card-arrow {
          opacity: 1;
          transform: translateX(4px);
        }

        @media (max-width: 640px) {
          .pbhub-root { padding: 32px 16px 60px; }
        }
      `}</style>
    </div>
  );
};
