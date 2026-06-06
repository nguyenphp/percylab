import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Download, RotateCcw, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ─── Types ──────────────────────────────────────────────
type Stage    = 'setup' | 'capture' | 'result';
type Layout   = 'duo' | 'quad';
type FilterId = 'none' | 'bw' | 'warm' | 'cool' | 'vivid' | 'fade' | 'film';
type ThemeId  = 'white' | 'cream' | 'dark' | 'film' | 'pink' | 'sky';

// ─── Canvas Layout Config ────────────────────────────────
const PW  = 400;
const PH  = 300;
const PAD = 30;
const GAP = 10;
const BBH = 54;

type Slot       = { x: number; y: number; w: number; h: number };
type CanvasLayout = { w: number; h: number; slots: Slot[] };

const CANVAS_LAYOUTS: Record<Layout, CanvasLayout> = {
  duo: {
    w: PAD + PW + GAP + PW + PAD,
    h: PAD + PH + BBH,
    slots: [
      { x: PAD,              y: PAD, w: PW, h: PH },
      { x: PAD + PW + GAP,   y: PAD, w: PW, h: PH },
    ],
  },
  quad: {
    w: PAD + PW + GAP + PW + PAD,
    h: PAD + PH + GAP + PH + BBH,
    slots: [
      { x: PAD,            y: PAD,            w: PW, h: PH },
      { x: PAD + PW + GAP, y: PAD,            w: PW, h: PH },
      { x: PAD,            y: PAD + PH + GAP, w: PW, h: PH },
      { x: PAD + PW + GAP, y: PAD + PH + GAP, w: PW, h: PH },
    ],
  },
};

// ─── Filters ─────────────────────────────────────────────
const FILTERS: { id: FilterId; labelVi: string; labelEn: string; css: string }[] = [
  { id: 'none',  labelVi: 'Gốc',  labelEn: 'Original', css: 'none' },
  { id: 'bw',    labelVi: 'B&W',  labelEn: 'B&W',      css: 'grayscale(100%)' },
  { id: 'warm',  labelVi: 'Ấm',   labelEn: 'Warm',     css: 'sepia(35%) saturate(120%) brightness(1.05)' },
  { id: 'cool',  labelVi: 'Lạnh', labelEn: 'Cool',     css: 'hue-rotate(200deg) saturate(70%)' },
  { id: 'vivid', labelVi: 'Đậm',  labelEn: 'Vivid',    css: 'saturate(160%) contrast(112%)' },
  { id: 'fade',  labelVi: 'Mờ',   labelEn: 'Fade',     css: 'brightness(1.15) contrast(0.8) saturate(0.65)' },
  { id: 'film',  labelVi: 'Phim', labelEn: 'Film',     css: 'sepia(0.45) contrast(1.1) saturate(0.85)' },
];

// ─── Themes ──────────────────────────────────────────────
type Theme = { id: ThemeId; name: string; bg: string; border: string; text: string };
const THEMES: Theme[] = [
  { id: 'white', name: 'Classic', bg: '#ffffff', border: '#d5d5d5', text: '#222222' },
  { id: 'cream', name: 'Cream',   bg: '#fdf6e3', border: '#e8d8b4', text: '#5a4a3a' },
  { id: 'dark',  name: 'Dark',    bg: '#1a1a1a', border: '#333333', text: '#ffffff' },
  { id: 'film',  name: 'Film',    bg: '#0d0d0d', border: '#2a2a2a', text: '#d4a017' },
  { id: 'pink',  name: 'Rose',    bg: '#fff0f5', border: '#ffd6e0', text: '#8b4768' },
  { id: 'sky',   name: 'Sky',     bg: '#f0f6ff', border: '#c8dcff', text: '#3b5bdb' },
];

const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

