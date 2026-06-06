import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'empty';
  text: string;
  lineNumber?: number;
}

export const JsondiffTool: React.FC = () => {
  const { lang } = useLanguage();
  const [jsonA, setJsonA] = useState<string>('{\n  "name": "percylab",\n  "version": "1.0.0",\n  "active": true,\n  "tags": ["genz", "tools"]\n}');
  const [jsonB, setJsonB] = useState<string>('{\n  "name": "percylab",\n  "version": "1.1.0",\n  "active": true,\n  "theme": "pastel green",\n  "tags": ["genz", "tools", "design"]\n}');

  const [diffResult, setDiffResult] = useState<{ left: DiffLine[]; right: DiffLine[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatJson = (text: string, setFn: React.Dispatch<React.SetStateAction<string>>) => {
    try {
      const parsed = JSON.parse(text);
      setFn(JSON.stringify(parsed, null, 2));
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(lang === 'vi' ? `JSON không hợp lệ: ${e.message}` : `Invalid JSON: ${e.message}`);
    }
  };

  const compareJSON = () => {
    setErrorMsg(null);
    try {
      // 1. Validate both JSONs
      const parsedA = JSON.parse(jsonA);
      const parsedB = JSON.parse(jsonB);

      // Pretty format them
      const strA = JSON.stringify(parsedA, null, 2);
      const strB = JSON.stringify(parsedB, null, 2);

      const linesA = strA.split('\n');
      const linesB = strB.split('\n');

      // 2. Simple LCS / line alignment diffing
      const left: DiffLine[] = [];
      const right: DiffLine[] = [];

      let i = 0;
      let j = 0;

      while (i < linesA.length || j < linesB.length) {
        const lineA = linesA[i];
        const lineB = linesB[j];

        if (i < linesA.length && j < linesB.length) {
          if (lineA === lineB) {
            left.push({ type: 'unchanged', text: lineA, lineNumber: i + 1 });
            right.push({ type: 'unchanged', text: lineB, lineNumber: j + 1 });
            i++;
            j++;
          } else {
            // Check if lineA exists further down in B (indicating lineB was inserted)
            const indexInB = linesB.indexOf(lineA, j);
            // Check if lineB exists further down in A (indicating lineA was deleted)
            const indexInA = linesA.indexOf(lineB, i);

            if (indexInB !== -1 && (indexInA === -1 || indexInB - j <= indexInA - i)) {
              // Line(s) inserted in B
              while (j < indexInB) {
                left.push({ type: 'empty', text: '' });
                right.push({ type: 'added', text: linesB[j], lineNumber: j + 1 });
                j++;
              }
            } else if (indexInA !== -1) {
              // Line(s) deleted from A
              while (i < indexInA) {
                left.push({ type: 'removed', text: linesA[i], lineNumber: i + 1 });
                right.push({ type: 'empty', text: '' });
                i++;
              }
            } else {
              // Mismatch replacement
              left.push({ type: 'removed', text: lineA, lineNumber: i + 1 });
              right.push({ type: 'added', text: lineB, lineNumber: j + 1 });
              i++;
              j++;
            }
          }
        } else if (i < linesA.length) {
          // Extra lines remaining in A (deleted)
          left.push({ type: 'removed', text: lineA, lineNumber: i + 1 });
          right.push({ type: 'empty', text: '' });
          i++;
        } else {
          // Extra lines remaining in B (added)
          left.push({ type: 'empty', text: '' });
          right.push({ type: 'added', text: lineB, lineNumber: j + 1 });
          j++;
        }
      }

      setDiffResult({ left, right });
    } catch (e: any) {
      setErrorMsg(lang === 'vi' ? `Không thể so sánh. Lỗi cú pháp JSON: ${e.message}` : `Cannot compare. JSON Syntax Error: ${e.message}`);
    }
  };

  const loadDemo = () => {
    setJsonA('{\n  "name": "percylab",\n  "version": "1.0.0",\n  "active": true,\n  "tags": ["genz", "tools"]\n}');
    setJsonB('{\n  "name": "percylab",\n  "version": "1.1.0",\n  "active": true,\n  "theme": "pastel green",\n  "tags": ["genz", "tools", "design"]\n}');
    setDiffResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="tool-container" style={{ maxWidth: '1200px' }}>
      <div className="tool-header">
        <h2 className="title-primary text-gradient">jsondiff</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi' ? 'So sánh cấu trúc dữ liệu giữa 2 tệp JSON. Tự động chuẩn hóa định dạng (Pretty print) và hiển thị trực quan các dòng được thêm, bớt hoặc sửa đổi.' : 'Compare structure differences between two JSON payloads. Pretty print formatting and highlighting added/removed lines.'}
        </p>
      </div>

      <div className="tool-grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* Input Textareas Panels */}
        <div className="tool-card glass animate-fade">
          <div className="json-inputs-row">
            {/* JSON A */}
            <div className="json-panel">
              <div className="panel-header-row">
                <span className="panel-badge-name">JSON A (Original)</span>
                <button onClick={() => formatJson(jsonA, setJsonA)} className="btn-small-link">Format</button>
              </div>
              <textarea 
                value={jsonA}
                onChange={(e) => setJsonA(e.target.value)}
                className="json-textarea monospace"
                placeholder='{"key": "value"}'
              ></textarea>
            </div>

            {/* JSON B */}
            <div className="json-panel">
              <div className="panel-header-row">
                <span className="panel-badge-name" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>JSON B (Modified)</span>
                <button onClick={() => formatJson(jsonB, setJsonB)} className="btn-small-link">Format</button>
              </div>
              <textarea 
                value={jsonB}
                onChange={(e) => setJsonB(e.target.value)}
                className="json-textarea monospace"
                placeholder='{"key": "value"}'
              ></textarea>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={compareJSON} className="btn btn-primary">
                <Layers size={16} />
                <span>{lang === 'vi' ? 'So sánh khác biệt' : 'Compare JSONs'}</span>
              </button>
              <button onClick={loadDemo} className="btn btn-secondary">
                <RefreshCw size={14} />
                <span>Demo</span>
              </button>
            </div>
            {errorMsg && (
              <div className="error-badge-row">
                <AlertTriangle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Diff Result Viewport */}
        {diffResult && (
          <div className="tool-card glass diff-viewport-card animate-fade" style={{ marginTop: 20 }}>
            <h3 className="section-title">{lang === 'vi' ? 'Bản so sánh đối chiếu' : 'Comparison Report'}</h3>
            <p className="section-subtitle">{lang === 'vi' ? 'Dòng màu xanh lá cây (+) là thêm mới, dòng màu đỏ (-) là bị xóa' : 'Green lines (+) represent additions, red lines (-) represent deletions'}</p>

            <div className="diff-split-container monospace">
              {/* Left Column (JSON A) */}
              <div className="diff-col border-right">
                {diffResult.left.map((line, idx) => (
                  <div 
                    key={idx} 
                    className={`diff-line-row ${line.type}`}
                  >
                    <span className="diff-line-number">{line.lineNumber || ''}</span>
                    <span className="diff-line-sign">{line.type === 'removed' ? '-' : ' '}</span>
                    <pre className="diff-line-code">{line.text}</pre>
                  </div>
                ))}
              </div>

              {/* Right Column (JSON B) */}
              <div className="diff-col">
                {diffResult.right.map((line, idx) => (
                  <div 
                    key={idx} 
                    className={`diff-line-row ${line.type}`}
                  >
                    <span className="diff-line-number">{line.lineNumber || ''}</span>
                    <span className="diff-line-sign">{line.type === 'added' ? '+' : ' '}</span>
                    <pre className="diff-line-code">{line.text}</pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .json-inputs-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 768px) {
          .json-inputs-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .json-panel {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .panel-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-badge-name {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--text-secondary);
          background: rgba(0,0,0,0.05);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .btn-small-link {
          background: transparent;
          border: none;
          color: var(--accent);
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .json-textarea {
          width: 100%;
          height: 240px;
          padding: 12px 14px;
          border: 1.5px solid var(--card-border);
          border-radius: var(--radius-sm);
          background: var(--bg-cream);
          resize: vertical;
          outline: none;
        }

        .json-textarea:focus {
          border-color: var(--accent);
          background: #ffffff;
        }

        .error-badge-row {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #EF4444;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .diff-split-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid var(--card-border);
          border-radius: var(--radius-md);
          background: #1e1e24;
          overflow-x: auto;
          max-height: 480px;
        }

        .diff-col {
          display: flex;
          flex-direction: column;
          min-width: 320px;
        }

        .border-right {
          border-right: 1px solid #2d2d34;
        }

        .diff-line-row {
          display: flex;
          align-items: center;
          padding: 2px 8px;
          min-height: 20px;
          line-height: 1.4;
          font-size: 0.76rem;
        }

        .diff-line-number {
          width: 30px;
          color: #5c5c63;
          text-align: right;
          padding-right: 8px;
          user-select: none;
          border-right: 1px solid #2d2d34;
          margin-right: 8px;
        }

        .diff-line-sign {
          width: 12px;
          color: #8c8c93;
          font-weight: 800;
          user-select: none;
        }

        .diff-line-code {
          margin: 0;
          padding: 0;
          color: #e2e2e9;
          white-space: pre-wrap;
          word-break: break-all;
          text-align: left;
        }

        .diff-line-row.added {
          background: rgba(39, 201, 63, 0.15);
        }
        .diff-line-row.added .diff-line-code {
          color: #a9ffb2;
        }

        .diff-line-row.removed {
          background: rgba(255, 95, 86, 0.15);
        }
        .diff-line-row.removed .diff-line-code {
          color: #ffb3b0;
        }

        .diff-line-row.empty {
          background: rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};
