import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ScratchCardData {
  id: string;
  category: 'chores' | 'activity' | 'reward';
  textVi: string;
  textEn: string;
}

const SCRATCH_ITEMS: ScratchCardData[] = [
  // Chores
  { id: 'c1', category: 'chores', textVi: 'Anh rửa bát tối nay và em ngồi chơi!', textEn: 'He washes dishes tonight and she rests!' },
  { id: 'c2', category: 'chores', textVi: 'Nửa kia lau nhà và giặt quần áo!', textEn: 'Partner mops the floor and does laundry!' },
  { id: 'c3', category: 'chores', textVi: 'Cùng nhau dọn dẹp phòng ngủ cực sạch nhé!', textEn: 'Clean the bedroom thoroughly together!' },
  { id: 'c4', category: 'chores', textVi: 'Người cào được đấm lưng cho nửa kia 10 phút!', textEn: 'Scratcher gives other person a 10 min massage!' },
  { id: 'c5', category: 'chores', textVi: 'Người cào được đặc cách không cần làm gì tối nay!', textEn: 'Scratcher gets a pass from all chores tonight!' },

  // Activity
  { id: 'a1', category: 'activity', textVi: 'Đi xem phim rạp và ăn bỏng ngô ngọt.', textEn: 'Go watch a movie at the cinema with sweet popcorn.' },
  { id: 'a2', category: 'activity', textVi: 'Cùng nhau cày một bộ phim lãng mạn tại nhà.', textEn: 'Watch a cozy romantic movie at home together.' },
  { id: 'a3', category: 'activity', textVi: 'Đi dạo phố phường ngắm hoàng hôn hồ Tây.', textEn: 'Take a sunset walk around West Lake.' },
  { id: 'a4', category: 'activity', textVi: 'Đi cafe check-in và chụp ảnh sống ảo cho nhau.', textEn: 'Go to a cafe and take photos of each other.' },
  { id: 'a5', category: 'activity', textVi: 'Cùng chơi game đối kháng hoặc game co-op.', textEn: 'Play a versus or co-op video game together.' },

  // Reward
  { id: 'r1', category: 'reward', textVi: 'Nhận 1 cái ôm chặt ấm áp 30 giây từ nửa kia.', textEn: 'Get a warm 30-second hug from your partner.' },
  { id: 'r2', category: 'reward', textVi: 'Nửa kia sẽ nấu món yêu thích cho bạn ăn.', textEn: 'Partner cooks your favorite meal.' },
  { id: 'r3', category: 'reward', textVi: 'Nhận 1 nụ hôn ngọt ngào lên má/trán.', textEn: 'Get a sweet kiss on the cheek or forehead.' },
  { id: 'r4', category: 'reward', textVi: 'Một buổi tối hẹn hò và nửa kia thanh toán hết.', textEn: 'A date night fully sponsored by your partner.' },
  { id: 'r5', category: 'reward', textVi: 'Nửa kia phải đồng ý làm theo 1 yêu cầu bất kỳ.', textEn: 'Partner must say YES to 1 wish of yours.' }
];

