import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Plus, X, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DeciderWheelTool: React.FC = () => {
  const { lang, t } = useLanguage();
  const [playerAName, setPlayerAName] = useState<string>(lang === 'vi' ? 'Bạn Nam' : 'Player A');
  const [playerBName, setPlayerBName] = useState<string>(lang === 'vi' ? 'Bạn Nữ' : 'Player B');
  const [wheelItems, setWheelItems] = useState<string[]>([
    'Phở Bò/Gà', 'Lẩu Thái', 'Bún Chả', 'Pizza', 'Đồ Hàn Quốc', 'Cơm Tấm', 'Bún Đậu Mắm Tôm', 'Sushi Nhật Bản'
  ]);
  const [customItemInput, setCustomItemInput] = useState<string>('');
  const [vetoCounts, setVetoCounts] = useState<{ A: number; B: number }>({ A: 1, B: 1 });
  const [wheelSpinning, setWheelSpinning] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [vetoMessage, setVetoMessage] = useState<string | null>(null);
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRotationRef = useRef<number>(0);

  // Sync names on locale change
  useEffect(() => {
    setPlayerAName(lang === 'vi' ? 'Bạn Nam' : 'Player A');
    setPlayerBName(lang === 'vi' ? 'Bạn Nữ' : 'Player B');
  }, [lang]);

  useEffect(() => {
    drawWheel();
  }, [wheelItems]);

  const drawWheel = (currentAngle = 0) => {
    const canvas = wheelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;

    ctx.clearRect(0, 0, size, size);

    if (wheelItems.length === 0) {
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.font = '16px Fredoka, var(--font-sans)';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'vi' ? 'Không có món nào!' : 'Empty list!', center, center);
      return;
    }

    const arcSize = (2 * Math.PI) / wheelItems.length;
    const colors = [
      '#FFF0F3', '#FFE4E6', '#FBCFE8', '#F9A8D4', '#FDA4AF', '#F472B6', 
      '#E9D5FF', '#F3E8FF', '#FAE8FF', '#FCE7F3'
    ];

    wheelItems.forEach((item, i) => {
      const angle = currentAngle + i * arcSize;
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arcSize);
      ctx.lineTo(center, center);
      ctx.fill();

      // Border lines
      ctx.strokeStyle = '#FECDD3';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw item text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#370B1B';
      ctx.font = '700 13px Fredoka, var(--font-sans)';
      
      const textToDraw = item.length > 18 ? item.substring(0, 16) + '..' : item;
      ctx.fillText(textToDraw, radius - 20, 5);
      ctx.restore();
    });

    // Draw Outer Circle
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Draw Inner Peg
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Inner Heart
    ctx.fillStyle = '#F43F5E';
    ctx.font = '14px Fredoka, var(--font-sans)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❤️', center, center);
  };

  const spinWheel = () => {
    if (wheelSpinning || wheelItems.length === 0) return;

    setWheelSpinning(true);
    setSelectedResult(null);
    setVetoMessage(null);

    let startSpeed = Math.random() * 0.2 + 0.35;
    let currentAngle = wheelRotationRef.current;

    const animateSpin = () => {
      currentAngle += startSpeed;
      startSpeed *= 0.985;

      wheelRotationRef.current = currentAngle;
      drawWheel(currentAngle);

      if (startSpeed > 0.001) {
        requestAnimationFrame(animateSpin);
      } else {
        setWheelSpinning(false);
        const totalRotation = currentAngle % (2 * Math.PI);
        let pointerAngle = (1.5 * Math.PI) - totalRotation;
        while (pointerAngle < 0) pointerAngle += 2 * Math.PI;
        const arcSize = (2 * Math.PI) / wheelItems.length;
        const index = Math.floor(pointerAngle / arcSize) % wheelItems.length;
        
        setSelectedResult(wheelItems[index]);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  const handleVeto = (player: 'A' | 'B') => {
    if (!selectedResult) return;
    
    const count = player === 'A' ? vetoCounts.A : vetoCounts.B;
    if (count <= 0) return;

    setVetoCounts(prev => ({
      ...prev,
      [player]: prev[player] - 1
    }));

    const vetoedItem = selectedResult;
    const updatedItems = wheelItems.filter(item => item !== vetoedItem);
    setWheelItems(updatedItems);
    
    const pName = player === 'A' ? playerAName : playerBName;
    setVetoMessage(
      lang === 'vi' 
        ? `🚫 ${pName} đã dùng quyền phủ quyết món "${vetoedItem}"! Đang quay lại...`
        : `🚫 ${pName} vetoed "${vetoedItem}"! Spinning again...`
    );

    setTimeout(() => {
      if (updatedItems.length > 0) {
        setWheelSpinning(true);
        setSelectedResult(null);
        let startSpeed = Math.random() * 0.2 + 0.35;
        let currentAngle = wheelRotationRef.current;

        const animateSpin = () => {
          currentAngle += startSpeed;
          startSpeed *= 0.985;
          wheelRotationRef.current = currentAngle;
          drawWheel(currentAngle);

          if (startSpeed > 0.001) {
            requestAnimationFrame(animateSpin);
          } else {
            setWheelSpinning(false);
            let pointerAngle = (1.5 * Math.PI) - (currentAngle % (2 * Math.PI));
            while (pointerAngle < 0) pointerAngle += 2 * Math.PI;
            const arcSize = (2 * Math.PI) / updatedItems.length;
            const index = Math.floor(pointerAngle / arcSize) % updatedItems.length;
            setSelectedResult(updatedItems[index]);
          }
        };
        requestAnimationFrame(animateSpin);
      }
    }, 1500);
  };

  const addCustomItem = () => {
    if (!customItemInput.trim()) return;
    setWheelItems(prev => [...prev, customItemInput.trim()]);
    setCustomItemInput('');
  };

  const removeWheelItem = (indexToRemove: number) => {
    setWheelItems(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const resetDefault = () => {
    setWheelItems([
      'Phở Bò/Gà', 'Lẩu Thái', 'Bún Chả', 'Pizza', 'Đồ Hàn Quốc', 'Cơm Tấm', 'Bún Đậu Mắm Tôm', 'Sushi Nhật Bản'
    ]);
    setVetoCounts({ A: 1, B: 1 });
    setSelectedResult(null);
    setVetoMessage(null);
  };

  return (
    <div className="tool-container love-theme">
      <style>{`
        .love-theme {
          --bg-hsl: 345, 100%, 98%;
          --bg: #FFF9FA;
          --bg-cream: #FFF3F5;
          --text-primary-hsl: 340, 60%, 15%;
          --text-primary: #380816;
          --text-secondary: #90485C;
          --accent-hsl: 335, 80%, 60%;
          --accent: #FF7597;
          --accent-light: #FFEBF0;
          --accent-bright: #FBCFE8;
          --accent-hover: #E05476;
          --card-border: #FFD1DC;
          --card-shadow: 4px 4px 0px 0px rgba(255, 117, 151, 0.12);
          font-family: 'Fredoka', 'Plus Jakarta Sans', sans-serif !important;
        }

        .love-theme * {
          font-family: 'Fredoka', 'Plus Jakarta Sans', sans-serif !important;
        }

        .wheel-workspace {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .wheel-canvas-container {
          position: relative;
          width: 320px;
          height: 320px;
        }

        .wheel-pointer {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 14px solid transparent;
          border-right: 14px solid transparent;
          border-top: 22px solid #F43F5E;
          z-index: 10;
          filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.1));
        }

        .wheel-items-list-box {
          text-align: left;
          width: 100%;
        }

        .wheel-item-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: white;
          border: 1.5px solid var(--card-border);
          padding: 4px 10px;
          border-radius: 8px;
          margin: 3px;
          font-size: 0.82rem;
          font-weight: 700;
        }

        .wheel-item-tag button {
          border: none;
          background: transparent;
          color: #EF4444;
          cursor: pointer;
        }

        .veto-btn-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
        }

        .spin-anim {
          animation: spin 1s infinite linear;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="tool-header">
        <h2 className="title-primary text-gradient">
          <RotateCw size={32} style={{ display: 'inline', marginRight: 10 }} />
          {t('couple.wheelTitle')}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('couple.wheelDesc')}
        </p>
      </div>

      <div className="tool-grid">
        <div className="tool-card glass animate-fade">
          <div className="wheel-workspace">
            <div className="wheel-canvas-container">
              <div className="wheel-pointer"></div>
              <canvas 
                ref={wheelCanvasRef} 
                width={320} 
                height={320} 
                style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
              />
            </div>

            {vetoMessage && (
              <div className="veto-alert" style={{ background: '#FFE4E6', border: '1.5px solid #FDA4AF', padding: '8px 12px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600, color: '#E11D48', width: '100%' }}>
                {vetoMessage}
              </div>
            )}

            {!selectedResult ? (
              <button 
                onClick={spinWheel} 
                disabled={wheelSpinning || wheelItems.length === 0} 
                className="btn btn-primary" 
                style={{ width: '100%', height: 48 }}
              >
                <RotateCw size={18} className={wheelSpinning ? 'spin-anim' : ''} />
                <span>{wheelSpinning ? t('couple.wheelSpinning') : t('couple.wheelSpinBtn')}</span>
              </button>
            ) : (
              <div className="wheel-result-action-stack" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="wheel-result-bubble" style={{ background: '#FFF5F6', border: '2px solid var(--accent)', padding: '14px', borderRadius: 14, textAlign: 'center' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)' }}>
                    🎉 {t('couple.wheelResult').replace('{item}', selectedResult)}
                  </h4>
                </div>

                <div className="veto-btn-group">
                  <button 
                    onClick={() => handleVeto('A')}
                    disabled={vetoCounts.A <= 0 || wheelSpinning}
                    className="btn btn-secondary"
                    style={{ borderColor: '#F43F5E', color: vetoCounts.A > 0 ? '#F43F5E' : '#9CA3AF' }}
                  >
                    <span>{t('couple.wheelVetoBtn').replace('{name}', playerAName).replace('{count}', vetoCounts.A.toString())}</span>
                  </button>
                  <button 
                    onClick={() => handleVeto('B')}
                    disabled={vetoCounts.B <= 0 || wheelSpinning}
                    className="btn btn-secondary"
                    style={{ borderColor: '#F43F5E', color: vetoCounts.B > 0 ? '#F43F5E' : '#9CA3AF' }}
                  >
                    <span>{t('couple.wheelVetoBtn').replace('{name}', playerBName).replace('{count}', vetoCounts.B.toString())}</span>
                  </button>
                </div>

                {(vetoCounts.A === 0 && vetoCounts.B === 0) && (
                  <p style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 600 }}>
                    ⚠️ {t('couple.wheelNoVetoes')}
                  </p>
                )}

                <button onClick={spinWheel} disabled={wheelSpinning} className="btn btn-primary">
                  <RotateCw size={16} />
                  <span>{t('couple.wheelSpinBtn')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="tool-card glass base64-output-card animate-fade">
          <h3 className="section-title">🛠️ {t('couple.wheelEditList')}</h3>
          
          <div className="wheel-items-list-box" style={{ marginTop: 12 }}>
            <div style={{ maxHeight: 200, overflowY: 'auto', border: '1.5px solid var(--card-border)', padding: '8px', borderRadius: 12, background: 'rgba(244,63,94,0.01)', marginBottom: 12 }}>
              {wheelItems.map((item, idx) => (
                <span key={idx} className="wheel-item-tag">
                  {item}
                  <button onClick={() => removeWheelItem(idx)} aria-label="Remove item">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  placeholder={lang === 'vi' ? 'Nhập thêm món mới...' : 'Add new option...'} 
                  value={customItemInput} 
                  onChange={e => setCustomItemInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && addCustomItem()}
                  className="form-input"
                  style={{ borderColor: 'var(--card-border)', flex: 1 }}
                />
                <button onClick={addCustomItem} className="btn btn-secondary" style={{ padding: '0 12px', border: '2px solid var(--text-primary)', background: 'white' }}>
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button onClick={resetDefault} className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--card-border)', background: 'white' }}>
              <span>{t('couple.wheelResetList')}</span>
            </button>
          </div>

          <div style={{ borderTop: '1px dashed var(--card-border)', marginTop: 16, paddingTop: 16 }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={14} style={{ color: 'var(--accent)' }} /> Rule of Veto
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
              {lang === 'vi' ? (
                'Mỗi bạn có 1 lượt "Phủ quyết" (Veto) duy nhất. Nếu kết quả quay vào món bạn ghét cay ghét đắng, hãy nhấn Veto để tự động loại bỏ món đó ra khỏi vòng quay và tiến hành quay lại.'
              ) : (
                'Each player gets 1 "Veto" power. If the wheel lands on something you really dislike, click Veto to permanently remove it and spin the wheel again.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
