import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Type, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type TextureType = 'clean' | 'vintage' | 'crumpled';

export const PolafiyTool: React.FC = () => {
  const { lang } = useLanguage();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  
  // Customizations
  const [caption, setCaption] = useState<string>('Summer vibes ☀️');
  const [rotateAngle, setRotateAngle] = useState<number>(-3); // degrees
  const [texture, setTexture] = useState<TextureType>('clean');

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

  const drawPolaroid = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define fixed size for high resolution Polaroid card export
    // Polaroid format classic aspect ratio: 8.8 x 10.7 cm
    const cardW = 700;
    const cardH = 850;

    // Set canvas size (expanded slightly to allow rotating the card without clipping)
    canvas.width = 900;
    canvas.height = 1000;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply rotation center-screen
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotateAngle * Math.PI) / 180);

    // Draw card shadows
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 12;

    // Draw card base border (white/sepia)
    ctx.fillStyle = texture === 'vintage' ? '#FAF0E6' : '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);
    ctx.fill();

    // Clear shadow for inner elements
    ctx.shadowColor = 'transparent';

    // Draw inner photo area (Square 1:1, e.g. 620 x 620 px)
    const photoSize = 620;
    const photoX = -photoSize / 2;
    const photoY = -cardH / 2 + 40; // 40px top border margin

    // Fill photo slot with dark background first in case image is loading
    ctx.fillStyle = '#18181B';
    ctx.fillRect(photoX, photoY, photoSize, photoSize);

    // Draw the image scaled to fit/fill square perfectly
    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoSize, photoSize);
    ctx.clip();

    const originalW = img.naturalWidth || img.width;
    const originalH = img.naturalHeight || img.height;
    const ratio = originalW / originalH;

    let targetW = photoSize;
    let targetH = photoSize;

    if (ratio > 1) {
      targetW = photoSize * ratio;
      ctx.drawImage(img, photoX - (targetW - photoSize) / 2, photoY, targetW, photoSize);
    } else {
      targetH = photoSize / ratio;
      ctx.drawImage(img, photoX, photoY - (targetH - photoSize) / 2, photoSize, targetH);
    }
    ctx.restore();

    // Photo slot inner shadow border overlay
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(photoX, photoY, photoSize, photoSize);

    // Draw handwritten text caption at the bottom spacer
    const textY = photoY + photoSize + 90; // spacer below photo
    ctx.fillStyle = '#27272A';
    
    // Choose custom hand-writing font look (fallback is elegant cursive)
    ctx.font = 'normal 42px "Outfit", "Comic Sans MS", "Caveat", "Brush Script MT", cursive';
    ctx.textAlign = 'center';
    
    // Limit text length to prevent overflow
    const maxTextWidth = cardW - 100;
    ctx.fillText(caption, 0, textY, maxTextWidth);

    // Draw paper texture overlays
    if (texture === 'crumpled') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
      
      // Mimic crumple lines by drawing subtle strokes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Line 1
      ctx.moveTo(-cardW/2, -cardH/3);
      ctx.lineTo(cardW/3, cardH/4);
      ctx.stroke();
      
      // Line 2
      ctx.moveTo(-cardW/4, cardH/2);
      ctx.lineTo(cardW/2, -cardH/4);
      ctx.stroke();
    }

    ctx.restore();
  };

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        drawPolaroid();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [imageSrc, caption, rotateAngle, texture]);

  const downloadPolaroid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `percylab-polaroid-${imageName || 'instant'}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">polafiy</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi' ? 'Biến những bức ảnh kỹ thuật số của bạn thành các tấm ảnh Polaroid hoài cổ lấy liền, đi kèm những dòng chữ viết tay và góc nghiêng tự nhiên.' : 'Transform your photos into vintage Polaroid instant camera frames with signature cursive handwriting overlays.'}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left Card: Upload & Polaroid canvas view */}
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
              <h3 style={{ fontWeight: 700 }}>{lang === 'vi' ? 'Chọn ảnh để tạo Polaroid' : 'Select photo for Polaroid'}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{lang === 'vi' ? 'hoặc kéo thả tệp hình ảnh vào đây' : 'or drag & drop your image file here'}</p>
            </div>
          ) : (
            <div className="uploader-preview-area">
              <div className="preview-header">
                <span className="file-info-title">{lang === 'vi' ? 'Tấm Polaroid của bạn' : 'Your Polaroid Print'}</span>
                <button onClick={clearImage} className="btn-clear">{lang === 'vi' ? 'Tải ảnh khác' : 'Change photo'}</button>
              </div>

              {/* Hidden reference img */}
              <img 
                ref={imgRef}
                src={imageSrc} 
                alt="Source instant" 
                style={{ display: 'none' }} 
                onLoad={() => drawPolaroid()}
              />

              {/* Canvas viewport container with background paper texture */}
              <div className="polaroid-canvas-viewport">
                <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '440px', borderRadius: 'var(--radius-sm)' }}></canvas>
              </div>

              {/* Action */}
              <button 
                onClick={downloadPolaroid}
                className="btn btn-primary btn-generate"
                style={{ marginTop: 20 }}
              >
                <Download size={18} />
                <span>{lang === 'vi' ? 'Tải ảnh Polaroid (PNG)' : 'Download Polaroid'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Card: Customizer sidebar */}
        <div className="tool-card glass controllers-card animate-fade">
          <h3 className="section-title">{lang === 'vi' ? 'Thiết kế Polaroid' : 'Polaroid Styling'}</h3>
          <p className="section-subtitle">{lang === 'vi' ? 'Tùy chỉnh góc xoay, chất giấy và chữ ký' : 'Modify captions, frame tilt, and textures'}</p>

          {/* Caption text */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Type size={14} style={{ color: 'var(--accent)' }} />
              {lang === 'vi' ? 'Dòng ghi chú viết tay' : 'Handwritten Caption'}
            </label>
            <input 
              type="text" 
              value={caption} 
              onChange={(e) => setCaption(e.target.value)}
              disabled={!imageSrc}
              className="form-input"
              placeholder={lang === 'vi' ? 'Nhập ghi chú...' : 'Enter note...'}
              style={{ width: '100%' }}
            />
          </div>

          {/* Rotate angle slider */}
          <div className="form-group" style={{ marginTop: 24 }}>
            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={14} style={{ color: 'var(--accent)' }} />
                {lang === 'vi' ? 'Góc nghiêng ảnh' : 'Tilt Rotation Angle'}
              </label>
              <span className="slider-value" style={{ fontWeight: 700, color: 'var(--accent)' }}>{rotateAngle}°</span>
            </div>
            <input 
              type="range" 
              min="-15" 
              max="15" 
              value={rotateAngle} 
              onChange={(e) => setRotateAngle(parseInt(e.target.value))}
              disabled={!imageSrc}
              className="slider-input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Texture & paper color options */}
          <div className="form-group" style={{ marginTop: 24 }}>
            <label>{lang === 'vi' ? 'Kiểu giấy viền' : 'Paper Border texture'}</label>
            <div className="tab-switch-row">
              {(['clean', 'vintage', 'crumpled'] as TextureType[]).map(tStyle => (
                <button
                  key={tStyle}
                  onClick={() => setTexture(tStyle)}
                  disabled={!imageSrc}
                  className={`tab-switch-btn ${texture === tStyle ? 'active' : ''}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {tStyle}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .polaroid-canvas-viewport {
          background: #eef2f5;
          padding: 30px;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
