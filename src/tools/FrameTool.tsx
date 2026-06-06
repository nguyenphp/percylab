import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Monitor, Smartphone, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type MockupType = 'iphone' | 'macbook' | 'browser';
type BgStyle = 'mint' | 'lavender' | 'aurora' | 'sunset' | 'clean';

export const FrameTool: React.FC = () => {
  const { lang } = useLanguage();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  
  // Settings
  const [mockup, setMockup] = useState<MockupType>('browser');
  const [bgStyle, setBgStyle] = useState<BgStyle>('aurora');
  const [padding] = useState<number>(60); // px on export canvas
  const [deviceScale, setDeviceScale] = useState<number>(85); // %
  const [shadowBlur, setShadowBlur] = useState<number>(25);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const loadImage = (file: File) => {
    setImageName(file.name.split('.')[0]);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageSrc(null);
    setImageName('');
  };

  const drawFrame = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set export canvas size
    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    // Calculate dimensions based on device type
    // Device screen will host the original image
    let deviceWidth = originalWidth;
    let deviceHeight = originalHeight;

    // If browser, we add a top bar header
    const topBarHeight = mockup === 'browser' ? 40 : 0;
    const bezel = mockup === 'iphone' ? 24 : mockup === 'macbook' ? 14 : 0;

    let canvasWidth = deviceWidth + bezel * 2 + padding * 2;
    let canvasHeight = deviceHeight + bezel * 2 + topBarHeight + padding * 2;

    // Adjust sizes to maintain a reasonable canvas scale
    const targetExportWidth = 1200;
    const exportScaleFactor = targetExportWidth / canvasWidth;

    canvas.width = targetExportWidth;
    canvas.height = canvasHeight * exportScaleFactor;

    const scale = exportScaleFactor;

    // Draw background
    ctx.save();
    if (bgStyle === 'mint') {
      ctx.fillStyle = '#E8F5E9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgStyle === 'lavender') {
      ctx.fillStyle = '#F3E5F5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgStyle === 'aurora') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#A8FF78');
      grad.addColorStop(1, '#78FFD6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgStyle === 'sunset') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#FF512F');
      grad.addColorStop(1, '#DD2476');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    // Draw Mockup Container + Image inside
    const scaledPadding = padding * scale;
    const scaledBezel = bezel * scale;
    const scaledTopBar = topBarHeight * scale;
    const factor = deviceScale / 100;

    const innerWidth = (canvas.width - scaledPadding * 2) * factor;
    const innerHeight = (canvas.height - scaledPadding * 2) * factor;

    // Centering the device frame
    const startX = (canvas.width - innerWidth) / 2;
    const startY = (canvas.height - innerHeight) / 2;

    // Add Shadow configuration
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = shadowBlur * scale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10 * scale;

    // Draw mockup body & contents
    if (mockup === 'browser') {
      // Draw browser outline
      const radius = 12 * scale;
      ctx.fillStyle = '#FFFFFF';
      
      // Draw rounded rect body
      ctx.beginPath();
      ctx.roundRect(startX, startY, innerWidth, innerHeight, radius);
      ctx.fill();

      // Top header tab bar
      ctx.shadowColor = 'transparent'; // clear shadow for inner components
      ctx.fillStyle = '#F4F4F5';
      ctx.beginPath();
      ctx.roundRect(startX, startY, innerWidth, scaledTopBar, [radius, radius, 0, 0]);
      ctx.fill();

      // Draw three buttons (mac style dot controls)
      const dotRadius = 4.5 * scale;
      const dotSpacing = 14 * scale;
      const dotY = startY + scaledTopBar / 2;
      const colors = ['#FF5F56', '#FFBD2E', '#27C93F'];

      colors.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(startX + 18 * scale + idx * dotSpacing, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw browser screen screenshot
      ctx.drawImage(
        img,
        startX,
        startY + scaledTopBar,
        innerWidth,
        innerHeight - scaledTopBar
      );

    } else if (mockup === 'iphone') {
      // Draw phone silhouette body
      const radius = 32 * scale;
      ctx.fillStyle = '#18181B'; // Dark phone shell
      ctx.beginPath();
      ctx.roundRect(startX, startY, innerWidth, innerHeight, radius);
      ctx.fill();

      // Draw Screen inside the phone bezels
      ctx.shadowColor = 'transparent';
      ctx.save();
      // Clip path to match inner screen curve
      const clipRadius = 26 * scale;
      ctx.beginPath();
      ctx.roundRect(
        startX + scaledBezel,
        startY + scaledBezel,
        innerWidth - scaledBezel * 2,
        innerHeight - scaledBezel * 2,
        clipRadius
      );
      ctx.clip();

      ctx.drawImage(
        img,
        startX + scaledBezel,
        startY + scaledBezel,
        innerWidth - scaledBezel * 2,
        innerHeight - scaledBezel * 2
      );
      ctx.restore();

      // Draw Dynamic Island pill
      ctx.fillStyle = '#000000';
      const islandW = 75 * scale;
      const islandH = 20 * scale;
      const islandX = startX + (innerWidth - islandW) / 2;
      const islandY = startY + scaledBezel + 10 * scale;
      ctx.beginPath();
      ctx.roundRect(islandX, islandY, islandW, islandH, 10 * scale);
      ctx.fill();

    } else if (mockup === 'macbook') {
      // Draw display screen bezel base
      const radius = 10 * scale;
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.roundRect(startX, startY, innerWidth, innerHeight - 12 * scale, radius);
      ctx.fill();

      // Draw inside screenshot
      ctx.shadowColor = 'transparent';
      ctx.drawImage(
        img,
        startX + scaledBezel,
        startY + scaledBezel,
        innerWidth - scaledBezel * 2,
        innerHeight - scaledBezel * 2 - 12 * scale
      );

      // Draw laptop keyboard base stand
      ctx.fillStyle = '#D4D4D8'; // Metallic grey keyboard chassis
      const baseH = 14 * scale;
      const baseW = innerWidth * 1.12;
      const baseX = startX - (baseW - innerWidth) / 2;
      const baseY = startY + innerHeight - 12 * scale;
      
      ctx.beginPath();
      ctx.roundRect(baseX, baseY, baseW, baseH, [2 * scale, 2 * scale, 12 * scale, 12 * scale]);
      ctx.fill();

      // Stand indentation groove line
      ctx.fillStyle = '#A1A1AA';
      const grooveW = 60 * scale;
      const grooveH = 3 * scale;
      ctx.beginPath();
      ctx.roundRect(baseX + (baseW - grooveW) / 2, baseY, grooveW, grooveH, [0, 0, 2 * scale, 2 * scale]);
      ctx.fill();
    }

    ctx.restore();
  };

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        drawFrame();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [imageSrc, mockup, bgStyle, padding, deviceScale, shadowBlur]);

  const downloadFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `percylab-mockup-${imageName || 'device'}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">frame</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi' ? 'Lồng hình ảnh screenshot của bạn vào khung thiết bị giả lập tinh tế (iPhone, Macbook, Web Browser) trên các nền dải màu gradient pastel cực đẹp.' : 'Embed your screenshots inside clean, minimalist mockup devices on gorgeous modern pastel gradients.'}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left Side: Dragzone & Preview Canvas */}
        <div className="tool-card glass animate-fade">
          {!imageSrc ? (
            <div 
              className="dropzone" 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  loadImage(file);
                }
              }}
              style={{ minHeight: '340px', justifyContent: 'center' }}
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
              <h3 style={{ fontWeight: 700 }}>{lang === 'vi' ? 'Kéo thả ảnh screenshot' : 'Drag screenshot here'}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{lang === 'vi' ? 'hoặc nhấp chuột để chọn tệp từ máy' : 'or click to browse from computer'}</p>
            </div>
          ) : (
            <div className="uploader-preview-area">
              <div className="preview-header">
                <span className="file-info-title">{lang === 'vi' ? 'Mockup thành phẩm' : 'Formatted Mockup Output'}</span>
                <button onClick={clearImage} className="btn-clear">{lang === 'vi' ? 'Đổi ảnh khác' : 'Change photo'}</button>
              </div>

              {/* Hidden reference img */}
              <img 
                ref={imgRef}
                src={imageSrc} 
                alt="Source screen" 
                style={{ display: 'none' }} 
                onLoad={() => drawFrame()}
              />

              {/* Live Canvas View */}
              <div className="canvas-wrapper">
                <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}></canvas>
              </div>

              {/* Action Trigger */}
              <button 
                onClick={downloadFrame}
                className="btn btn-primary btn-generate"
                style={{ marginTop: 20 }}
              >
                <Download size={18} />
                <span>{lang === 'vi' ? 'Tải tệp thành phẩm (PNG)' : 'Download Mockup'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Mockup config Panel */}
        <div className="tool-card glass controllers-card animate-fade">
          <h3 className="section-title">{lang === 'vi' ? 'Tùy chọn Khung' : 'Device Framing'}</h3>
          <p className="section-subtitle">{lang === 'vi' ? 'Lựa chọn khung vỏ thiết bị di động & máy tính' : 'Choose templates and custom color backdrops'}</p>

          {/* Device Selection */}
          <div className="form-group">
            <label>{lang === 'vi' ? 'Loại thiết bị' : 'Device Frame'}</label>
            <div className="tab-switch-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <button 
                onClick={() => setMockup('browser')}
                className={`tab-switch-btn ${mockup === 'browser' ? 'active' : ''}`}
                style={{ padding: '8px 4px', fontSize: '0.78rem' }}
                disabled={!imageSrc}
              >
                <Globe size={12} />
                <span>Web Browser</span>
              </button>
              <button 
                onClick={() => setMockup('iphone')}
                className={`tab-switch-btn ${mockup === 'iphone' ? 'active' : ''}`}
                style={{ padding: '8px 4px', fontSize: '0.78rem' }}
                disabled={!imageSrc}
              >
                <Smartphone size={12} />
                <span>iPhone 15</span>
              </button>
              <button 
                onClick={() => setMockup('macbook')}
                className={`tab-switch-btn ${mockup === 'macbook' ? 'active' : ''}`}
                style={{ padding: '8px 4px', fontSize: '0.78rem' }}
                disabled={!imageSrc}
              >
                <Monitor size={12} />
                <span>Macbook Air</span>
              </button>
            </div>
          </div>

          {/* Background Gradient Styles */}
          <div className="form-group" style={{ marginTop: 24 }}>
            <label>{lang === 'vi' ? 'Màu nền phông' : 'Backdrop Canvas Background'}</label>
            <div className="tab-switch-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {(['aurora', 'sunset', 'mint', 'lavender', 'clean'] as BgStyle[]).map(style => (
                <button
                  key={style}
                  onClick={() => setBgStyle(style)}
                  disabled={!imageSrc}
                  className={`tab-switch-btn ${bgStyle === style ? 'active' : ''}`}
                  style={{ textTransform: 'capitalize', fontSize: '0.7rem', padding: '8px 2px' }}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Device Scale */}
          <div className="form-group" style={{ marginTop: 24 }}>
            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label>{lang === 'vi' ? 'Tỉ lệ co giãn vỏ' : 'Device Frame Scale'}</label>
              <span className="slider-value" style={{ fontWeight: 700, color: 'var(--accent)' }}>{deviceScale}%</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="95" 
              value={deviceScale} 
              onChange={(e) => setDeviceScale(parseInt(e.target.value))}
              disabled={!imageSrc}
              className="slider-input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Shadow Blurs */}
          <div className="form-group" style={{ marginTop: 24 }}>
            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label>{lang === 'vi' ? 'Độ nhòe bóng đổ (Shadow)' : 'Drop Shadow Blur'}</label>
              <span className="slider-value" style={{ fontWeight: 700, color: 'var(--accent)' }}>{shadowBlur}px</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="60" 
              value={shadowBlur} 
              onChange={(e) => setShadowBlur(parseInt(e.target.value))}
              disabled={!imageSrc}
              className="slider-input"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
