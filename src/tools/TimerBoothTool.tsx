import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, RotateCcw, Play, Square } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

const INTERVAL_PRESETS = [5, 10, 30, 60];

const FILTERS = [
  { id: 'none',  label: 'Gốc',  css: 'none' },
  { id: 'film',  label: 'Phim', css: 'sepia(0.45) contrast(1.1) saturate(0.85)' },
  { id: 'warm',  label: 'Ấm',   css: 'sepia(0.25) saturate(1.5) hue-rotate(-10deg) brightness(1.04)' },
  { id: 'cool',  label: 'Lạnh', css: 'hue-rotate(185deg) saturate(0.8) brightness(1.05)' },
  { id: 'bw',    label: 'B&W',  css: 'grayscale(1) contrast(1.05)' },
  { id: 'fade',  label: 'Mờ',   css: 'brightness(1.15) contrast(0.8) saturate(0.65)' },
  { id: 'vivid', label: 'Đậm',  css: 'saturate(1.9) contrast(1.15)' },
];

export const TimerBoothTool: React.FC = () => {
  const { lang } = useLanguage();

  const [numShots, setNumShots]       = useState(5);
  const [interval, setInterval]       = useState(10);
  const [customInterval, setCustomInterval] = useState('');
  const [isCustom, setIsCustom]       = useState(false);
  const [running, setRunning]       = useState(false);
  const [cdValue, setCdValue]       = useState<number | null>(null);
  const [shotsTaken, setShotsTaken] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [photos, setPhotos]         = useState<string[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [filterId, setFilterId]       = useState('none');
  const [mirrored, setMirrored]       = useState(true);

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
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  const captureFrame = (): string | null => {
    const video = videoRef.current, canvas = captureCanvas.current;
    if (!video || !canvas) return null;
    const W = video.videoWidth || 1280, H = video.videoHeight || 720;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const filterCss = FILTERS.find(f => f.id === filterId)?.css ?? 'none';
    ctx.filter = filterCss === 'none' ? '' : filterCss;
    ctx.save();
    if (mirrored) { ctx.translate(W, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, W, H);
    ctx.restore();
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  useEffect(() => {
    startCamera();
    return () => { cancelledRef.current = true; stopCamera(); };
  }, []);

  const startSession = async () => {
    if (!cameraReady) return;
    cancelledRef.current = false;
    setPhotos([]);
    setShotsTaken(0);
    setRunning(true);

    const taken: string[] = [];

    for (let i = 0; i < numShots; i++) {
      if (cancelledRef.current) break;

      // countdown before each shot
      for (let cd = interval; cd >= 1; cd--) {
        if (cancelledRef.current) break;
        setCdValue(cd);
        await sleep(1000);
      }
      if (cancelledRef.current) break;

      setCdValue(null);
      setIsFlashing(true);
      const frame = captureFrame();
      if (frame) {
        taken.push(frame);
        setPhotos([...taken]);
        setShotsTaken(taken.length);
      }
      await sleep(400);
      setIsFlashing(false);
      if (i < numShots - 1) await sleep(300);
    }

    setRunning(false);
    setCdValue(null);
  };

  const stopSession = () => {
    cancelledRef.current = true;
    setRunning(false);
    setCdValue(null);
    setIsFlashing(false);
  };

  const reset = () => {
    stopSession();
    setPhotos([]);
    setShotsTaken(0);
  };

  const downloadPhoto = (src: string, idx: number) => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `percylab-timer-${idx + 1}.jpg`;
    a.click();
  };

  const downloadAll = () => {
    photos.forEach((src, i) => {
      setTimeout(() => downloadPhoto(src, i), i * 120);
    });
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">timerbooth</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi'
            ? 'Đặt số lượng ảnh và khoảng thời gian — camera tự chụp theo timer, không cần chạm vào máy.'
            : 'Set shot count and interval — camera fires automatically on timer, hands-free.'}
        </p>
      </div>

      <div className="tb-layout">
        {/* ── Left: Camera ── */}
        <div className="tb-camera-col">
          <div className="tb-video-wrapper glass">
            {/* Corner brackets */}
            <div className="tb-corner tb-tl" /><div className="tb-corner tb-tr" />
            <div className="tb-corner tb-bl" /><div className="tb-corner tb-br" />

            {cameraError ? (
              <div className="tb-cam-error">
                <Camera size={36} style={{ opacity: 0.3 }} />
                <p>{lang === 'vi' ? 'Không thể truy cập camera. Vui lòng cấp quyền.' : 'Camera access denied. Please allow permission.'}</p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={startCamera}>
                  {lang === 'vi' ? 'Thử lại' : 'Retry'}
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef} autoPlay playsInline muted
                  className="tb-video"
                  style={{
                    transform: mirrored ? 'scaleX(-1)' : 'none',
                    filter: filterId !== 'none' ? (FILTERS.find(f => f.id === filterId)?.css ?? 'none') : 'none',
                  }}
                />
                {isFlashing && <div className="tb-flash" />}
                {cdValue !== null && (
                  <div className="tb-cd-overlay">
                    <span key={cdValue} className="tb-cd-num">{cdValue}</span>
                  </div>
                )}
                {running && cdValue === null && (
                  <div className="tb-status-chip">
                    <span className="tb-rec-dot" />
                    {lang === 'vi' ? `${shotsTaken} / ${numShots} ảnh` : `${shotsTaken} / ${numShots} shots`}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Filter chips */}
          <div className="tb-filter-row">
            <span className="tb-filter-label">FILTER</span>
            <div className="tb-filter-chips">
              {FILTERS.map(f => (
                <button key={f.id}
                  onClick={() => setFilterId(f.id)}
                  className={`tb-fchip ${filterId === f.id ? 'active' : ''}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mirror toggle */}
          <button className="tb-mirror-btn" onClick={() => setMirrored(m => !m)}>
            <span className="tb-mirror-dot" style={{ background: mirrored ? 'var(--accent)' : 'var(--text-secondary)' }} />
            {lang === 'vi' ? 'Lật gương (selfie)' : 'Mirror (selfie)'}
          </button>

          {/* Progress dots */}
          {(running || photos.length > 0) && (
            <div className="tb-progress-dots">
              {Array.from({ length: numShots }).map((_, i) => (
                <div key={i}
                  className={`tb-pdot ${i < photos.length ? 'done' : (running && i === photos.length ? 'cur' : '')}`} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Controls + Gallery ── */}
        <div className="tb-right-col">
          {/* Settings */}
          <div className="tool-card glass tb-settings-card">
            <h3 className="section-title" style={{ marginBottom: 16 }}>
              {lang === 'vi' ? 'Cài đặt' : 'Settings'}
            </h3>

            {/* Number of shots */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label>{lang === 'vi' ? 'Số ảnh cần chụp' : 'Number of shots'}</label>
                <span className="tb-val-badge">{numShots}</span>
              </div>
              <input type="range" min={1} max={20} value={numShots}
                onChange={e => setNumShots(Number(e.target.value))}
                disabled={running} className="slider-input" style={{ width: '100%' }} />
              <div className="tb-range-labels"><span>1</span><span>20</span></div>
            </div>

            {/* Interval */}
            <div className="form-group" style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label>{lang === 'vi' ? 'Khoảng cách mỗi lần chụp' : 'Interval between shots'}</label>
                <span className="tb-val-badge">{interval}s</span>
              </div>
              <div className="tb-interval-chips">
                {INTERVAL_PRESETS.map(v => (
                  <button key={v}
                    onClick={() => { setInterval(v); setIsCustom(false); setCustomInterval(''); }}
                    disabled={running}
                    className={`tb-chip ${!isCustom && interval === v ? 'active' : ''}`}>
                    {v}s
                  </button>
                ))}
                <button
                  onClick={() => { setIsCustom(true); setCustomInterval(String(interval)); }}
                  disabled={running}
                  className={`tb-chip ${isCustom ? 'active' : ''}`}>
                  {lang === 'vi' ? 'Tùy chỉnh' : 'Custom'}
                </button>
              </div>
              {isCustom && (
                <div className="tb-custom-row">
                  <input
                    type="number" min={1} max={59}
                    value={customInterval}
                    disabled={running}
                    placeholder="1–59"
                    onChange={e => {
                      const raw = e.target.value;
                      setCustomInterval(raw);
                      const n = parseInt(raw, 10);
                      if (!isNaN(n) && n >= 1 && n <= 59) setInterval(n);
                    }}
                    className="tb-custom-input"
                  />
                  <span className="tb-custom-unit">giây</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!running ? (
                <button onClick={startSession} disabled={!cameraReady}
                  className="btn btn-primary btn-generate" style={{ width: '100%' }}>
                  <Play size={16} />
                  <span>{lang === 'vi' ? `Bắt đầu chụp ${numShots} ảnh` : `Start ${numShots}-shot timer`}</span>
                </button>
              ) : (
                <button onClick={stopSession} className="tb-stop-btn" style={{ width: '100%' }}>
                  <Square size={16} />
                  <span>{lang === 'vi' ? 'Dừng lại' : 'Stop'}</span>
                </button>
              )}

              {photos.length > 0 && !running && (
                <>
                  <button onClick={downloadAll} className="btn btn-primary btn-generate" style={{ width: '100%' }}>
                    <Download size={16} />
                    <span>{lang === 'vi' ? `Tải tất cả (${photos.length} ảnh)` : `Download all (${photos.length})`}</span>
                  </button>
                  <button onClick={reset} className="tb-reset-btn" style={{ width: '100%' }}>
                    <RotateCcw size={14} />
                    <span>{lang === 'vi' ? 'Chụp lại' : 'Reset'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Photo gallery */}
          {photos.length > 0 && (
            <div className="tb-gallery glass">
              <div className="tb-gallery-header">
                <span className="section-title">{lang === 'vi' ? `Ảnh đã chụp (${photos.length})` : `Captured (${photos.length})`}</span>
              </div>
              <div className="tb-gallery-grid">
                {photos.map((src, i) => (
                  <div key={i} className="tb-gallery-item" onClick={() => downloadPhoto(src, i)}>
                    <img src={src} alt={`shot ${i + 1}`} />
                    <div className="tb-gallery-overlay">
                      <Download size={16} />
                    </div>
                    <span className="tb-gallery-num">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={captureCanvas} style={{ display: 'none' }} />

      <style>{`
        .tb-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px;
          align-items: start;
        }

        /* Camera */
        .tb-camera-col { display: flex; flex-direction: column; gap: 12px; }
        .tb-video-wrapper {
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          aspect-ratio: 4/3;
          background: #111;
          display: flex; align-items: center; justify-content: center;
        }
        .tb-video {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          transition: filter 0.25s;
        }
        .tb-cam-error {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; color: var(--text-secondary); font-size: 0.88rem;
          text-align: center; padding: 24px;
        }
        /* Corner brackets */
        .tb-corner {
          position: absolute; width: 20px; height: 20px; z-index: 10;
          pointer-events: none;
        }
        .tb-tl { top: 10px; left: 10px;
          border-top: 2.5px solid rgba(255,255,255,0.7);
          border-left: 2.5px solid rgba(255,255,255,0.7); }
        .tb-tr { top: 10px; right: 10px;
          border-top: 2.5px solid rgba(255,255,255,0.7);
          border-right: 2.5px solid rgba(255,255,255,0.7); }
        .tb-bl { bottom: 10px; left: 10px;
          border-bottom: 2.5px solid rgba(255,255,255,0.7);
          border-left: 2.5px solid rgba(255,255,255,0.7); }
        .tb-br { bottom: 10px; right: 10px;
          border-bottom: 2.5px solid rgba(255,255,255,0.7);
          border-right: 2.5px solid rgba(255,255,255,0.7); }
        /* Filter chips */
        .tb-filter-row {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .tb-filter-label {
          font-family: var(--font-heading); font-size: 0.7rem; font-weight: 800;
          color: var(--text-secondary); letter-spacing: 0.08em; flex-shrink: 0;
        }
        .tb-filter-chips { display: flex; gap: 5px; flex-wrap: wrap; }
        .tb-fchip {
          padding: 5px 12px; border-radius: 99px;
          border: 1.5px solid var(--card-border);
          background: var(--bg-cream);
          color: var(--text-secondary);
          font-family: var(--font-heading); font-weight: 700; font-size: 0.78rem;
          cursor: pointer; transition: var(--transition-bounce);
          white-space: nowrap;
        }
        .tb-fchip:hover { border-color: var(--accent); color: var(--accent); }
        .tb-fchip.active {
          background: var(--accent); color: #fff;
          border-color: var(--accent);
          box-shadow: 2px 2px 0px var(--text-primary);
        }
        /* Mirror toggle */
        .tb-mirror-btn {
          display: inline-flex; align-items: center; gap: 7px;
          align-self: flex-start;
          padding: 7px 14px; border-radius: 99px;
          border: 1.5px solid var(--card-border);
          background: var(--card-bg);
          color: var(--text-secondary);
          font-family: var(--font-heading); font-weight: 700; font-size: 0.82rem;
          cursor: pointer; transition: var(--transition-bounce);
        }
        .tb-mirror-btn:hover { border-color: var(--accent); color: var(--text-primary); }
        .tb-mirror-dot {
          width: 8px; height: 8px; border-radius: 50%;
          flex-shrink: 0; transition: background 0.2s;
        }
        .tb-flash {
          position: absolute; inset: 0; background: #fff; pointer-events: none;
          animation: tb-flash-a 0.38s ease-out forwards;
        }
        @keyframes tb-flash-a {
          0% { opacity: 0.9; } 100% { opacity: 0; }
        }
        .tb-cd-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.38);
        }
        .tb-cd-num {
          font-size: 6rem; font-weight: 900; color: #fff;
          font-family: var(--font-heading);
          animation: tb-pop 0.32s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes tb-pop {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .tb-status-chip {
          position: absolute; top: 12px; right: 12px;
          display: flex; align-items: center; gap: 6px;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
          border-radius: 99px; padding: 5px 12px;
          color: #fff; font-size: 0.78rem; font-weight: 700;
        }
        .tb-rec-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #ef4444;
          animation: tb-blink 1s ease-in-out infinite;
        }
        @keyframes tb-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* Progress dots */
        .tb-progress-dots {
          display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;
        }
        .tb-pdot {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--card-border); transition: all 0.25s;
          flex-shrink: 0;
        }
        .tb-pdot.done { background: var(--accent); }
        .tb-pdot.cur  { background: #f59e0b; transform: scale(1.4); box-shadow: 0 0 8px rgba(245,158,11,0.5); }

        /* Settings */
        .tb-settings-card { padding: 22px; }
        .tb-val-badge {
          font-size: 1.05rem; font-weight: 900;
          color: var(--accent); font-family: var(--font-heading);
        }
        .tb-range-labels {
          display: flex; justify-content: space-between;
          font-size: 0.7rem; color: var(--text-secondary);
          margin-top: 4px; padding: 0 2px;
        }
        /* Interval chips */
        .tb-interval-chips {
          display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px;
        }
        .tb-chip {
          padding: 6px 14px; border-radius: 99px;
          border: 1.5px solid var(--card-border);
          background: var(--bg-cream);
          color: var(--text-secondary);
          font-family: var(--font-heading); font-weight: 700; font-size: 0.82rem;
          cursor: pointer; transition: var(--transition-bounce);
          white-space: nowrap;
        }
        .tb-chip:hover:not(:disabled) {
          border-color: var(--accent); color: var(--accent);
          background: var(--accent-light);
        }
        .tb-chip.active {
          background: var(--accent); color: #fff;
          border-color: var(--accent);
          box-shadow: 2px 2px 0px var(--text-primary);
        }
        .tb-chip:disabled { opacity: 0.45; cursor: not-allowed; }
        /* Custom interval input */
        .tb-custom-row {
          display: flex; align-items: center; gap: 8px;
          margin-top: 10px;
        }
        .tb-custom-input {
          width: 80px; padding: 7px 10px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--card-border);
          background: var(--card-bg);
          color: var(--text-primary);
          font-family: var(--font-heading); font-weight: 700; font-size: 0.95rem;
          outline: none; text-align: center;
          transition: border-color 0.2s;
        }
        .tb-custom-input:focus { border-color: var(--accent); }
        .tb-custom-input:disabled { opacity: 0.45; }
        .tb-custom-unit {
          font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;
        }
        .tb-stop-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 20px; border-radius: var(--radius-sm);
          border: 1.5px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.06);
          color: #ef4444;
          font-family: inherit; font-weight: 700; font-size: 0.9rem;
          cursor: pointer; transition: var(--transition-bounce);
        }
        .tb-stop-btn:hover { background: rgba(239,68,68,0.12); border-color: #ef4444; }
        .tb-reset-btn {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px; border-radius: var(--radius-sm);
          border: 1.5px solid var(--card-border); background: transparent;
          color: var(--text-secondary);
          font-family: inherit; font-weight: 600; font-size: 0.88rem;
          cursor: pointer; transition: var(--transition-bounce);
        }
        .tb-reset-btn:hover { border-color: var(--accent); color: var(--accent); }

        /* Gallery */
        .tb-gallery {
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .tb-gallery-header { display: flex; justify-content: space-between; align-items: center; }
        .tb-gallery-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
        }
        .tb-gallery-item {
          position: relative; border-radius: 8px; overflow: hidden;
          aspect-ratio: 16/9; cursor: pointer;
          border: 1.5px solid var(--card-border);
          transition: var(--transition-bounce);
        }
        .tb-gallery-item:hover { border-color: var(--accent); transform: scale(1.02); }
        .tb-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tb-gallery-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          color: #fff; opacity: 0; transition: opacity 0.2s;
        }
        .tb-gallery-item:hover .tb-gallery-overlay { opacity: 1; }
        .tb-gallery-num {
          position: absolute; bottom: 5px; right: 7px;
          font-size: 0.65rem; font-weight: 800;
          color: rgba(255,255,255,0.85);
          font-family: var(--font-heading);
          text-shadow: 0 1px 3px rgba(0,0,0,0.6);
        }

        @media (max-width: 640px) {
          .tb-layout { grid-template-columns: 1fr; padding: 0 16px; }
          .tb-gallery-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
};