export const ScratchCardTool: React.FC = () => {
  const { lang, t } = useLanguage();
  const [scratchCards, setScratchCards] = useState<{
    id: string;
    category: 'chores' | 'activity' | 'reward';
    text: string;
    scratched: boolean;
  }[]>([]);

  useEffect(() => {
    initScratchCards();
  }, []);

  const initScratchCards = () => {
    const categories: ('chores' | 'activity' | 'reward')[] = ['chores', 'activity', 'reward'];
    const selected: typeof scratchCards = [];

    categories.forEach((cat) => {
      const filtered = SCRATCH_ITEMS.filter(item => item.category === cat);
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      shuffled.slice(0, 2).forEach((item, innerIndex) => {
        selected.push({
          id: `${cat}-${innerIndex}-${Date.now()}`,
          category: cat,
          text: lang === 'vi' ? item.textVi : item.textEn,
          scratched: false
        });
      });
    });

    setScratchCards(selected.sort(() => Math.random() - 0.5));
  };

  const ScratchCard: React.FC<{
    card: typeof scratchCards[0];
    onScratchComplete: (id: string) => void;
  }> = ({ card, onScratchComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scratched, setScratched] = useState(card.scratched);

    useEffect(() => {
      setScratched(card.scratched);
      if (!card.scratched) {
        initCanvas();
      }
    }, [card.scratched]);

    const initCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#FDA4AF');
      grad.addColorStop(0.5, '#F9A8D4');
      grad.addColorStop(1, '#F472B6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '14px var(--font-sans)';
      for (let x = 12; x < w; x += 30) {
        for (let y = 15; y < h; y += 30) {
          ctx.fillText('❤️', x, y);
        }
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px var(--font-sans)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#370B1B';
      ctx.lineWidth = 3;
      ctx.strokeText(lang === 'vi' ? 'CÀO TỚ ĐI' : 'SCRATCH ME', w / 2, h / 2);
      ctx.fillText(lang === 'vi' ? 'CÀO TỚ ĐI' : 'SCRATCH ME', w / 2, h / 2);
    };

    const handleScratchMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (scratched) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        if (e.buttons !== 1) return;
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fill();

      checkScratchPercentage(canvas);
    };

    const checkScratchPercentage = (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      let cleared = 0;

      for (let i = 0; i < data.length; i += 16) {
        if (data[i + 3] === 0) {
          cleared++;
        }
      }

      const totalSamples = data.length / 16;
      const pct = cleared / totalSamples;

      if (pct > 0.6) {
        setScratched(true);
        onScratchComplete(card.id);
      }
    };

    const getCategoryDetails = () => {
      switch (card.category) {
        case 'chores':
          return { label: t('couple.scratchCardChores'), icon: '🧹', color: '#FEE2E2', border: '#FCA5A5' };
        case 'activity':
          return { label: t('couple.scratchCardActivity'), icon: '🎡', color: '#FEF3C7', border: '#FCD34D' };
        case 'reward':
          return { label: t('couple.scratchCardReward'), icon: '🎁', color: '#ECFDF5', border: '#6EE7B7' };
      }
    };

    const cat = getCategoryDetails();

    return (
      <div 
        className="scratch-card-box glass animate-fade"
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '200px', 
          overflow: 'hidden',
          backgroundColor: cat.color,
          borderColor: cat.border,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          textAlign: 'center',
          borderRadius: '16px'
        }}
      >
        <div className="scratch-content animate-fade">
          <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>{cat.icon}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.label}</span>
          <p style={{ marginTop: '8px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {card.text}
          </p>
        </div>

        {!scratched && (
          <canvas
            ref={canvasRef}
            width={180}
            height={200}
            onMouseMove={handleScratchMove}
            onTouchMove={handleScratchMove}
            onMouseDown={handleScratchMove}
            onTouchStart={handleScratchMove}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              cursor: 'radial-gradient(circle, transparent 20px, #000 20px)',
              touchAction: 'none'
            }}
          />
        )}
      </div>
    );
  };

  const handleScratchComplete = (cardId: string) => {
    setScratchCards(prev => prev.map(card => card.id === cardId ? { ...card, scratched: true } : card));
  };

  const revealAllCards = () => {
    setScratchCards(prev => prev.map(card => ({ ...card, scratched: true })));
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

        .scratch-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%;
        }

        @media (min-width: 768px) {
          .scratch-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      <div className="tool-header">
        <h2 className="title-primary text-gradient">
          <Heart size={32} style={{ display: 'inline', marginRight: 10, fill: 'var(--accent)' }} />
          {t('couple.scratchTitle')}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('couple.scratchDesc')}
        </p>
      </div>

      <div className="tool-card glass animate-fade" style={{ textAlign: 'center' }}>
        <div className="scratch-grid">
          {scratchCards.map((card) => (
            <ScratchCard 
              key={card.id} 
              card={card} 
              onScratchComplete={handleScratchComplete}
            />
          ))}
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={revealAllCards} className="btn btn-secondary" style={{ borderColor: 'var(--card-border)', background: 'white' }}>
            <span>🔓 {t('couple.scratchRevealAll')}</span>
          </button>
          <button onClick={initScratchCards} className="btn btn-primary">
            <RotateCw size={16} />
            <span>{lang === 'vi' ? 'Đổi bộ thẻ khác' : 'Get new cards'}</span>
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 16, fontWeight: 500 }}>
          💡 {t('couple.scratchInstruction')}
        </p>
      </div>
    </div>
  );
};
