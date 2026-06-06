import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DrinkingDiceTool: React.FC = () => {
  const { t } = useLanguage();
  const [isRolling, setIsRolling] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [ruleResult, setRuleResult] = useState<string | null>(null);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setRuleResult(null);

    const targetFace = Math.floor(Math.random() * 6) + 1;
    const extraX = (Math.floor(Math.random() * 3) + 3) * 360;
    const extraY = (Math.floor(Math.random() * 3) + 3) * 360;

    let rotateX = 0;
    let rotateY = 0;
    switch (targetFace) {
      case 1: rotateX = 0; rotateY = 0; break;
      case 2: rotateX = 0; rotateY = -90; break;
      case 3: rotateX = 0; rotateY = -180; break;
      case 4: rotateX = 0; rotateY = 90; break;
      case 5: rotateX = -90; rotateY = 0; break;
      case 6: rotateX = 90; rotateY = 0; break;
    }

    setRotation({
      x: rotateX + extraX,
      y: rotateY + extraY
    });

    setTimeout(() => {
      setIsRolling(false);
      setRuleResult(t(`drinkingdice.rule${targetFace}`));
    }, 1500);
  };

  return (
    <div className="tool-container drink-theme love-theme">
      <style>{`
        .drink-theme {
          --bg-hsl: 330, 100%, 98%;
          --bg: #FFF9FA;
          --bg-cream: #FFF3F5;
          --text-primary-hsl: 335, 60%, 15%;
          --text-primary: #380816;
          --text-secondary: #90485C;
          --accent-hsl: 335, 80%, 60%;
          --accent: #FF7597;
          --accent-light: #FFEBF0;
          --accent-bright: #FBCFE8;
          --accent-hover: #E05476;
          --card-border: #FFD1DC;
          --card-shadow: 4px 4px 0px 0px rgba(255, 117, 151, 0.12);
          font-family: 'Fredoka', sans-serif !important;
        }

        .drink-theme * {
          font-family: 'Fredoka', sans-serif !important;
        }

        .scene {
          width: 120px;
          height: 120px;
          margin: 40px auto;
          perspective: 600px;
        }

        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 1.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .cube-face {
          position: absolute;
          width: 120px;
          height: 120px;
          background: white;
          border: 3.5px solid var(--text-primary);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 15px rgba(255, 117, 151, 0.15);
        }

        .cube-face-dots {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          width: 80px;
          height: 80px;
          padding: 5px;
        }

        .dot {
          background-color: var(--accent);
          border-radius: 50%;
          width: 14px;
          height: 14px;
          margin: auto;
          border: 1px solid var(--text-primary);
        }

        .face-1 { transform: rotateY(  0deg) translateZ(60px); }
        .face-2 { transform: rotateY( 90deg) translateZ(60px); }
        .face-3 { transform: rotateY(180deg) translateZ(60px); }
        .face-4 { transform: rotateY(-90deg) translateZ(60px); }
        .face-5 { transform: rotateX( 90deg) translateZ(60px); }
        .face-6 { transform: rotateX(-90deg) translateZ(60px); }

        .face-1 .dot { grid-area: 2 / 2; background-color: #EF4444; }
        
        .face-2 .dot:nth-child(1) { grid-area: 1 / 1; }
        .face-2 .dot:nth-child(2) { grid-area: 3 / 3; }

        .face-3 .dot:nth-child(1) { grid-area: 1 / 1; }
        .face-3 .dot:nth-child(2) { grid-area: 2 / 2; }
        .face-3 .dot:nth-child(3) { grid-area: 3 / 3; }

        .face-4 .dot:nth-child(1) { grid-area: 1 / 1; }
        .face-4 .dot:nth-child(2) { grid-area: 1 / 3; }
        .face-4 .dot:nth-child(3) { grid-area: 3 / 1; }
        .face-4 .dot:nth-child(4) { grid-area: 3 / 3; }

        .face-5 .dot:nth-child(1) { grid-area: 1 / 1; }
        .face-5 .dot:nth-child(2) { grid-area: 1 / 3; }
        .face-5 .dot:nth-child(3) { grid-area: 2 / 2; }
        .face-5 .dot:nth-child(4) { grid-area: 3 / 1; }
        .face-5 .dot:nth-child(5) { grid-area: 3 / 3; }

        .face-6 .dot:nth-child(1) { grid-area: 1 / 1; }
        .face-6 .dot:nth-child(2) { grid-area: 1 / 3; }
        .face-6 .dot:nth-child(3) { grid-area: 2 / 1; }
        .face-6 .dot:nth-child(4) { grid-area: 2 / 3; }
        .face-6 .dot:nth-child(5) { grid-area: 3 / 1; }
        .face-6 .dot:nth-child(6) { grid-area: 3 / 3; }

        .dice-rule-box {
          margin-top: 28px;
          padding: 18px 24px;
          border-radius: var(--radius-md);
          background: var(--accent-light);
          border: 2.5px solid var(--accent);
          box-shadow: 4px 4px 0px var(--accent);
          display: inline-block;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          animation: rulePulse 1.5s infinite ease-in-out;
        }

        @keyframes rulePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>

      <div className="tool-header">
        <h2 className="title-primary text-gradient">
          🎲 {t('drinkingdice.title')}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('drinkingdice.desc')}
        </p>
      </div>

      <div className="tool-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-card glass animate-fade" style={{ textAlign: 'center', padding: '36px 20px', minHeight: 460, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          
          <div>
            <div className="scene">
              <div 
                className="cube" 
                style={{ 
                  transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
                }}
              >
                <div className="cube-face face-1">
                  <div className="cube-face-dots">
                    <div className="dot"></div>
                  </div>
                </div>
                <div className="cube-face face-2">
                  <div className="cube-face-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
                <div className="cube-face face-3">
                  <div className="cube-face-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
                <div className="cube-face face-4">
                  <div className="cube-face-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
                <div className="cube-face face-5">
                  <div className="cube-face-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
                <div className="cube-face face-6">
                  <div className="cube-face-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isRolling && (
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>
                  ⏳ {t('drinkingdice.rolling')}
                </span>
              )}
              {!isRolling && ruleResult && (
                <div className="dice-rule-box animate-scale">
                  <span style={{ fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    🎯 {t('drinkingdice.resultPrompt')}
                  </span>
                  {ruleResult}
                </div>
              )}
            </div>

            <button 
              onClick={rollDice} 
              disabled={isRolling}
              className="btn btn-primary"
              style={{ marginTop: 20, padding: '12px 36px', fontSize: '1.05rem' }}
            >
              <RotateCw size={18} className={isRolling ? 'spin-animation' : ''} />
              <span>{t('drinkingdice.rollBtn')}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
