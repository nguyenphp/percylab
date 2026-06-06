import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Download, RotateCcw, Check, FlipHorizontal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ─── Types ─────────────────────────────────────────────
type Stage    = 'frame' | 'capture' | 'style';
type FrameId  = 'strip2' | 'strip3' | 'strip4' | 'grid4' | 'duo' | 'port2' | 'port3' | 'pg4';
type FilterId = 'none' | 'bw' | 'warm' | 'cool' | 'vivid' | 'fade' | 'film';
type ThemeId  = 'white' | 'cream' | 'dark' | 'film' | 'pink' | 'sky';

// ─── Canvas Layout Config ──────────────────────────────
const PW   = 400; // landscape photo width
const PH   = 300; // landscape photo height (4:3)
const PP_W = 270; // portrait photo width
const PP_H = 360; // portrait photo height
const PAD  = 30;  // side / top padding
const GAP  = 10;  // gap between photos
const BBH  = 54;  // bottom bar height (caption + labels)

type Slot   = { x: number; y: number; w: number; h: number };
type Layout = { w: number; h: number; slots: Slot[] };

const LAYOUTS: Record<FrameId, Layout> = {
  duo: {
    w: PAD + PW + GAP + PW + PAD,
    h: PAD + PH + BBH,
    slots: [
      { x: PAD,              y: PAD, w: PW, h: PH },
      { x: PAD + PW + GAP,   y: PAD, w: PW, h: PH },
    ],
  },
  strip2: {
    w: PAD + PW + PAD,
    h: PAD + PH + GAP + PH + BBH,
    slots: [
      { x: PAD, y: PAD,                w: PW, h: PH },
      { x: PAD, y: PAD + PH + GAP,     w: PW, h: PH },
    ],
  },
  strip3: {
    w: PAD + PW + PAD,
    h: PAD + PH * 3 + GAP * 2 + BBH,
    slots: [
      { x: PAD, y: PAD,                    w: PW, h: PH },
      { x: PAD, y: PAD + (PH + GAP),       w: PW, h: PH },
      { x: PAD, y: PAD + (PH + GAP) * 2,   w: PW, h: PH },
    ],
  },
  strip4: {
    w: PAD + PW + PAD,
    h: PAD + PH * 4 + GAP * 3 + BBH,
    slots: [
      { x: PAD, y: PAD,                    w: PW, h: PH },
      { x: PAD, y: PAD + (PH + GAP),       w: PW, h: PH },
      { x: PAD, y: PAD + (PH + GAP) * 2,   w: PW, h: PH },
      { x: PAD, y: PAD + (PH + GAP) * 3,   w: PW, h: PH },
    ],
  },
  grid4: {
    w: PAD + PW + GAP + PW + PAD,
    h: PAD + PH + GAP + PH + BBH,
    slots: [
      { x: PAD,             y: PAD,            w: PW, h: PH },
      { x: PAD + PW + GAP,  y: PAD,            w: PW, h: PH },
      { x: PAD,             y: PAD + PH + GAP, w: PW, h: PH },
      { x: PAD + PW + GAP,  y: PAD + PH + GAP, w: PW, h: PH },
    ],
  },
  // ── Portrait layouts ──
  port2: {
    // 2 portrait photos side by side → landscape output
    w: PAD + PP_W + GAP + PP_W + PAD,
    h: PAD + PP_H + BBH,
    slots: [
      { x: PAD,               y: PAD, w: PP_W, h: PP_H },
      { x: PAD + PP_W + GAP,  y: PAD, w: PP_W, h: PP_H },
    ],
  },
  port3: {
    // 3 portrait photos vertical strip
    w: PAD + PP_W + PAD,
    h: PAD + PP_H * 3 + GAP * 2 + BBH,
    slots: [
      { x: PAD, y: PAD,                       w: PP_W, h: PP_H },
      { x: PAD, y: PAD + (PP_H + GAP),         w: PP_W, h: PP_H },
      { x: PAD, y: PAD + (PP_H + GAP) * 2,     w: PP_W, h: PP_H },
    ],
  },
  pg4: {
    // 4 portrait photos in 2×2 grid
    w: PAD + PP_W + GAP + PP_W + PAD,
    h: PAD + PP_H + GAP + PP_H + BBH,
    slots: [
      { x: PAD,              y: PAD,              w: PP_W, h: PP_H },
      { x: PAD + PP_W + GAP, y: PAD,              w: PP_W, h: PP_H },
      { x: PAD,              y: PAD + PP_H + GAP, w: PP_W, h: PP_H },
      { x: PAD + PP_W + GAP, y: PAD + PP_H + GAP, w: PP_W, h: PP_H },
    ],
  },
};

