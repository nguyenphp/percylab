import { useState, useRef } from 'react';
import { Copy, Check, RotateCw, Trash2 } from 'lucide-react';

interface ColorStop {
  id: string;
  color: string;
  position: number; // 0 to 100
}

interface GradientPreset {
  name: string;
  type: 'linear' | 'radial';
  angle: number;
  stops: ColorStop[];
}

import { useLanguage } from '../context/LanguageContext';

export const GradioTool: React.FC = () => {
  const { lang, t } = useLanguage();
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState<number>(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: '1', color: '#E8F5E9', position: 0 },
    { id: '2', color: '#A3E4D7', position: 100 },
  ]);
  const [selectedStopId, setSelectedStopId] = useState<string>('1');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  const presets: GradientPreset[] = [
    {
      name: 'Mint Breeze',
      type: 'linear',
      angle: 135,
      stops: [
        { id: 'p1-1', color: '#E8F5E9', position: 0 },
        { id: 'p1-2', color: '#C8E6C9', position: 100 },
      ]
    },
    {
      name: 'Morning Sage',
      type: 'linear',
      angle: 90,
      stops: [
        { id: 'p2-1', color: '#E0F2F1', position: 0 },
        { id: 'p2-2', color: '#B2DFDB', position: 50 },
        { id: 'p2-3', color: '#80CBC4', position: 100 },
      ]
    },
    {
      name: 'Peach Blossom',
      type: 'linear',
      angle: 135,
      stops: [
        { id: 'p3-1', color: '#FFE0B2', position: 0 },
        { id: 'p3-2', color: '#FFCDD2', position: 100 },
      ]
    },
    {
      name: 'Sky Glass',
      type: 'linear',
      angle: 45,
      stops: [
        { id: 'p4-1', color: '#E0F7FA', position: 0 },
        { id: 'p4-2', color: '#E8EAF6', position: 100 },
      ]
    },
    {
      name: 'Sweet Lavender',
      type: 'linear',
      angle: 225,
      stops: [
        { id: 'p5-1', color: '#F3E5F5', position: 0 },
        { id: 'p5-2', color: '#E8EAF6', position: 100 },
      ]
    }
  ];

  // Helper to construct the CSS gradient string
  const getGradientCSS = (sortedStops: ColorStop[] = []) => {
    const stopsList = sortedStops.length > 0 ? sortedStops : [...stops].sort((a, b) => a.position - b.position);
    const stopsString = stopsList.map(s => `${s.color} ${s.position}%`).join(', ');
    
    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsString})`;
    } else {
      return `radial-gradient(circle at center, ${stopsString})`;
    }
  };

  const loadPreset = (preset: GradientPreset) => {
    setGradientType(preset.type);
    setAngle(preset.angle);
    // Deep copy stops
    const newStops = preset.stops.map(s => ({ ...s, id: Math.random().toString() }));
    setStops(newStops);
    setSelectedStopId(newStops[0].id);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || isDraggingRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const position = Math.round((clickX / rect.width) * 100);

    // Get color at clicked position (simple linear interpolation)
    const color = getColorAtPosition(position);
    const newStop: ColorStop = {
      id: Math.random().toString(),
      color,
      position
    };

    setStops(prev => {
      const updated = [...prev, newStop];
      return updated.sort((a, b) => a.position - b.position);
    });
    setSelectedStopId(newStop.id);
  };

  const getColorAtPosition = (pos: number): string => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    
    // Check bounds
    if (pos <= sorted[0].position) return sorted[0].color;
    if (pos >= sorted[sorted.length - 1].position) return sorted[sorted.length - 1].color;

    // Find bounding stops
    let left = sorted[0];
    let right = sorted[sorted.length - 1];

    for (let i = 0; i < sorted.length - 1; i++) {
      if (pos >= sorted[i].position && pos <= sorted[i + 1].position) {
        left = sorted[i];
        right = sorted[i + 1];
        break;
      }
    }

    const range = right.position - left.position;
    const factor = range === 0 ? 0 : (pos - left.position) / range;

    return interpolateColor(left.color, right.color, factor);
  };

  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const parse = (c: string) => {
      const hex = c.replace('#', '');
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    };

    const c1 = parse(color1);
    const c2 = parse(color2);

    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));

    const toHex = (x: number) => {
      const h = x.toString(16);
      return h.length === 1 ? '0' + h : h;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  const handleStopMouseDown = (e: React.MouseEvent, stopId: string) => {
    e.stopPropagation();
    setSelectedStopId(stopId);
    isDraggingRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const moveX = moveEvent.clientX - rect.left;
      let position = Math.round((moveX / rect.width) * 100);
      position = Math.max(0, Math.min(100, position)); // Clamp 0-100

      setStops(prev => 
        prev.map(s => s.id === stopId ? { ...s, position } : s)
      );
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const updateSelectedColor = (color: string) => {
    setStops(prev => 
      prev.map(s => s.id === selectedStopId ? { ...s, color } : s)
    );
  };

  const deleteSelectedStop = () => {
    if (stops.length <= 2) return; // Must have at least 2 stops
    const updated = stops.filter(s => s.id !== selectedStopId);
    setStops(updated);
    setSelectedStopId(updated[0].id);
  };

  const copyCode = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 1500);
  };

  // Generate React Native template code string
  const getRNCode = () => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const colorsArr = sorted.map(s => `'${s.color}'`).join(', ');
    const locationsArr = sorted.map(s => s.position / 100).join(', ');

    if (gradientType === 'linear') {
      // Calculate start and end coordinates based on angle
      const rad = (angle * Math.PI) / 180;
      const start = {
        x: Math.round((0.5 - Math.cos(rad) / 2) * 10) / 10,
        y: Math.round((0.5 + Math.sin(rad) / 2) * 10) / 10
      };
      const end = {
        x: Math.round((0.5 + Math.cos(rad) / 2) * 10) / 10,
        y: Math.round((0.5 - Math.sin(rad) / 2) * 10) / 10
      };

      return `<LinearGradient\n  colors={[${colorsArr}]}\n  locations={[${locationsArr}]}\n  start={{ x: ${start.x}, y: ${start.y} }}\n  end={{ x: ${end.x}, y: ${end.y} }}\n  style={styles.gradient}\n/>`;
    }

    return `<RadialGradient\n  colors={[${colorsArr}]}\n  center={[0.5, 0.5]}\n  radius={0.5}\n  style={styles.gradient}\n/>`;
  };

  // Generate Tailwind classes
  const getTailwindCode = () => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    if (sorted.length === 2) {
      return `bg-gradient-to-r from-[${sorted[0].color}] to-[${sorted[1].color}]`;
    }
    if (sorted.length === 3) {
      return `bg-gradient-to-r from-[${sorted[0].color}] via-[${sorted[1].color}] to-[${sorted[2].color}]`;
    }
    return `bg-[image:${getGradientCSS(sorted)}]`;
  };

  const activeStop = stops.find(s => s.id === selectedStopId);
  const cssString = getGradientCSS();

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">{t('gradio.title')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('gradio.desc')}
        </p>
      </div>

      <div className="tool-grid">
        {/* Left Side: Visual Preview & presets */}
        <div className="tool-grid-left animate-fade">
          {/* Preset Picker */}
          <div className="tool-card glass preset-panel">
            <h4 className="presets-title">{lang === 'vi' ? 'Bảng màu pastel mẫu' : 'Pastel presets'}</h4>
            <div className="presets-flex">
              {presets.map(p => (
                <button 
                  key={p.name} 
                  onClick={() => loadPreset(p)} 
                  className="preset-btn glass"
                  style={{ background: getGradientCSS(p.stops) }}
                  title={p.name}
                >
                  <span className="preset-name-overlay">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Canvas Display */}
          <div 
            className="tool-card visual-workspace-card" 
            style={{ background: cssString }}
          >
            <div className="workspace-overlay-btn">
              <button 
                onClick={() => copyCode(cssString, 'css')} 
                className="btn btn-secondary glass"
              >
                {copiedText === 'css' ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedText === 'css' ? (lang === 'vi' ? 'Đã Copy CSS!' : 'CSS Copied!') : (lang === 'vi' ? 'Copy Code CSS' : 'Copy CSS Code')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Controllers */}
        <div className="tool-card glass controllers-card animate-fade">
          <h3 className="section-title">{lang === 'vi' ? 'Bộ chỉnh sửa dải màu' : 'Gradient Editor'}</h3>
          <p className="section-subtitle">{lang === 'vi' ? 'Tùy biến góc xoay, màu sắc và mật độ chuyển màu' : 'Customize angle, colors, and stop positions'}</p>

          {/* Type Selector */}
          <div className="form-group">
            <label>{lang === 'vi' ? 'Loại Gradient' : 'Gradient Type'}</label>
            <div className="tab-switch-row">
              <button 
                onClick={() => setGradientType('linear')}
                className={`tab-switch-btn ${gradientType === 'linear' ? 'active' : ''}`}
              >
                {lang === 'vi' ? 'Linear (Tuyến tính)' : 'Linear'}
              </button>
              <button 
                onClick={() => setGradientType('radial')}
                className={`tab-switch-btn ${gradientType === 'radial' ? 'active' : ''}`}
              >
                {lang === 'vi' ? 'Radial (Tâm tròn)' : 'Radial'}
              </button>
            </div>
          </div>

          {/* Angle slider (Only linear) */}
          {gradientType === 'linear' && (
            <div className="form-group">
              <div className="slider-label-row">
                <label>{lang === 'vi' ? 'Góc xoay (Degrees)' : 'Angle'}</label>
                <span className="slider-value">{angle}°</span>
              </div>
              <div className="angle-control-row">
                <RotateCw size={16} className="rotate-icon" style={{ transform: `rotate(${angle}deg)` }} />
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={angle} 
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className="range-slider"
                />
              </div>
            </div>
          )}

          {/* Draggable Stop Track */}
          <div className="form-group" style={{ margin: '24px 0' }}>
            <label>{lang === 'vi' ? 'Thanh trượt điểm màu (Click để thêm điểm)' : 'Color stop track (Click to add)'}</label>
            <div className="stop-slider-container">
              {/* Background representation of stops */}
              <div 
                ref={trackRef} 
                onClick={handleTrackClick} 
                className="stop-slider-track"
                style={{ 
                  background: `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                }}
              >
                {stops.map(stop => (
                  <div 
                    key={stop.id}
                    onMouseDown={(e) => handleStopMouseDown(e, stop.id)}
                    className={`stop-handle ${stop.id === selectedStopId ? 'active' : ''}`}
                    style={{ 
                      left: `${stop.position}%`,
                      backgroundColor: stop.color 
                    }}
                    title={`Điểm màu: ${stop.color} (${stop.position}%)`}
                  ></div>
                ))}
              </div>
            </div>
            <span className="slider-tip">{lang === 'vi' ? 'Mẹo: Click để thêm điểm mới. Bấm đúp hoặc giữ điểm màu để kéo vị trí.' : 'Tip: Click to add a stop. Hold and drag to change position.'}</span>
          </div>

          {/* Selected Stop Controller */}
          {activeStop && (
            <div className="active-stop-editor glass">
              <div className="editor-stop-header">
                <span className="editor-stop-title">{lang === 'vi' ? 'Hiệu chỉnh điểm màu đang chọn' : 'Edit selected color stop'}</span>
                <button 
                  onClick={deleteSelectedStop} 
                  className="btn-delete-stop"
                  disabled={stops.length <= 2}
                  title={lang === 'vi' ? 'Xóa điểm màu này' : 'Delete this color stop'}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="editor-inputs-row">
                <div className="color-input-wrapper">
                  <input 
                    type="color" 
                    value={activeStop.color} 
                    onChange={(e) => updateSelectedColor(e.target.value)}
                    className="hex-color-picker"
                  />
                  <input 
                    type="text" 
                    value={activeStop.color.toUpperCase()} 
                    onChange={(e) => updateSelectedColor(e.target.value)}
                    className="form-input text-hex-input"
                  />
                </div>

                <div className="position-input-wrapper">
                  <span className="position-label">{lang === 'vi' ? 'Vị trí:' : 'Position:'}</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={activeStop.position}
                    onChange={(e) => {
                      const pos = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                      setStops(prev => prev.map(s => s.id === selectedStopId ? { ...s, position: pos } : s).sort((a,b) => a.position - b.position));
                    }}
                    className="form-input number-pos-input"
                  />
                  <span className="unit-label">%</span>
                </div>
              </div>
            </div>
          )}

          {/* Code Export Tabs */}
          <div className="gradio-code-export">
            <div className="code-box-wrapper">
              <div className="code-header">
                <span>CSS Code</span>
                <button 
                  onClick={() => copyCode(cssString, 'css')} 
                  className="btn-copy-small"
                >
                  {copiedText === 'css' ? (lang === 'vi' ? 'Đã Copy!' : 'Copied!') : (lang === 'vi' ? 'Copy' : 'Copy')}
                </button>
              </div>
              <pre><code>{`background: ${cssString};`}</code></pre>
            </div>

            <div className="code-box-wrapper" style={{ marginTop: 12 }}>
              <div className="code-header">
                <span>React Native Code (Expo)</span>
                <button 
                  onClick={() => copyCode(getRNCode(), 'rn')} 
                  className="btn-copy-small"
                >
                  {copiedText === 'rn' ? (lang === 'vi' ? 'Đã Copy!' : 'Copied!') : (lang === 'vi' ? 'Copy' : 'Copy')}
                </button>
              </div>
              <pre><code>{getRNCode()}</code></pre>
            </div>

            <div className="code-box-wrapper" style={{ marginTop: 12 }}>
              <div className="code-header">
                <span>Tailwind CSS</span>
                <button 
                  onClick={() => copyCode(getTailwindCode(), 'tailwind')} 
                  className="btn-copy-small"
                >
                  {copiedText === 'tailwind' ? (lang === 'vi' ? 'Đã Copy!' : 'Copied!') : (lang === 'vi' ? 'Copy' : 'Copy')}
                </button>
              </div>
              <pre><code>{getTailwindCode()}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .tool-grid-left {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .preset-panel {
          padding: 20px;
          text-align: left;
        }

        .presets-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .presets-flex {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .preset-btn {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: var(--transition-bounce);
          border-color: rgba(46, 125, 96, 0.1);
        }

        .preset-btn:hover {
          transform: translateY(-3px) scale(1.04);
          border-color: var(--accent);
        }

        .preset-name-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.45);
          color: white;
          font-size: 0.6rem;
          padding: 2px 4px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .preset-btn:hover .preset-name-overlay {
          opacity: 1;
        }

        .visual-workspace-card {
          flex: 1;
          min-height: 240px;
          border-radius: var(--radius-lg);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--card-shadow);
          border: 1px solid var(--card-border);
          overflow: hidden;
        }

        .workspace-overlay-btn {
          position: absolute;
          bottom: 20px;
          right: 20px;
        }

        .controllers-card {
          text-align: left;
        }

        .tab-switch-row {
          display: flex;
          background: rgba(46, 125, 96, 0.04);
          border: 1px solid rgba(46, 125, 96, 0.08);
          border-radius: 12px;
          padding: 4px;
          gap: 2px;
        }

        .tab-switch-btn {
          flex: 1;
          border: none;
          background: transparent;
          padding: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .tab-switch-btn.active {
          background: var(--card-bg);
          color: var(--accent);
          box-shadow: 0 2px 8px rgba(46,125,96,0.08);
        }

        .slider-label-row {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .slider-value {
          color: var(--accent);
        }

        .angle-control-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 6px;
        }

        .rotate-icon {
          color: var(--accent);
          transition: transform 0.1s linear;
        }

        .range-slider {
          flex: 1;
          height: 6px;
          accent-color: var(--accent);
          background: rgba(46,125,96,0.08);
          border-radius: 99px;
          cursor: pointer;
        }

        .stop-slider-container {
          padding: 14px 0;
          position: relative;
        }

        .stop-slider-track {
          height: 24px;
          border-radius: 8px;
          position: relative;
          cursor: crosshair;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
        }

        .stop-handle {
          width: 18px;
          height: 32px;
          border-radius: 4px;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: grab;
          transition: transform 0.1s ease;
        }

        .stop-handle:active {
          cursor: grabbing;
        }

        .stop-handle.active {
          transform: translate(-50%, -50%) scale(1.15);
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(46,125,96,0.25), 0 2px 8px rgba(0,0,0,0.3);
        }

        .slider-tip {
          font-size: 0.76rem;
          color: var(--text-secondary);
        }

        .active-stop-editor {
          padding: 16px;
          border-radius: var(--radius-md);
          border-color: rgba(46, 125, 96, 0.08);
          margin-bottom: 24px;
          background: rgba(46, 125, 96, 0.02);
        }

        .editor-stop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .editor-stop-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .btn-delete-stop {
          background: transparent;
          border: none;
          color: #EF4444;
          cursor: pointer;
          opacity: 0.8;
          transition: var(--transition-smooth);
        }

        .btn-delete-stop:hover:not(:disabled) {
          opacity: 1;
          transform: scale(1.05);
        }

        .btn-delete-stop:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .editor-inputs-row {
          display: flex;
          gap: 16px;
        }

        .color-input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1.2;
        }

        .hex-color-picker {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          border: 1px solid var(--card-border);
          cursor: pointer;
          background: transparent;
        }

        .text-hex-input {
          flex: 1;
          font-family: var(--font-mono);
          text-transform: uppercase;
        }

        .position-input-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .position-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .number-pos-input {
          text-align: center;
        }

        .unit-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .code-box-wrapper {
          background: rgba(46, 125, 96, 0.03);
          border: 1px solid rgba(46, 125, 96, 0.08);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .code-header {
          background: rgba(46, 125, 96, 0.05);
          padding: 8px 12px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(46, 125, 96, 0.06);
        }

        .code-box-wrapper pre {
          padding: 12px;
          margin: 0;
          overflow-x: auto;
        }

        .code-box-wrapper code {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          background: transparent;
          padding: 0;
          color: var(--text-primary);
          white-space: pre-wrap;
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
};