// ─── Layout Picker SVG Previews ───────────────────────────
function DuoPreview({ selected }: { selected: boolean }) {
  const fill   = selected ? 'rgba(46,125,96,0.28)' : 'rgba(0,0,0,0.13)';
  const stroke = selected ? 'rgba(46,125,96,0.7)' : 'rgba(0,0,0,0.22)';
  const bg     = selected ? 'rgba(46,125,96,0.06)' : 'rgba(0,0,0,0.03)';
  return (
    <svg width="80" height="56" viewBox="0 0 80 56" style={{ display: 'block' }}>
      <rect x="2" y="2" width="76" height="52" rx="4" fill={bg} />
      <rect x="6"  y="8" width="31" height="40" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <rect x="43" y="8" width="31" height="40" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
      {selected && (
        <>
          <line x1="21" y1="22" x2="21" y2="34" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="28" x2="27" y2="28" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="58" y1="22" x2="58" y2="34" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="52" y1="28" x2="64" y2="28" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function QuadPreview({ selected }: { selected: boolean }) {
  const fill   = selected ? 'rgba(46,125,96,0.28)' : 'rgba(0,0,0,0.13)';
  const stroke = selected ? 'rgba(46,125,96,0.7)' : 'rgba(0,0,0,0.22)';
  const bg     = selected ? 'rgba(46,125,96,0.06)' : 'rgba(0,0,0,0.03)';
  return (
    <svg width="80" height="70" viewBox="0 0 80 70" style={{ display: 'block' }}>
      <rect x="2" y="2" width="76" height="66" rx="4" fill={bg} />
      <rect x="6"  y="7"  width="31" height="26" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <rect x="43" y="7"  width="31" height="26" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <rect x="6"  y="37" width="31" height="26" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
      <rect x="43" y="37" width="31" height="26" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────
export const GroupBoothTool: React.FC = () => {
  const { lang } = useLanguage();

  // Stage
  const [stage, setStage] = useState<Stage>('setup');

  // Setup state
  const [layout, setLayout]       = useState<Layout>('duo');
  const [timer, setTimer]         = useState<number>(5);
  const [groupName, setGroupName] = useState('');
  const [mirrored, setMirrored]   = useState(true);

  // Capture state
  const [currentSlot, setCurrentSlot] = useState(0);
  const [cdValue, setCdValue]         = useState<number | null>(null);
  const [isFlashing, setIsFlashing]   = useState(false);
  const [frames, setFrames]           = useState<string[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Result state
  const [selectedFilter, setSelectedFilter] = useState<FilterId>('none');
  const [selectedTheme, setSelectedTheme]   = useState<ThemeId>('white');
  const [caption, setCaption]               = useState('');
  const [showDate, setShowDate]             = useState(true);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering]       = useState(false);

  // Refs
  const videoRef      = useRef<HTMLVideoElement>(null);
  const captureCanvas = useRef<HTMLCanvasElement>(null);
  const previewCanvas = useRef<HTMLCanvasElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const cancelledRef  = useRef(false);

  const totalSlots = CANVAS_LAYOUTS[layout].slots.length;

  // ── Camera helpers ───────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
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

  const captureFrame = (): string | null => {
    const video = videoRef.current, canvas = captureCanvas.current;
    if (!video || !canvas) return null;
    const W = video.videoWidth || 640, H = video.videoHeight || 480;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.save();
    if (mirrored) { ctx.translate(W, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, W, H);
    ctx.restore();
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  // Re-attach stream when stage changes (same pattern as selfbooth)
  useEffect(() => {
    if (stage === 'setup' || stage === 'capture') {
      if (streamRef.current && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  }, [stage]);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => { cancelledRef.current = true; stopCamera(); };
  }, []);

  // ── Capture session ──────────────────────────────────
  const startSession = async () => {
    cancelledRef.current = false;
    setCameraError(false);
    setFrames([]);
    setCurrentSlot(0);
    setCdValue(null);
    setIsFlashing(false);
    setCaption(groupName);
    setStage('capture');

    await sleep(800);

    if (!streamRef.current) {
      try {
        await startCamera();
      } catch {
        setCameraError(true);
        setStage('setup');
        return;
      }
    }

    // Re-attach stream after stage change
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }

    await sleep(400);

    const captured: string[] = [];

    for (let i = 0; i < totalSlots; i++) {
      if (cancelledRef.current) return;
      setCurrentSlot(i);

      for (let cd = timer; cd >= 1; cd--) {
        if (cancelledRef.current) return;
        setCdValue(cd);
        await sleep(1000);
      }
      if (cancelledRef.current) return;

      setCdValue(null);
      setIsFlashing(true);
      const frame = captureFrame();
      if (frame) {
        captured.push(frame);
        setFrames([...captured]);
      }
      await sleep(450);
      if (cancelledRef.current) return;
      setIsFlashing(false);
      if (i < totalSlots - 1) await sleep(700);
    }

    if (!cancelledRef.current) {
      stopCamera();
      setStage('result');
    }
  };

  const retake = () => {
    cancelledRef.current = true;
    stopCamera();
    setFrames([]);
    setCdValue(null);
    setIsFlashing(false);
    setPreviewDataUrl(null);
    setSelectedFilter('none');
    setSelectedTheme('white');
    setStage('setup');
    // Restart camera for setup preview
    setTimeout(() => {
      cancelledRef.current = false;
      startCamera();
    }, 100);
  };

  // ── Canvas rendering ─────────────────────────────────
  const renderCanvas = useCallback(async () => {
    const canvas = previewCanvas.current;
    if (!canvas || frames.length === 0) return;
    setIsRendering(true);
    setPreviewDataUrl(null);

    const cl     = CANVAS_LAYOUTS[layout];
    const theme  = THEMES.find(t => t.id === selectedTheme)!;
    const filter = FILTERS.find(f => f.id === selectedFilter)!;

    canvas.width  = cl.w;
    canvas.height = cl.h;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, cl.w, cl.h);

    // Film sprockets for film theme
    if (selectedTheme === 'film') {
      const sW = 9, sH = 16, sR = 3;
      const count = Math.floor(cl.h / 27);
      for (let i = 0; i < count; i++) {
        const sy = 6 + i * 27;
        ctx.fillStyle = '#252525';
        for (const sx of [7, cl.w - 16]) {
          ctx.beginPath();
          ctx.roundRect(sx, sy, sW, sH, sR);
          ctx.fill();
        }
      }
    }

    // Draw photos with filter
    const drawPhoto = (idx: number): Promise<void> => {
      if (idx >= frames.length) return Promise.resolve();
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const s = cl.slots[idx];
          ctx.save();
          ctx.beginPath(); ctx.rect(s.x, s.y, s.w, s.h); ctx.clip();
          const iAR = img.naturalWidth / img.naturalHeight;
          const sAR = s.w / s.h;
          let dx = s.x, dy = s.y, dw = s.w, dh = s.h;
          if (iAR > sAR) { dw = s.h * iAR; dx = s.x - (dw - s.w) / 2; }
          else           { dh = s.w / iAR; dy = s.y - (dh - s.h) / 2; }
          ctx.filter = filter.css === 'none' ? 'none' : filter.css;
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.filter = 'none';
          ctx.restore();
          drawPhoto(idx + 1).then(resolve);
        };
        img.src = frames[idx];
      });
    };
    await drawPhoto(0);

    // Bottom bar text
    const ty = cl.h - 16;
    const captionText = caption.trim() || groupName.trim();
    if (captionText) {
      ctx.fillStyle = theme.text;
      ctx.font = `italic bold 17px "Outfit", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText(captionText, cl.w / 2, ty, cl.w - PAD * 2);
    }
    if (showDate) {
      const now = new Date();
      const ds  = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
      ctx.fillStyle = theme.text; ctx.globalAlpha = 0.45;
      ctx.font = `11px monospace`; ctx.textAlign = 'right';
      ctx.fillText(ds, cl.w - PAD, ty);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = theme.text; ctx.globalAlpha = 0.28;
    ctx.font = `10px monospace`; ctx.textAlign = 'left';
    ctx.fillText('percylab.space', PAD, ty);
    ctx.globalAlpha = 1;

    setPreviewDataUrl(canvas.toDataURL('image/png'));
    setIsRendering(false);
  }, [frames, layout, selectedFilter, selectedTheme, caption, groupName, showDate]);

  useEffect(() => {
    if (stage === 'result' && frames.length > 0) renderCanvas();
  }, [stage, frames, selectedFilter, selectedTheme, caption, showDate, renderCanvas]);

  const download = () => {
    if (!previewDataUrl) return;
    const a = document.createElement('a');
    a.href = previewDataUrl;
    a.download = `percylab-groupbooth-${layout}.png`;
    a.click();
  };

  // ── JSX ──────────────────────────────────────────────
  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">groupbooth</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi'
            ? 'Chọn bố cục → Mỗi người lần lượt chụp → Ghép ảnh nhóm'
            : 'Pick layout → Each person takes a turn → Composite group photo'}
        </p>
      </div>

      {/* ══════════════ STAGE 1: SETUP ══════════════ */}
      {stage === 'setup' && (
        <div className="gb-setup animate-fade">
          {/* Left: Camera preview */}
          <div className="gb-camera-col">
            <div className="gb-video-wrapper glass">
              <div className="gb-corner gb-tl" /><div className="gb-corner gb-tr" />
              <div className="gb-corner gb-bl" /><div className="gb-corner gb-br" />
              {cameraError ? (
                <div className="gb-cam-error">
                  <Camera size={36} style={{ opacity: 0.3 }} />
                  <p>{lang === 'vi' ? 'Không thể truy cập camera. Vui lòng cấp quyền.' : 'Camera access denied. Please allow permission.'}</p>
                  <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={startCamera}>
                    {lang === 'vi' ? 'Thử lại' : 'Retry'}
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef} autoPlay playsInline muted
                  className="gb-video"
                  style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
                />
              )}
            </div>

            {/* Mirror toggle */}
            <button className="gb-mirror-btn" onClick={() => setMirrored(m => !m)}>
              <span className="gb-mirror-dot" style={{ background: mirrored ? 'var(--accent)' : 'var(--text-secondary)' }} />
              {lang === 'vi' ? 'Lật gương (selfie)' : 'Mirror (selfie)'}
            </button>
          </div>

          {/* Right: Controls */}
          <div className="gb-controls-col">
            {/* Layout picker */}
            <div className="gb-section">
              <p className="gb-section-lbl">
                {lang === 'vi' ? 'Bố cục nhóm' : 'Group Layout'}
              </p>
              <div className="gb-layout-cards">
                <button
                  className={`gb-layout-card glass ${layout === 'duo' ? 'selected' : ''}`}
                  onClick={() => setLayout('duo')}
                >
                  <DuoPreview selected={layout === 'duo'} />
                  <span className="gb-lc-name">
                    {lang === 'vi' ? 'Đôi' : 'Duo'}
                  </span>
                  <span className="gb-lc-desc">
                    {lang === 'vi' ? '2 người, song song' : '2 people, side by side'}
                  </span>
                </button>

                <button
                  className={`gb-layout-card glass ${layout === 'quad' ? 'selected' : ''}`}
                  onClick={() => setLayout('quad')}
                >
                  <QuadPreview selected={layout === 'quad'} />
                  <span className="gb-lc-name">
                    {lang === 'vi' ? 'Nhóm 4' : 'Quad'}
                  </span>
                  <span className="gb-lc-desc">
                    {lang === 'vi' ? '4 người, lưới 2×2' : '4 people, 2×2 grid'}
                  </span>
                </button>
              </div>
            </div>

            {/* Timer per shot */}
            <div className="gb-section">
              <p className="gb-section-lbl">
                {lang === 'vi' ? 'Đếm ngược mỗi lượt' : 'Countdown per turn'}
              </p>
              <div className="gb-chips">
                {[3, 5, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => setTimer(s)}
                    className={`gb-chip ${timer === s ? 'active' : ''}`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            {/* Group name */}
            <div className="gb-section">
              <p className="gb-section-lbl">
                {lang === 'vi' ? 'Tên nhóm (tuỳ chọn)' : 'Group name (optional)'}
              </p>
              <input
                type="text"
                value={groupName}
                maxLength={40}
                onChange={e => setGroupName(e.target.value)}
                placeholder={lang === 'vi' ? 'VD: Hội bạn thân 2025...' : 'E.g. Friends trip 2025...'}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            {/* Start button */}
            <button
              onClick={startSession}
              disabled={!cameraReady}
              className="btn btn-primary btn-generate"
              style={{ width: '100%', marginTop: 4 }}
            >
              <Camera size={18} />
              <span>
                {lang === 'vi'
                  ? `Bắt đầu chụp ${totalSlots} tấm!`
                  : `Start Shooting ${totalSlots} shots!`}
              </span>
            </button>

            {cameraError && (
              <div className="gb-error">
                {lang === 'vi'
                  ? 'Camera chưa sẵn sàng. Vui lòng cấp quyền truy cập camera.'
                  : 'Camera not ready. Please allow camera access.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ STAGE 2: CAPTURE ══════════════ */}
      {stage === 'capture' && (
        <div className="gb-capture animate-fade">
          {/* Progress dots */}
          <div className="gb-dots">
            {Array.from({ length: totalSlots }).map((_, i) => (
              <div
                key={i}
                className={`gb-dot ${i < frames.length ? 'done' : i === currentSlot ? 'cur' : ''}`}
              />
            ))}
          </div>

          {/* Video box */}
          <div className="gb-cap-video-wrap glass">
            {/* Turn badge top-left */}
            <div className="gb-turn-badge">
              {lang === 'vi'
                ? `Lượt ${currentSlot + 1} / ${totalSlots}`
                : `Turn ${currentSlot + 1} of ${totalSlots}`}
            </div>

            <video ref={videoRef} autoPlay playsInline muted className="gb-cap-video" />

            {/* Countdown overlay */}
            {cdValue !== null && (
              <div className="gb-cd-overlay">
                {/* "Who's turn" label above number */}
                <div className="gb-turn-label">
                  {lang === 'vi'
                    ? `Lượt của người ${currentSlot + 1}`
                    : `Person ${currentSlot + 1}'s turn`}
                </div>
                <span key={cdValue} className="gb-cd-num">{cdValue}</span>
              </div>
            )}

            {/* "Get ready" overlay when no countdown yet (between shots) */}
            {cdValue === null && frames.length === currentSlot && frames.length < totalSlots && (
              <div className="gb-ready-overlay">
                <span className="gb-ready-text">
                  {lang === 'vi'
                    ? `Người ${currentSlot + 1}, chuẩn bị!`
                    : `Person ${currentSlot + 1}, get ready!`}
                </span>
              </div>
            )}

            {isFlashing && <div className="gb-flash" />}
          </div>

          {/* Thumbnail strip */}
          <div className="gb-thumbs">
            {Array.from({ length: totalSlots }).map((_, i) => (
              <div
                key={i}
                className={`gb-thumb ${frames[i] ? 'filled' : i === currentSlot ? 'cur' : ''}`}
              >
                {frames[i] ? (
                  <img src={frames[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span className="gb-thumb-n">{i + 1}</span>
                )}
              </div>
            ))}
          </div>

          {/* Cancel button */}
          <button onClick={retake} className="gb-cancel-btn">
            {lang === 'vi' ? 'Huỷ & Quay lại' : 'Cancel & Go back'}
          </button>
        </div>
      )}

      {/* ══════════════ STAGE 3: RESULT ══════════════ */}
      {stage === 'result' && (
        <div className="gb-result animate-fade">
          {/* Left: Composite preview */}
          <div className="gb-preview glass">
            {isRendering && <p className="gb-rendering">{lang === 'vi' ? 'Đang tạo ảnh...' : 'Rendering...'}</p>}
            <canvas ref={previewCanvas} className="gb-canvas" />
          </div>

          {/* Right: Controls */}
          <div className="gb-result-controls">
            {/* Color filter */}
            <div className="gb-ctrl-box glass">
              <span className="gb-ctrl-lbl">{lang === 'vi' ? 'Bộ lọc màu' : 'Color Filter'}</span>
              <div className="gb-filter-row">
                {FILTERS.map(f => (
                  <button
                    key={f.id}
                    className={`gb-filt-btn ${selectedFilter === f.id ? 'active' : ''}`}
                    onClick={() => setSelectedFilter(f.id)}
                  >
                    <div className="gb-filt-thumb">
                      {frames[0] && (
                        <img
                          src={frames[0]} alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: f.css === 'none' ? undefined : f.css }}
                        />
                      )}
                    </div>
                    <span>{lang === 'vi' ? f.labelVi : f.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="gb-ctrl-box glass">
              <span className="gb-ctrl-lbl">{lang === 'vi' ? 'Kiểu viền & nền' : 'Frame & Background'}</span>
              <div className="gb-theme-row">
                {THEMES.map(th => (
                  <button
                    key={th.id} title={th.name}
                    className={`gb-theme-dot ${selectedTheme === th.id ? 'active' : ''}`}
                    style={{ background: th.bg, border: `2.5px solid ${selectedTheme === th.id ? 'var(--accent)' : th.border}` }}
                    onClick={() => setSelectedTheme(th.id)}
                  >
                    {selectedTheme === th.id && <Check size={12} style={{ color: th.text }} />}
                  </button>
                ))}
              </div>
              <div className="gb-theme-names">
                {THEMES.map(th => (
                  <span key={th.id} className={`gb-theme-nm ${selectedTheme === th.id ? 'active' : ''}`}>{th.name}</span>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="gb-ctrl-box glass">
              <span className="gb-ctrl-lbl">{lang === 'vi' ? 'Tiêu đề' : 'Caption'}</span>
              <input
                type="text" value={caption} maxLength={40}
                onChange={e => setCaption(e.target.value)}
                placeholder={lang === 'vi' ? 'Thêm chú thích ảnh...' : 'Add a caption...'}
                className="form-input" style={{ width: '100%', marginTop: 6 }}
              />
            </div>

            {/* Date toggle */}
            <div className="gb-ctrl-box glass">
              <label className="gb-toggle-row" onClick={() => setShowDate(d => !d)}>
                <span className="gb-ctrl-lbl" style={{ margin: 0 }}>
                  {lang === 'vi' ? 'Ngày chụp' : 'Date stamp'}
                </span>
                <div className={`gb-toggle ${showDate ? 'on' : ''}`}>
                  <div className="gb-toggle-knob" />
                </div>
              </label>
            </div>

            {/* Download */}
            <button
              onClick={download}
              disabled={!previewDataUrl || isRendering}
              className="btn btn-primary btn-generate"
              style={{ width: '100%' }}
            >
              <Download size={18} />
              <span>{lang === 'vi' ? 'Tải ảnh nhóm (PNG)' : 'Download Group PNG'}</span>
            </button>

            {/* Retake */}
            <button onClick={retake} className="gb-retake">
              <RotateCcw size={15} />
              <span>{lang === 'vi' ? 'Chụp lại từ đầu' : 'Start Over'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvases */}
      <canvas ref={captureCanvas} style={{ display: 'none' }} />
      {stage !== 'result' && <canvas ref={previewCanvas} style={{ display: 'none' }} />}

      <style>{`
        /* ── Setup: 2 column ── */
        .gb-setup {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          max-width: 960px;
          margin: 0 auto;
          padding: 0 24px;
          align-items: start;
        }

        /* Camera col */
        .gb-camera-col { display: flex; flex-direction: column; gap: 12px; }
        .gb-video-wrapper {
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          aspect-ratio: 4/3;
          background: #111;
          display: flex; align-items: center; justify-content: center;
        }
        .gb-video {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          transition: filter 0.25s;
        }
        .gb-cam-error {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; color: var(--text-secondary); font-size: 0.88rem;
          text-align: center; padding: 24px;
        }

        /* Corner brackets */
        .gb-corner {
          position: absolute; width: 20px; height: 20px; z-index: 10;
          pointer-events: none;
        }
        .gb-tl { top: 10px; left: 10px;
          border-top: 2.5px solid rgba(255,255,255,0.7);
          border-left: 2.5px solid rgba(255,255,255,0.7); }
        .gb-tr { top: 10px; right: 10px;
          border-top: 2.5px solid rgba(255,255,255,0.7);
          border-right: 2.5px solid rgba(255,255,255,0.7); }
        .gb-bl { bottom: 10px; left: 10px;
          border-bottom: 2.5px solid rgba(255,255,255,0.7);
          border-left: 2.5px solid rgba(255,255,255,0.7); }
        .gb-br { bottom: 10px; right: 10px;
          border-bottom: 2.5px solid rgba(255,255,255,0.7);
          border-right: 2.5px solid rgba(255,255,255,0.7); }

        /* Mirror button */
        .gb-mirror-btn {
          display: inline-flex; align-items: center; gap: 7px;
          align-self: flex-start;
          padding: 7px 14px; border-radius: 99px;
          border: 1.5px solid var(--card-border);
          background: var(--card-bg);
          color: var(--text-secondary);
          font-family: var(--font-heading); font-weight: 700; font-size: 0.82rem;
          cursor: pointer; transition: var(--transition-bounce);
        }
        .gb-mirror-btn:hover { border-color: var(--accent); color: var(--text-primary); }
        .gb-mirror-dot {
          width: 8px; height: 8px; border-radius: 50%;
          flex-shrink: 0; transition: background 0.2s;
        }

        /* Controls col */
        .gb-controls-col {
          display: flex; flex-direction: column; gap: 18px;
        }

        /* Section label */
        .gb-section { display: flex; flex-direction: column; gap: 10px; }
        .gb-section-lbl {
          font-size: 0.72rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--text-secondary); margin: 0;
        }

        /* Layout cards */
        .gb-layout-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .gb-layout-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 16px 10px 12px;
          border-radius: var(--radius-md);
          border: 2px solid var(--card-border);
          background: none; cursor: pointer;
          transition: var(--transition-bounce);
          font-family: inherit;
        }
        .gb-layout-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          background: rgba(46,125,96,0.02);
        }
        .gb-layout-card.selected {
          border-color: var(--accent);
          background: rgba(46,125,96,0.05);
          box-shadow: 0 0 0 3px rgba(46,125,96,0.08);
        }
        .gb-lc-name {
          font-size: 0.92rem; font-weight: 800;
          color: var(--text-primary); font-family: var(--font-heading);
        }
        .gb-layout-card.selected .gb-lc-name { color: var(--accent); }
        .gb-lc-desc {
          font-size: 0.7rem; color: var(--text-secondary); text-align: center;
          line-height: 1.3;
        }

        /* Timer chips */
        .gb-chips { display: flex; gap: 8px; }
        .gb-chip {
          padding: 7px 18px; border-radius: 99px;
          border: 1.5px solid var(--card-border);
          background: var(--glass-bg);
          color: var(--text-secondary);
          font-family: var(--font-heading); font-weight: 700; font-size: 0.85rem;
          cursor: pointer; transition: var(--transition-bounce);
          white-space: nowrap;
        }
        .gb-chip:hover { border-color: var(--accent); color: var(--accent); }
        .gb-chip.active {
          background: var(--accent); color: #fff;
          border-color: var(--accent);
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        /* Error */
        .gb-error {
          background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
          color: #ef4444; border-radius: 8px; padding: 10px 14px;
          font-size: 0.82rem;
        }

        /* ── Capture stage ── */
        .gb-capture {
          display: flex; flex-direction: column; align-items: center;
          gap: 18px;
          max-width: 680px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
          box-sizing: border-box;
        }

        /* Progress dots */
        .gb-dots { display: flex; gap: 10px; justify-content: center; }
        .gb-dot {
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--card-border); transition: all 0.3s;
        }
        .gb-dot.done { background: var(--accent); }
        .gb-dot.cur  { background: #f59e0b; transform: scale(1.5); box-shadow: 0 0 10px rgba(245,158,11,0.5); }

        /* Capture video wrapper */
        .gb-cap-video-wrap {
          width: 100%;
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          aspect-ratio: 4/3;
          background: #000;
        }
        .gb-cap-video {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          transform: scaleX(-1);
        }

        /* Turn badge top-left */
        .gb-turn-badge {
          position: absolute; top: 12px; left: 12px; z-index: 10;
          background: rgba(0,0,0,0.58); backdrop-filter: blur(6px);
          color: #fff; font-size: 0.78rem; font-weight: 800;
          font-family: var(--font-heading);
          padding: 5px 12px; border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.15);
          pointer-events: none;
        }

        /* Countdown overlay */
        .gb-cd-overlay {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
          background: rgba(0,0,0,0.45);
        }
        .gb-turn-label {
          font-size: 1.15rem; font-weight: 800; color: #fff;
          font-family: var(--font-heading);
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
          letter-spacing: -0.01em;
          background: rgba(46,125,96,0.7);
          padding: 6px 20px; border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .gb-cd-num {
          font-size: 6rem; font-weight: 900; color: #fff;
          font-family: var(--font-heading);
          animation: gb-pop 0.32s cubic-bezier(0.34,1.56,0.64,1) both;
          line-height: 1;
        }
        @keyframes gb-pop {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        /* "Get ready" overlay */
        .gb-ready-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: 20px;
          pointer-events: none;
        }
        .gb-ready-text {
          font-size: 1.1rem; font-weight: 800; color: #fff;
          font-family: var(--font-heading);
          background: rgba(245,158,11,0.85);
          padding: 8px 24px; border-radius: 99px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.3);
          animation: gb-bounce-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes gb-bounce-in {
          from { transform: translateY(16px) scale(0.85); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* Flash */
        .gb-flash {
          position: absolute; inset: 0; background: #fff; pointer-events: none;
          animation: gb-flash-a 0.42s ease-out forwards;
        }
        @keyframes gb-flash-a {
          0% { opacity: 0.92; } 100% { opacity: 0; }
        }

        /* Thumbnails */
        .gb-thumbs {
          display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
        }
        .gb-thumb {
          width: 88px; height: 66px; border-radius: 8px;
          border: 2px solid var(--card-border); overflow: hidden;
          background: var(--glass-bg);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s; flex-shrink: 0;
        }
        .gb-thumb.filled { border-color: var(--accent); box-shadow: 0 0 10px rgba(46,125,96,0.15); }
        .gb-thumb.cur    { border-color: #f59e0b; border-style: dashed; animation: gb-pending 1s ease-in-out infinite; }
        @keyframes gb-pending {
          0%,100% { box-shadow: 0 0 0 rgba(245,158,11,0); }
          50%     { box-shadow: 0 0 12px rgba(245,158,11,0.4); }
        }
        .gb-thumb-n {
          font-size: 1.4rem; font-weight: 800;
          color: var(--text-secondary); opacity: 0.35;
        }

        /* Cancel */
        .gb-cancel-btn {
          padding: 9px 20px; border-radius: var(--radius-sm);
          border: 1.5px solid var(--card-border); background: transparent;
          color: var(--text-secondary);
          font-family: inherit; font-weight: 600; font-size: 0.85rem;
          cursor: pointer; transition: var(--transition-bounce);
        }
        .gb-cancel-btn:hover { border-color: #ef4444; color: #ef4444; }

        /* ── Result stage ── */
        .gb-result {
          max-width: 1040px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: auto 300px;
          gap: 20px;
          align-items: start;
        }
        .gb-preview {
          border-radius: var(--radius-md); padding: 20px;
          background: #111 !important;
          display: flex; align-items: center; justify-content: center;
          min-height: 280px; position: relative;
        }
        .gb-rendering { position: absolute; color: #666; font-size: 0.82rem; }
        .gb-canvas { max-width: 100%; max-height: 600px; display: block; border-radius: 3px; }

        .gb-result-controls { display: flex; flex-direction: column; gap: 10px; }
        .gb-ctrl-box {
          border-radius: var(--radius-md); padding: 13px 15px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .gb-ctrl-lbl {
          font-size: 0.7rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-secondary);
        }

        /* Filter row */
        .gb-filter-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .gb-filt-btn {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          background: none; border: 2px solid var(--card-border); border-radius: 7px;
          cursor: pointer; overflow: hidden; padding: 0 0 4px;
          transition: var(--transition-bounce); font-family: inherit;
        }
        .gb-filt-btn:hover  { border-color: var(--accent); }
        .gb-filt-btn.active { border-color: var(--accent); }
        .gb-filt-btn span   { font-size: 0.58rem; font-weight: 700; color: var(--text-secondary); }
        .gb-filt-btn.active span { color: var(--accent); }
        .gb-filt-thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; }

        /* Theme row */
        .gb-theme-row { display: flex; gap: 7px; align-items: center; }
        .gb-theme-dot {
          width: 32px; height: 32px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .gb-theme-dot:hover  { transform: scale(1.12); }
        .gb-theme-dot.active { transform: scale(1.18); }
        .gb-theme-names { display: flex; gap: 7px; }
        .gb-theme-nm {
          width: 32px; text-align: center;
          font-size: 0.6rem; color: var(--text-secondary); font-weight: 600;
        }
        .gb-theme-nm.active { color: var(--accent); font-weight: 800; }

        /* Date toggle */
        .gb-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; user-select: none;
        }
        .gb-toggle {
          width: 38px; height: 21px; border-radius: 11px;
          background: var(--card-border); position: relative;
          transition: background 0.2s; flex-shrink: 0;
        }
        .gb-toggle.on { background: var(--accent); }
        .gb-toggle-knob {
          width: 15px; height: 15px; border-radius: 50%; background: #fff;
          position: absolute; top: 3px; left: 3px;
          transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .gb-toggle.on .gb-toggle-knob { left: 20px; }

        /* Retake */
        .gb-retake {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; padding: 10px; border-radius: var(--radius-sm);
          border: 1.5px solid var(--card-border); background: transparent;
          color: var(--text-primary); font-family: inherit;
          font-weight: 600; font-size: 0.88rem; cursor: pointer;
          transition: var(--transition-bounce);
        }
        .gb-retake:hover { border-color: var(--accent); color: var(--accent); }

        /* ── Responsive ── */
        @media (max-width: 820px) {
          .gb-setup { grid-template-columns: 1fr; }
          .gb-controls-col { order: -1; }
        }
        @media (max-width: 760px) {
          .gb-result { grid-template-columns: 1fr !important; }
          .gb-filter-row { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 480px) {
          .gb-setup { padding: 0 16px; }
          .gb-capture { padding: 0 16px; }
          .gb-result { padding: 0 16px; }
          .gb-filter-row { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </div>
  );
};
