import React, { useState, useRef } from 'react';
import { Upload, Download, Sparkles } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useLanguage } from '../context/LanguageContext';

export const SplashgenTool: React.FC = () => {
  const { lang } = useLanguage();
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string>('');
  
  // Customization State
  const [bgColor, setBgColor] = useState<string>('#E8F5E9'); // Light green pastel
  const [logoScale, setLogoScale] = useState<number>(30); // 10% - 60%
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadLogo(file);
    }
  };

  const loadLogo = (file: File) => {
    setLogoName(file.name.split('.')[0]);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const clearLogo = () => {
    setLogoSrc(null);
    setLogoName('');
  };

  const generateSplashAssets = async () => {
    if (!logoSrc || !canvasRef.current) return;
    setIsProcessing(true);
    setProgress(10);

    const zip = new JSZip();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load logo image
    const logoImg = new Image();
    logoImg.src = logoSrc;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });

    const lWidth = logoImg.naturalWidth || logoImg.width;
    const lHeight = logoImg.naturalHeight || logoImg.height;

    // Define standard device viewport sizes for splash screens
    // iOS (3 sizes): 1242x2688 (3x), 828x1792 (2x), 640x1136 (1x)
    // Android (5 sizes): mipmap-mdpi (320x480), hdpi (480x800), xhdpi (720x1280), xxhdpi (960x1600), xxxhdpi (1280x1920)
    const splashTargets = [
      { name: 'ios/launch_1x.png', w: 640, h: 1136, scale: 1 },
      { name: 'ios/launch_2x.png', w: 828, h: 1792, scale: 2 },
      { name: 'ios/launch_3x.png', w: 1242, h: 2688, scale: 3 },
      { name: 'android/drawable-mdpi/splash.png', w: 320, h: 480, scale: 0.5 },
      { name: 'android/drawable-hdpi/splash.png', w: 480, h: 800, scale: 0.75 },
      { name: 'android/drawable-xhdpi/splash.png', w: 720, h: 1280, scale: 1 },
      { name: 'android/drawable-xxhdpi/splash.png', w: 960, h: 1600, scale: 1.5 },
      { name: 'android/drawable-xxxhdpi/splash.png', w: 1280, h: 1920, scale: 2 },
    ];

    const totalSteps = splashTargets.length;
    let completedSteps = 0;

    for (const target of splashTargets) {
      canvas.width = target.w;
      canvas.height = target.h;

      // 1. Draw solid background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, target.w, target.h);

      // 2. Draw logo centered with the selected scale (percentage of width)
      const targetLogoWidth = target.w * (logoScale / 100);
      const ratio = lWidth / lHeight;
      const targetLogoHeight = targetLogoWidth / ratio;

      const x = (target.w - targetLogoWidth) / 2;
      const y = (target.h - targetLogoHeight) / 2;

      ctx.drawImage(logoImg, x, y, targetLogoWidth, targetLogoHeight);

      // 3. Convert to blob and add to zip
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      if (blob) {
        zip.file(target.name, blob);
      }

      completedSteps++;
      setProgress(Math.round(10 + (completedSteps / totalSteps) * 80));
    }

    // Add Android splash layout styling XML guide
    const androidStylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="SplashTheme" parent="Theme.AppCompat.NoActionBar">
        <item name="android:windowBackground">@drawable/splash</item>
        <item name="android:statusBarColor">#00000000</item>
    </style>
