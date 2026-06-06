import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

const FILTERS = [
  { id: 'none',  label: 'Gốc',  css: 'none' },
  { id: 'film',  label: 'Phim', css: 'sepia(45%) contrast(1.1) saturate(0.85)' },
  { id: 'warm',  label: 'Ấm',   css: 'sepia(25%) saturate(1.5) hue-rotate(-10deg)' },
  { id: 'cool',  label: 'Lạnh', css: 'hue-rotate(185deg) saturate(0.8)' },
  { id: 'bw',    label: 'B&W',  css: 'grayscale(1)' },
  { id: 'fade',  label: 'Mờ',   css: 'brightness(1.15) contrast(0.8) saturate(0.65)' },
  { id: 'vivid', label: 'Đậm',  css: 'saturate(1.9) contrast(1.15)' },
];

const COUNTDOWN_PRESETS = [
  { value: 0,  label: 'Tức thì', labelEn: 'Instant' },
  { value: 3,  label: '3s',      labelEn: '3s' },
  { value: 5,  label: '5s',      labelEn: '5s' },
  { value: 10, label: '10s',     labelEn: '10s' },
];

export const FilterBoothTool: React.FC = () => {
  const { lang } = useLanguage();

  const [filterId, setFilterId]       = useState('none');
  const [countdown, setCountdown]     = useState(3);
  const [capturing, setCapturing]     = useState(false);
  const [cdValue, setCdValue]         = useState<number | null>(null);
  const [isFlashing, setIsFlashing]   = useState(false);
  const [mirrored, setMirrored]       = useState(true);
  const [photos, setPhotos]           = useState<string[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const videoRef      = useRef<HTMLVideoElement>(null);
  const captureCanvas = useRef<HTMLCanvasElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const cancelledRef  = useRef(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraReady(true);
      setCameraError(false);
    } catch {
      setCameraError(true);
      setCameraReady(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      cancelledRef.current = true;
      stopCamera();
    };
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = captureCanvas.current;
    if (!video || !canvas) return null;
    const W = video.videoWidth || 1280;
    const H = video.videoHeight || 720;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const filterCss = FILTERS.find(f => f.id === filterId)?.css ?? 'none';
    ctx.filter = filterCss === 'none' ? '' : filterCss;
    ctx.save();
    if (mirrored) {
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, W, H);
    ctx.restore();
    ctx.filter = '';
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [filterId, mirrored]);

  const handleCapture = async () => {
    if (!cameraReady || capturing) return;
    cancelledRef.current = false;
    setCapturing(true);

    if (countdown === 0) {
      setIsFlashing(true);
      const frame = captureFrame();
      if (frame) setPhotos(prev => [frame, ...prev]);
      await sleep(380);
      setIsFlashing(false);
    } else {
      for (let cd = countdown; cd >= 1; cd--) {
        if (cancelledRef.current) break;
        setCdValue(cd);
        await sleep(1000);
      }
      if (!cancelledRef.current) {
        setCdValue(null);
        setIsFlashing(true);
        const frame = captureFrame();
        if (frame) setPhotos(prev => [frame, ...prev]);
        await sleep(380);
        setIsFlashing(false);
      }
      setCdValue(null);
    }

    setCapturing(false);
  };

  const downloadPhoto = (src: string, idx: number) => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `percylab-filterbooth-${idx + 1}.jpg`;
    a.click();
  };

  const downloadAll = () => {
    photos.forEach((src, i) => {
      setTimeout(() => downloadPhoto(src, i), i * 120);
    });
  };

  const currentFilterCss = FILTERS.find(f => f.id === filterId)?.css ?? 'none';

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">filterbooth</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi'
            ? 'Chụp selfie tức thì với các bộ lọc màu film LUT đặc trưng theo phong cách retro.'
            : 'Snap selfies instantly with distinctive retro film LUT color filters.'}
        </p>
      </div>

      <div className="fb-layout">
        {/* ── Left: Camera ── */}
        <div className="fb-camera-col">
          <div className="fb-video-wrapper glass">
            {/* Corner brackets */}
            <div className="fb-corner fb-tl" />
            <div className="fb-corner fb-tr" />
            <div className="fb-corner fb-bl" />
            <div className="fb-corner fb-br" />

            {/* Shot counter chip */}
            {photos.length > 0 && (
              <div className="fb-shot-chip">
                {photos.length} {lang === 'vi' ? 'ảnh' : 'shots'}
              </div>
            )}

            {cameraError ? (
              <div className="fb-cam-error">
                <Camera size={36} style={{ opacity: 0.3 }} />
                <p>
                  {lang === 'vi'
                    ? 'Không thể truy cập camera. Vui lòng cấp quyền.'
                    : 'Camera access denied. Please allow permission.'}
                </p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={startCamera}>
                  {lang === 'vi' ? 'Thử lại' : 'Retry'}
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="fb-video"
                  style={{
                    transform: mirrored ? 'scaleX(-1)' : 'none',
                    filter: currentFilterCss === 'none' ? 'none' : currentFilterCss,
                  }}
                />
                {isFlashing && <div className="fb-flash" />}
                {cdValue !== null && (
                  <div className="fb-cd-overlay">
                    <span key={cdValue} className="fb-cd-num">{cdValue}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mirror toggle */}
          <button className="fb-mirror-btn" onClick={() => setMirrored(m => !m)}>
            <span
              className="fb-mirror-dot"
              style={{ background: mirrored ? 'var(--accent)' : 'var(--text-secondary)' }}
            />
            {lang === 'vi' ? 'Lật gương (selfie)' : 'Mirror (selfie)'}
          </button>
        </div>

        {/* ── Right: Controls ── */}
        <div className="fb-right-col">
          <div className="tool-card glass fb-controls-card">

            {/* FILTER section */}
            <div className="fb-section">
              <span className="fb-section-label">FILTER</span>
              <div className="fb-filter-grid">
                {FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterId(f.id)}
                    className={`fb-chip ${filterId === f.id ? 'active' : ''}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fb-divider" />

            {/* COUNTDOWN section */}
            <div className="fb-section">
              <div className="fb-section-header">
                <span className="fb-section-label">
                  {lang === 'vi' ? 'ĐẾM NGƯỢC' : 'COUNTDOWN'}
                </span>
                <span className="fb-section-hint">
                  {lang === 'vi' ? 'thời gian trước khi chụp' : 'delay before capture'}
                </span>
              </div>
              <div className="fb-chip-row">
                {COUNTDOWN_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setCountdown(p.value)}
                    className={`fb-chip ${countdown === p.value ? 'active' : ''}`}
                    disabled={capturing}
                  >
                    {lang === 'vi' ? p.label : p.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div className="fb-divider" />

            {/* Capture button */}
            <button
              onClick={handleCapture}
              disabled={!cameraReady || capturing}
              className="btn btn-primary btn-generate fb-capture-btn"
            >
              <Camera size={18} />
              <span>
                {capturing
                  ? (lang === 'vi' ? 'Đang chụp...' : 'Capturing...')
                  : (lang === 'vi' ? 'Chụp ảnh' : 'Capture')}
              </span>
            </button>
          </div>

          {/* Gallery */}
          {photos.length > 0 && (
            <div className="fb-gallery glass">
              <div className="fb-gallery-header">
                <span className="section-title">
                  {lang === 'vi'
                    ? `ẢNH ĐÃ CHỤP (${photos.length})`
                    : `CAPTURED (${photos.length})`}
                </span>
                <button className="fb-download-all-btn" onClick={downloadAll}>
                  {lang === 'vi' ? 'Tải tất cả' : 'Download all'}
                </button>
              </div>
              <div className="fb-gallery-grid">
                {photos.map((src, i) => (
                  <div
                    key={i}
                    className="fb-gallery-item"
                    onClick={() => downloadPhoto(src, photos.length - i)}
                  >
                    <img src={src} alt={`shot ${photos.length - i}`} />
                    <div className="fb-gallery-overlay">
                      <Download size={16} />
                    </div>
                    <span className="fb-gallery-num">{photos.length - i}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={captureCanvas} style={{ display: 'none' }} />

      <style>{`
        .fb-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px;
          align-items: start;
        }

        /* ── Camera column ── */
        .fb-camera-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .fb-video-wrapper {
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          aspect-ratio: 4/3;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fb-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: filter 0.25s;
        }

        .fb-cam-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.88rem;
          text-align: center;
          padding: 24px;
        }

        /* Corner brackets */
        .fb-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          z-index: 10;
          pointer-events: none;
        }
        .fb-tl {
          top: 10px; left: 10px;
          border-top: 2.5px solid rgba(255,255,255,0.7);
          border-left: 2.5px solid rgba(255,255,255,0.7);
        }
        .fb-tr {
          top: 10px; right: 10px;
          border-top: 2.5px solid rgba(255,255,255,0.7);
          border-right: 2.5px solid rgba(255,255,255,0.7);
        }
        .fb-bl {
          bottom: 10px; left: 10px;
          border-bottom: 2.5px solid rgba(255,255,255,0.7);
          border-left: 2.5px solid rgba(255,255,255,0.7);
        }
        .fb-br {
          bottom: 10px; right: 10px;
          border-bottom: 2.5px solid rgba(255,255,255,0.7);
          border-right: 2.5px solid rgba(255,255,255,0.7);
        }

        /* Shot counter chip */
        .fb-shot-chip {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          border-radius: 99px;
          padding: 5px 12px;
          color: #fff;
          font-size: 0.78rem;
          font-weight: 700;
          font-family: var(--font-heading);
          pointer-events: none;
        }

        /* Flash overlay */
        .fb-flash {
          position: absolute;
          inset: 0;
          background: #fff;
          pointer-events: none;
          animation: fb-flash-anim 0.38s ease-out forwards;
        }
        @keyframes fb-flash-anim {
          0%   { opacity: 0.9; }
          100% { opacity: 0; }
        }

        /* Countdown overlay */
        .fb-cd-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.38);
          z-index: 8;
        }
        .fb-cd-num {
          font-size: 6rem;
          font-weight: 900;
          color: #fff;
          font-family: var(--font-heading);
          animation: fb-pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes fb-pop {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        /* Mirror button */
        .fb-mirror-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          align-self: flex-start;
          padding: 7px 14px;
          border-radius: 99px;
          border: 1.5px solid var(--card-border);
          background: var(--card-bg);
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: var(--transition-bounce);
        }
        .fb-mirror-btn:hover {
          border-color: var(--accent);
          color: var(--text-primary);
        }
        .fb-mirror-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background 0.2s;
        }

        /* ── Right column ── */
        .fb-right-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .fb-controls-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Section */
        .fb-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .fb-section-label {
          font-family: var(--font-heading);
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        /* ── Chips ── */
        .fb-chip {
          padding: 7px 14px;
          border-radius: 99px;
          border: 1.5px solid var(--card-border);
          background: var(--bg-cream);
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: var(--transition-bounce);
          white-space: nowrap;
          line-height: 1;
        }
        .fb-chip:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-light);
        }
        .fb-chip.active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
          box-shadow: 2px 2px 0px var(--text-primary);
        }
        .fb-chip:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Filter grid: 4 cols so 7 chips = 4+3 */
        .fb-filter-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        .fb-filter-grid .fb-chip {
          padding: 7px 6px;
          text-align: center;
          justify-content: center;
        }

        /* Section divider */
        .fb-divider {
          height: 1px;
          background: var(--card-border);
          border-style: dashed;
          border-width: 0 0 1.5px 0;
          border-color: var(--card-border);
          margin: 0 -20px;
        }

        /* Section header with hint */
        .fb-section-header {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .fb-section-hint {
          font-size: 0.68rem;
          color: var(--text-secondary);
          opacity: 0.7;
        }

        /* Countdown row */
        .fb-chip-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        /* Capture button */
        .fb-capture-btn {
          width: 100%;
        }

        /* ── Gallery ── */
        .fb-gallery {
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .fb-gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .fb-download-all-btn {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent);
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-heading);
          padding: 0;
          transition: opacity 0.2s;
        }
        .fb-download-all-btn:hover {
          opacity: 0.7;
        }
        .fb-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .fb-gallery-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 16/9;
          cursor: pointer;
          border: 1.5px solid var(--card-border);
          transition: var(--transition-bounce);
        }
        .fb-gallery-item:hover {
          border-color: var(--accent);
          transform: scale(1.02);
        }
        .fb-gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .fb-gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .fb-gallery-item:hover .fb-gallery-overlay {
          opacity: 1;
        }
        .fb-gallery-num {
          position: absolute;
          bottom: 5px;
          right: 7px;
          font-size: 0.65rem;
          font-weight: 800;
          color: rgba(255,255,255,0.85);
          font-family: var(--font-heading);
          text-shadow: 0 1px 3px rgba(0,0,0,0.6);
        }

        /* ── Responsive ── */
        @media (max-width: 700px) {
          .fb-layout {
            grid-template-columns: 1fr;
            padding: 0 16px;
          }
          .fb-gallery-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};
