import React, { useState, useEffect } from 'react';
import { Play, Copy, Trash2, Terminal, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SavedLink {
  id: string;
  scheme: string;
  timestamp: string;
}

export const DeeplinkTool: React.FC = () => {
  const { lang } = useLanguage();
  const [urlScheme, setUrlScheme] = useState<string>('myapp://profile?id=123');
  const [history, setHistory] = useState<SavedLink[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('percylab-deeplinks');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToHistory = (scheme: string) => {
    if (!scheme.trim()) return;
    // Prevent duplicate entries adjacent to each other
    if (history.length > 0 && history[0].scheme === scheme) return;

    const newLink: SavedLink = {
      id: Math.random().toString(36).substring(2, 9),
      scheme: scheme.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newLink, ...history.slice(0, 19)]; // Limit to 20 items
    setHistory(updated);
    localStorage.setItem('percylab-deeplinks', JSON.stringify(updated));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('percylab-deeplinks', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('percylab-deeplinks');
  };

  const triggerLaunch = () => {
    if (!urlScheme.trim()) return;
    saveToHistory(urlScheme);
    
    // Redirect browser (will show error in browser if no handler exists, which is normal behavior)
    window.location.href = urlScheme;
  };

  const selectHistory = (scheme: string) => {
    setUrlScheme(scheme);
  };

  // Commands for Simulators
  const iosCommand = `xcrun simctl openurl booted "${urlScheme}"`;
  const androidCommand = `adb shell am start -a android.intent.action.VIEW -d "${urlScheme}"`;

  // QR Code URL (using a fast, free, secure public QR generator API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(urlScheme)}`;

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">deeplink</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi' ? 'Hỗ trợ kiểm thử liên kết sâu (Deep Link / Custom URL Scheme). Tạo mã QR quét nhanh trên điện thoại thật hoặc sao chép tập lệnh kiểm thử Xcode/ADB Simulator.' : 'Test custom deep link URL schemes. Generate scan-ready QR codes for physical test devices, or copy simulation ADB/xcrun terminal commands.'}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left Card: Input and Terminal commands */}
        <div className="tool-card glass animate-fade">
          <h3 className="section-title">{lang === 'vi' ? 'Trình soạn URL Scheme' : 'URL Scheme Tester'}</h3>
          <p className="section-subtitle">{lang === 'vi' ? 'Nhập liên kết ứng dụng di động để tạo lệnh' : 'Enter mobile deep link parameters'}</p>

          <div className="form-group">
            <input 
              type="text" 
              value={urlScheme}
              onChange={(e) => setUrlScheme(e.target.value)}
              className="form-input"
              placeholder="scheme://path?param=value"
              style={{ width: '100%', fontSize: '1.05rem', fontWeight: 600, padding: 14 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button onClick={triggerLaunch} className="btn btn-primary" style={{ flex: 1 }}>
              <Play size={16} />
              <span>{lang === 'vi' ? 'Mở trong Trình duyệt' : 'Open in Browser'}</span>
            </button>
            <button 
              onClick={() => copyToClipboard(urlScheme, 'input')} 
              className="btn btn-secondary"
            >
              <Copy size={16} />
              <span>{copied === 'input' ? (lang === 'vi' ? 'Đã chép!' : 'Copied!') : (lang === 'vi' ? 'Sao chép' : 'Copy link')}</span>
            </button>
          </div>

          {/* Terminal commands */}
          <div className="terminal-commands-wrapper" style={{ marginTop: 28 }}>
            <h4 className="config-title" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '12px 0 8px' }}>
              <Terminal size={14} style={{ color: 'var(--accent)' }} />
              {lang === 'vi' ? 'Tập lệnh chạy trên Máy ảo (Simulator)' : 'Simulator Test Scripts'}
            </h4>

            {/* iOS */}
            <div className="terminal-box glass">
              <div className="terminal-header-row">
                <span className="terminal-os">iOS Simulator (xcrun)</span>
                <button onClick={() => copyToClipboard(iosCommand, 'ios')} className="terminal-copy-btn">
                  {copied === 'ios' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <code>{iosCommand}</code>
            </div>

            {/* Android */}
            <div className="terminal-box glass" style={{ marginTop: 12 }}>
              <div className="terminal-header-row">
                <span className="terminal-os">Android Emulator (adb)</span>
                <button onClick={() => copyToClipboard(androidCommand, 'android')} className="terminal-copy-btn">
                  {copied === 'android' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <code>{androidCommand}</code>
            </div>
          </div>
        </div>

        {/* Right Card: QR Code & History */}
        <div className="tool-card glass preview-mask-card animate-fade">
          <div className="qr-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid rgba(46,125,96,0.08)', paddingBottom: 24, marginBottom: 20 }}>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
              <QrCode size={18} style={{ color: 'var(--accent)' }} />
              {lang === 'vi' ? 'Mã QR quét trên máy thật' : 'Mobile Testing QR Code'}
            </h3>
            <p className="section-subtitle" style={{ alignSelf: 'flex-start' }}>
              {lang === 'vi' ? 'Dùng camera điện thoại thật quét để kích hoạt deep link' : 'Scan with physical phone camera to trigger scheme'}
            </p>

            <div className="qr-container-box glass">
              <img src={qrCodeUrl} alt="Deep Link QR code representation" />
            </div>
          </div>

          {/* History */}
          <div className="history-section" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="preview-header" style={{ marginBottom: 12 }}>
              <span className="file-info-title">{lang === 'vi' ? 'Lịch sử kiểm thử' : 'Test History'}</span>
              {history.length > 0 && (
                <button onClick={clearHistory} className="btn-clear">{lang === 'vi' ? 'Xóa lịch sử' : 'Clear'}</button>
              )}
            </div>

            {!history.length ? (
              <div className="empty-history-text" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '24px 0' }}>
                {lang === 'vi' ? 'Chưa có liên kết nào được lưu' : 'No tested links recorded yet'}
              </div>
            ) : (
              <div className="history-links-list" style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '200px', overflowY: 'auto' }}>
                {history.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => selectHistory(item.scheme)}
                    className="history-link-item glass"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <div className="history-link-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'left', flex: 1, marginRight: 12 }}>
                      {item.scheme}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.timestamp}</span>
                      <button onClick={(e) => deleteItem(item.id, e)} className="btn-delete-item" style={{ padding: 4 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .terminal-box {
          background: #1e1e24;
          color: #a9ffb2;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-family: monospace;
          font-size: 0.8rem;
          text-align: left;
          overflow-x: auto;
          border: 1px solid #2d2d34;
        }

        .terminal-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          border-bottom: 1px solid #2d2d34;
          padding-bottom: 6px;
        }

        .terminal-os {
          color: #8c8c93;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .terminal-copy-btn {
          background: #2d2d34;
          border: none;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .terminal-copy-btn:hover {
          background: var(--accent);
          color: white;
        }

        .qr-container-box {
          background: white;
          padding: 12px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          border: 1px solid var(--card-border);
          width: 150px;
          height: 150px;
        }

        .qr-container-box img {
          max-width: 100%;
          max-height: 100%;
        }

        .history-link-item {
          transition: var(--transition-smooth);
        }

        .history-link-item:hover {
          border-color: var(--accent);
          background: var(--accent-light);
        }
      `}</style>
    </div>
  );
};