</resources>`;
    zip.file('android/values/styles_splash.xml', androidStylesXml);

    setProgress(95);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `percylab-splash-${logoName || 'assets'}.zip`);

    setProgress(100);
    setTimeout(() => {
      setIsProcessing(false);
      setProgress(0);
    }, 1000);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">splashgen</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi' ? 'Tạo nhanh bộ tài nguyên màn hình chào (Splash Screen) cho ứng dụng di động iOS/Android chuẩn kích cỡ màn hình từ logo định dạng PNG.' : 'Generate fully structured iOS storyboard launch screens and Android multi-density drawables from your logo icon.'}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left Card: Upload & Device Canvas Preview */}
        <div className="tool-card glass animate-fade">
          {!logoSrc ? (
            <div 
              className="dropzone" 
              onClick={triggerUpload}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  loadLogo(file);
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
              <h3 style={{ fontWeight: 700 }}>{lang === 'vi' ? 'Chọn Logo dạng PNG' : 'Choose Logo PNG'}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{lang === 'vi' ? 'Kéo & thả tệp logo có nền trong suốt' : 'Drag & drop transparent logo file'}</p>
            </div>
          ) : (
            <div className="uploader-preview-area">
              <div className="preview-header">
                <span className="file-info-title">{lang === 'vi' ? 'Màn hình xem trước' : 'Launch Screen Preview'}</span>
                <button onClick={clearLogo} className="btn-clear">{lang === 'vi' ? 'Đổi logo' : 'Change logo'}</button>
              </div>

              {/* Mock Device screen preview */}
              <div className="mock-device-viewport">
                <div 
                  className="mock-device-screen ios-squircle"
                  style={{ backgroundColor: bgColor }}
                >
                  <img 
                    src={logoSrc} 
                    alt="Logo preview" 
                    style={{ width: `${logoScale}%`, height: 'auto', objectFit: 'contain' }}
                  />
                  
                  {/* Mock home indicator pill bar */}
                  <div className="mock-indicator"></div>
                </div>
              </div>

              {/* Action */}
              <button 
                onClick={generateSplashAssets}
                disabled={isProcessing}
                className="btn btn-primary btn-generate"
                style={{ marginTop: 20 }}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    <span>{lang === 'vi' ? `Đang nén ZIP (${progress}%)` : `Zipping assets (${progress}%)`}</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>{lang === 'vi' ? 'Xuất bộ Splash Screens (ZIP)' : 'Generate Splash Assets (ZIP)'}</span>
                  </>
                )}
              </button>

              {isProcessing && (
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Card: Customizer configurations */}
        <div className="tool-card glass controllers-card animate-fade">
          <h3 className="section-title">{lang === 'vi' ? 'Thiết lập Splash' : 'Splash Layout'}</h3>
          <p className="section-subtitle">{lang === 'vi' ? 'Cấu hình nền và căn chỉnh logo' : 'Configure background color and logo scale'}</p>

          {/* Color Picker */}
          <div className="form-group">
            <label>{lang === 'vi' ? 'Màu nền màn hình chờ' : 'Background Background Color'}</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
              <input 
                type="color" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)}
                disabled={!logoSrc}
                style={{ width: 44, height: 44, border: '1px solid var(--card-border)', borderRadius: 6, cursor: 'pointer', padding: 0, background: 'none' }}
              />
              <input 
                type="text" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)}
                disabled={!logoSrc}
                className="form-input"
                style={{ flex: 1, textTransform: 'uppercase', fontWeight: 600 }}
              />
            </div>
          </div>

          {/* Logo scale slider */}
          <div className="form-group" style={{ marginTop: 24 }}>
            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label>{lang === 'vi' ? 'Kích cỡ hiển thị logo' : 'Logo Render Scale'}</label>
              <span className="slider-value" style={{ fontWeight: 700, color: 'var(--accent)' }}>{logoScale}%</span>
            </div>
            <input 
              type="range" 
              min="15" 
              max="50" 
              value={logoScale} 
              onChange={(e) => setLogoScale(parseInt(e.target.value))}
              disabled={!logoSrc}
              className="slider-input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Structures info */}
          <div className="info-box-pastel" style={{ marginTop: 28 }}>
            <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              {lang === 'vi' ? 'Cấu trúc thư mục đầu ra:' : 'Output Folder Structure:'}
            </h4>
            <ul style={{ fontSize: '0.82rem', paddingLeft: 16, marginTop: 6, lineHeight: 1.5, textAlign: 'left' }}>
              <li><strong>ios/</strong>: launch_1x, 2x, 3x sizes for storyboard launch image assets.</li>
              <li><strong>android/</strong>: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi drawable assets and a `styles_splash.xml` setup resource script.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hidden helper canvas for resizing */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      <style>{`
        .mock-device-viewport {
          background: #eef2f5;
          padding: 24px;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .mock-device-screen {
          width: 200px;
          height: 400px;
          border-radius: 24px;
          border: 6px solid #1c1c1e;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: background-color 0.2s ease;
        }

        .mock-indicator {
          width: 70px;
          height: 4px;
          background: rgba(0,0,0,0.2);
          border-radius: 99px;
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
        }
      `}</style>
    </div>
  );
};
