import { useState, useRef } from 'react';
import { Upload, Download, Sparkles, Smartphone, Apple } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface IconSize {
  name: string;
  width: number;
  height: number;
  platform: 'ios' | 'android';
  idiom?: string;
  scale?: string;
  sizeName?: string; // e.g. "20x20"
}

import { useLanguage } from '../context/LanguageContext';

export const IconsetTool: React.FC = () => {
  const { lang, t } = useLanguage();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ w: number; h: number } | null>(null);
  const [exportIOS, setExportIOS] = useState<boolean>(true);
  const [exportAndroid, setExportAndroid] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // iOS icon definitions (for Contents.json)
  const iosIcons: IconSize[] = [
    { name: 'icon-20@2x.png', width: 40, height: 40, platform: 'ios', idiom: 'iphone', scale: '2x', sizeName: '20x20' },
    { name: 'icon-20@3x.png', width: 60, height: 60, platform: 'ios', idiom: 'iphone', scale: '3x', sizeName: '20x20' },
    { name: 'icon-29.png', width: 29, height: 29, platform: 'ios', idiom: 'iphone', scale: '1x', sizeName: '29x29' },
    { name: 'icon-29@2x.png', width: 58, height: 58, platform: 'ios', idiom: 'iphone', scale: '2x', sizeName: '29x29' },
    { name: 'icon-29@3x.png', width: 87, height: 87, platform: 'ios', idiom: 'iphone', scale: '3x', sizeName: '29x29' },
    { name: 'icon-40@2x.png', width: 80, height: 80, platform: 'ios', idiom: 'iphone', scale: '2x', sizeName: '40x40' },
    { name: 'icon-40@3x.png', width: 120, height: 120, platform: 'ios', idiom: 'iphone', scale: '3x', sizeName: '40x40' },
    { name: 'icon-60@2x.png', width: 120, height: 120, platform: 'ios', idiom: 'iphone', scale: '2x', sizeName: '60x60' },
    { name: 'icon-60@3x.png', width: 180, height: 180, platform: 'ios', idiom: 'iphone', scale: '3x', sizeName: '60x60' },
    // ipad
    { name: 'icon-20-ipad.png', width: 20, height: 20, platform: 'ios', idiom: 'ipad', scale: '1x', sizeName: '20x20' },
    { name: 'icon-20@2x-ipad.png', width: 40, height: 40, platform: 'ios', idiom: 'ipad', scale: '2x', sizeName: '20x20' },
    { name: 'icon-29-ipad.png', width: 29, height: 29, platform: 'ios', idiom: 'ipad', scale: '1x', sizeName: '29x29' },
    { name: 'icon-29@2x-ipad.png', width: 58, height: 58, platform: 'ios', idiom: 'ipad', scale: '2x', sizeName: '29x29' },
    { name: 'icon-40-ipad.png', width: 40, height: 40, platform: 'ios', idiom: 'ipad', scale: '1x', sizeName: '40x40' },
    { name: 'icon-40@2x-ipad.png', width: 80, height: 80, platform: 'ios', idiom: 'ipad', scale: '2x', sizeName: '40x40' },
    { name: 'icon-76-ipad.png', width: 76, height: 76, platform: 'ios', idiom: 'ipad', scale: '1x', sizeName: '76x76' },
    { name: 'icon-76@2x-ipad.png', width: 152, height: 152, platform: 'ios', idiom: 'ipad', scale: '2x', sizeName: '76x76' },
    { name: 'icon-83.5@2x-ipad.png', width: 167, height: 167, platform: 'ios', idiom: 'ipad', scale: '2x', sizeName: '83.5x83.5' },
    // store
    { name: 'icon-1024.png', width: 1024, height: 1024, platform: 'ios', idiom: 'ios-marketing', scale: '1x', sizeName: '1024x1024' }
  ];

  // Android icon definitions
  const androidIcons: IconSize[] = [
    { name: 'mipmap-mdpi/ic_launcher.png', width: 48, height: 48, platform: 'android' },
    { name: 'mipmap-hdpi/ic_launcher.png', width: 72, height: 72, platform: 'android' },
    { name: 'mipmap-xhdpi/ic_launcher.png', width: 96, height: 96, platform: 'android' },
    { name: 'mipmap-xxhdpi/ic_launcher.png', width: 144, height: 144, platform: 'android' },
    { name: 'mipmap-xxxhdpi/ic_launcher.png', width: 192, height: 192, platform: 'android' },
    { name: 'play_store_512.png', width: 512, height: 512, platform: 'android' }
  ];

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
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ w: img.width, h: img.height });
        setImageSrc(event.target?.result as string);
      };
      img.src = event.target?.result as string;
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

  const generateIcons = async () => {
    if (!imageSrc || !canvasRef.current) return;
    setIsProcessing(true);
    setProgress(5);

    const zip = new JSZip();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load original image to canvas helper
    const originalImg = new Image();
    originalImg.src = imageSrc;
    await new Promise((resolve) => {
      originalImg.onload = resolve;
    });

    const exportSizes: IconSize[] = [];
    if (exportIOS) exportSizes.push(...iosIcons);
    if (exportAndroid) exportSizes.push(...androidIcons);

    const totalSteps = exportSizes.length;
    let completedSteps = 0;

    for (const size of exportSizes) {
      // Set canvas size
      canvas.width = size.width;
      canvas.height = size.height;

      // Draw and resize image
      ctx.clearRect(0, 0, size.width, size.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(originalImg, 0, 0, size.width, size.height);

      // Convert canvas to blob/base64
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      if (blob) {
        if (size.platform === 'ios') {
          // Xcode Asset Catalogue format
          zip.file(`ios/AppIcon.appiconset/${size.name}`, blob);
        } else {
          // Android structure
          zip.file(`android/${size.name}`, blob);
        }
      }

      completedSteps++;
      setProgress(Math.round(5 + (completedSteps / totalSteps) * 85));
    }

    // Generate Xcode Contents.json if exporting iOS
    if (exportIOS) {
      const contentsJson = {
        images: iosIcons.map((icon) => ({
          size: icon.sizeName,
          idiom: icon.idiom,
          filename: icon.name,
          scale: icon.scale,
        })),
        info: {
          version: 1,
          author: 'xcode',
        },
      };
      zip.file('ios/AppIcon.appiconset/Contents.json', JSON.stringify(contentsJson, null, 2));
    }

    setProgress(95);

    // Generate and save ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `percy-icons-${imageName || 'app'}.zip`);

    setProgress(100);
    setTimeout(() => {
      setIsProcessing(false);
      setProgress(0);
    }, 1000);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setImageSrc(null);
    setImageDimensions(null);
    setImageName('');
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">{t('iconset.title')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('iconset.desc')}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left Side: Upload & Configuration */}
        <div className="tool-card glass animate-fade">
          {!imageSrc ? (
            <div 
              className="dropzone" 
              onClick={triggerUpload}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png, image/jpeg"
                style={{ display: 'none' }}
              />
              <div className="upload-circle">
                <Upload size={32} />
              </div>
              <h3 style={{ fontWeight: 700 }}>{lang === 'vi' ? 'Kéo & thả ảnh vào đây' : 'Drag & drop image here'}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{lang === 'vi' ? 'hoặc nhấp chuột để chọn tệp từ máy tính' : 'or click to browse file from your computer'}</p>
              <span className="file-hint">{lang === 'vi' ? 'Định dạng hỗ trợ: PNG, JPEG (Tỉ lệ 1:1 đề xuất)' : 'Supported formats: PNG, JPEG (1:1 aspect ratio recommended)'}</span>
            </div>
          ) : (
            <div className="uploader-preview-area">
              <div className="preview-header">
                <span className="file-info-title">{lang === 'vi' ? 'Ảnh gốc tải lên' : 'Original image uploaded'}</span>
                <button onClick={clearImage} className="btn-clear">{lang === 'vi' ? 'Thay ảnh khác' : 'Change image'}</button>
              </div>
              <div className="preview-image-box">
                <img src={imageSrc} alt="Original uploader preview" />
              </div>
              <div className="image-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">{lang === 'vi' ? 'Tên tệp:' : 'File name:'}</span>
                  <span className="meta-value">{imageName}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">{lang === 'vi' ? 'Kích thước:' : 'Dimensions:'}</span>
                  <span className="meta-value">
                    {imageDimensions ? `${imageDimensions.w} x ${imageDimensions.h} px` : (lang === 'vi' ? 'Đang tính...' : 'Calculating...')}
                  </span>
                </div>
              </div>

              {/* Configurations */}
              <div className="config-section">
                <h4 className="config-title">{lang === 'vi' ? 'Tùy chọn nền tảng xuất' : 'Export Platforms'}</h4>
                <div className="checkbox-row">
                  <label className={`checkbox-label glass ${exportIOS ? 'active' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={exportIOS} 
                      onChange={(e) => setExportIOS(e.target.checked)} 
                    />
                    <Apple size={16} />
                    <span>{lang === 'vi' ? 'Bộ AppIcon cho iOS' : 'AppIcon set for iOS'}</span>
                  </label>
                  <label className={`checkbox-label glass ${exportAndroid ? 'active' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={exportAndroid} 
                      onChange={(e) => setExportAndroid(e.target.checked)} 
                    />
                    <Smartphone size={16} />
                    <span>{lang === 'vi' ? 'Bộ Mipmap cho Android' : 'Mipmap set for Android'}</span>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={generateIcons} 
                className="btn btn-primary btn-generate"
                disabled={isProcessing || (!exportIOS && !exportAndroid)}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    <span>{lang === 'vi' ? `Đang xử lý (${progress}%)` : `Processing (${progress}%)`}</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>{lang === 'vi' ? 'Xuất bộ Icons (ZIP)' : 'Export Icons (ZIP)'}</span>
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

        {/* Right Side: Mask Previews & Details */}
        <div className="tool-card glass preview-mask-card animate-fade">
          <h3 className="section-title">{lang === 'vi' ? 'Xem trước mặt nạ hiển thị' : 'Display mask previews'}</h3>
          <p className="section-subtitle">{lang === 'vi' ? 'Cách icon hiển thị trên các nền tảng khác nhau' : 'How the icon displays on different platforms'}</p>
          
          <div className="mask-preview-grid">
            <div className="mask-item">
              <div className="mask-shape ios-squircle">
                {imageSrc ? <img src={imageSrc} alt="iOS squircle view" /> : <div className="placeholder-icon">iOS</div>}
              </div>
              <span>iOS Squircle</span>
            </div>

            <div className="mask-item">
              <div className="mask-shape android-circle">
                {imageSrc ? <img src={imageSrc} alt="Android circle view" /> : <div className="placeholder-icon">Android</div>}
              </div>
              <span>Android Circle</span>
            </div>

            <div className="mask-item">
              <div className="mask-shape rounded-square">
                {imageSrc ? <img src={imageSrc} alt="Rounded square view" /> : <div className="placeholder-icon">Web</div>}
              </div>
              <span>Rounded Square</span>
            </div>
          </div>

          <div className="info-box-pastel">
            <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              {lang === 'vi' ? 'Cấu trúc file zip đầu ra:' : 'Output ZIP structure:'}
            </h4>
            <ul>
              <li><strong>{lang === 'vi' ? 'Mục iOS' : 'iOS section'}</strong>{lang === 'vi' ? ': Chứa thư mục `AppIcon.appiconset` có sẵn file `Contents.json` để bạn kéo trực tiếp vào thư mục Xcode Assets.' : ': Contains the AppIcon.appiconset folder with Contents.json ready to drag directly into Xcode Assets.'}</li>
              <li><strong>{lang === 'vi' ? 'Mục Android' : 'Android section'}</strong>{lang === 'vi' ? ': Đầy đủ các độ phân giải từ `mdpi` đến `xxxhdpi` được xếp trong các thư mục tương ứng và ảnh chất lượng cao 512px dành cho Play Store.' : ': Includes all mipmap density categories from mdpi to xxxhdpi organized in separate folders, plus a high-quality 512px image for Play Store.'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hidden helper canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      <style>{`
        .upload-circle {
          width: 64px;
          height: 64px;
          background: var(--accent-light);
          color: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .file-hint {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .file-info-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .btn-clear {
          background: transparent;
          border: none;
          color: #EF4444;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-clear:hover {
          opacity: 0.8;
        }

        .preview-image-box {
          width: 140px;
          height: 140px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--card-border);
          background: #ffffff;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        }

        .preview-image-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
        }

        .image-meta-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          background: rgba(46, 125, 96, 0.04);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          margin-bottom: 24px;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
        }

        .meta-label {
          color: var(--text-secondary);
        }

        .meta-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .config-section {
          text-align: left;
          margin-bottom: 24px;
        }

        .config-title {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .checkbox-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media(min-width: 480px) {
          .checkbox-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          user-select: none;
          transition: var(--transition-bounce);
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: var(--accent);
          cursor: pointer;
        }

        .checkbox-label span {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .checkbox-label.active {
          border-color: var(--accent);
          background: var(--accent-light);
        }

        .checkbox-label.active span {
          color: var(--accent);
        }

        .btn-generate {
          width: 100%;
          padding: 14px;
        }

        .progress-bar-container {
          width: 100%;
          height: 6px;
          background: rgba(46, 125, 96, 0.08);
          border-radius: 99px;
          overflow: hidden;
          margin-top: 16px;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 99px;
          transition: width 0.2s ease-out;
        }

        /* Spinner style */
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .preview-mask-card {
          text-align: left;
          display: flex;
          flex-direction: column;
        }

        .section-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .section-subtitle {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .mask-preview-grid {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid rgba(46, 125, 96, 0.08);
          margin-bottom: 24px;
        }

        .mask-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .mask-shape {
          width: 80px;
          height: 80px;
          background: #ffffff;
          border: 1px solid var(--card-border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mask-shape img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-icon {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: rgba(46,125,96,0.05);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Masks shapes */
        .ios-squircle {
          border-radius: 17.5px; /* Appicon squircle simulation */
          clip-path: url(#squircle-clip); /* Or smooth fallback border radius */
          border-radius: 18px; 
        }

        .android-circle {
          border-radius: 50%;
        }

        .rounded-square {
          border-radius: 12px;
        }

        .info-box-pastel {
          background: rgba(46, 125, 96, 0.04);
          border: 1px solid rgba(46, 125, 96, 0.08);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .info-box-pastel ul {
          padding-left: 18px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .info-box-pastel li {
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};
