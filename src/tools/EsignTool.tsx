import React, { useState, useRef, useEffect } from 'react';
import { Download, Trash2, PenLine } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type DrawMode = 'draw' | 'type';

export const EsignTool: React.FC = () => {
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<DrawMode>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<string>('#000000');
  const [penSize, setPenSize] = useState<number>(3);
  const [typedName, setTypedName] = useState<string>('');
  const [selectedFont, setSelectedFont] = useState<string>('Caveat');
  const [hasDrawn, setHasDrawn] = useState(false);

  const signatureFonts = [
    { id: 'Caveat', label: 'Caveat' },
    { id: 'cursive', label: 'Cursive' },
    { id: 'Fredoka', label: 'Fredoka' },
    { id: 'serif', label: 'Elegant' },
  ];

  const penColors = [
    { id: '#000000', label: lang === 'vi' ? 'Đen' : 'Black', hex: '#000000' },
    { id: '#1a3a8a', label: lang === 'vi' ? 'Xanh' : 'Blue', hex: '#1a3a8a' },
    { id: '#991B1B', label: lang === 'vi' ? 'Đỏ' : 'Red', hex: '#991B1B' },
  ];

  const t = (viStr: string, enStr: string) => lang === 'vi' ? viStr : enStr;

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 600;
    canvas.height = 200;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw guide line
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(40, 150);
    ctx.lineTo(560, 150);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  // Mouse/Touch drawing handlers
  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoords(e);
    setIsDrawing(true);
    setHasDrawn(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || mode !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  // Generate typed signature on canvas
  useEffect(() => {
    if (mode !== 'type' || !typedName.trim()) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Guide line
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(40, 150);
    ctx.lineTo(560, 150);
    ctx.stroke();
    ctx.setLineDash([]);

    // Text
    ctx.fillStyle = penColor;
    ctx.font = `48px "${selectedFont}", cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(typedName, canvas.width / 2, 148, 520);
    setHasDrawn(true);
  }, [typedName, selectedFont, penColor, mode]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(40, 150);
    ctx.lineTo(560, 150);
    ctx.stroke();
    ctx.setLineDash([]);

    setHasDrawn(false);
    setTypedName('');
  };

  const downloadSignature = (transparent: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (transparent) {
      // Create a new canvas with transparency
      const tCanvas = document.createElement('canvas');
      tCanvas.width = canvas.width;
      tCanvas.height = canvas.height;
      const tCtx = tCanvas.getContext('2d');
      if (!tCtx) return;

      const imgData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
      if (!imgData) return;
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Make white & near-white pixels transparent
        if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) {
          data[i + 3] = 0;
        }
        // Also make the guide line transparent (light gray)
        if (data[i] > 220 && data[i + 1] > 220 && data[i + 2] > 220 && data[i + 3] < 255) {
          data[i + 3] = 0;
        }
      }

      tCtx.putImageData(imgData, 0, 0);
      const dataUrl = tCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'percylab-signature-transparent.png';
      link.href = dataUrl;
      link.click();
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'percylab-signature.png';
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">esign</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t(
            'Tạo chữ ký số bằng cách vẽ tay hoặc nhập tên — tải về dạng PNG nền trong suốt.',
            'Create digital signatures by drawing or typing your name — download as transparent PNG.'
          )}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left: Canvas Pad */}
        <div className="tool-card glass animate-fade">
          <div className="preview-header" style={{ marginBottom: 12 }}>
            <span className="file-info-title">
              <PenLine size={14} style={{ display: 'inline', marginRight: 6 }} />
              {t('Bảng ký tên', 'Signature Pad')}
            </span>
            <button onClick={clearCanvas} className="btn-clear">
              <Trash2 size={12} style={{ marginRight: 4 }} />
              {t('Xoá', 'Clear')}
            </button>
          </div>

          {/* Mode Switch */}
          <div className="tab-switch-row" style={{ marginBottom: 16 }}>
            <button
              onClick={() => { setMode('draw'); clearCanvas(); }}
              className={`tab-switch-btn ${mode === 'draw' ? 'active' : ''}`}
            >
              {t('✍️ Vẽ tay', '✍️ Draw')}
            </button>
            <button
              onClick={() => { setMode('type'); clearCanvas(); }}
              className={`tab-switch-btn ${mode === 'type' ? 'active' : ''}`}
            >
              {t('⌨️ Nhập tên', '⌨️ Type Name')}
            </button>
          </div>

          {/* Canvas */}
          <div className="esign-canvas-wrapper">
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
              style={{
                width: '100%',
                maxHeight: 200,
                borderRadius: 'var(--radius-sm)',
                cursor: mode === 'draw' ? 'crosshair' : 'default',
                touchAction: 'none',
              }}
            />
          </div>

          {/* Type mode input */}
          {mode === 'type' && (
            <div style={{ marginTop: 16 }} className="animate-fade">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder={t('Nhập họ tên của bạn...', 'Enter your full name...')}
                className="form-input"
                style={{ width: '100%', fontSize: '1.1rem', fontStyle: 'italic' }}
                maxLength={30}
              />

              <div style={{ marginTop: 12 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {t('Phông chữ ký', 'Signature Font')}
                </span>
                <div className="tab-switch-row" style={{ marginTop: 4 }}>
                  {signatureFonts.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFont(f.id)}
                      className={`tab-switch-btn ${selectedFont === f.id ? 'active' : ''}`}
                      style={{ fontFamily: `"${f.id}", cursive`, fontSize: '0.82rem' }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Download Actions */}
          {hasDrawn && (
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }} className="animate-fade">
              <button
                onClick={() => downloadSignature(true)}
                className="btn btn-primary btn-generate"
                style={{ flex: 1 }}
              >
                <Download size={16} />
                <span>{t('PNG trong suốt', 'Transparent PNG')}</span>
              </button>
              <button
                onClick={() => downloadSignature(false)}
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Download size={16} />
                <span>{t('PNG nền trắng', 'White BG PNG')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Pen Settings */}
        <div className="tool-card glass controllers-card animate-fade">
          <h3 className="section-title">{t('Tuỳ chỉnh', 'Settings')}</h3>
          <p className="section-subtitle">{t('Thiết lập nét bút và màu mực', 'Customize pen stroke and ink color')}</p>

          {/* Pen Color */}
          <div className="form-group" style={{ marginTop: 16 }}>
            <label style={{ fontWeight: 700 }}>{t('Màu mực', 'Ink Color')}</label>
            <div className="esign-color-options">
              {penColors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setPenColor(c.id)}
                  className={`esign-color-btn ${penColor === c.id ? 'active' : ''}`}
                >
                  <span className="esign-color-swatch" style={{ background: c.hex }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pen Size (Draw mode only) */}
          {mode === 'draw' && (
            <div className="form-group" style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontWeight: 700 }}>{t('Nét bút', 'Pen Size')}</label>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{penSize}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={penSize}
                onChange={(e) => setPenSize(parseInt(e.target.value))}
                className="slider-input"
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Instructions */}
          <div style={{ marginTop: 28, padding: 16, background: 'var(--bg-cream)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--card-border)' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              💡 {t(
                'Mẹo: Tải ảnh "PNG trong suốt" để dễ chèn chữ ký vào tài liệu Word, PDF, hoặc email mà không có nền trắng.',
                'Tip: Download "Transparent PNG" to easily paste your signature into Word documents, PDFs, or emails without a white background.'
              )}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .esign-canvas-wrapper {
          border: 2px solid var(--card-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #ffffff;
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.03);
        }
        .esign-color-options {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .esign-color-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 8px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--card-border);
          background: var(--bg-cream);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-bounce);
        }
        .esign-color-btn.active {
          border-color: var(--accent);
          background: var(--accent-light);
        }
        .esign-color-swatch {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(0,0,0,0.1);
        }
        .tab-switch-row {
          display: flex;
          background: rgba(46, 125, 96, 0.05);
          border: 1px solid rgba(46, 125, 96, 0.08);
          padding: 4px;
          border-radius: var(--radius-sm);
          gap: 4px;
        }
        .tab-switch-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px 4px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-bounce);
        }
        .tab-switch-btn.active {
          background: white;
          color: var(--accent);
          box-shadow: 0 2px 8px rgba(46, 125, 96, 0.1);
        }
        .slider-input {
          accent-color: var(--accent);
        }
      `}</style>
    </div>
  );
};