// ─── Filters ───────────────────────────────────────────
const FILTERS: { id: FilterId; name: string; nameVi: string; css: string }[] = [
  { id: 'none',  name: 'Normal', nameVi: 'Gốc',  css: 'none' },
  { id: 'bw',    name: 'B&W',   nameVi: 'B&W',   css: 'grayscale(100%)' },
  { id: 'warm',  name: 'Warm',  nameVi: 'Ấm',    css: 'sepia(35%) saturate(120%) brightness(1.05)' },
  { id: 'cool',  name: 'Cool',  nameVi: 'Lạnh',  css: 'hue-rotate(200deg) saturate(70%)' },
  { id: 'vivid', name: 'Vivid', nameVi: 'Đậm',   css: 'saturate(160%) contrast(112%)' },
  { id: 'fade',  name: 'Fade',  nameVi: 'Mờ',    css: 'brightness(1.15) contrast(0.8) saturate(0.65)' },
  { id: 'film',  name: 'Film',  nameVi: 'Phim',  css: 'sepia(0.45) contrast(1.1) saturate(0.85)' },
];

// ─── Themes ────────────────────────────────────────────
type Theme = { id: ThemeId; name: string; bg: string; border: string; text: string };
const THEMES: Theme[] = [
  { id: 'white', name: 'Classic', bg: '#ffffff', border: '#d5d5d5', text: '#222222' },
  { id: 'cream', name: 'Cream',   bg: '#fdf6e3', border: '#e8d8b4', text: '#5a4a3a' },
  { id: 'dark',  name: 'Dark',    bg: '#1a1a1a', border: '#333333', text: '#ffffff' },
  { id: 'film',  name: 'Film',    bg: '#0d0d0d', border: '#2a2a2a', text: '#d4a017' },
  { id: 'pink',  name: 'Rose',    bg: '#fff0f5', border: '#ffd6e0', text: '#8b4768' },
  { id: 'sky',   name: 'Sky',     bg: '#f0f6ff', border: '#c8dcff', text: '#3b5bdb' },
];

// ─── Frame Template Defs ───────────────────────────────
const FRAME_TEMPLATES: {
  id: FrameId; shots: number;
  nameVi: string; nameEn: string;
  descVi: string; descEn: string;
}[] = [
  { id: 'strip2', shots: 2, nameVi: 'Strip 2', nameEn: 'Strip 2', descVi: '2 tấm dọc',   descEn: '2 vertical'   },
  { id: 'strip3', shots: 3, nameVi: 'Strip 3', nameEn: 'Strip 3', descVi: '3 tấm dọc',   descEn: '3 vertical'   },
  { id: 'strip4', shots: 4, nameVi: 'Strip 4', nameEn: 'Strip 4', descVi: '4 tấm dọc',   descEn: '4 vertical'   },
  { id: 'grid4',  shots: 4, nameVi: 'Grid 2×2',nameEn: 'Grid 2×2',descVi: 'Lưới 4 ô',    descEn: '2×2 grid'     },
  { id: 'duo',    shots: 2, nameVi: 'Duo',     nameEn: 'Duo',     descVi: '2 ảnh ngang', descEn: 'Side-by-side' },
  { id: 'port2',  shots: 2, nameVi: 'Port 2',  nameEn: 'Port 2',  descVi: '2 dọc kép',   descEn: '2 portrait'   },
  { id: 'port3',  shots: 3, nameVi: 'Port 3',  nameEn: 'Port 3',  descVi: '3 dọc dài',   descEn: '3 portrait'   },
  { id: 'pg4',    shots: 4, nameVi: 'P-Grid',  nameEn: 'P-Grid',  descVi: '4 dọc lưới',  descEn: '4p 2×2 grid'  },
];

// ─── Frame Preview SVG ─────────────────────────────────
function FramePreview({ frameId, selected }: { frameId: FrameId; selected: boolean }) {
  const layout = LAYOUTS[frameId];
  const maxW = 52, maxH = 74;
  const scale = Math.min(maxW / layout.w, maxH / layout.h);
  const sW = layout.w * scale;
  const sH = layout.h * scale;
  const ox = (60 - sW) / 2;
  const oy = (80 - sH) / 2;
  return (
    <svg width="60" height="80" viewBox="0 0 60 80" style={{ display: 'block', margin: '0 auto' }}>
      <rect x={ox} y={oy} width={sW} height={sH}
        fill={selected ? 'rgba(46,125,96,0.1)' : 'rgba(0,0,0,0.04)'} rx="3" />
      {layout.slots.map((s, i) => (
        <rect key={i}
          x={ox + s.x * scale} y={oy + s.y * scale}
          width={s.w * scale} height={s.h * scale}
          fill={selected ? 'rgba(46,125,96,0.28)' : 'rgba(0,0,0,0.13)'}
          stroke={selected ? 'rgba(46,125,96,0.6)' : 'rgba(0,0,0,0.22)'}
          strokeWidth="1" rx="1.5"
        />
      ))}
    </svg>
  );
}

