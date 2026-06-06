import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, RefreshCw, Scissors } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type Stage = 'idle' | 'loading' | 'done' | 'error';

export const BgRemoveTool: React.FC = () => {
  const { lang } = useLanguage();
  const [stage, setStage] = useState<Stage>('idle');
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setFileName(file.name.replace(/\.[^.]+$/, ''));
    setStage('loading');
    setProgress(10);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => setOriginalSrc(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      setProgress(40);

      const blob = await removeBackground(file, {
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round(40 + (current / total) * 55);
            setProgress(Math.min(pct, 95));
          }
        },
      });

      setProgress(100);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStage('done');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unknown error');
      setStage('error');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setStage('idle');
    setOriginalSrc(null);
    setResultUrl(null);
    setFileName('');
    setProgress(0);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${fileName || 'image'}-nobg.png`;
    a.click();
  };

  const vi = lang === 'vi';

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">
          {vi ? 'bgremove' : 'bgremove'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {vi
            ? 'Xóa nền ảnh tự động ngay trên trình duyệt — không cần API key, không upload lên server.'
            : 'Remove image backgrounds instantly in-browser — no API key, no server upload.'}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left: Upload / Original */}
        <div className="tool-card glass animate-fade">
          {!originalSrc ? (
            <div
              className="dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              style={{ minHeight: 260, justifyContent: 'center' }}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="upload-circle">
                <Upload size={32} />
              </div>
              <h3 style={{ fontWeight: 700 }}>
                {vi ? 'Chọn ảnh' : 'Choose Image'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {vi ? 'kéo thả hoặc nhấp để duyệt' : 'drag & drop or click to browse'}
              </p>
            </div>
          ) : (
            <div className="preview-stack">
              <div className="preview-label">
                <Scissors size={14} />
                <span>{vi ? 'Ảnh gốc' : 'Original'}</span>
                <button className="btn-clear" onClick={handleReset}>
                  {vi ? 'Làm lại' : 'Reset'}
                </button>
              </div>
              <div className="bgr-preview-box checkerboard">
                <img src={originalSrc} alt="original" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Result */}
        <div className="tool-card glass animate-fade" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="section-title">{vi ? 'Kết quả' : 'Result'}</h3>
          <p className="section-subtitle">
            {vi ? 'Ảnh đã xóa nền, sẵn sàng tải xuống' : 'Background removed, ready to download'}
          </p>

          {stage === 'idle' && (
            <div className="empty-results-box">
              <Scissors size={36} style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
              <p>{vi ? 'Tải ảnh lên để bắt đầu xóa nền.' : 'Upload an image to start removing the background.'}</p>
            </div>
          )}

          {stage === 'loading' && (
            <div className="empty-results-box" style={{ gap: 20 }}>
              <div className="bgr-spinner" />
              <p style={{ fontWeight: 600 }}>
                {vi ? 'Đang xử lý AI...' : 'Processing with AI...'}
              </p>
              <div className="bgr-progress-track">
                <div className="bgr-progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {vi
                  ? 'Lần đầu chạy sẽ tải model AI (~50MB), sau đó cache lại.'
                  : 'First run downloads the AI model (~50MB), then cached.'}
              </p>
            </div>
          )}

          {stage === 'error' && (
            <div className="empty-results-box">
              <div className="error-message-box" style={{ width: '100%' }}>
                {errorMsg}
              </div>
              <button className="btn btn-primary" onClick={handleReset}>
                <RefreshCw size={16} />
                <span>{vi ? 'Thử lại' : 'Try Again'}</span>
              </button>
            </div>
          )}

          {stage === 'done' && resultUrl && (
            <div className="preview-stack" style={{ flex: 1 }}>
              <div className="bgr-preview-box checkerboard" style={{ flex: 1 }}>
                <img src={resultUrl} alt="result" />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleDownload}>
                <Download size={18} />
                <span>{vi ? 'Tải xuống PNG (Không nền)' : 'Download PNG (No Background)'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .bgr-preview-box {
          width: 100%;
          min-height: 200px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bgr-preview-box img {
          max-width: 100%;
          max-height: 280px;
          object-fit: contain;
          display: block;
        }

        .checkerboard {
          background-image:
            linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
            linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
            linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
          background-color: #f5f5f5;
        }

        .preview-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
        }

        .preview-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .preview-label .btn-clear {
          margin-left: auto;
        }

        .bgr-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--accent-light);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: bgr-spin 0.8s linear infinite;
        }

        @keyframes bgr-spin {
          to { transform: rotate(360deg); }
        }

        .bgr-progress-track {
          width: 100%;
          max-width: 240px;
          height: 6px;
          background: var(--accent-light);
          border-radius: 99px;
          overflow: hidden;
        }

        .bgr-progress-bar {
          height: 100%;
          background: var(--accent);
          border-radius: 99px;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
};
