import React, { useState } from 'react';
import { RotateCw, Sparkles, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DrinkingCardsTool: React.FC = () => {
  const { t } = useLanguage();
  const [cardCategory, setCardCategory] = useState<'casual' | 'crazy' | 'spicy'>('casual');
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [drawTrigger, setDrawTrigger] = useState(0);

  const getPrompts = (cat: 'casual' | 'crazy' | 'spicy') => {
    const prefix = cat === 'casual' ? 'c' : cat === 'crazy' ? 'cr' : 's';
    return [
      t(`drinkingcards.${prefix}Prompt1`),
      t(`drinkingcards.${prefix}Prompt2`),
      t(`drinkingcards.${prefix}Prompt3`),
      t(`drinkingcards.${prefix}Prompt4`),
      t(`drinkingcards.${prefix}Prompt5`),
    ];
  };

  const drawCard = () => {
    setIsFlipped(false);
    const list = getPrompts(cardCategory);
    const randomPrompt = list[Math.floor(Math.random() * list.length)];
    
    setTimeout(() => {
      setCurrentPrompt(randomPrompt);
      setDrawTrigger(prev => prev + 1);
    }, 150);
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

        .card-scene {
          width: 280px;
          height: 380px;
          margin: 20px auto;
          perspective: 1000px;
        }

        .flip-card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .flip-card.flipped {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 24px;
          border: 3.5px solid var(--text-primary);
          box-shadow: 6px 6px 0px var(--text-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
        }

        .card-front {
          background: linear-gradient(135deg, #FF9EBB 0%, #FF7597 100%);
          color: white;
          overflow: hidden;
        }

        .card-front-pattern {
          position: absolute;
          font-size: 8rem;
          opacity: 0.12;
          transform: rotate(-12deg);
        }

        .card-back {
          background: white;
          transform: rotateY(180deg);
          justify-content: space-between;
        }

        .card-badge {
          background: var(--accent-light);
          color: var(--accent);
          border: 1.5px solid var(--accent);
          padding: 4px 14px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .category-chips {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .chip {
          padding: 6px 16px;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 700;
          border: 2px solid var(--card-border);
          background: white;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .chip:hover {
          transform: translateY(-1px);
        }

        .chip.casual { color: #10B981; border-color: #A7F3D0; }
        .chip.casual.active { background: #10B981; color: white; border-color: #10B981; }

        .chip.crazy { color: #3B82F6; border-color: #BFDBFE; }
        .chip.crazy.active { background: #3B82F6; color: white; border-color: #3B82F6; }

        .chip.spicy { color: #EF4444; border-color: #FCA5A5; }
        .chip.spicy.active { background: #EF4444; color: white; border-color: #EF4444; }
      `}</style>

      <div className="tool-header">
        <h2 className="title-primary text-gradient">
          🃏 {t('drinkingcards.title')}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('drinkingcards.desc')}
        </p>
      </div>

      <div className="tool-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="tool-card glass animate-fade" style={{ textAlign: 'center', padding: '36px 20px', minHeight: 460, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          
          <div style={{ width: '100%' }}>
            <div className="category-chips">
              <button 
                onClick={() => { setCardCategory('casual'); setCurrentPrompt(null); }} 
                className={`chip casual ${cardCategory === 'casual' ? 'active' : ''}`}
              >
                🌱 {t('drinkingcards.cardCasual')}
              </button>
              <button 
                onClick={() => { setCardCategory('crazy'); setCurrentPrompt(null); }} 
                className={`chip crazy ${cardCategory === 'crazy' ? 'active' : ''}`}
              >
                🤪 {t('drinkingcards.cardCrazy')}
              </button>
              <button 
                onClick={() => { setCardCategory('spicy'); setCurrentPrompt(null); }} 
                className={`chip spicy ${cardCategory === 'spicy' ? 'active' : ''}`}
              >
                🔥 {t('drinkingcards.cardSpicy')}
              </button>
            </div>

            {!currentPrompt ? (
              <div style={{ padding: '40px 0' }}>
                <button 
                  onClick={drawCard} 
                  className="btn btn-primary"
                  style={{ padding: '16px 36px', fontSize: '1.1rem' }}
                >
                  <Sparkles size={20} style={{ fill: 'white' }} />
                  <span>{t('drinkingcards.drawCardBtn')}</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="card-scene">
                  <div 
                    key={`${cardCategory}-${drawTrigger}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`flip-card ${isFlipped ? 'flipped' : ''}`}
                  >
                    <div className="card-face card-front">
                      <span className="card-front-pattern">🍺</span>
                      <h3 style={{ fontSize: '1.6rem', fontFamily: 'Fredoka', fontWeight: 700 }}>PercyLab</h3>
                      <p style={{ fontSize: '0.85rem', marginTop: 10, opacity: 0.9 }}>
                        {t('drinkingcards.clickToFlip')}
                      </p>
                    </div>

                    <div className="card-face card-back">
                      <div className="card-badge">
                        {cardCategory === 'casual' ? '🌱 Casual' : cardCategory === 'crazy' ? '🤪 Crazy' : '🔥 Spicy 18+'}
                      </div>
                      
                      <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '20px 0', lineHeight: 1.5 }}>
                        {currentPrompt}
                      </p>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                        <Award size={16} />
                        <span>DRINK OR DARE!</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button 
                    onClick={() => setCurrentPrompt(null)} 
                    className="btn btn-secondary"
                    style={{ borderColor: 'var(--card-border)', background: 'white' }}
                  >
                    <span>⬅️ {t('drinkingcards.backToDeck')}</span>
                  </button>
                  <button 
                    onClick={drawCard} 
                    className="btn btn-primary"
                  >
                    <RotateCw size={16} />
                    <span>{t('drinkingcards.drawCardBtn')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