const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

// ─── Main Component ────────────────────────────────────
export const PhotoBoothTool: React.FC = () => {
  const { lang } = useLanguage();

  const [stage, setStage]           = useState<Stage>('frame');
  const [frameId, setFrameId]       = useState<FrameId>('strip3');
  const [cdDuration, setCdDuration] = useState(3);
  const [mirrored, setMirrored]     = useState(true);

  const [currentShot, setCurrentShot]       = useState(0);
  const [cdValue, setCdValue]               = useState<number | null>(null);
  const [isFlashing, setIsFlashing]         = useState(false);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [cameraError, setCameraError]       = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<FilterId>('none');
  const [selectedTheme, setSelectedTheme]   = useState<ThemeId>('white');
  const [caption, setCaption]               = useState('');
  const [showDate, setShowDate]             = useState(true);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering]       = useState(false);

  const videoRef      = useRef<HTMLVideoElement>(null);
  const captureCanvas = useRef<HTMLCanvasElement>(null);
  const previewCanvas = useRef<HTMLCanvasElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const cancelledRef  = useRef(false);

  const stageIndex = ['frame', 'capture', 'style'].indexOf(stage);
  const totalShots = LAYOUTS[frameId].slots.length;

  // ── Camera ───────────────────────────────────────────
  const startCamera = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

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

  // ── Re-attach stream after stage transitions ─────────
  useEffect(() => {
    if (streamRef.current && videoRef.current && stage !== 'style') {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [stage]);

  // ── Start camera on mount for stage 1 live preview ──
  useEffect(() => {
    startCamera().catch(() => setCameraError(true));
    return () => { cancelledRef.current = true; stopCamera(); };
  }, []);

  // ── Capture session ──────────────────────────────────
  const startSession = async () => {
    cancelledRef.current = false;
    setCameraError(false);
    setCapturedFrames([]);
    setCurrentShot(0);
    setCdValue(null);
    setIsFlashing(false);
    setStage('capture');

    // Give React time to remount video + effect to fire
    await sleep(800);

    if (cancelledRef.current) return;

    const frames: string[] = [];
    for (let i = 0; i < totalShots; i++) {
      if (cancelledRef.current) return;
      setCurrentShot(i);
      for (let cd = cdDuration; cd >= 1; cd--) {
        if (cancelledRef.current) return;
        setCdValue(cd);
        await sleep(1000);
      }
      if (cancelledRef.current) return;
      setCdValue(null);
      setIsFlashing(true);
      const frame = captureFrame();
      if (frame) { frames.push(frame); setCapturedFrames([...frames]); }
      await sleep(450);
      if (cancelledRef.current) return;
      setIsFlashing(false);
      if (i < totalShots - 1) await sleep(650);
    }

    if (!cancelledRef.current) { stopCamera(); setStage('style'); }
  };

  const retake = () => {
    cancelledRef.current = true;
    stopCamera();
    setCapturedFrames([]);
    setCdValue(null);
    setIsFlashing(false);
    setPreviewDataUrl(null);
    setStage('frame');
    // Restart camera for stage 1 preview
    setTimeout(() => startCamera().catch(() => setCameraError(true)), 200);
  };

  // ── Canvas rendering (Stage 3) ───────────────────────
  const renderCanvas = async () => {
    const canvas = previewCanvas.current;
    if (!canvas || capturedFrames.length === 0) return;
    setIsRendering(true);
    setPreviewDataUrl(null);

    const layout = LAYOUTS[frameId];
    const theme  = THEMES.find(t => t.id === selectedTheme)!;
    const filter = FILTERS.find(f => f.id === selectedFilter)!;

    canvas.width  = layout.w;
    canvas.height = layout.h;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, layout.w, layout.h);

    // Film sprockets for film theme
    if (selectedTheme === 'film') {
      const sW = 9, sH = 16, sR = 3;
      const count = Math.floor(layout.h / 27);
      for (let i = 0; i < count; i++) {
        const sy = 6 + i * 27;
        ctx.fillStyle = '#252525';
        for (const sx of [7, layout.w - 16]) {
          ctx.beginPath(); ctx.roundRect(sx, sy, sW, sH, sR); ctx.fill();
        }
      }
    }

    // Draw each photo with filter
    const drawPhoto = (idx: number): Promise<void> => {
      if (idx >= capturedFrames.length) return Promise.resolve();
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const s = layout.slots[idx];
          ctx.save();
          ctx.beginPath(); ctx.rect(s.x, s.y, s.w, s.h); ctx.clip();
          // Cover-fit
          const iAR = img.naturalWidth / img.naturalHeight;
          const sAR = s.w / s.h;
          let dx = s.x, dy = s.y, dw = s.w, dh = s.h;
          if (iAR > sAR) { dw = s.h * iAR; dx = s.x - (dw - s.w) / 2; }
          else           { dh = s.w / iAR; dy = s.y - (dh - s.h) / 2; }
          ctx.filter = filter.css === 'none' ? '' : filter.css;
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.filter = 'none';
          ctx.restore();
          drawPhoto(idx + 1).then(resolve);
        };
        img.src = capturedFrames[idx];
      });
    };
    await drawPhoto(0);

    // Bottom bar text
    const ty = layout.h - 16;
    if (caption.trim()) {
      ctx.fillStyle = theme.text;
      ctx.font = `italic bold 17px "Outfit", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText(caption, layout.w / 2, ty, layout.w - PAD * 2);
    }
    if (showDate) {
      const now = new Date();
      const ds  = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
      ctx.fillStyle = theme.text; ctx.globalAlpha = 0.45;
      ctx.font = `11px monospace`; ctx.textAlign = 'right';
      ctx.fillText(ds, layout.w - PAD, ty);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = theme.text; ctx.globalAlpha = 0.28;
    ctx.font = `10px monospace`; ctx.textAlign = 'left';
    ctx.fillText('percylab.space', PAD, ty);
    ctx.globalAlpha = 1;

    setPreviewDataUrl(canvas.toDataURL('image/png'));
    setIsRendering(false);
  };

  useEffect(() => {
    if (stage === 'style' && capturedFrames.length > 0) renderCanvas();
  }, [stage, capturedFrames, selectedFilter, selectedTheme, caption, showDate]);

  const download = () => {
    if (!previewDataUrl) return;
    const a = document.createElement('a');
    a.href = previewDataUrl; a.download = 'percylab-photobooth.png'; a.click();
  };

  // ── JSX ──────────────────────────────────────────────
  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">selfbooth</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi' ? 'Chọn khung → Tự động chụp → Thiết kế & Tải về' : 'Pick frame → Auto-capture → Style & Download'}
        </p>
      </div>

      {/* ── Step bar ── */}
      <div className="pbs-steps">
        {(['frame','capture','style'] as Stage[]).map((s, i) => (
          <React.Fragment key={s}>
            <div className={`pbs-step ${stage === s ? 'active' : stageIndex > i ? 'done' : ''}`}>
              <span className="pbs-num">{i + 1}</span>
              <span className="pbs-lbl">
                {s === 'frame'   ? (lang === 'vi' ? 'Chọn khung' : 'Pick Frame') :
                 s === 'capture' ? (lang === 'vi' ? 'Chụp ảnh'   : 'Capture')    :
                                   (lang === 'vi' ? 'Thiết kế'   : 'Style')}
              </span>
            </div>
            {i < 2 && <div className="pbs-connector" />}
          </React.Fragment>
        ))}
      </div>

      {/* ══════════════ STAGE 1: FRAME ══════════════ */}
      {stage === 'frame' && (
        <div className="pbs-stage pbs-stage-1 animate-fade">
          {/* ── Left: Live camera preview ── */}
          <div className="pbs-live-col">
            <div className="pbs-live-wrapper glass">
              {/* Corner brackets */}
              <div className="pbs-corner pbs-tl" />
              <div className="pbs-corner pbs-tr" />
              <div className="pbs-corner pbs-bl" />
              <div className="pbs-corner pbs-br" />

              {cameraError ? (
                <div className="pbs-cam-error">
                  <Camera size={36} style={{ opacity: 0.3 }} />
                  <p>{lang === 'vi' ? 'Không thể truy cập camera. Vui lòng cấp quyền.' : 'Camera access denied. Please allow permission.'}</p>
                  <button className="btn btn-primary" style={{ marginTop: 12 }}
                    onClick={() => { setCameraError(false); startCamera().catch(() => setCameraError(true)); }}>
                    {lang === 'vi' ? 'Thử lại' : 'Retry'}
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay playsInline muted
                  className="pbs-live-video"
                  style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
                />
              )}
            </div>

            {/* Mirror toggle */}
            <button className="pbs-mirror-btn" onClick={() => setMirrored(m => !m)}>
              <span className="pbs-mirror-dot" style={{ background: mirrored ? 'var(--accent)' : 'var(--text-secondary)' }} />
              <FlipHorizontal size={14} />
              {lang === 'vi' ? 'Lật gương' : 'Mirror'}
            </button>
          </div>

          {/* ── Right: Frame grid + settings ── */}
          <div className="pbs-right-panel">
            {cameraError && (
              <div className="pbs-error">
                {lang === 'vi' ? '⚠️ Không thể truy cập camera. Vui lòng cấp quyền rồi thử lại.' : '⚠️ Camera access denied. Allow permission and retry.'}
              </div>
            )}

            <p className="pbs-section-lbl">{lang === 'vi' ? 'Chọn khung hình' : 'Select frame layout'}</p>

            <div className="pbs-frame-grid">
              {FRAME_TEMPLATES.map(tpl => (
                <button key={tpl.id}
                  className={`pbs-frame-card glass ${frameId === tpl.id ? 'selected' : ''}`}
                  onClick={() => setFrameId(tpl.id)}>
                  <FramePreview frameId={tpl.id} selected={frameId === tpl.id} />
                  <span className="pbs-fc-name">{lang === 'vi' ? tpl.nameVi : tpl.nameEn}</span>
                  <span className="pbs-fc-desc">{lang === 'vi' ? tpl.descVi : tpl.descEn}</span>
                </button>
              ))}
            </div>

            {/* Countdown picker */}
            <div className="pbs-settings">
              <p className="pbs-section-lbl" style={{ marginTop: 4, marginBottom: 8 }}>
                {lang === 'vi' ? 'Đếm ngược mỗi tấm' : 'Countdown per shot'}
              </p>
              <div className="pbs-cd-chips">
                {[3, 5, 10].map(s => (
                  <button key={s} onClick={() => setCdDuration(s)}
                    className={`pbs-cd-btn ${cdDuration === s ? 'active' : ''}`}>{s}s</button>
                ))}
              </div>
            </div>

            <button onClick={startSession} className="btn btn-primary btn-generate" style={{ width: '100%', marginTop: 12 }}>
              <Camera size={18} />
              <span>{lang === 'vi' ? `Bắt đầu chụp ${totalShots} tấm!` : `Bắt đầu — ${totalShots} shots`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ STAGE 2: CAPTURE ══════════════ */}
      {stage === 'capture' && (
        <div className="pbs-stage pbs-capture animate-fade">
          <div className="pbs-video-card glass">
            <div className="pbs-dots">
              {Array.from({ length: totalShots }).map((_, i) => (
                <div key={i} className={`pbs-dot ${i < capturedFrames.length ? 'done' : i === currentShot ? 'cur' : ''}`} />
              ))}
            </div>
            <div className="pbs-video-box">
              <video ref={videoRef} autoPlay playsInline muted className="pbs-video"
                style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }} />
              {cdValue !== null && (
                <div className="pbs-cd-overlay">
                  <span key={cdValue} className="pbs-cd-num">{cdValue}</span>
                </div>
              )}
              {isFlashing && <div className="pbs-flash" />}
            </div>
            <div className="pbs-shot-info">
              <span>{lang === 'vi' ? `Tấm ${currentShot + 1} / ${totalShots}` : `Shot ${currentShot + 1} of ${totalShots}`}</span>
              {capturedFrames.length > 0 && <span className="pbs-done-lbl">✓ {capturedFrames.length} {lang === 'vi' ? 'xong' : 'done'}</span>}
            </div>
          </div>

          <div className="pbs-thumbs">
            {Array.from({ length: totalShots }).map((_, i) => (
              <div key={i} className={`pbs-thumb ${capturedFrames[i] ? 'filled' : i === currentShot ? 'cur' : ''}`}>
                {capturedFrames[i]
                  ? <img src={capturedFrames[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span className="pbs-thumb-n">{i + 1}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ STAGE 3: STYLE ══════════════ */}
      {stage === 'style' && (
        <div className="pbs-stage pbs-style animate-fade">
          {/* Preview */}
          <div className="pbs-preview glass">
            {isRendering && <p className="pbs-rendering">{lang === 'vi' ? 'Đang tạo ảnh...' : 'Rendering...'}</p>}
            <canvas ref={previewCanvas} className="pbs-canvas" />
          </div>

          {/* Controls */}
          <div className="pbs-controls">
            {/* Filter — 7 filters, 7 columns */}
            <div className="pbs-ctrl-box glass">
              <span className="pbs-ctrl-lbl">{lang === 'vi' ? 'Bộ lọc màu' : 'Color Filter'}</span>
              <div className="pbs-filter-row">
                {FILTERS.map(f => (
                  <button key={f.id}
                    className={`pbs-filt-btn ${selectedFilter === f.id ? 'active' : ''}`}
                    onClick={() => setSelectedFilter(f.id)}>
                    <div className="pbs-filt-thumb">
                      {capturedFrames[0] && (
                        <img src={capturedFrames[0]} alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover',
                            filter: f.css === 'none' ? 'none' : f.css }} />
                      )}
                    </div>
                    <span>{lang === 'vi' ? f.nameVi : f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="pbs-ctrl-box glass">
              <span className="pbs-ctrl-lbl">{lang === 'vi' ? 'Kiểu viền & nền' : 'Frame & Background'}</span>
              <div className="pbs-theme-row">
                {THEMES.map(th => (
                  <button key={th.id} title={th.name}
                    className={`pbs-theme-dot ${selectedTheme === th.id ? 'active' : ''}`}
                    style={{ background: th.bg, border: `2.5px solid ${selectedTheme === th.id ? 'var(--accent)' : th.border}` }}
                    onClick={() => setSelectedTheme(th.id)}>
                    {selectedTheme === th.id && <Check size={12} style={{ color: th.text }} />}
                  </button>
                ))}
              </div>
              <div className="pbs-theme-names">
                {THEMES.map(th => (
                  <span key={th.id} className={`pbs-theme-nm ${selectedTheme === th.id ? 'active' : ''}`}>{th.name}</span>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="pbs-ctrl-box glass">
              <span className="pbs-ctrl-lbl">{lang === 'vi' ? 'Tiêu đề' : 'Caption'}</span>
              <input type="text" value={caption} maxLength={40}
                onChange={e => setCaption(e.target.value)}
                placeholder={lang === 'vi' ? 'Thêm chú thích ảnh...' : 'Add a caption...'}
                className="form-input" style={{ width: '100%', marginTop: 6 }} />
            </div>

            {/* Date toggle */}
            <div className="pbs-ctrl-box glass">
              <label className="pbs-toggle-row" onClick={() => setShowDate(!showDate)}>
                <span className="pbs-ctrl-lbl" style={{ margin: 0 }}>
                  {lang === 'vi' ? 'Ngày chụp' : 'Date stamp'}
                </span>
                <div className={`pbs-toggle ${showDate ? 'on' : ''}`}>
                  <div className="pbs-toggle-knob" />
                </div>
              </label>
            </div>

            <button onClick={download} disabled={!previewDataUrl || isRendering}
              className="btn btn-primary btn-generate" style={{ width: '100%' }}>
              <Download size={18} />
              <span>{lang === 'vi' ? 'Tải ảnh (PNG)' : 'Download PNG'}</span>
            </button>

            <button onClick={retake} className="pbs-retake">
              <RotateCcw size={15} />
              <span>{lang === 'vi' ? 'Chụp lại từ đầu' : 'Start Over'}</span>
            </button>
          </div>
        </div>
      )}

      <canvas ref={captureCanvas} style={{ display: 'none' }} />

      <style>{`
        /* ── Step bar ── */
        .pbs-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin: 0 auto 28px;
        }
        .pbs-step {
          display: flex; align-items: center; gap: 7px;
          opacity: 0.38; transition: opacity 0.3s;
        }
        .pbs-step.active { opacity: 1; }
        .pbs-step.done   { opacity: 0.62; }
        .pbs-num {
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--card-border); color: var(--text-secondary);
          font-size: 0.76rem; font-weight: 800; font-family: var(--font-heading);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pbs-step.active .pbs-num,
        .pbs-step.done   .pbs-num { background: var(--accent); color: #fff; }
        .pbs-lbl {
          font-size: 0.8rem; font-weight: 700;
          color: var(--text-secondary); white-space: nowrap;
        }
        .pbs-step.active .pbs-lbl { color: var(--text-primary); }
        .pbs-connector {
          width: 28px; height: 1.5px;
          background: var(--card-border);
          margin: 0 10px; flex-shrink: 0;
        }

        /* ── Common stage wrapper ── */
        .pbs-stage {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .pbs-section-lbl {
          font-size: 0.74rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--text-secondary); margin-bottom: 12px;
        }
        .pbs-error {
          background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2);
          color: #ef4444; border-radius: 8px; padding: 10px 14px;
          font-size: 0.82rem; margin-bottom: 16px;
        }

        /* ── Stage 1: 2-column layout ── */
        .pbs-stage-1 {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 22px;
          align-items: start;
          max-width: 960px !important;
        }

        /* Live camera column */
        .pbs-live-col {
          display: flex; flex-direction: column; gap: 12px;
        }
        .pbs-live-wrapper {
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          aspect-ratio: 4/3;
          background: #111;
          display: flex; align-items: center; justify-content: center;
        }
        .pbs-live-video {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .pbs-cam-error {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; color: var(--text-secondary); font-size: 0.88rem;
          text-align: center; padding: 24px;
        }

        /* Corner brackets */
        .pbs-corner {
          position: absolute; width: 20px; height: 20px; z-index: 10;
          pointer-events: none;
        }
        .pbs-tl { top: 10px; left: 10px;
          border-top: 2.5px solid rgba(255,255,255,0.65);
          border-left: 2.5px solid rgba(255,255,255,0.65); }
        .pbs-tr { top: 10px; right: 10px;
          border-top: 2.5px solid rgba(255,255,255,0.65);
          border-right: 2.5px solid rgba(255,255,255,0.65); }
        .pbs-bl { bottom: 10px; left: 10px;
          border-bottom: 2.5px solid rgba(255,255,255,0.65);
          border-left: 2.5px solid rgba(255,255,255,0.65); }
        .pbs-br { bottom: 10px; right: 10px;
          border-bottom: 2.5px solid rgba(255,255,255,0.65);
          border-right: 2.5px solid rgba(255,255,255,0.65); }

        /* Mirror button */
        .pbs-mirror-btn {
          display: inline-flex; align-items: center; gap: 7px;
          align-self: flex-start;
          padding: 7px 14px; border-radius: 99px;
          border: 1.5px solid var(--card-border);
          background: var(--card-bg);
          color: var(--text-secondary);
          font-family: var(--font-heading); font-weight: 700; font-size: 0.82rem;
          cursor: pointer; transition: var(--transition-bounce);
        }
        .pbs-mirror-btn:hover { border-color: var(--accent); color: var(--text-primary); }
        .pbs-mirror-dot {
          width: 8px; height: 8px; border-radius: 50%;
          flex-shrink: 0; transition: background 0.2s;
        }

        /* Right panel */
        .pbs-right-panel {
          display: flex; flex-direction: column; gap: 14px;
        }

        /* Frame grid — 4 columns */
        .pbs-frame-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .pbs-frame-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 10px 4px 8px;
          border-radius: var(--radius-md);
          border: 2px solid var(--card-border);
          background: none; cursor: pointer;
          transition: var(--transition-bounce);
          font-family: inherit;
        }
        .pbs-frame-card:hover    { border-color: var(--accent); transform: translateY(-2px); }
        .pbs-frame-card.selected { border-color: var(--accent); background: rgba(46,125,96,0.04); }
        .pbs-fc-name { font-size: 0.75rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-heading); }
        .pbs-fc-desc { font-size: 0.62rem; color: var(--text-secondary); text-align: center; }

        /* Settings area */
        .pbs-settings { display: flex; flex-direction: column; gap: 6px; }

        /* Countdown chips */
        .pbs-cd-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .pbs-cd-btn {
          padding: 6px 14px; border-radius: 99px;
          border: 1.5px solid var(--card-border);
          background: var(--bg-cream);
          color: var(--text-secondary);
          font-family: var(--font-heading); font-weight: 700; font-size: 0.82rem;
          cursor: pointer; transition: var(--transition-bounce);
          white-space: nowrap;
        }
        .pbs-cd-btn:hover { border-color: var(--accent); color: var(--accent); }
        .pbs-cd-btn.active {
          background: var(--accent); color: #fff;
          border-color: var(--accent);
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        /* ── Stage 2: Capture ── */
        .pbs-capture { display: flex; flex-direction: column; gap: 18px; }
        .pbs-video-card {
          border-radius: var(--radius-md); padding: 18px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .pbs-dots { display: flex; gap: 8px; justify-content: center; }
        .pbs-dot {
          width: 11px; height: 11px; border-radius: 50%;
          background: var(--card-border); transition: all 0.3s;
        }
        .pbs-dot.done { background: var(--accent); }
        .pbs-dot.cur  { background: #f59e0b; transform: scale(1.45); box-shadow: 0 0 10px rgba(245,158,11,0.5); }
        .pbs-video-box {
          position: relative; border-radius: var(--radius-sm);
          overflow: hidden; background: #000; aspect-ratio: 4/3;
        }
        .pbs-video {
          width: 100%; height: 100%; object-fit: cover;
          display: block;
        }
        .pbs-cd-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.38);
        }
        .pbs-cd-num {
          font-size: 5.5rem; font-weight: 900; color: #fff;
          font-family: var(--font-heading);
          animation: pbs-pop 0.32s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes pbs-pop {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .pbs-flash {
          position: absolute; inset: 0; background: #fff; pointer-events: none;
          animation: pbs-flash-a 0.42s ease-out forwards;
        }
        @keyframes pbs-flash-a {
          0% { opacity: 0.92; } 100% { opacity: 0; }
        }
        .pbs-shot-info {
          display: flex; justify-content: space-between;
          font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);
        }
        .pbs-done-lbl { color: var(--accent); }
        .pbs-thumbs {
          display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;
        }
        .pbs-thumb {
          width: 76px; height: 57px; border-radius: 7px;
          border: 2px solid var(--card-border); overflow: hidden;
          background: var(--glass-bg);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s; flex-shrink: 0;
        }
        .pbs-thumb.filled { border-color: var(--accent); box-shadow: 0 0 10px rgba(46,125,96,0.14); }
        .pbs-thumb.cur    { border-color: #f59e0b; border-style: dashed; animation: pbs-pending 1s ease-in-out infinite; }
        @keyframes pbs-pending {
          0%,100% { box-shadow: 0 0 0 rgba(245,158,11,0); }
          50%     { box-shadow: 0 0 10px rgba(245,158,11,0.35); }
        }
        .pbs-thumb-n { font-size: 1.2rem; font-weight: 800; color: var(--text-secondary); opacity: 0.35; }

        /* ── Stage 3: Style ── */
        .pbs-style {
          max-width: 1040px !important;
          display: grid;
          grid-template-columns: auto 300px;
          gap: 20px;
          align-items: start;
        }
        .pbs-preview {
          border-radius: var(--radius-md); padding: 20px;
          background: #111 !important;
          display: flex; align-items: center; justify-content: center;
          min-height: 280px; position: relative;
        }
        .pbs-rendering { position: absolute; color: #666; font-size: 0.82rem; }
        .pbs-canvas { max-width: 100%; max-height: 580px; display: block; border-radius: 3px; }

        .pbs-controls { display: flex; flex-direction: column; gap: 10px; }
        .pbs-ctrl-box { border-radius: var(--radius-md); padding: 13px 15px; display: flex; flex-direction: column; gap: 8px; }
        .pbs-ctrl-lbl {
          font-size: 0.7rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-secondary);
        }

        /* 7 filters in 7 columns */
        .pbs-filter-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .pbs-filt-btn {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          background: none; border: 2px solid var(--card-border); border-radius: 7px;
          cursor: pointer; overflow: hidden; padding: 0 0 4px;
          transition: var(--transition-bounce); font-family: inherit;
        }
        .pbs-filt-btn:hover  { border-color: var(--accent); }
        .pbs-filt-btn.active { border-color: var(--accent); }
        .pbs-filt-btn span   { font-size: 0.55rem; font-weight: 700; color: var(--text-secondary); }
        .pbs-filt-btn.active span { color: var(--accent); }
        .pbs-filt-thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; }

        .pbs-theme-row { display: flex; gap: 7px; align-items: center; }
        .pbs-theme-dot {
          width: 32px; height: 32px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .pbs-theme-dot:hover  { transform: scale(1.12); }
        .pbs-theme-dot.active { transform: scale(1.18); }
        .pbs-theme-names { display: flex; gap: 7px; }
        .pbs-theme-nm {
          width: 32px; text-align: center;
          font-size: 0.6rem; color: var(--text-secondary); font-weight: 600;
        }
        .pbs-theme-nm.active { color: var(--accent); font-weight: 800; }

        .pbs-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; user-select: none;
        }
        .pbs-toggle {
          width: 38px; height: 21px; border-radius: 11px;
          background: var(--card-border); position: relative;
          transition: background 0.2s; flex-shrink: 0;
        }
        .pbs-toggle.on { background: var(--accent); }
        .pbs-toggle-knob {
          width: 15px; height: 15px; border-radius: 50%; background: #fff;
          position: absolute; top: 3px; left: 3px;
          transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .pbs-toggle.on .pbs-toggle-knob { left: 20px; }

        .pbs-retake {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; padding: 10px; border-radius: var(--radius-sm);
          border: 1.5px solid var(--card-border); background: transparent;
          color: var(--text-primary); font-family: inherit;
          font-weight: 600; font-size: 0.88rem; cursor: pointer;
          transition: var(--transition-bounce);
        }
        .pbs-retake:hover { border-color: var(--accent); color: var(--accent); }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .pbs-stage-1 {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 760px) {
          .pbs-frame-grid { grid-template-columns: repeat(4, 1fr); }
          .pbs-style { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 500px) {
          .pbs-frame-grid { grid-template-columns: repeat(2, 1fr); }
          .pbs-stage { padding: 0 16px; }
          .pbs-filter-row { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </div>
  );
};
