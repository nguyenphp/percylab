import React, { useState } from 'react';
import { Heart, RotateCw, Smile, X, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Food {
  id: string;
  nameVi: string;
  nameEn: string;
  category: string;
  image: string;
}

const FOOD_ITEMS: Food[] = [
  // Món chính
  { id: '1', nameVi: 'Phở Bò/Gà', nameEn: 'Vietnamese Pho', category: 'main', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&auto=format&fit=crop&q=80' },
  { id: '2', nameVi: 'Cơm Tấm Sườn Bì Chả', nameEn: 'Broken Rice with Grilled Pork', category: 'main', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&auto=format&fit=crop&q=80' },
  { id: '3', nameVi: 'Mì Ý Pasta Sốt Bò Bằm', nameEn: 'Italian Pasta Bolognese', category: 'main', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80' },
  { id: '4', nameVi: 'Sushi & Sashimi Nhật Bản', nameEn: 'Sushi & Sashimi Platter', category: 'main', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&auto=format&fit=crop&q=80' },
  { id: '5', nameVi: 'Bún Chả Hà Nội', nameEn: 'Bun Cha Hanoi', category: 'main', image: 'https://images.unsplash.com/photo-1564671165093-201896028d34?w=400&auto=format&fit=crop&q=80' },
  { id: '6', nameVi: 'Cơm Rang Kim Chi', nameEn: 'Kimchi Fried Rice', category: 'main', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop&q=80' },

  // Lẩu & Nướng
  { id: '7', nameVi: 'Lẩu Thái Chua Cay', nameEn: 'Tom Yum Hotpot', category: 'bbq', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&auto=format&fit=crop&q=80' },
  { id: '8', nameVi: 'Bò Nướng Hàn Quốc', nameEn: 'Korean BBQ', category: 'bbq', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80' },
  { id: '9', nameVi: 'Lẩu Tokbokki Phô Mai', nameEn: 'Tokbokki Cheese Hotpot', category: 'bbq', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80' },
  { id: '10', nameVi: 'Steak Bò Bít Tết', nameEn: 'Ribeye Beef Steak', category: 'bbq', image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400&auto=format&fit=crop&q=80' },

  // Ăn vặt
  { id: '11', nameVi: 'Pizza Phô Mai & Thập Cẩm', nameEn: 'Cheese & Supreme Pizza', category: 'snacks', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80' },
  { id: '12', nameVi: 'Gà Rán Giòn Rụm', nameEn: 'Crispy Fried Chicken', category: 'snacks', image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&auto=format&fit=crop&q=80' },
  { id: '13', nameVi: 'Bún Đậu Mắm Tôm', nameEn: 'Vermicelli with Fried Tofu', category: 'snacks', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80' },
  { id: '14', nameVi: 'Khoai Tây Chiên Phô Mai', nameEn: 'French Fries with Cheese', category: 'snacks', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80' },
  { id: '15', nameVi: 'Bánh Tráng Trộn Tây Ninh', nameEn: 'Rice Paper Salad', category: 'snacks', image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&auto=format&fit=crop&q=80' },

  // Đồ uống
  { id: '16', nameVi: 'Trà Sữa Trân Châu', nameEn: 'Pearl Bubble Tea', category: 'drinks', image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=400&auto=format&fit=crop&q=80' },
  { id: '17', nameVi: 'Cà Phê Muối / Bạc Xỉu', nameEn: 'Salted Cream Coffee', category: 'drinks', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80' },
  { id: '18', nameVi: 'Trà Đào Cam Sả', nameEn: 'Peach Orange Lemongrass Tea', category: 'drinks', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&auto=format&fit=crop&q=80' },

  // Tráng miệng
  { id: '19', nameVi: 'Kem Tươi Trái Cây', nameEn: 'Fruit Ice Cream Cup', category: 'drinks', image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop&q=80' },
  { id: '20', nameVi: 'Bánh Tiramisu', nameEn: 'Sweet Tiramisu Cake', category: 'drinks', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop&q=80' }
];

export const FoodMatcherTool: React.FC = () => {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState<'setup' | 'playerA' | 'playerB' | 'transition' | 'result'>('setup');
  const [playerAName, setPlayerAName] = useState<string>(lang === 'vi' ? 'Bạn Nam' : 'Player A');
  const [playerBName, setPlayerBName] = useState<string>(lang === 'vi' ? 'Bạn Nữ' : 'Player B');
  const [foodCategory, setFoodCategory] = useState<string>('all');
  const [foods, setFoods] = useState<Food[]>([]);
  const [swipeIndex, setSwipeIndex] = useState<number>(0);
  const [likesA, setLikesA] = useState<string[]>([]);
  const [likesB, setLikesB] = useState<string[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const startSwipe = () => {
    let filtered = FOOD_ITEMS;
    if (foodCategory !== 'all') {
      filtered = FOOD_ITEMS.filter(f => f.category === foodCategory);
    }
    const randomFoods = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10);
    setFoods(randomFoods);
    setSwipeIndex(0);
    setLikesA([]);
    setLikesB([]);
    setStep('playerA');
  };

  const handleSwipe = (liked: boolean) => {
    setSwipeDirection(liked ? 'right' : 'left');

    setTimeout(() => {
      const currentFood = foods[swipeIndex];
      
      if (step === 'playerA') {
        if (liked) setLikesA(prev => [...prev, currentFood.id]);
        if (swipeIndex + 1 < foods.length) {
          setSwipeIndex(prev => prev + 1);
        } else {
          setStep('transition');
          setSwipeIndex(0);
        }
      } else if (step === 'playerB') {
        if (liked) setLikesB(prev => [...prev, currentFood.id]);
        if (swipeIndex + 1 < foods.length) {
          setSwipeIndex(prev => prev + 1);
        } else {
          setStep('result');
        }
      }
      setSwipeDirection(null);
    }, 250);
  };

  const getMatches = () => {
    const matchedIds = likesA.filter(id => likesB.includes(id));
    return foods.filter(food => matchedIds.includes(food.id));
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

        .swipe-workspace {
          max-width: 440px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .food-card-container {
          position: relative;
          width: 320px;
          height: 380px;
          perspective: 1000px;
        }

        .food-card {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-md);
          background: #ffffff;
          border: 3px solid var(--card-border);
          box-shadow: 6px 6px 0px var(--card-border);
          overflow: hidden;
          position: absolute;
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .food-card.swipe-left {
          transform: rotate(-15deg) translateX(-350px) translateY(20px);
          opacity: 0;
        }

        .food-card.swipe-right {
          transform: rotate(15deg) translateX(350px) translateY(20px);
          opacity: 0;
        }

        .food-card-img {
          width: 100%;
          height: 260px;
          object-fit: cover;
          background: #ffeef2;
          border-bottom: 2px dashed var(--card-border);
        }

        .food-card-info {
          padding: 18px;
          text-align: left;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .food-card-info h3 {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          color: var(--text-primary);
        }

        .swipe-actions {
          display: flex;
          gap: 24px;
          justify-content: center;
          width: 100%;
        }

        .btn-swipe {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px solid var(--text-primary);
          box-shadow: 3px 3px 0px var(--text-primary);
          cursor: pointer;
          transition: var(--transition-bounce);
          background: white;
        }

        .btn-swipe:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px var(--text-primary);
        }

        .btn-swipe-dislike {
          color: #EF4444;
        }
        .btn-swipe-dislike:hover {
          background: #FEF2F2;
          transform: scale(1.1) translateY(-2px);
        }

        .btn-swipe-like {
          color: #EC4899;
        }
        .btn-swipe-like:hover {
          background: #FDF2F8;
          transform: scale(1.1) translateY(-2px);
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          margin: 16px 0;
        }

        .result-food-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px;
          background: white;
          border: 2px solid var(--card-border);
          border-radius: 12px;
        }

        .result-food-img {
          width: 55px;
          height: 55px;
          border-radius: 8px;
          object-fit: cover;
        }
      `}</style>

      <div className="tool-header">
        <h2 className="title-primary text-gradient">
          <Heart size={32} style={{ display: 'inline', marginRight: 10, fill: 'var(--accent)' }} />
          {lang === 'vi' ? 'Quẹt Món Ăn Couple' : 'Couple Food Matcher'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'vi' ? 'Cùng quẹt chọn món ăn yêu thích và tìm ra điểm chung ẩm thực của cả hai.' : 'Swipe to match your favorite foods and find your mutual cravings.'}
        </p>
      </div>

      <div className="tool-grid" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
        <div className="tool-card glass animate-fade" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 480 }}>
          
          {step === 'setup' && (
            <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%', textAlign: 'left' }}>
              <h3 className="section-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: 12 }}>
                ✨ {t('couple.tinderSetupTitle')}
              </h3>

              <div className="form-group">
                <label>{t('couple.tinderPlayerA')}</label>
                <input 
                  type="text" 
                  value={playerAName} 
                  onChange={e => setPlayerAName(e.target.value)} 
                  className="form-input" 
                  style={{ borderColor: 'var(--card-border)' }}
                />
              </div>

              <div className="form-group">
                <label>{t('couple.tinderPlayerB')}</label>
                <input 
                  type="text" 
                  value={playerBName} 
                  onChange={e => setPlayerBName(e.target.value)} 
                  className="form-input" 
                  style={{ borderColor: 'var(--card-border)' }}
                />
              </div>

              <div className="form-group">
                <label>{t('couple.tinderCategory')}</label>
                <select 
                  value={foodCategory} 
                  onChange={e => setFoodCategory(e.target.value)} 
                  className="form-input"
                  style={{ borderColor: 'var(--card-border)', background: 'white' }}
                >
                  <option value="all">{lang === 'vi' ? '🍔 Tất cả các món' : '🍔 All Cuisines'}</option>
                  <option value="main">{lang === 'vi' ? '🍜 Món chính (Cơm, Mì, Sushi)' : '🍜 Main Courses'}</option>
                  <option value="bbq">{lang === 'vi' ? '🔥 Lẩu & Nướng' : '🔥 Hotpot & BBQ'}</option>
                  <option value="snacks">{lang === 'vi' ? '🍕 Ăn vặt & Fast Food' : '🍕 Snacks & Fast Food'}</option>
                  <option value="drinks">{lang === 'vi' ? '🥤 Đồ uống & Trà sữa' : '🥤 Coffee & Tea'}</option>
                </select>
              </div>

              <button onClick={startSwipe} className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                <Heart size={18} style={{ fill: 'white' }} />
                <span>{t('couple.tinderStartBtn')}</span>
              </button>
            </div>
          )}

          {(step === 'playerA' || step === 'playerB') && foods.length > 0 && (
            <div className="swipe-workspace animate-fade">
              <div style={{ background: 'var(--accent-light)', border: '1.5px solid var(--card-border)', padding: '6px 16px', borderRadius: 99, fontWeight: 700, color: 'var(--accent)' }}>
                🎯 {t('couple.tinderSwipeTurnPrompt').replace('{name}', step === 'playerA' ? playerAName : playerBName)}
              </div>

              <div className="food-card-container">
                {foods.map((food, idx) => {
                  if (idx !== swipeIndex) return null;
                  return (
                    <div 
                      key={food.id}
                      className={`food-card ${swipeDirection === 'left' ? 'swipe-left' : swipeDirection === 'right' ? 'swipe-right' : ''}`}
                    >
                      <img src={food.image} alt={food.nameVi} className="food-card-img" />
                      <div className="food-card-info">
                        <h3>{lang === 'vi' ? food.nameVi : food.nameEn}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: 4, fontWeight: 700 }}>
                          #{food.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {swipeIndex + 1} / {foods.length}
              </span>

              <div className="swipe-actions">
                <button onClick={() => handleSwipe(false)} className="btn-swipe btn-swipe-dislike" aria-label="Dislike">
                  <X size={26} />
                </button>
                <button onClick={() => handleSwipe(true)} className="btn-swipe btn-swipe-like" aria-label="Like">
                  <Heart size={26} style={{ fill: 'currentColor' }} />
                </button>
              </div>
            </div>
          )}

          {step === 'transition' && (
            <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
              <Smile size={60} style={{ color: 'var(--accent)', marginBottom: 16, margin: '0 auto 16px' }} />
              <h3 className="section-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: 12 }}>
                {t('couple.tinderPassPhonePrompt').replace('{name}', playerAName)}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                {t('couple.tinderPassPhoneDesc').replace('{nextName}', playerBName)}
              </p>
              <button onClick={() => setStep('playerB')} className="btn btn-primary" style={{ width: '100%' }}>
                <span>{t('couple.tinderNextTurnBtn').replace('{nextName}', playerBName)}</span>
              </button>
            </div>
          )}

          {step === 'result' && (
            <div className="animate-fade" style={{ textAlign: 'center', width: '100%', padding: '0 20px' }}>
              <Award size={56} style={{ color: 'var(--accent)', marginBottom: 12, margin: '0 auto 12px' }} />
              <h3 className="section-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginBottom: 8 }}>
                {t('couple.tinderResultTitle')}
              </h3>

              {getMatches().length > 0 ? (
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                    {t('couple.tinderMatchCount').replace('{count}', getMatches().length.toString())}
                  </p>
                  <div className="results-list">
                    {getMatches().map(food => (
                      <div key={food.id} className="result-food-item">
                        <img src={food.image} alt={food.nameVi} className="result-food-img" />
                        <div style={{ textAlign: 'left' }}>
                          <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{lang === 'vi' ? food.nameVi : food.nameEn}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>#{food.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '24px 0' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                    {t('couple.tinderNoMatch')}
                  </p>
                </div>
              )}

              <button onClick={() => setStep('setup')} className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                <RotateCw size={16} />
                <span>{t('couple.tinderPlayAgain')}</span>
              </button>
            </div>
          )}
        </div>

        <div className="tool-card glass base64-output-card animate-fade">
          <h3 className="section-title">💡 How to Play</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
            {lang === 'vi' ? (
              <>
                Công cụ giúp giải quyết nhanh nhất câu hỏi kinh điển <strong>"Hôm nay ăn gì?"</strong>:
                <ol style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Nhập tên của 2 bạn và chọn nhóm món ăn.</li>
                  <li><strong>Lượt của {playerAName}</strong>: Vuốt Trái/Bấm nút X nếu ghét, Vuốt Phải/Bấm Tim nếu thích 10 món ăn.</li>
                  <li><strong>Lượt của {playerBName}</strong>: Chuyển máy và làm tương tự.</li>
                  <li>Ứng dụng tự động so khớp và tìm ra những món cả hai cùng chọn!</li>
                </ol>
              </>
            ) : (
              <>
                A smart way to resolve the classic <strong>"What should we eat?"</strong> question:
                <ol style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Enter player names and select a food category.</li>
                  <li><strong>{playerAName}'s Turn</strong>: Swipe Left/click X for Dislike, Swipe Right/click Heart for Like.</li>
                  <li><strong>{playerBName}'s Turn</strong>: Pass the device and swipe the same items.</li>
                  <li>The app will automatically match and display the mutual preferences!</li>
                </ol>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
