import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, RefreshCw, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TIMEZONES = [
  { label: 'Local (your browser)', value: 'local' },
  { label: 'UTC / GMT+0',          value: 'UTC' },
  { label: 'Asia/Ho_Chi_Minh (GMT+7)', value: 'Asia/Ho_Chi_Minh' },
  { label: 'Asia/Bangkok (GMT+7)', value: 'Asia/Bangkok' },
  { label: 'Asia/Singapore (GMT+8)', value: 'Asia/Singapore' },
  { label: 'Asia/Tokyo (GMT+9)',    value: 'Asia/Tokyo' },
  { label: 'America/New_York',      value: 'America/New_York' },
  { label: 'America/Los_Angeles',   value: 'America/Los_Angeles' },
  { label: 'Europe/London',         value: 'Europe/London' },
  { label: 'Europe/Paris (GMT+1/2)',value: 'Europe/Paris' },
];

function formatWithTz(date: Date, tz: string): string {
  if (tz === 'local') {
    return date.toLocaleString('en-GB', { hour12: false })
      .replace(',', '');
  }
  return date.toLocaleString('en-GB', { timeZone: tz, hour12: false }).replace(',', '');
}

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export const TimestampTool: React.FC = () => {
  const { lang } = useLanguage();
  const vi = lang === 'vi';

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [tz, setTz] = useState('Asia/Ho_Chi_Minh');

  // Unix → DateTime
  const [unixInput, setUnixInput] = useState('');
  const [unixResult, setUnixResult] = useState('');

  // DateTime → Unix
  const [dtInput, setDtInput] = useState('');
  const [dtResult, setDtResult] = useState('');

  // Copy states
  const [copiedNow, setCopiedNow] = useState(false);
  const [copiedUnix, setCopiedUnix] = useState(false);
  const [copiedDt, setCopiedDt] = useState(false);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const copy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 1500);
  };

  const convertUnixToDate = useCallback(() => {
    const ts = parseInt(unixInput.trim(), 10);
    if (isNaN(ts)) { setUnixResult(vi ? '— Số không hợp lệ' : '— Invalid number'); return; }
    const ms = unixInput.trim().length >= 13 ? ts : ts * 1000;
    const d = new Date(ms);
    setUnixResult(formatWithTz(d, tz));
  }, [unixInput, tz, vi]);

  const convertDateToUnix = useCallback(() => {
    if (!dtInput) { setDtResult(''); return; }
    const d = new Date(dtInput);
    if (isNaN(d.getTime())) { setDtResult(vi ? '— Ngày không hợp lệ' : '— Invalid date'); return; }
    setDtResult(String(Math.floor(d.getTime() / 1000)));
  }, [dtInput, vi]);

  const nowDate = new Date(now * 1000);
  const nowFormatted = formatWithTz(nowDate, tz);

  const units = [
    { label: vi ? 'Giây' : 'Seconds',      value: now },
    { label: vi ? 'Milliseconds' : 'Milliseconds', value: now * 1000 },
    { label: vi ? 'Phút' : 'Minutes',      value: Math.floor(now / 60) },
    { label: vi ? 'Giờ' : 'Hours',         value: Math.floor(now / 3600) },
    { label: vi ? 'Ngày' : 'Days',         value: Math.floor(now / 86400) },
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2 className="title-primary text-gradient">timestamp</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {vi
            ? 'Chuyển đổi Unix timestamp sang ngày giờ và ngược lại, hỗ trợ nhiều múi giờ.'
            : 'Convert Unix timestamps to human-readable dates and back, with timezone support.'}
        </p>
      </div>

      {/* Timezone selector */}
      <div className="ts-tz-bar glass">
        <Clock size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
          {vi ? 'Múi giờ:' : 'Timezone:'}
        </span>
        <select className="ts-select" value={tz} onChange={(e) => setTz(e.target.value)}>
          {TIMEZONES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Live Now */}
      <div className="ts-card glass animate-fade">
        <div className="ts-card-header">
          <div>
            <h3 className="section-title">{vi ? 'Thời gian hiện tại' : 'Current Time'}</h3>
            <p className="section-subtitle">{vi ? 'Cập nhật mỗi giây' : 'Updates every second'}</p>
          </div>
          <div className="ts-live-dot" />
        </div>

        <div className="ts-now-display">
          <div className="ts-big-num">{now.toLocaleString()}</div>
          <div className="ts-now-readable">{nowFormatted}</div>
        </div>

        <div className="ts-units-grid">
          {units.map((u) => (
            <div key={u.label} className="ts-unit-cell">
              <span className="ts-unit-val">{u.value.toLocaleString()}</span>
              <span className="ts-unit-label">{u.label}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => copy(String(now), setCopiedNow)}>
          {copiedNow ? <Check size={15} /> : <Copy size={15} />}
          <span>{copiedNow ? (vi ? 'Đã copy!' : 'Copied!') : (vi ? 'Copy Unix timestamp' : 'Copy Unix timestamp')}</span>
        </button>
      </div>

      <div className="tool-grid">
        {/* Unix → Date */}
        <div className="tool-card glass animate-fade">
          <h3 className="section-title">{vi ? 'Unix → Ngày giờ' : 'Unix → Date'}</h3>
          <p className="section-subtitle">{vi ? 'Nhập số giây hoặc milliseconds' : 'Enter seconds or milliseconds'}</p>

          <div className="ts-input-row">
            <input
              className="ts-input"
              type="number"
              placeholder={vi ? 'Ví dụ: 1749203200' : 'e.g. 1749203200'}
              value={unixInput}
              onChange={(e) => setUnixInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && convertUnixToDate()}
            />
            <button className="btn btn-primary" onClick={convertUnixToDate}>
              <RefreshCw size={15} />
            </button>
          </div>

          <button className="ts-hint-btn" onClick={() => setUnixInput(String(now))}>
            {vi ? 'Dùng timestamp hiện tại' : 'Use current timestamp'}
          </button>

          {unixResult && (
            <div className="ts-result-box">
              <span className="ts-result-val">{unixResult}</span>
              <button className="ts-copy-btn" onClick={() => copy(unixResult, setCopiedUnix)}>
                {copiedUnix ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* Date → Unix */}
        <div className="tool-card glass animate-fade">
          <h3 className="section-title">{vi ? 'Ngày giờ → Unix' : 'Date → Unix'}</h3>
          <p className="section-subtitle">{vi ? 'Chọn ngày giờ để lấy Unix timestamp' : 'Pick a date to get the Unix timestamp'}</p>

          <div className="ts-input-row">
            <input
              className="ts-input ts-datetime"
              type="datetime-local"
              value={dtInput}
              onChange={(e) => setDtInput(e.target.value)}
            />
            <button className="btn btn-primary" onClick={convertDateToUnix}>
              <RefreshCw size={15} />
            </button>
          </div>

          <button className="ts-hint-btn" onClick={() => setDtInput(toDatetimeLocal(nowDate))}>
            {vi ? 'Dùng thời gian hiện tại' : 'Use current time'}
          </button>

          {dtResult && (
            <div className="ts-result-box">
              <span className="ts-result-val">{dtResult}</span>
              <button className="ts-copy-btn" onClick={() => copy(dtResult, setCopiedDt)}>
                {copiedDt ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reference Table */}
      <div className="tool-card glass animate-fade">
        <h3 className="section-title">{vi ? 'Bảng quy đổi thời gian' : 'Time Unit Reference'}</h3>
        <div className="ts-ref-table">
          {[
            ['1 phút / 1 minute',    '60'],
            ['1 giờ / 1 hour',       '3,600'],
            ['1 ngày / 1 day',       '86,400'],
            ['1 tuần / 1 week',      '604,800'],
            ['1 tháng / 1 month (30d)', '2,592,000'],
            ['1 năm / 1 year (365d)', '31,536,000'],
          ].map(([unit, val]) => (
            <div key={unit} className="ts-ref-row">
              <span>{unit}</span>
              <code>{val} {vi ? 'giây' : 'seconds'}</code>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ts-tz-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: var(--radius-md);
        }

        .ts-select {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }

        .ts-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
          border-radius: var(--radius-md);
        }

        .ts-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .ts-live-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-bright);
          box-shadow: 0 0 0 0 var(--accent-bright);
          animation: ts-pulse 1.5s ease-in-out infinite;
          margin-top: 4px;
        }

        @keyframes ts-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          70%  { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .ts-now-display {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ts-big-num {
          font-family: var(--font-mono);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--accent);
          letter-spacing: -1px;
          line-height: 1;
        }

        .ts-now-readable {
          font-family: var(--font-mono);
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .ts-units-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .ts-unit-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(46, 125, 96, 0.05);
          border: 1px solid rgba(46, 125, 96, 0.1);
          min-width: 100px;
        }

        .ts-unit-val {
          font-family: var(--font-mono);
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .ts-unit-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .ts-input-row {
          display: flex;
          gap: 8px;
        }

        .ts-input {
          flex: 1;
          padding: 11px 14px;
          border: 1px solid var(--card-border);
          background: rgba(46, 125, 96, 0.02);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          font-size: 0.9rem;
          outline: none;
          transition: var(--transition-smooth);
        }

        .ts-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(46, 125, 96, 0.1);
        }

        .ts-datetime {
          font-family: var(--font-sans);
          color-scheme: light dark;
        }

        .ts-hint-btn {
          background: none;
          border: none;
          color: var(--accent);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-align: left;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-family: var(--font-sans);
        }

        .ts-result-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: rgba(46, 125, 96, 0.06);
          border: 1px solid rgba(46, 125, 96, 0.15);
          border-radius: var(--radius-sm);
          margin-top: 4px;
        }

        .ts-result-val {
          flex: 1;
          font-family: var(--font-mono);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          word-break: break-all;
        }

        .ts-copy-btn {
          background: none;
          border: none;
          color: var(--accent);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: var(--transition-smooth);
        }

        .ts-copy-btn:hover {
          background: rgba(46, 125, 96, 0.1);
        }

        .ts-ref-table {
          display: flex;
          flex-direction: column;
          gap: 0;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--card-border);
        }

        .ts-ref-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--card-border);
        }

        .ts-ref-row:last-child {
          border-bottom: none;
        }

        .ts-ref-row code {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--accent);
          background: rgba(46, 125, 96, 0.06);
          padding: 3px 8px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};
