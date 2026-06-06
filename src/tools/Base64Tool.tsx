import React, { useState, useRef } from 'react';
import { Upload, Copy, Check, FileCode, RefreshCw, Download, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Base64Tool: React.FC = () => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  
  // Encoder States
  const [encodeSrc, setEncodeSrc] = useState<string | null>(null);
  const [encodeName, setEncodeName] = useState<string>('');
  const [encodeSize, setEncodeSize] = useState<number>(0);
  const [encodeMime, setEncodeMime] = useState<string>('');
  const [includeHeader, setIncludeHeader] = useState<boolean>(true);
  const [copiedEncode, setCopiedEncode] = useState<boolean>(false);
  
  // Decoder States
  const [decodeInput, setDecodeInput] = useState<string>('');
  const [decodeSrc, setDecodeSrc] = useState<string | null>(null);
  const [decodeMime, setDecodeMime] = useState<string>('');
  const [decodeSize, setDecodeSize] = useState<number>(0);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File helpers
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 1. Encoder Logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFileForEncoding(file);
    }
  };

  const processFileForEncoding = (file: File) => {
    setEncodeName(file.name);
    setEncodeSize(file.size);
    setEncodeMime(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      setEncodeSrc(event.target?.result as string);
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
      processFileForEncoding(file);
    }
  };

  const getBase64Output = (): string => {
    if (!encodeSrc) return '';
    if (includeHeader) return encodeSrc;
    // Strip header (e.g. "data:image/png;base64,")
    const commaIndex = encodeSrc.indexOf(',');
    return commaIndex > -1 ? encodeSrc.substring(commaIndex + 1) : encodeSrc;
  };

  const copyEncodeOutput = () => {
    const output = getBase64Output();
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopiedEncode(true);
    setTimeout(() => setCopiedEncode(false), 1500);
  };

  const clearEncoder = () => {
    setEncodeSrc(null);
    setEncodeName('');
    setEncodeSize(0);
    setEncodeMime('');
  };

  // 2. Decoder Logic
  const handleDecodeInputChange = (val: string) => {
    setDecodeInput(val);
    if (!val.trim()) {
      setDecodeSrc(null);
      setDecodeSize(0);
      setDecodeMime('');
      setDecodeError(null);
      return;
    }

    try {
      let base64String = val.trim();
      let mimeType = 'image/png'; // Fallback MIME

      // Detect header
      if (base64String.startsWith('data:')) {
        const mimeMatch = base64String.match(/data:([^;]+);base64,/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      } else {
        // Synthesize standard header for image tag rendering
        base64String = `data:image/png;base64,${base64String}`;
      }

      // Quick syntax check: verify Base64 format structure
      const rawBase64 = base64String.split(',')[1] || '';
      // Base64 regex check
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(rawBase64.replace(/\s/g, ''))) {
        throw new Error('Chuỗi ký tự không đúng định dạng Base64 hợp lệ.');
      }

      // Calculate file size from base64 string
      const padding = (rawBase64.match(/=/g) || []).length;
      const calculatedSize = Math.round((rawBase64.length * 3) / 4) - padding;

      setDecodeSrc(base64String);
      setDecodeMime(mimeType);
      setDecodeSize(calculatedSize);
      setDecodeError(null);
    } catch (err: any) {
      setDecodeSrc(null);
      setDecodeSize(0);
      setDecodeMime('');
      setDecodeError(err.message || (lang === 'vi' ? 'Chuỗi Base64 không hợp lệ hoặc lỗi phân tích.' : 'Invalid Base64 string or parsing error.'));
    }
  };

  const downloadDecodedImage = () => {
    if (!decodeSrc) return;
    
    // Parse MIME and content
    const parts = decodeSrc.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    const extension = mime.split('/')[1] || 'png';
    const blob = new Blob([u8arr], { type: mime });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `percy-decoded-image.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearDecoder = () => {
    setDecodeInput('');
    setDecodeSrc(null);
    setDecodeSize(0);
    setDecodeMime('');
    setDecodeError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">{t('base64.title')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('base64.desc')}
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="tool-tabs-wrapper">
        <div className="tool-tabs-switch glass">
          <button 
            onClick={() => setActiveTab('encode')}
            className={`tab-btn ${activeTab === 'encode' ? 'active' : ''}`}
          >
            <FileCode size={16} />
            <span>{t('base64.modeEncode')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('decode')}
            className={`tab-btn ${activeTab === 'decode' ? 'active' : ''}`}
          >
            <RefreshCw size={16} />
            <span>{t('base64.modeDecode')}</span>
          </button>
        </div>
      </div>

      <div className="tool-grid">
        {/* ENCODE TAB WORKSPACE */}
        {activeTab === 'encode' && (
          <>
            {/* Left Box: Uploader */}
            <div className="tool-card glass animate-fade">
              {!encodeSrc ? (
                <div 
                  className="dropzone" 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  style={{ minHeight: '260px', justifyContent: 'center' }}
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
                  <h3 style={{ fontWeight: 700 }}>{t('base64.chooseImage')}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{t('base64.dragAndDrop')}</p>
                </div>
              ) : (
                <div className="encoder-preview-stack">
                  <div className="preview-header">
                    <span className="file-info-title">{lang === 'vi' ? 'Ảnh nguồn đã tải' : 'Uploaded source image'}</span>
                    <button onClick={clearEncoder} className="btn-clear">{lang === 'vi' ? 'Xóa ảnh' : 'Remove image'}</button>
                  </div>
                  
                  <div className="preview-image-box" style={{ width: 120, height: 120 }}>
                    <img src={encodeSrc} alt="Base64 encode preview" />
                  </div>

                  <div className="image-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">{lang === 'vi' ? 'Tên tệp:' : 'File name:'}</span>
                      <span className="meta-value">{encodeName}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">{lang === 'vi' ? 'Định dạng (MIME):' : 'Format (MIME):'}</span>
                      <span className="meta-value">{encodeMime}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">{lang === 'vi' ? 'Dung lượng gốc:' : 'Original size:'}</span>
                      <span className="meta-value">{formatBytes(encodeSize)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">{lang === 'vi' ? 'Độ dài chuỗi Base64:' : 'Base64 string length:'}</span>
                      <span className="meta-value">{getBase64Output().length.toLocaleString()} {lang === 'vi' ? 'ký tự' : 'characters'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Box: Base64 String Output */}
            <div className="tool-card glass base64-output-card animate-fade">
              <h3 className="section-title">{t('base64.outputTitle')}</h3>
              <p className="section-subtitle">{t('base64.outputSubtitle')}</p>

              {!encodeSrc ? (
                <div className="empty-results-box">
                  <FileCode size={36} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                  <p>{t('base64.outputPlaceholder')}</p>
                </div>
              ) : (
                <div className="result-controls-stack">
                  {/* Options */}
                  <div className="option-row">
                    <label className="switch-container">
                      <input 
                        type="checkbox" 
                        checked={includeHeader} 
                        onChange={(e) => setIncludeHeader(e.target.checked)} 
                      />
                      <span className="switch-slider"></span>
                    </label>
                    <span className="option-label-text">
                      {lang === 'vi' ? 'Bao gồm header định dạng (ví dụ: ' : 'Include format header (e.g. '}<code>data:image/png;base64,...</code>)
                    </span>
                  </div>

                  {/* Output Textarea */}
                  <textarea 
                    readOnly 
                    value={getBase64Output()} 
                    className="base64-textarea"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  ></textarea>

                  {/* Copy Button */}
                  <button onClick={copyEncodeOutput} className="btn btn-primary">
                    {copiedEncode ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copiedEncode ? (lang === 'vi' ? 'Đã copy chuỗi Base64!' : 'Base64 string copied!') : (lang === 'vi' ? 'Copy chuỗi Base64' : 'Copy Base64 string')}</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* DECODE TAB WORKSPACE */}
        {activeTab === 'decode' && (
          <>
            {/* Left Box: Textarea Input */}
            <div className="tool-card glass animate-fade">
              <h3 className="section-title">{lang === 'vi' ? 'Dán chuỗi Base64 vào đây' : 'Paste Base64 string here'}</h3>
              <p className="section-subtitle">{lang === 'vi' ? 'Chấp nhận chuỗi raw hoặc chuỗi có header' : 'Accepts raw strings or strings with header'}</p>

              <div className="decoder-input-container">
                <textarea 
                  value={decodeInput} 
                  onChange={(e) => handleDecodeInputChange(e.target.value)} 
                  placeholder={lang === 'vi' ? 'Ví dụ: data:image/png;base64,iVBORw0KGgoAAAANSU...' : 'Example: data:image/png;base64,iVBORw0KGgoAAAANSU...'}
                  className="base64-textarea decode-textarea"
                ></textarea>

                {decodeInput && (
                  <button onClick={clearDecoder} className="btn-clear-decode">{lang === 'vi' ? 'Xóa chuỗi' : 'Clear string'}</button>
                )}
              </div>

              {decodeError && (
                <div className="error-message-box">
                  {decodeError}
                </div>
              )}
            </div>

            {/* Right Box: Image preview and download */}
            <div className="tool-card glass base64-output-card animate-fade">
              <h3 className="section-title">{lang === 'vi' ? 'Ảnh kết quả giải mã' : 'Decoded image result'}</h3>
              <p className="section-subtitle">{lang === 'vi' ? 'Xem trước hình ảnh và lưu lại file' : 'Preview image and save file'}</p>

              {!decodeSrc ? (
                <div className="empty-results-box">
                  <ImageIcon size={36} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                  <p>{lang === 'vi' ? 'Vui lòng dán chuỗi Base64 hợp lệ để hiển thị ảnh preview.' : 'Please paste a valid Base64 string to preview the image.'}</p>
                </div>
              ) : (
                <div className="decoder-preview-stack">
                  <div className="preview-image-box" style={{ width: '100%', height: '200px', background: '#f5f5f5', borderStyle: 'dashed' }}>
                    <img src={decodeSrc} alt="Base64 decode output" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                  </div>

                  <div className="image-meta-grid" style={{ marginTop: 20 }}>
                    <div className="meta-item">
                      <span className="meta-label">{lang === 'vi' ? 'Định dạng giải mã:' : 'Decoded format:'}</span>
                      <span className="meta-value">{decodeMime}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">{lang === 'vi' ? 'Dung lượng ước tính:' : 'Estimated size:'}</span>
                      <span className="meta-value">{formatBytes(decodeSize)}</span>
                    </div>
                  </div>

                  <button onClick={downloadDecodedImage} className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
                    <Download size={18} />
                    <span>{lang === 'vi' ? 'Lưu file ảnh (.png/.jpeg)' : 'Save image file (.png/.jpeg)'}</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .tool-tabs-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
        }

        .tool-tabs-switch {
          display: flex;
          padding: 6px;
          border-radius: var(--radius-md);
          gap: 4px;
        }

        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          border: none;
          background: transparent;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background: rgba(46, 125, 96, 0.04);
        }

        .tab-btn.active {
          color: var(--accent);
          background: var(--card-bg);
          box-shadow: 0 4px 12px rgba(46, 125, 96, 0.08);
        }

        .base64-output-card {
          text-align: left;
          display: flex;
          flex-direction: column;
        }

        .empty-results-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: var(--text-secondary);
          font-size: 0.88rem;
          text-align: center;
          padding: 60px 20px;
          gap: 12px;
        }

        .result-controls-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }

        .option-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.88rem;
        }

        .option-label-text {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .option-label-text code {
          background: rgba(46, 125, 96, 0.05);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.78rem;
        }

        .base64-textarea {
          flex: 1;
          width: 100%;
          min-height: 180px;
          border: 1px solid var(--card-border);
          background: rgba(46, 125, 96, 0.02);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          padding: 16px;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          outline: none;
          resize: none;
          line-height: 1.5;
          transition: var(--transition-smooth);
        }

        .base64-textarea:focus {
          border-color: var(--accent);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(46, 125, 96, 0.1);
        }

        /* Switch styles */
        .switch-container {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .switch-container input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .switch-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(46, 125, 96, 0.15);
          transition: .3s;
          border-radius: 24px;
        }

        .switch-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        input:checked + .switch-slider {
          background-color: var(--accent);
        }

        input:checked + .switch-slider:before {
          transform: translateX(20px);
        }

        .decoder-input-container {
          position: relative;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .decode-textarea {
          min-height: 260px;
        }

        .btn-clear-decode {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: var(--bg);
          border: 1px solid var(--card-border);
          color: #EF4444;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .btn-clear-decode:hover {
          background: #EF4444;
          color: white;
          border-color: #EF4444;
          transform: translateY(-1px);
        }

        .error-message-box {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #EF4444;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};
