import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sliders, RefreshCw, Crop, Type, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FilterPreset {
  id: string;
  nameVi: string;
  nameEn: string;
  category: 'japan' | 'korea' | 'hk' | 'western' | 'mono';
  lut: { r: number; g: number; b: number; contrast?: number; saturation?: number };
}

export const GrainTool: React.FC = () => {
  const { lang } = useLanguage();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  
  // Crop states
  const [cropRatio, setCropRatio] = useState<string>('none'); // none, 1:1, 4:3, 3:4
  const [cropOffset, setCropOffset] = useState<number>(50); // 0 - 100

  // Filter & Grain states
  const [selectedPreset, setSelectedPreset] = useState<string>('none');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [grainIntensity, setGrainIntensity] = useState<number>(30); // 0-100
  const [grainSize, setGrainSize] = useState<number>(2); // 1-4

  // Text Overlay states
  const [enableTextOverlay, setEnableTextOverlay] = useState<boolean>(false);
  const [textOverlayValue, setTextOverlayValue] = useState<string>('');
  const [textOverlayColor, setTextOverlayColor] = useState<'white' | 'black'>('white');
  const [textOverlaySize, setTextOverlaySize] = useState<number>(6); // 3-15% of width
  const [textOverlayPosition, setTextOverlayPosition] = useState<'top' | 'center' | 'bottom'>('bottom');

  // Polaroid Frame states
  const [enablePolaroid, setEnablePolaroid] = useState<boolean>(false);
  const [polaroidCaption, setPolaroidCaption] = useState<string>('');
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const presets: FilterPreset[] = [
    // Japan
    { id: 'fuji_astia', nameVi: 'Fuji Astia (Trong trẻo)', nameEn: 'Fuji Astia', category: 'japan', lut: { r: 0.95, g: 1.05, b: 1.0, contrast: 1.02 } },
    { id: 'kyoto_summer', nameVi: 'Kyoto Summer (Ấm nhẹ)', nameEn: 'Kyoto Summer', category: 'japan', lut: { r: 1.02, g: 1.04, b: 0.94, contrast: 1.05 } },
    { id: 'tokyo_nostalgia', nameVi: 'Tokyo Nostalgia (Hoài niệm)', nameEn: 'Tokyo Nostalgia', category: 'japan', lut: { r: 0.98, g: 1.02, b: 0.9, contrast: 0.98 } },
    // Korea
    { id: 'seoul_milk', nameVi: 'Seoul Milk (Pastel ngọt)', nameEn: 'Seoul Milk', category: 'korea', lut: { r: 1.05, g: 1.04, b: 1.1, contrast: 0.92, saturation: 1.05 } },
    { id: 'jeju_coral', nameVi: 'Jeju Coral (San hô)', nameEn: 'Jeju Coral', category: 'korea', lut: { r: 1.12, g: 1.0, b: 0.98, contrast: 0.95 } },
    // HK
    { id: 'wong_kar_wai', nameVi: 'Wong Kar-wai (Phim HK)', nameEn: 'Wong Kar-wai', category: 'hk', lut: { r: 1.15, g: 1.08, b: 0.78, contrast: 1.15 } },
    { id: 'hk_street', nameVi: 'HK Neon (Đêm đỏ)', nameEn: 'HK Neon', category: 'hk', lut: { r: 0.88, g: 1.1, b: 1.15, contrast: 1.1 } },
    // Western
    { id: 'kodak_gold', nameVi: 'Kodak Gold (Phim Mỹ)', nameEn: 'Kodak Gold', category: 'western', lut: { r: 1.18, g: 1.02, b: 0.82, contrast: 1.08 } },
    { id: 'la_sunset', nameVi: 'LA Sunset (Hoàng hôn)', nameEn: 'LA Sunset', category: 'western', lut: { r: 1.25, g: 0.92, b: 0.8, contrast: 1.04 } },
    // Mono
    { id: 'noir_classic', nameVi: 'Noir (Cổ điển B&W)', nameEn: 'Noir Classic', category: 'mono', lut: { r: 1, g: 1, b: 1, saturation: 0, contrast: 1.18 } },
    { id: 'silver_gelatin', nameVi: 'Silver Gelatin (Hạt bạc)', nameEn: 'Silver Gelatin', category: 'mono', lut: { r: 0.95, g: 0.95, b: 0.95, saturation: 0, contrast: 1.05 } }
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
      setImageSrc(event.target?.result as string);
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

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setImageSrc(null);
    setImageName('');
    setSelectedPreset('none');
    setCropRatio('none');
    setCropOffset(50);
    setEnableTextOverlay(false);
    setTextOverlayValue('');
    setEnablePolaroid(false);
    setPolaroidCaption('');
  };

  // Process crop, filters, text & grain on canvas
  const applyFilters = () => {
    const canvas = canvasRef.current;
    const img = sourceImageRef.current;
    if (!canvas || !img) return;

    setIsProcessing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;
    
    // 1. Calculate Crop Box Source dimensions
    let sx = 0;
    let sy = 0;
    let sw = origWidth;
    let sh = origHeight;

    if (cropRatio !== 'none') {
      let targetAspect = 1;
      if (cropRatio === '1:1') targetAspect = 1;
      else if (cropRatio === '4:3') targetAspect = 4 / 3;
      else if (cropRatio === '3:4') targetAspect = 3 / 4;

      const currentAspect = origWidth / origHeight;

      if (currentAspect > targetAspect) {
        // Source is wider than crop box
        sw = Math.round(origHeight * targetAspect);
        sh = origHeight;
        const maxOffset = origWidth - sw;
        sx = Math.round(maxOffset * (cropOffset / 100));
        sy = 0;
      } else {
        // Source is taller than crop box
        sw = origWidth;
        sh = Math.round(origWidth / targetAspect);
        const maxOffset = origHeight - sh;
        sx = 0;
        sy = Math.round(maxOffset * (cropOffset / 100));
      }
    }

    const drawWidth = sw;
    const drawHeight = sh;
    let startX = 0;
    let startY = 0;

    // 2. Set Canvas Size (Polaroid frames add margins around cropped aspect)
    if (enablePolaroid) {
      const padX = Math.round(drawWidth * 0.08);
      const padYTop = Math.round(drawHeight * 0.08);
      const padYBottom = Math.round(drawHeight * 0.23);
      
      canvas.width = drawWidth + padX * 2;
      canvas.height = drawHeight + padYTop + padYBottom;
      
      // Polaroid cream background
      ctx.fillStyle = '#FAFAF9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Shadow behind the photo slot
      ctx.shadowColor = 'rgba(0, 0, 0, 0.07)';
      ctx.shadowBlur = Math.round(drawWidth * 0.02);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.round(drawWidth * 0.01);
      
      ctx.fillStyle = '#18181B';
      ctx.fillRect(padX, padYTop, drawWidth, drawHeight);
      ctx.shadowColor = 'transparent'; // reset shadow
      
      startX = padX;
      startY = padYTop;
    } else {
      canvas.width = drawWidth;
      canvas.height = drawHeight;
    }

    // 3. Draw Cropped Base Image
    ctx.drawImage(img, sx, sy, sw, sh, startX, startY, drawWidth, drawHeight);

    // 4. LUT Preset Filter
    try {
      const imgData = ctx.getImageData(startX, startY, drawWidth, drawHeight);
      const data = imgData.data;
      const len = data.length;

      const preset = presets.find(p => p.id === selectedPreset);
      const rF = preset?.lut.r ?? 1;
      const gF = preset?.lut.g ?? 1;
      const bF = preset?.lut.b ?? 1;
      const contrast = preset?.lut.contrast;
      const saturation = preset?.lut.saturation;

      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        r = r * rF;
        g = g * gF;
        b = b * bF;

        if (saturation === 0) {
          const grayscale = 0.3 * r + 0.59 * g + 0.11 * b;
          r = grayscale;
          g = grayscale;
          b = grayscale;
        }

        if (contrast !== undefined) {
          r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
          g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
          b = ((b / 255 - 0.5) * contrast + 0.5) * 255;
        }

        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }
      ctx.putImageData(imgData, startX, startY);
    } catch (e) {
      console.error("Filter calculation error:", e);
    }

    // 5. Film Grain Noise
    if (grainIntensity > 0) {
      const grainCanvas = document.createElement('canvas');
      const gCtx = grainCanvas.getContext('2d');
      if (gCtx) {
        const patternSize = 128;
        grainCanvas.width = patternSize;
        grainCanvas.height = patternSize;

        const grainImgData = gCtx.createImageData(patternSize, patternSize);
        const gData = grainImgData.data;
        const gLen = gData.length;

        for (let i = 0; i < gLen; i += 4) {
          const value = Math.floor(Math.random() * 255);
          gData[i] = value;
          gData[i + 1] = value;
          gData[i + 2] = value;
          gData[i + 3] = (grainIntensity / 100) * 25; // max alpha ~25
        }
        gCtx.putImageData(grainImgData, 0, 0);

        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        
        const pattern = ctx.createPattern(grainCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          const matrix = new DOMMatrix().scaleSelf(grainSize, grainSize);
          pattern.setTransform(matrix);
          ctx.fillRect(startX, startY, drawWidth, drawHeight);
        }
        ctx.restore();
      }
    }

    // 6. Draw Direct Text Overlay on Image
    if (enableTextOverlay && textOverlayValue.trim()) {
      ctx.save();
      ctx.fillStyle = textOverlayColor === 'white' ? '#FFFFFF' : '#000000';
      
      // Shadow helper for text readability
      if (textOverlayColor === 'white') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = Math.round(drawWidth * 0.012);
      } else {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = Math.round(drawWidth * 0.012);
      }
      
      const fontSize = Math.max(14, Math.round(drawWidth * (textOverlaySize / 100)));
      ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      
      const textX = startX + drawWidth / 2;
      let textY = startY + drawHeight / 2;
      
      if (textOverlayPosition === 'top') {
        textY = startY + Math.round(drawHeight * 0.12);
      } else if (textOverlayPosition === 'bottom') {
        textY = startY + drawHeight - Math.round(drawHeight * 0.12);
      }
      
      ctx.fillText(textOverlayValue, textX, textY, drawWidth - 40);
      ctx.restore();
    }

    // 7. Draw Polaroid styling & handwritten caption
    if (enablePolaroid) {
      // Photo slot border overlay
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = Math.max(1, Math.round(drawWidth * 0.002));
      ctx.strokeRect(startX, startY, drawWidth, drawHeight);
      
      // Text Caption at spacer
      if (polaroidCaption.trim()) {
        ctx.fillStyle = '#27272A';
        const fontSize = Math.max(16, Math.round(drawWidth * 0.052));
        ctx.font = `normal ${fontSize}px "Caveat", "Outfit", "Comic Sans MS", cursive`;
        ctx.textAlign = 'center';
        const textX = canvas.width / 2;
        const textY = canvas.height - Math.round(drawHeight * 0.23 * 0.45);
        ctx.fillText(polaroidCaption, textX, textY, canvas.width - startX * 2);
      }
    }

    setIsProcessing(false);
  };

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        applyFilters();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    imageSrc, selectedPreset, grainIntensity, grainSize, 
    enablePolaroid, polaroidCaption, cropRatio, cropOffset, 
    enableTextOverlay, textOverlayValue, textOverlayColor, 
    textOverlaySize, textOverlayPosition
  ]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `percylab-grain-${imageName || 'edited'}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const filteredPresets = activeCategory === 'all' 
    ? presets 
    : presets.filter(p => p.category === activeCategory);

  const displayPresets = [
    { id: 'none', nameVi: 'Mộc (Raw)', nameEn: 'None (Raw)', category: 'all', lut: { r: 1, g: 1, b: 1 } },
    ...filteredPresets
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">grain</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi' ? 'Biên tập hình ảnh hoài cổ bằng các bộ lọc dải màu điện ảnh (LUTs) kết hợp hiệu ứng nhiễu hạt phim (Film Grain) ấm áp.' : 'Web film-grade editor adding artistic color LUT overlays and organic analog film grain noises to digital photos.'}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left Side: Upload zone and Canvas Preview */}
        <div className="tool-card glass animate-fade">
          {!imageSrc ? (
            <div 
              className="dropzone" 
              onClick={triggerUpload}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
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
              <h3 style={{ fontWeight: 700 }}>{lang === 'vi' ? 'Tải ảnh của bạn lên đây' : 'Upload your photo here'}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{lang === 'vi' ? 'Kéo thả ảnh hoặc nhấp để duyệt ảnh' : 'Drag & drop image or click to browse'}</p>
              <span className="file-hint">{lang === 'vi' ? 'Định dạng hỗ trợ: JPG, PNG, WEBP' : 'Supported formats: JPG, PNG, WEBP'}</span>
            </div>
          ) : (
            <div className="uploader-preview-area">
              <div className="preview-header">
                <span className="file-info-title">{lang === 'vi' ? 'Xem trước kết quả' : 'Processed Preview'}</span>
                <button onClick={clearImage} className="btn-clear">{lang === 'vi' ? 'Đổi ảnh khác' : 'Change photo'}</button>
              </div>

              {/* Hidden reference img */}
              <img 
                ref={sourceImageRef}
                src={imageSrc} 
                alt="Source reference" 
                style={{ display: 'none' }} 
                onLoad={() => applyFilters()}
              />

              {/* Live Canvas View */}
              <div className="canvas-wrapper">
                <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}></canvas>
              </div>

              {/* Download Action */}
              <button 
                onClick={downloadImage}
                className="btn btn-primary btn-generate"
                style={{ marginTop: 20 }}
                disabled={isProcessing}
              >
                <Download size={18} />
                <span>{lang === 'vi' ? 'Tải ảnh lưu trữ' : 'Download Photo'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Configurations Sidebar */}
        <div className="tool-card glass controllers-card animate-fade">
          <h3 className="section-title">{lang === 'vi' ? 'Bộ lọc & Nhiễu' : 'Filter & Grain'}</h3>
          <p className="section-subtitle">{lang === 'vi' ? 'Cắt ảnh, áp bộ lọc màu và thêm khung Polaroid' : 'Crop, apply filters, and make Polaroid cards'}</p>

          {/* STEP 1: Crop Image */}
          <div className="form-group" style={{ marginTop: 16, borderBottom: '1px dashed var(--card-border)', paddingBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <Crop size={14} style={{ color: 'var(--accent)' }} />
              {lang === 'vi' ? '1. Cắt tỷ lệ ảnh (Crop)' : '1. Crop Dimensions'}
            </label>
            
            <div className="tab-switch-row" style={{ marginTop: 8 }}>
              {['none', '1:1', '4:3', '3:4'].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setCropRatio(ratio)}
                  disabled={!imageSrc}
                  className={`tab-switch-btn ${cropRatio === ratio ? 'active' : ''}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  {ratio === 'none' && (lang === 'vi' ? 'Gốc' : 'Original')}
                  {ratio === '1:1' && '1:1'}
                  {ratio === '4:3' && '4:3'}
                  {ratio === '3:4' && '3:4'}
                </button>
              ))}
            </div>

            {cropRatio !== 'none' && (
              <div style={{ marginTop: 12 }} className="animate-fade">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{lang === 'vi' ? 'Căn lề cắt dọc/ngang' : 'Crop Position Offset'}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{cropOffset}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={cropOffset}
                  onChange={(e) => setCropOffset(parseInt(e.target.value))}
                  disabled={!imageSrc}
                  className="slider-input"
                  style={{ width: '100%', marginTop: 6 }}
                />
              </div>
            )}
          </div>

          {/* STEP 2: Filters */}
          <div className="form-group" style={{ marginTop: 16, borderBottom: '1px dashed var(--card-border)', paddingBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <ImageIcon size={14} style={{ color: 'var(--accent)' }} />
              {lang === 'vi' ? '2. Bộ lọc dải màu (LUTs)' : '2. LUT Preset Filters'}
            </label>
            
            <div className="tab-switch-row" style={{ marginTop: 8, marginBottom: 8 }}>
              {['all', 'japan', 'korea', 'hk', 'western', 'mono'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedPreset('none');
                  }}
                  disabled={!imageSrc}
                  className={`tab-switch-btn ${activeCategory === cat ? 'active' : ''}`}
                  style={{ padding: '6px 2px', fontSize: '0.72rem' }}
                >
                  {cat === 'all' && (lang === 'vi' ? 'Tất cả' : 'All')}
                  {cat === 'japan' && (lang === 'vi' ? 'Nhật' : 'Japan')}
                  {cat === 'korea' && (lang === 'vi' ? 'Hàn' : 'Korea')}
                  {cat === 'hk' && (lang === 'vi' ? 'HK' : 'HK')}
                  {cat === 'western' && (lang === 'vi' ? 'Âu Mỹ' : 'Western')}
                  {cat === 'mono' && (lang === 'vi' ? 'B&W' : 'B&W')}
                </button>
              ))}
            </div>

            <div className="presets-list-grid">
              {displayPresets.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreset(p.id)}
                  className={`preset-btn glass ${selectedPreset === p.id ? 'active' : ''}`}
                  disabled={!imageSrc}
                >
                  <span className="preset-btn-name">{lang === 'vi' ? p.nameVi : p.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Grain & Text Overlay */}
          <div className="form-group" style={{ marginTop: 16, borderBottom: '1px dashed var(--card-border)', paddingBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
              <Sliders size={14} style={{ color: 'var(--accent)' }} />
              {lang === 'vi' ? '3. Nhiễu hạt & Chữ đè' : '3. Grain & Text Overlay'}
            </label>

            {/* Grain Intensity */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{lang === 'vi' ? 'Mật độ hạt phim' : 'Grain Intensity'}</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{grainIntensity}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={grainIntensity} 
                onChange={(e) => setGrainIntensity(parseInt(e.target.value))}
                disabled={!imageSrc}
                className="slider-input"
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>

            {/* Grain Size Selector */}
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{lang === 'vi' ? 'Kích thước hạt' : 'Grain Size'}</span>
              <div className="tab-switch-row" style={{ marginTop: 4 }}>
                {[1, 2, 3, 4].map(size => (
                  <button 
                    key={size}
                    onClick={() => setGrainSize(size)}
                    disabled={!imageSrc}
                    className={`tab-switch-btn ${grainSize === size ? 'active' : ''}`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            {/* Text Overlay Option */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={enableTextOverlay}
                  onChange={(e) => setEnableTextOverlay(e.target.checked)}
                  disabled={!imageSrc}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 700 }}><Type size={12} style={{ display: 'inline', marginRight: 4 }} />{lang === 'vi' ? 'Chèn chữ đè lên ảnh' : 'Overlay text on photo'}</span>
              </label>

              {enableTextOverlay && (
                <div style={{ marginTop: 10 }} className="animate-fade">
                  <input 
                    type="text"
                    value={textOverlayValue}
                    onChange={(e) => setTextOverlayValue(e.target.value)}
                    placeholder={lang === 'vi' ? 'Nhập chữ đè lên ảnh...' : 'Type text overlay...'}
                    disabled={!imageSrc}
                    className="form-input"
                    style={{ width: '100%' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lang === 'vi' ? 'Màu chữ' : 'Color'}</span>
                      <div className="tab-switch-row" style={{ marginTop: 2 }}>
                        {(['white', 'black'] as const).map(color => (
                          <button
                            key={color}
                            onClick={() => setTextOverlayColor(color)}
                            className={`tab-switch-btn ${textOverlayColor === color ? 'active' : ''}`}
                            style={{ fontSize: '0.72rem', padding: '4px' }}
                          >
                            {color === 'white' ? (lang === 'vi' ? 'Trắng' : 'White') : (lang === 'vi' ? 'Đen' : 'Black')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lang === 'vi' ? 'Vị trí' : 'Position'}</span>
                      <div className="tab-switch-row" style={{ marginTop: 2 }}>
                        {(['top', 'center', 'bottom'] as const).map(pos => (
                          <button
                            key={pos}
                            onClick={() => setTextOverlayPosition(pos)}
                            className={`tab-switch-btn ${textOverlayPosition === pos ? 'active' : ''}`}
                            style={{ fontSize: '0.72rem', padding: '4px' }}
                          >
                            {pos === 'top' && (lang === 'vi' ? 'Trên' : 'Top')}
                            {pos === 'center' && (lang === 'vi' ? 'Giữa' : 'Mid')}
                            {pos === 'bottom' && (lang === 'vi' ? 'Dưới' : 'Btm')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>{lang === 'vi' ? 'Cỡ chữ' : 'Font Size'}</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{textOverlaySize}%</span>
                    </div>
                    <input 
                      type="range"
                      min="3"
                      max="15"
                      value={textOverlaySize}
                      onChange={(e) => setTextOverlaySize(parseInt(e.target.value))}
                      className="slider-input"
                      style={{ width: '100%', marginTop: 2 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 4: Polaroid Frame */}
          <div className="form-group" style={{ marginTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={enablePolaroid}
                onChange={(e) => setEnablePolaroid(e.target.checked)}
                disabled={!imageSrc}
                style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <span>{lang === 'vi' ? '4. Lồng khung Polaroid' : '4. Apply Polaroid Frame'}</span>
            </label>
            
            {enablePolaroid && (
              <div style={{ marginTop: 12 }} className="animate-fade">
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {lang === 'vi' ? 'Ghi chú chữ tay dưới viền khung' : 'Handwritten Photo Caption (on Frame)'}
                </label>
                <input 
                  type="text"
                  value={polaroidCaption}
                  onChange={(e) => setPolaroidCaption(e.target.value)}
                  placeholder={lang === 'vi' ? 'Kỷ niệm mùa hè 2026...' : 'e.g. Summer memories 2026...'}
                  disabled={!imageSrc}
                  className="form-input"
                  style={{ marginTop: 6, width: '100%', fontStyle: 'italic' }}
                  maxLength={40}
                />
              </div>
            )}
          </div>

          {/* Manual Refresher helper */}
          {imageSrc && (
            <button 
              onClick={applyFilters} 
              className="btn btn-secondary"
              style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}
            >
              <RefreshCw size={14} />
              <span>{lang === 'vi' ? 'Làm mới canvas' : 'Re-render Canvas'}</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .btn-clear {
          background: transparent;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition-bounce);
        }
        .btn-clear:hover {
          background: var(--accent-light);
        }

        .tab-switch-row {
          display: flex;
          background: rgba(46, 125, 96, 0.05);
          border: 1px solid rgba(46, 125, 96, 0.08);
          padding: 4px;
          border-radius: var(--radius-sm);
          gap: 4px;
          margin-top: 8px;
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

        .tab-switch-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .presets-list-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 8px;
        }

        .preset-btn {
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--card-border);
          cursor: pointer;
          font-weight: 700;
          font-size: 0.8rem;
          transition: var(--transition-bounce);
          text-align: center;
        }

        .preset-btn.active {
          background: var(--accent-light);
          border-color: var(--accent);
          color: var(--accent);
        }

        .preset-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .canvas-wrapper {
          border: 1px solid var(--card-border);
          background: #ffffff;
          padding: 12px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          margin-bottom: 16px;
        }

        .slider-input {
          accent-color: var(--accent);
        }
      `}</style>
    </div>
  );
};
