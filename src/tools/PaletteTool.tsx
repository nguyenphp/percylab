import { useState, useRef, useEffect } from 'react';
import { Upload, Copy, Check, Pipette } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
}

export const PaletteTool: React.FC = () => {
  const { lang, t } = useLanguage();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [eyeDropperSupported, setEyeDropperSupported] = useState<boolean>(false);
  const [customColors, setCustomColors] = useState<ColorInfo[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);

  // Check if browser supports EyeDropper API
  useEffect(() => {
    setEyeDropperSupported('EyeDropper' in window);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setCustomColors([]); // Reset custom colors
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  // Extract dominant colors when imageSrc updates
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      extractColorsFromImage(img);
      drawOnCanvas(img);
    };
  }, [imageSrc]);

  const drawOnCanvas = (img: HTMLImageElement) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions relative to container but maintaining image aspect ratio
    const containerWidth = Math.min(canvas.parentElement?.clientWidth || 500, 600);
    const scale = containerWidth / img.width;
    canvas.width = containerWidth;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  // Resize canvas redraw on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!imageSrc) return;
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => drawOnCanvas(img);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageSrc]);

  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const hexToRgb = (hex: string): {r: number, g: number, b: number} | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const extractColorsFromImage = (img: HTMLImageElement) => {
    // Create tiny canvas to sample pixels
    const sampleCanvas = document.createElement('canvas');
    const sampleCtx = sampleCanvas.getContext('2d');
    if (!sampleCtx) return;

    sampleCanvas.width = 40;
    sampleCanvas.height = 40;
    sampleCtx.drawImage(img, 0, 0, 40, 40);

    const imgData = sampleCtx.getImageData(0, 0, 40, 40).data;
    const colorMap: { [key: string]: { r: number; g: number; b: number; count: number } } = {};

    // Group similar colors to find dominant swatches
    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      if (a < 125) continue; // Skip highly transparent pixels

      // Group colors by grouping their values (divide by 16 to reduce color space)
      const key = `${Math.round(r / 20) * 20},${Math.round(g / 20) * 20},${Math.round(b / 20) * 20}`;
      if (colorMap[key]) {
        colorMap[key].count++;
        // Keep moving average of colors in group
        colorMap[key].r = Math.round((colorMap[key].r + r) / 2);
        colorMap[key].g = Math.round((colorMap[key].g + g) / 2);
        colorMap[key].b = Math.round((colorMap[key].b + b) / 2);
      } else {
        colorMap[key] = { r, g, b, count: 1 };
      }
    }

    // Sort by frequency
    const sortedGroups = Object.values(colorMap).sort((a, b) => b.count - a.count);

    // Pick top 6 colors that are sufficiently different
    const selectedColors: ColorInfo[] = [];
    const minDistance = 45; // Euclidean distance check to ensure variety

    for (const group of sortedGroups) {
      if (selectedColors.length >= 6) break;

      const isUnique = selectedColors.every(c => {
        const rgb = hexToRgb(c.hex);
        if (!rgb) return true;
        const dist = Math.sqrt(
          Math.pow(rgb.r - group.r, 2) +
          Math.pow(rgb.g - group.g, 2) +
          Math.pow(rgb.b - group.b, 2)
        );
        return dist > minDistance;
      });

      if (isUnique) {
        const hex = rgbToHex(group.r, group.g, group.b);
        selectedColors.push({
          hex,
          rgb: `rgb(${group.r}, ${group.g}, ${group.b})`,
          hsl: rgbToHsl(group.r, group.g, group.b)
        });
      }
    }

    setColors(selectedColors);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Translate CSS coordinate space to canvas internal resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];

    const hex = rgbToHex(r, g, b);
    const colorObj: ColorInfo = {
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: rgbToHsl(r, g, b)
    };

    // Add custom color (limit to 6 custom colors)
    setCustomColors(prev => {
      const exists = prev.some(c => c.hex === hex);
      if (exists) return prev;
      return [colorObj, ...prev].slice(0, 6);
    });
  };

  // EyeDropper API (Native Chrome/Edge/Opera/Safari 16.4+)
  const triggerNativeEyeDropper = async () => {
    if (!eyeDropperSupported) return;
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      
      // Parse color output
      const hex = result.sRGBHex.toUpperCase();
      const rgbValues = hexToRgb(hex);
      if (rgbValues) {
        const colorObj: ColorInfo = {
          hex,
          rgb: `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})`,
          hsl: rgbToHsl(rgbValues.r, rgbValues.g, rgbValues.b)
        };
        
        setCustomColors(prev => {
          const exists = prev.some(c => c.hex === hex);
          if (exists) return prev;
          return [colorObj, ...prev].slice(0, 6);
        });
      }
    } catch (err) {
      console.warn("User canceled color pick or EyeDropper failed", err);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const getExportData = (type: 'css' | 'json' | 'rn') => {
    const list = customColors.length > 0 ? customColors : colors;
    if (list.length === 0) return '';

    if (type === 'css') {
      return `:root {\n` + list.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n') + `\n}`;
    }
    if (type === 'json') {
      return JSON.stringify(list.map((c, i) => ({ name: `color-${i+1}`, hex: c.hex, rgb: c.rgb, hsl: c.hsl })), null, 2);
    }
    if (type === 'rn') {
      return `export const palette = {\n` + list.map((c, i) => `  color${i + 1}: '${c.hex}',`).join('\n') + `\n};`;
    }
    return '';
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setImageSrc(null);
    setColors([]);
    setCustomColors([]);
  };

  const displayedColors = customColors.length > 0 ? customColors : colors;

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">{t('palette.title')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('palette.desc')}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left Card: Canvas & Interactive Eye Dropper */}
        <div className="tool-card glass animate-fade">
          {!imageSrc ? (
            <div 
              className="dropzone" 
              onClick={triggerUpload}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{ minHeight: '300px', justifyContent: 'center' }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div className="upload-circle">
                <Upload size={32} />
              </div>
              <h3 style={{ fontWeight: 700 }}>{t('palette.uploadTitle')}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{t('palette.uploadDesc')}</p>
            </div>
          ) : (
            <div className="canvas-wrapper">
              <div className="preview-header">
                <span className="file-info-title">
                  {customColors.length > 0 
                    ? (lang === 'vi' ? 'Chế độ: Chọn màu thủ công (Click lên ảnh)' : 'Mode: Manual Color Picking (Click on image)')
                    : (lang === 'vi' ? 'Trích xuất màu tự động (Click lên ảnh để chấm thêm)' : 'Auto Color Extraction (Click to add custom colors)')}
                </span>
                <div style={{ display: 'flex', gap: 10 }}>
                  {eyeDropperSupported && (
                    <button onClick={triggerNativeEyeDropper} className="btn-picker">
                      <Pipette size={14} /> {lang === 'vi' ? 'Chấm màu hệ thống' : 'System Picker'}
                    </button>
                  )}
                  <button onClick={clearImage} className="btn-clear">{lang === 'vi' ? 'Xóa ảnh' : 'Remove image'}</button>
                </div>
              </div>

              <div className="canvas-container-outer">
                <canvas 
                  ref={imageCanvasRef} 
                  onClick={handleCanvasClick}
                  className="interactive-canvas"
                  title={lang === 'vi' ? 'Click vào điểm bất kỳ trên hình để chọn màu' : 'Click anywhere on the image to pick color'}
                ></canvas>
              </div>
              
              <span className="canvas-tip">{lang === 'vi' ? 'Mẹo: Di chuột và bấm vào ảnh để chấm lấy mã màu chính xác.' : 'Tip: Hover and click on the image to pick the precise color code.'}</span>
            </div>
          )}
        </div>

        {/* Right Card: Swatches & Code Export */}
        <div className="tool-card glass swatches-card animate-fade">
          <h3 className="section-title">
            {customColors.length > 0 ? (lang === 'vi' ? 'Bảng màu thủ công của bạn' : 'Your manual palette') : (lang === 'vi' ? 'Bảng màu tự động' : 'Automatic palette')}
          </h3>
          <p className="section-subtitle">
            {customColors.length > 0 
              ? (lang === 'vi' ? `Đã chấm ${customColors.length} màu. Bảng màu tự động sẽ bị ghi đè.` : `Picked ${customColors.length} colors. Auto palette is overridden.`) 
              : (lang === 'vi' ? '6 màu chủ đạo của bức hình được phân tích qua thuật toán.' : '6 dominant colors extracted via algorithm.')}
          </p>

          {displayedColors.length === 0 ? (
            <div className="empty-palette-view">
              <div className="empty-dots">
                <span className="dot shadow-pulse"></span>
                <span className="dot shadow-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="dot shadow-pulse" style={{ animationDelay: '0.4s' }}></span>
              </div>
              <p>{lang === 'vi' ? 'Tải ảnh lên để bắt đầu tạo bảng màu...' : 'Upload an image to start generating a palette...'}</p>
            </div>
          ) : (
            <div className="swatches-stack">
              {displayedColors.map((color, index) => (
                <div key={`${color.hex}-${index}`} className="color-swatch-item glass">
                  <div className="swatch-color-box" style={{ backgroundColor: color.hex }}></div>
                  <div className="swatch-values">
                    <span className="swatch-hex">{color.hex}</span>
                    <span className="swatch-sub">{color.rgb}</span>
                  </div>
                  <div className="swatch-copy-actions">
                    <button 
                      onClick={() => copyToClipboard(color.hex, index)} 
                      className="btn-copy-icon" 
                      title={lang === 'vi' ? 'Copy mã Hex' : 'Copy Hex code'}
                    >
                      {copiedIndex === index ? <Check size={16} style={{ color: 'var(--accent)' }} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              {/* Export Panel */}
              <div className="export-panel">
                <h4 className="export-title">{lang === 'vi' ? 'Xuất bảng màu' : 'Export Palette'}</h4>
                <div className="export-tabs-row">
                  <div className="export-box">
                    <div className="export-box-header">
                      <span>CSS Variables</span>
                      <button 
                        onClick={() => copyToClipboard(getExportData('css'), 99)} 
                        className="btn-copy-small"
                      >
                        {copiedIndex === 99 ? (lang === 'vi' ? 'Đã Copy!' : 'Copied!') : (lang === 'vi' ? 'Copy Code' : 'Copy Code')}
                      </button>
                    </div>
                    <pre><code>{getExportData('css')}</code></pre>
                  </div>

                  <div className="export-box" style={{ marginTop: 12 }}>
                    <div className="export-box-header">
                      <span>React Native Theme</span>
                      <button 
                        onClick={() => copyToClipboard(getExportData('rn'), 98)} 
                        className="btn-copy-small"
                      >
                        {copiedIndex === 98 ? (lang === 'vi' ? 'Đã Copy!' : 'Copied!') : (lang === 'vi' ? 'Copy Code' : 'Copy Code')}
                      </button>
                    </div>
                    <pre><code>{getExportData('rn')}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .canvas-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .canvas-container-outer {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: rgba(46, 125, 96, 0.02);
          border: 1px solid var(--card-border);
        }

        .interactive-canvas {
          max-width: 100%;
          cursor: crosshair;
          transition: transform 0.2s ease;
          display: block;
        }

        .canvas-tip {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-align: center;
        }

        .btn-picker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent-light);
          color: var(--accent);
          border: 1px solid rgba(46, 125, 96, 0.12);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .btn-picker:hover {
          transform: translateY(-1px);
          background: var(--accent);
          color: white;
        }

        .swatches-card {
          text-align: left;
          display: flex;
          flex-direction: column;
        }

        .empty-palette-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 60px 0;
          gap: 20px;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .empty-dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.6;
        }

        .shadow-pulse {
          animation: dot-pulse 1.4s infinite ease-in-out both;
        }

        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1.1); opacity: 0.9; }
        }

        .swatches-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: fadeIn 0.4s ease-out;
        }

        .color-swatch-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-radius: var(--radius-sm);
          border-color: rgba(46, 125, 96, 0.08);
          transition: var(--transition-bounce);
        }

        .color-swatch-item:hover {
          transform: translateX(4px);
          border-color: var(--accent);
        }

        .swatch-color-box {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);
        }

        .swatch-values {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding-left: 16px;
        }

        .swatch-hex {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.05rem;
          color: var(--text-primary);
        }

        .swatch-sub {
          font-size: 0.78rem;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          margin-top: 2px;
        }

        .btn-copy-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(46, 125, 96, 0.03);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .btn-copy-icon:hover {
          background: var(--accent-light);
          color: var(--accent);
          transform: scale(1.08);
        }

        .export-panel {
          margin-top: 24px;
          border-top: 1px dashed rgba(46,125,96,0.12);
          padding-top: 24px;
        }

        .export-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.05rem;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .export-box {
          background: rgba(46, 125, 96, 0.03);
          border: 1px solid rgba(46, 125, 96, 0.08);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .export-box-header {
          background: rgba(46, 125, 96, 0.05);
          padding: 8px 12px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(46, 125, 96, 0.06);
        }

        .btn-copy-small {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-copy-small:hover {
          color: var(--accent);
        }

        .export-box pre {
          padding: 12px;
          margin: 0;
          overflow-x: auto;
        }

        .export-box code {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          background: transparent;
          padding: 0;
          color: var(--text-primary);
          white-space: pre-wrap;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};
