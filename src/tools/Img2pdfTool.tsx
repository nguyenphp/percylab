import React, { useState, useRef } from 'react';
import { Upload, ArrowUp, ArrowDown, Trash2, FileText, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useLanguage } from '../context/LanguageContext';

interface UploadedImage {
  id: string;
  name: string;
  src: string;
  size: number;
}

export const Img2pdfTool: React.FC = () => {
  const { lang } = useLanguage();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(10); // in px
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [pdfName, setPdfName] = useState<string>('percylab-compiled');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      loadFiles(Array.from(files));
    }
  };

  const loadFiles = (fileList: File[]) => {
    const validImageFiles = fileList.filter(f => f.type.startsWith('image/'));
    
    validImageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            src: event.target?.result as string,
            size: file.size
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      loadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const clearAll = () => {
    setImages([]);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(10);

    try {
      const pageSpecs = {
        a4: { w: 595.28, h: 841.89 },
        letter: { w: 612, h: 792 }
      };

      let doc: jsPDF | null = null;
      const totalImages = images.length;

      for (let i = 0; i < totalImages; i++) {
        const item = images[i];
        
        const img = new Image();
        img.src = item.src;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;

        let pageWidth = 0;
        let pageHeight = 0;

        if (pageSize === 'fit') {
          pageWidth = originalWidth + margin * 2;
          pageHeight = originalHeight + margin * 2;
        } else {
          const spec = pageSpecs[pageSize];
          pageWidth = orientation === 'portrait' ? spec.w : spec.h;
          pageHeight = orientation === 'portrait' ? spec.h : spec.w;
        }

        if (i === 0) {
          doc = new jsPDF({
            orientation: orientation,
            unit: 'pt',
            format: [pageWidth, pageHeight]
          });
        } else if (doc) {
          doc.addPage([pageWidth, pageHeight], orientation);
        }

        if (doc) {
          const maxWidth = pageWidth - margin * 2;
          const maxHeight = pageHeight - margin * 2;

          let targetWidth = 0;
          let targetHeight = 0;

          const ratio = originalWidth / originalHeight;
          if (maxWidth / maxHeight < ratio) {
            targetWidth = maxWidth;
            targetHeight = maxWidth / ratio;
          } else {
            targetHeight = maxHeight;
            targetWidth = maxHeight * ratio;
          }

          const x = margin + (maxWidth - targetWidth) / 2;
          const y = margin + (maxHeight - targetHeight) / 2;

          const imgType = item.name.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';
          doc.addImage(item.src, imgType, x, y, targetWidth, targetHeight, undefined, 'FAST');
        }

        setProgress(Math.round(10 + (i / totalImages) * 80));
      }

      setProgress(95);
      if (doc) {
        doc.save(`${pdfName || 'percylab-compiled'}.pdf`);
      }
      
      setProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 1000);

    } catch (err) {
      console.error(err);
      alert(lang === 'vi' ? 'Đã xảy ra lỗi khi tạo tệp PDF' : 'An error occurred while building the PDF');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">img2pdf</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi' ? 'Ghép nhanh nhiều tệp hình ảnh thành một file tài liệu PDF trực tuyến duy nhất. Tùy chọn căn chỉnh lề, hướng xoay và thứ tự tùy ý.' : 'Compile multiple image files into a single online PDF document quickly. Set custom margins, orientations, and custom page order.'}
        </p>
      </div>

      <div className="tool-grid">
        <div className="tool-card glass animate-fade" style={{ display: 'flex', flexDirection: 'column' }}>
          {!images.length ? (
            <div 
              className="dropzone" 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{ minHeight: '320px', justifyContent: 'center', flex: 1 }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              <div className="upload-circle">
                <Upload size={32} />
              </div>
              <h3 style={{ fontWeight: 700 }}>{lang === 'vi' ? 'Tải các ảnh lên đây' : 'Upload your images here'}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{lang === 'vi' ? 'Kéo thả nhiều ảnh hoặc nhấp để chọn tệp' : 'Drag & drop multiple images or click to select'}</p>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>{lang === 'vi' ? 'Hỗ trợ: PNG, JPG, WEBP, v.v.' : 'Supports: PNG, JPG, WEBP, etc.'}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
              <div className="preview-header" style={{ marginBottom: 12 }}>
                <span className="file-info-title">
                  {lang === 'vi' ? `Đã tải ${images.length} hình ảnh` : `Uploaded ${images.length} images`}
                </span>
                <button onClick={clearAll} className="btn-clear">{lang === 'vi' ? 'Xóa toàn bộ' : 'Clear all'}</button>
              </div>

              <div className="pdf-images-list">
                {images.map((img, index) => (
                  <div key={img.id} className="pdf-image-item glass">
                    <span className="pdf-order-badge">{index + 1}</span>
                    <div className="pdf-thumbnail">
                      <img src={img.src} alt={img.name} />
                    </div>
                    <div className="pdf-file-details">
                      <span className="pdf-file-name">{img.name}</span>
                      <span className="pdf-file-size">{formatBytes(img.size)}</span>
                    </div>
                    <div className="pdf-item-actions">
                      <button 
                        onClick={() => moveUp(index)} 
                        disabled={index === 0} 
                        className="btn-order-arrow"
                        title={lang === 'vi' ? 'Di chuyển lên' : 'Move up'}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button 
                        onClick={() => moveDown(index)} 
                        disabled={index === images.length - 1} 
                        className="btn-order-arrow"
                        title={lang === 'vi' ? 'Di chuyển xuống' : 'Move down'}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button 
                        onClick={() => removeImage(img.id)} 
                        className="btn-delete-item"
                        title={lang === 'vi' ? 'Xóa ảnh' : 'Remove image'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="btn btn-secondary" 
                style={{ marginTop: 12 }}
              >
                <Upload size={14} />
                <span>{lang === 'vi' ? 'Thêm hình ảnh khác' : 'Add more images'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="tool-card glass controllers-card animate-fade">
          <h3 className="section-title">{lang === 'vi' ? 'Tùy chỉnh PDF' : 'PDF Configurations'}</h3>
          <p className="section-subtitle">{lang === 'vi' ? 'Thiết lập định dạng trang tài liệu xuất bản' : 'Set up output page format parameters'}</p>

          <div className="form-group">
            <label>{lang === 'vi' ? 'Tên File xuất bản (.pdf)' : 'Output File Name (.pdf)'}</label>
            <input 
              type="text" 
              value={pdfName} 
              onChange={(e) => setPdfName(e.target.value)}
              className="form-input"
              placeholder="percylab-compiled"
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label>{lang === 'vi' ? 'Khổ giấy' : 'Page Size'}</label>
            <div className="tab-switch-row">
              <button 
                onClick={() => setPageSize('a4')}
                className={`tab-switch-btn ${pageSize === 'a4' ? 'active' : ''}`}
              >
                A4 (595x841pt)
              </button>
              <button 
                onClick={() => setPageSize('letter')}
                className={`tab-switch-btn ${pageSize === 'letter' ? 'active' : ''}`}
              >
                Letter (612x792pt)
              </button>
              <button 
                onClick={() => setPageSize('fit')}
                className={`tab-switch-btn ${pageSize === 'fit' ? 'active' : ''}`}
                title={lang === 'vi' ? 'Cắt trang khít khao kích thước ảnh gốc' : 'Fit page sizes to original image dimensions'}
              >
                {lang === 'vi' ? 'Khít ảnh (Fit)' : 'Auto Fit'}
              </button>
            </div>
          </div>

          {pageSize !== 'fit' && (
            <div className="form-group">
              <label>{lang === 'vi' ? 'Hướng xoay' : 'Orientation'}</label>
              <div className="tab-switch-row">
                <button 
                  onClick={() => setOrientation('portrait')}
                  className={`tab-switch-btn ${orientation === 'portrait' ? 'active' : ''}`}
                >
                  {lang === 'vi' ? 'Dọc (Portrait)' : 'Portrait'}
                </button>
                <button 
                  onClick={() => setOrientation('landscape')}
                  className={`tab-switch-btn ${orientation === 'landscape' ? 'active' : ''}`}
                >
                  {lang === 'vi' ? 'Ngang (Landscape)' : 'Landscape'}
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>{lang === 'vi' ? 'Căn lề hình ảnh' : 'Page Margins'}</label>
            <div className="tab-switch-row">
              <button 
                onClick={() => setMargin(0)}
                className={`tab-switch-btn ${margin === 0 ? 'active' : ''}`}
              >
                {lang === 'vi' ? 'Không có (0px)' : 'None (0px)'}
              </button>
              <button 
                onClick={() => setMargin(15)}
                className={`tab-switch-btn ${margin === 15 ? 'active' : ''}`}
              >
                {lang === 'vi' ? 'Nhỏ (15px)' : 'Small (15px)'}
              </button>
              <button 
                onClick={() => setMargin(30)}
                className={`tab-switch-btn ${margin === 30 ? 'active' : ''}`}
              >
                {lang === 'vi' ? 'Vừa (30px)' : 'Medium (30px)'}
              </button>
            </div>
          </div>

          <button 
            onClick={generatePDF} 
            disabled={images.length === 0 || isProcessing} 
            className="btn btn-primary btn-generate"
            style={{ marginTop: 24 }}
          >
            {isProcessing ? (
              <>
                <div className="spinner"></div>
                <span>{lang === 'vi' ? `Đang xuất bản (${progress}%)` : `Exporting (${progress}%)`}</span>
              </>
            ) : (
              <>
                <FileText size={18} />
                <span>{lang === 'vi' ? 'Tải tệp PDF ghép' : 'Download Compiled PDF'}</span>
              </>
            )}
          </button>

          {isProcessing && (
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          )}

          {images.length === 0 && (
            <div className="info-box-pastel" style={{ marginTop: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
              <AlertCircle size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {lang === 'vi' ? 'Tải ít nhất 1 ảnh ở cột bên trái để bắt đầu cấu hình PDF.' : 'Upload at least 1 image on the left card to start compiling.'}
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .pdf-images-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 360px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .pdf-image-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--card-border);
          background: var(--bg-cream);
        }

        .pdf-order-badge {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 0.82rem;
          color: var(--accent);
          background: var(--accent-light);
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pdf-thumbnail {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pdf-thumbnail img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .pdf-file-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
          text-align: left;
        }

        .pdf-file-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pdf-file-size {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .pdf-item-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-order-arrow {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: var(--transition-smooth);
        }

        .btn-order-arrow:hover:not(:disabled) {
          color: var(--accent);
          background: var(--accent-light);
        }

        .btn-order-arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .btn-delete-item {
          background: transparent;
          border: none;
          color: #EF4444;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: var(--transition-smooth);
        }

        .btn-delete-item:hover {
          background: rgba(239, 68, 68, 0.08);
        }
      `}</style>
    </div>
  );
};
