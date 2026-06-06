import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { Upload, Download, RefreshCw, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type DotStyle = 'square' | 'rounded' | 'dots' | 'classy';

interface QRStyle {
  id: DotStyle;
  label: string;
  labelEn: string;
}

const STYLES: QRStyle[] = [
  { id: 'square',  label: 'Classic',  labelEn: 'Classic'  },
  { id: 'rounded', label: 'Rounded',  labelEn: 'Rounded'  },
  { id: 'dots',    label: 'Dots',     labelEn: 'Dots'     },
  { id: 'classy',  label: 'Classy',   labelEn: 'Classy'   },
];

const PRESETS = [
  { fg: '#1a1a1a', bg: '#ffffff', label: 'Monochrome' },
  { fg: '#1E6B3F', bg: '#D2ECD8', label: 'Forest'    },
  { fg: '#1d4ed8', bg: '#eff6ff', label: 'Ocean'     },
  { fg: '#7c3aed', bg: '#f5f3ff', label: 'Violet'    },
  { fg: '#be185d', bg: '#fdf2f8', label: 'Rose'      },
  { fg: '#ffffff', bg: '#1a1a1a', label: 'Dark'      },
];

const SIZE = 400;
const LOGO_RATIO = 0.22;

export const QRTool: React.FC = () => {
  const { lang } = useLanguage();
  const vi = lang === 'vi';

  const [text, setText] = useState('https://percylab.space');
  const [dotStyle, setDotStyle] = useState<DotStyle>('rounded');
  const [fgColor, setFgColor] = useState('#1a1a1a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoName, setLogoName] = useState('');
  const [errorLevel] = useState<'M' | 'H'>('H');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const drawQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = SIZE;
    canvas.height = SIZE;

    try {
      // Get QR matrix
      const qr = QRCode.create(text, { errorCorrectionLevel: errorLevel });
      const modules = qr.modules;
      const count = modules.size;
      const margin = 16;
      const available = SIZE - margin * 2;
      const cellSize = available / count;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, SIZE, SIZE);

      ctx.fillStyle = fgColor;

      for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
          if (!modules.get(row, col)) continue;

          const x = margin + col * cellSize;
          const y = margin + row * cellSize;
          const s = cellSize;

          if (dotStyle === 'dots') {
            ctx.beginPath();
            ctx.arc(x + s / 2, y + s / 2, s * 0.46, 0, Math.PI * 2);
            ctx.fill();
          } else if (dotStyle === 'rounded') {
            const r = s * 0.3;
            roundRect(ctx, x + 0.5, y + 0.5, s - 1, s - 1, r);
            ctx.fill();
          } else if (dotStyle === 'classy') {
            // Finder patterns stay square, data dots are small squares
            const isFinderZone =
              (row < 8 && col < 8) ||
              (row < 8 && col >= count - 8) ||
              (row >= count - 8 && col < 8);
            if (isFinderZone) {
              ctx.fillRect(x, y, s, s);
            } else {
              const pad = s * 0.15;
              const r = s * 0.2;
              roundRect(ctx, x + pad, y + pad, s - pad * 2, s - pad * 2, r);
              ctx.fill();
            }
          } else {
            ctx.fillRect(x, y, s, s);
          }
        }
      }

      // Overlay logo
      if (logoSrc) {
        const img = new Image();
        img.src = logoSrc;
        await new Promise<void>((res) => { img.onload = () => res(); });

        const logoSize = SIZE * LOGO_RATIO;
        const pad = logoSize * 0.15;
        const lx = (SIZE - logoSize) / 2;
        const ly = (SIZE - logoSize) / 2;

        // White pill background behind logo
        ctx.fillStyle = bgColor;
        roundRect(ctx, lx - pad, ly - pad, logoSize + pad * 2, logoSize + pad * 2, 10);
        ctx.fill();

        ctx.drawImage(img, lx, ly, logoSize, logoSize);
      }
    } catch {
      // invalid QR content — clear canvas
      ctx.clearRect(0, 0, SIZE, SIZE);
    }
  }, [text, dotStyle, fgColor, bgColor, logoSrc, errorLevel]);

  useEffect(() => { drawQR(); }, [drawQR]);

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setLogoSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'qrcode-percylab.png';
    a.click();
  };

  const applyPreset = (fg: string, bg: string) => {
    setFgColor(fg);
    setBgColor(bg);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">qrcode</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {vi
            ? 'Tạo mã QR tuỳ chỉnh với nhiều kiểu dáng, màu sắc và logo thương hiệu.'
            : 'Generate custom QR codes with multiple styles, colors, and brand logos.'}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left: Controls */}
        <div className="tool-card glass animate-fade qr-controls">

          {/* Text Input */}
          <div className="qr-section">
            <label className="section-title">{vi ? 'Nội dung' : 'Content'}</label>
            <textarea
              className="qr-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={vi ? 'URL, text, số điện thoại...' : 'URL, text, phone number...'}
              rows={3}
            />
          </div>

          {/* Dot Style */}
          <div className="qr-section">
            <label className="section-title">{vi ? 'Kiểu dáng' : 'Style'}</label>
            <div className="qr-style-grid">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  className={`qr-style-btn ${dotStyle === s.id ? 'active' : ''}`}
                  onClick={() => setDotStyle(s.id)}
                >
                  {vi ? s.label : s.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Color Presets */}
          <div className="qr-section">
            <label className="section-title">{vi ? 'Bộ màu' : 'Color Presets'}</label>
            <div className="qr-preset-row">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  className={`qr-preset-dot ${fgColor === p.fg && bgColor === p.bg ? 'active' : ''}`}
                  onClick={() => applyPreset(p.fg, p.bg)}
                  title={p.label}
                  style={{ background: p.bg, border: `3px solid ${p.fg}` }}
                />
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="qr-section">
            <label className="section-title">{vi ? 'Màu tuỳ chỉnh' : 'Custom Colors'}</label>
            <div className="qr-color-row">
              <label className="qr-color-label">
                <span>{vi ? 'Màu QR' : 'QR Color'}</span>
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
              </label>
              <label className="qr-color-label">
                <span>{vi ? 'Màu nền' : 'Background'}</span>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              </label>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="qr-section">
            <label className="section-title">{vi ? 'Logo thương hiệu' : 'Brand Logo'}</label>
            {!logoSrc ? (
              <div
                className="qr-logo-drop"
                onClick={() => logoInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleLogoUpload(f); }}
              >
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
                <Upload size={18} />
                <span>{vi ? 'Tải logo lên (PNG/SVG)' : 'Upload logo (PNG/SVG)'}</span>
              </div>
            ) : (
              <div className="qr-logo-preview">
                <img src={logoSrc} alt="logo" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }} />
                <span className="qr-logo-name">{logoName}</span>
                <button className="btn-clear" onClick={() => { setLogoSrc(null); setLogoName(''); }}>
                  <X size={12} /> {vi ? 'Xoá' : 'Remove'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview + Download */}
        <div className="tool-card glass animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <h3 className="section-title" style={{ alignSelf: 'flex-start' }}>{vi ? 'Xem trước' : 'Preview'}</h3>

          <div className="qr-canvas-wrapper">
            <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', borderRadius: 12 }} />
          </div>

          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setText(''); setLogoSrc(null); setLogoName(''); setFgColor('#1a1a1a'); setBgColor('#ffffff'); setDotStyle('rounded'); }}>
              <RefreshCw size={16} />
              <span>{vi ? 'Đặt lại' : 'Reset'}</span>
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleDownload}>
              <Download size={16} />
              <span>{vi ? 'Tải xuống PNG' : 'Download PNG'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {vi ? 'Xuất ảnh 400×400px, sẵn sàng in hoặc dùng kỹ thuật số.' : 'Exports at 400×400px, print-ready or digital-use.'}
          </p>
        </div>
      </div>

      <style>{`
        .qr-controls {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .qr-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .qr-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--card-border);
          background: rgba(46, 125, 96, 0.02);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          outline: none;
          resize: none;
          transition: var(--transition-smooth);
        }

        .qr-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(46, 125, 96, 0.1);
        }

        .qr-style-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .qr-style-btn {
          padding: 8px 6px;
          border-radius: 10px;
          border: 1.5px solid var(--card-border);
          background: transparent;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .qr-style-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .qr-style-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
          box-shadow: 2px 2px 0 var(--text-primary);
        }

        .qr-preset-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .qr-preset-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .qr-preset-dot:hover {
          transform: scale(1.15);
        }

        .qr-preset-dot.active {
          box-shadow: 0 0 0 3px var(--accent);
          transform: scale(1.1);
        }

        .qr-color-row {
          display: flex;
          gap: 16px;
        }

        .qr-color-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .qr-color-label input[type="color"] {
          width: 36px;
          height: 36px;
          border: 1.5px solid var(--card-border);
          border-radius: 8px;
          padding: 2px;
          cursor: pointer;
          background: none;
        }

        .qr-logo-drop {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border: 1.5px dashed var(--card-border);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .qr-logo-drop:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(46, 125, 96, 0.03);
        }

        .qr-logo-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border: 1px solid var(--card-border);
          border-radius: var(--radius-sm);
          background: rgba(46, 125, 96, 0.02);
        }

        .qr-logo-name {
          flex: 1;
          font-size: 0.82rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .qr-canvas-wrapper {
          width: 100%;
          max-width: 280px;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 4px 4px 0 var(--text-primary);
          border: 2px solid var(--text-primary);
        }
      `}</style>
    </div>
  );
};
