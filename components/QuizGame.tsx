
import React, { useState, useEffect, useRef } from 'react';
import { KANA_DATA } from '../constants';
import { Kana, MnemonicResponse } from '../types';
import { getMnemonic } from '../services/geminiService';

type CharType = 'hiragana' | 'katakana' | 'romaji' | 'random';
type ConcreteCharType = 'hiragana' | 'katakana' | 'romaji';
type GameMode = 'regular' | 'mixed' | 'heartbeat';

interface QuizConfig {
  questionType: CharType;
  answerType: CharType;
  selectedCategories: string[];
  gameMode: GameMode;
}

const CHAR_TYPE_LABELS: Record<CharType, string> = {
  hiragana: '平假名 (あ)',
  katakana: '片假名 (ア)',
  romaji: '罗马音 (a)',
  random: '🎲 随机 (Random)'
};

const CATEGORIES = Array.from(new Set(KANA_DATA.map(k => k.category)));

const CATEGORY_GROUPS = {
  '清音 (基础)': ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa', 'n'],
  '浊音 (Voiced)': ['ga', 'za', 'da', 'ba'],
  '半浊音': ['pa']
};

const ROW_LABELS: Record<string, string> = {
  'a': 'あ行', 'ka': 'か行', 'sa': 'さ行', 'ta': 'た行', 'na': 'な行',
  'ha': 'は行', 'ma': 'ま行', 'ya': 'や行', 'ra': 'ら行', 'wa': 'わ行', 'n': 'ん',
  'ga': 'が行', 'za': 'ざ行', 'da': 'だ行', 'ba': 'ば行',
  'pa': 'ぱ行'
};

// Anime Voice Lines
const VOICE_LINES = {
  start: ['頑張ってね！', 'ganbatte ne', '要加油哦！'],
  correct: ['すごい！', 'sugoi', '好厉害！'],
  correct_strip: ['きゃっ！えっち！', 'kya! ecchi!', '呀！色鬼！'],
  wrong: ['違うよ！', 'chigau yo', '不对哦！'],
  wrong_dress: ['バカ！', 'baka', '笨蛋！'],
  timeout: ['遅いよ...', 'osoi yo', '太慢了...'],
  win_naked: ['もう...全部見られちゃった...', 'mou... zenbu mirarechatta', '真是的...全被看光了...'],
  win_normal: ['お疲れ様！', 'otsukaresama', '辛苦啦！'],
  lose: ['残念でした〜', 'zannen deshita', '太遗憾了~']
};

// --- SVG Anime Avatar Component (High Precision Version) ---
const PixelAnimeGirl: React.FC<{ level: number, mood: 'happy' | 'shocked' | 'angry' }> = ({ level, mood }) => {
  // Colors - Enhanced Palette
  const c = {
    skin: "#FFE0BD",
    skinShadow: "#EUC094", // Darker skin for shading
    skinHighlight: "#FFF0E0",
    hair: "#6A4C93", 
    hairDark: "#4D3669",
    hairLight: "#9D7CC8",
    eyeBase: mood === 'shocked' ? "#1E293B" : "#3B82F6",
    eyeDark: "#1D4ED8",
    blush: "#FF9999",
    shirt: "#FFFFFF",
    shirtShadow: "#E2E8F0",
    vest: "#FFD700",
    vestShadow: "#B45309",
    skirt: "#3B82F6",
    skirtShadow: "#1E40AF",
    skirtLight: "#60A5FA",
    socks: "#1E293B",
    shoes: "#573024",
    blazer: "#1E3A8A",
    blazerShadow: "#0F172A",
    scarf: "#EF4444",
    scarfShadow: "#991B1B",
    beret: "#F9A8D4",
    beretShadow: "#DB2777",
    bag: "#78350F",
    bagHighlight: "#92400E"
  };

  return (
    <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-xl" shapeRendering="crispEdges">
      {/* Background Aura */}
      <circle cx="200" cy="280" r="160" fill={mood === 'shocked' ? '#FECACA' : '#E0E7FF'} opacity="0.4" />
      
      {/* --- BODY BASE (Level 0) --- */}
      <g id="body">
        {/* Legs with shading */}
        <rect x="160" y="350" width="30" height="200" fill={c.skin} />
        <rect x="160" y="350" width="5" height="200" fill={c.skinShadow} opacity="0.3" /> {/* Leg Shadow */}
        <rect x="210" y="350" width="30" height="200" fill={c.skin} />
        <rect x="235" y="350" width="5" height="200" fill={c.skinShadow} opacity="0.3" /> {/* Leg Shadow */}
        
        {/* Torso */}
        <rect x="150" y="200" width="100" height="160" fill={c.skin} />
        <rect x="150" y="240" width="100" height="20" fill={c.skinShadow} opacity="0.1" /> {/* Rib shadow */}

        {/* Neck */}
        <rect x="185" y="170" width="30" height="40" fill={c.skin} />
        <rect x="185" y="170" width="30" height="10" fill={c.skinShadow} opacity="0.3" /> {/* Chin shadow */}

        {/* Head Shape */}
        <rect x="150" y="80" width="100" height="110" rx="20" fill={c.skin} />
        
        {/* Underwear (SFW Base) */}
        <g id="underwear">
             {/* Top */}
            <rect x="155" y="210" width="90" height="60" fill="white" opacity="0.9" />
            <rect x="155" y="260" width="90" height="10" fill="#E2E8F0" opacity="0.5" />
            <path d="M155 210 Q200 240 245 210" fill="#F1F5F9" opacity="0.5" />
            {/* Bottoms */}
            <rect x="155" y="340" width="90" height="35" fill="white" opacity="0.9" />
            <rect x="155" y="340" width="5" height="35" fill="#E2E8F0" />
            <rect x="240" y="340" width="5" height="35" fill="#E2E8F0" />
        </g>

         {/* Arms with elbow definition */}
        <g transform="rotate(5 120 210)">
            <rect x="120" y="210" width="30" height="140" fill={c.skin} />
            <rect x="120" y="210" width="10" height="140" fill={c.skinShadow} opacity="0.2" />
        </g>
        <g transform="rotate(-5 250 210)">
            <rect x="250" y="210" width="30" height="140" fill={c.skin} />
            <rect x="270" y="210" width="10" height="140" fill={c.skinShadow} opacity="0.2" />
        </g>
      </g>

      {/* --- FACE DETAILS --- */}
      <g id="face">
        {/* Blush */}
        {(mood === 'shocked' || level <= 3) && (
            <>
              <rect x="155" y="155" width="25" height="10" fill={c.blush} opacity="0.5" rx="5" />
              <rect x="220" y="155" width="25" height="10" fill={c.blush} opacity="0.5" rx="5" />
              <path d="M160 160 L170 150 M165 165 L175 155" stroke={c.blush} strokeWidth="2" />
              <path d="M225 160 L235 150 M230 165 L240 155" stroke={c.blush} strokeWidth="2" />
            </>
        )}

        {/* Eyes (High Detail) */}
        <g id="eye-left">
            <rect x="162" y="125" width="26" height="24" fill="white" rx="2"/>
            <rect x="165" y="125" width="20" height="24" fill={c.eyeBase} />
            <rect x="165" y="125" width="20" height="10" fill={c.eyeDark} />
            <rect x="175" y="128" width="8" height="8" fill="white" opacity="0.9" /> {/* Large Highlight */}
            <rect x="167" y="140" width="4" height="4" fill="white" opacity="0.6" /> {/* Small Highlight */}
        </g>
        <g id="eye-right">
            <rect x="212" y="125" width="26" height="24" fill="white" rx="2"/>
            <rect x="215" y="125" width="20" height="24" fill={c.eyeBase} />
            <rect x="215" y="125" width="20" height="10" fill={c.eyeDark} />
            <rect x="225" y="128" width="8" height="8" fill="white" opacity="0.9" />
            <rect x="217" y="140" width="4" height="4" fill="white" opacity="0.6" />
        </g>
        
        {/* Eyebrows */}
        {mood === 'angry' ? (
           <>
             <path d="M160 115 L190 120" stroke={c.hairDark} strokeWidth="3" />
             <path d="M240 115 L210 120" stroke={c.hairDark} strokeWidth="3" />
           </>
        ) : (
           <>
             <path d="M160 118 Q175 115 190 118" stroke={c.hairDark} strokeWidth="3" fill="none"/>
             <path d="M210 118 Q225 115 240 118" stroke={c.hairDark} strokeWidth="3" fill="none"/>
           </>
        )}

        {/* Mouth */}
        {mood === 'happy' && <path d="M190 165 Q200 175 210 165" stroke="#BE123C" strokeWidth="3" fill="none" strokeLinecap="round" />}
        {mood === 'shocked' && <rect x="195" y="165" width="10" height="14" rx="5" fill="#BE123C" />}
        {mood === 'angry' && <path d="M190 170 Q200 160 210 170" stroke="#BE123C" strokeWidth="3" fill="none" strokeLinecap="round" />}
      </g>

      {/* --- BACK HAIR (Lowest Layer) --- */}
      <g id="hair-back">
        <path d="M140 100 L110 280 L160 280 L150 100 Z" fill={c.hair} />
        <path d="M260 100 L290 280 L240 280 L250 100 Z" fill={c.hair} />
        <path d="M110 280 L160 280 L135 320 Z" fill={c.hairDark} />
        <path d="M290 280 L240 280 L265 320 Z" fill={c.hairDark} />
      </g>

      {/* --- CLOTHING LAYERS (Ordered 1 to 10) --- */}

      {/* Layer 1: Shirt (Detailed) */}
      <g id="layer-1-shirt" style={{ opacity: level >= 1 ? 1 : 0, transition: 'all 0.3s' }}>
        <rect x="150" y="200" width="100" height="150" fill={c.shirt} />
        <rect x="150" y="200" width="100" height="150" fill={c.shirtShadow} opacity="0.2" mask="url(#shirt-fold)" /> 
        {/* Sleeves */}
        <rect x="120" y="210" width="30" height="60" fill={c.shirt} transform="rotate(5 120 210)" />
        <rect x="250" y="210" width="30" height="60" fill={c.shirt} transform="rotate(-5 250 210)" />
        {/* Collar Detail */}
        <path d="M180 200 L200 230 L220 200" fill="none" stroke="#94A3B8" strokeWidth="1" />
        {/* Buttons */}
        <circle cx="200" cy="250" r="2" fill="#CBD5E1" />
        <circle cx="200" cy="280" r="2" fill="#CBD5E1" />
        <circle cx="200" cy="310" r="2" fill="#CBD5E1" />
      </g>

      {/* Layer 2: Socks (Detailed) */}
      <g id="layer-2-socks" style={{ opacity: level >= 2 ? 1 : 0, transition: 'all 0.3s' }}>
        <rect x="160" y="440" width="30" height="110" fill={c.socks} />
        <rect x="160" y="440" width="30" height="5" fill="#334155" /> {/* Band */}
        <rect x="210" y="440" width="30" height="110" fill={c.socks} />
        <rect x="210" y="440" width="30" height="5" fill="#334155" /> {/* Band */}
      </g>

      {/* Layer 3: Vest (Detailed) */}
      <g id="layer-3-vest" style={{ opacity: level >= 3 ? 1 : 0, transition: 'all 0.3s' }}>
        <path d="M152 210 L152 335 L248 335 L248 210 L230 205 L200 260 L170 205 Z" fill={c.vest} />
        <rect x="152" y="320" width="96" height="15" fill={c.vestShadow} opacity="0.2" /> {/* Bottom hem */}
        <path d="M165 210 L170 320" stroke={c.vestShadow} strokeWidth="1" opacity="0.3" /> {/* Knit texture line */}
        <path d="M235 210 L230 320" stroke={c.vestShadow} strokeWidth="1" opacity="0.3" />
      </g>

      {/* Layer 4: Skirt (Pleated High Res) */}
      <g id="layer-4-skirt" style={{ opacity: level >= 4 ? 1 : 0, transition: 'all 0.3s' }}>
        <path d="M148 330 L125 410 L275 410 L252 330 Z" fill={c.skirt} />
        {/* Deep Pleat Shadows */}
        <path d="M165 330 L158 410 L175 410 L180 330" fill={c.skirtShadow} opacity="0.3" />
        <path d="M200 330 L195 410 L205 410 L200 330" fill={c.skirtShadow} opacity="0.3" />
        <path d="M235 330 L228 410 L245 410 L250 330" fill={c.skirtShadow} opacity="0.3" />
        {/* Highlights */}
        <rect x="135" y="400" width="130" height="2" fill={c.skirtLight} opacity="0.5" />
      </g>

      {/* Layer 5: Shoes (Loafers) */}
      <g id="layer-5-shoes" style={{ opacity: level >= 5 ? 1 : 0, transition: 'all 0.3s' }}>
        <path d="M153 550 L153 570 Q153 580 168 580 L185 580 Q192 580 192 570 L192 560 L180 550 Z" fill={c.shoes} />
        <rect x="160" y="552" width="20" height="5" fill="#3E2018" /> {/* Strap */}
        <path d="M203 550 L203 570 Q203 580 218 580 L235 580 Q242 580 242 570 L242 560 L230 550 Z" fill={c.shoes} />
        <rect x="210" y="552" width="20" height="5" fill="#3E2018" /> {/* Strap */}
      </g>

      {/* Layer 6: School Bag (Detailed leather) */}
      <g id="layer-6-bag" style={{ opacity: level >= 6 ? 1 : 0, transition: 'all 0.3s' }}>
        <g transform="translate(255, 360) rotate(-5)">
            <rect x="0" y="0" width="85" height="65" rx="6" fill={c.bag} />
            <rect x="0" y="0" width="85" height="25" rx="4" fill={c.bagHighlight} />
            <rect x="35" y="15" width="15" height="15" rx="2" fill="#F59E0B" /> {/* Buckle */}
            <rect x="5" y="5" width="75" height="2" fill="#FDE68A" opacity="0.5" /> {/* Stitching */}
        </g>
        <path d="M220 220 Q240 250 260 360" stroke={c.bag} strokeWidth="6" fill="none" strokeCap="round" />
      </g>

      {/* Layer 7: Blazer (Detailed) */}
      <g id="layer-7-blazer" style={{ opacity: level >= 7 ? 1 : 0, transition: 'all 0.3s' }}>
        <path d="M142 205 L142 345 L190 345 L190 290 L200 250 L210 290 L210 345 L258 345 L258 205 Q200 190 142 205" fill={c.blazer} />
        <path d="M142 205 L190 290" stroke={c.blazerShadow} strokeWidth="1" fill="none" opacity="0.5" /> {/* Lapel */}
        <path d="M258 205 L210 290" stroke={c.blazerShadow} strokeWidth="1" fill="none" opacity="0.5" />
        {/* Sleeves */}
        <rect x="112" y="210" width="38" height="135" fill={c.blazer} transform="rotate(5 120 210)" rx="5"/>
        <rect x="250" y="210" width="38" height="135" fill={c.blazer} transform="rotate(-5 250 210)" rx="5"/>
        {/* Pocket */}
        <rect x="220" y="310" width="30" height="2" fill={c.blazerShadow} opacity="0.5" />
        {/* Gold Buttons */}
        <circle cx="205" cy="300" r="4" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
        <circle cx="205" cy="325" r="4" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
      </g>

      {/* Layer 8: Scarf (Fluffy) */}
      <g id="layer-8-scarf" style={{ opacity: level >= 8 ? 1 : 0, transition: 'all 0.3s' }}>
        <path d="M165 195 Q200 220 235 195 L235 215 Q200 240 165 215 Z" fill={c.scarfShadow} />
        <rect x="160" y="195" width="80" height="35" rx="15" fill={c.scarf} />
        <rect x="215" y="210" width="25" height="70" rx="5" fill={c.scarf} />
        {/* Pattern */}
        <line x1="170" y1="195" x2="170" y2="230" stroke={c.scarfShadow} strokeWidth="2" opacity="0.3" />
        <line x1="220" y1="210" x2="220" y2="280" stroke={c.scarfShadow} strokeWidth="2" opacity="0.3" />
      </g>

      {/* Layer 9: Beret (Hat with detail) */}
      <g id="layer-9-hat" style={{ opacity: level >= 9 ? 1 : 0, transition: 'all 0.3s' }}>
         <ellipse cx="225" cy="85" rx="75" ry="35" fill={c.beret} transform="rotate(-10 200 100)" />
         <ellipse cx="225" cy="88" rx="70" ry="30" fill={c.beretShadow} transform="rotate(-10 200 100)" opacity="0.2" /> {/* Depth */}
         <rect x="215" y="55" width="8" height="12" fill={c.beret} transform="rotate(-10)" />
      </g>
      
      {/* Layer 10: Glasses (Wireframe) */}
      <g id="layer-10-glasses" style={{ opacity: level >= 10 ? 1 : 0, transition: 'all 0.3s' }}>
        <rect x="160" y="125" width="28" height="18" stroke={glassesFrame} strokeWidth="2" fill="white" fillOpacity="0.1" rx="4" />
        <rect x="212" y="125" width="28" height="18" stroke={glassesFrame} strokeWidth="2" fill="white" fillOpacity="0.1" rx="4" />
        <line x1="188" y1="134" x2="212" y2="134" stroke={glassesFrame} strokeWidth="2" />
        {/* Reflection */}
        <line x1="165" y1="130" x2="175" y2="140" stroke="white" strokeWidth="1" opacity="0.8" />
      </g>

      {/* --- HAIR FRONT (Bangs) --- */}
      <g id="hair-front">
          <path d="M150 80 L145 120 L160 105 L175 125 L190 95 L200 120 L220 95 L235 125 L255 105 L250 80 Z" fill={c.hairLight} />
          <path d="M175 125 L178 110" stroke={c.hairDark} strokeWidth="1" opacity="0.3" />
          <path d="M235 125 L232 110" stroke={c.hairDark} strokeWidth="1" opacity="0.3" />
          {/* Hair Highlight Ring */}
          <path d="M160 90 Q200 85 240 90" stroke={c.skinHighlight} strokeWidth="3" opacity="0.4" fill="none" strokeCap="round" />
      </g>

    </svg>
  );
};


const QuizGame: React.FC = () => {
  // Game Status State
  const [status, setStatus] = useState<'menu' | 'playing' | 'result'>('menu');
  const [config, setConfig] = useState<QuizConfig>({
    questionType: 'hiragana',
    answerType: 'romaji',
    selectedCategories: [...CATEGORY_GROUPS['清音 (基础)']],
    gameMode: 'regular',
  });

  // Gameplay State
  const [currentQuestion, setCurrentQuestion] = useState<Kana | null>(null);
  const [currentRoundTypes, setCurrentRoundTypes] = useState<{q: ConcreteCharType, a: ConcreteCharType}>({q: 'hiragana', a: 'romaji'});
  const [options, setOptions] = useState<Kana[]>([]);
  
  // Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundState, setRoundState] = useState<'waiting' | 'success' | 'failure'>('waiting');
  
  // Heartbeat Mode Specifics
  const [timeLeft, setTimeLeft] = useState(5);
  const [clothingLevel, setClothingLevel] = useState(10); // 10 = fully clothed, 0 = naked
  const [questionCount, setQuestionCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const HEARTBEAT_TOTAL_QUESTIONS = 10;

  // AI Helper State
  const [mnemonic, setMnemonic] = useState<MnemonicResponse | null>(null);
  const [loadingMnemonic, setLoadingMnemonic] = useState(false);

  // --- Effects ---

  // Timer logic for Heartbeat mode
  useEffect(() => {
    if (config.gameMode === 'heartbeat' && status === 'playing' && roundState === 'waiting') {
      if (timeLeft > 0) {
        timerRef.current = window.setTimeout(() => {
          setTimeLeft(prev => prev - 0.1);
        }, 100);
      } else {
        handleTimeout();
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, status, roundState, config.gameMode]);

  const getDisplayText = (kana: Kana, type: ConcreteCharType) => {
    switch (type) {
      case 'hiragana': return kana.hiragana;
      case 'katakana': return kana.katakana;
      case 'romaji': return kana.romaji;
    }
  };

  // --- Audio Helpers ---

  const speakAnime = (type: keyof typeof VOICE_LINES) => {
    const text = VOICE_LINES[type][0];
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.pitch = 1.4; // Make it sound younger/anime-like
    u.rate = 1.1;
    window.speechSynthesis.speak(u);
  };

  const playEffect = (type: 'success' | 'failure') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audio = new AudioCtx();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.connect(gain);
      gain.connect(audio.destination);
      const now = audio.currentTime;

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) { console.error(e); }
  };

  // --- Configuration Helpers ---

  const toggleCategory = (cat: string) => {
    setConfig(prev => {
      const isSelected = prev.selectedCategories.includes(cat);
      return isSelected 
        ? { ...prev, selectedCategories: prev.selectedCategories.filter(c => c !== cat) }
        : { ...prev, selectedCategories: [...prev.selectedCategories, cat] };
    });
  };

  const toggleGroup = (groupCats: string[]) => {
    setConfig(prev => {
      const isAllSelected = groupCats.every(cat => prev.selectedCategories.includes(cat));
      let newSelected;
      if (isAllSelected) {
        newSelected = prev.selectedCategories.filter(c => !groupCats.includes(c));
      } else {
        const currentSet = new Set(prev.selectedCategories);
        groupCats.forEach(c => currentSet.add(c));
        newSelected = Array.from(currentSet);
      }
      return { ...prev, selectedCategories: newSelected };
    });
  };

  const selectAllCategories = () => setConfig(prev => ({ ...prev, selectedCategories: [...CATEGORIES] }));
  const deselectAllCategories = () => setConfig(prev => ({ ...prev, selectedCategories: [] }));

  // --- Game Flow ---

  const startGame = (mode: GameMode) => {
    if (mode === 'regular' && config.questionType !== 'random' && config.answerType !== 'random' && config.questionType === config.answerType) {
      alert("常规模式下，题目类型和答案类型不能相同！");
      return;
    }
    if (config.selectedCategories.length === 0) {
      alert("请至少选择一行进行练习！");
      return;
    }
    
    setConfig(prev => ({ ...prev, gameMode: mode }));
    setScore(0);
    setStreak(0);
    setStatus('playing');
    
    // Heartbeat Init
    if (mode === 'heartbeat') {
      setClothingLevel(10);
      setQuestionCount(0);
      speakAnime('start');
    }

    generateQuestion(mode);
  };

  const stopGame = () => {
    setStatus('menu');
    setRoundState('waiting');
    setMnemonic(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const generateQuestion = (modeOverride?: GameMode) => {
    const currentMode = modeOverride || config.gameMode;
    const activeConfig = { ...config, gameMode: currentMode };

    // Heartbeat check
    if (currentMode === 'heartbeat') {
      if (questionCount >= HEARTBEAT_TOTAL_QUESTIONS) {
        endHeartbeatGame();
        return;
      }
      setQuestionCount(prev => prev + 1);
      setTimeLeft(5.0); // Reset timer
    }

    let qConcrete: ConcreteCharType;
    let aConcrete: ConcreteCharType;

    const pickRandom = (exclude?: ConcreteCharType): ConcreteCharType => {
      const types: ConcreteCharType[] = ['hiragana', 'katakana', 'romaji'];
      const pool = exclude ? types.filter(t => t !== exclude) : types;
      return pool[Math.floor(Math.random() * pool.length)];
    };

    if (activeConfig.questionType === 'random' && activeConfig.answerType === 'random') {
      qConcrete = pickRandom();
      aConcrete = pickRandom(qConcrete);
    } else if (activeConfig.questionType === 'random') {
      aConcrete = activeConfig.answerType as ConcreteCharType;
      qConcrete = pickRandom(aConcrete);
    } else if (activeConfig.answerType === 'random') {
      qConcrete = activeConfig.questionType as ConcreteCharType;
      aConcrete = pickRandom(qConcrete);
    } else {
      qConcrete = activeConfig.questionType as ConcreteCharType;
      aConcrete = activeConfig.answerType as ConcreteCharType;
    }

    const shouldSwap = currentMode === 'mixed' || currentMode === 'heartbeat';
    
    if (shouldSwap && Math.random() > 0.5) {
      [qConcrete, aConcrete] = [aConcrete, qConcrete];
    }
    
    setCurrentRoundTypes({ q: qConcrete, a: aConcrete });

    const pool = KANA_DATA.filter(k => activeConfig.selectedCategories.includes(k.category));
    if (pool.length === 0) return; 

    const randomIndex = Math.floor(Math.random() * pool.length);
    const correct = pool[randomIndex];
    
    const availableDistractorsInPool = pool.filter(k => k.romaji !== correct.romaji);
    const distractors = new Set<Kana>();
    
    if (availableDistractorsInPool.length >= 3) {
      while (distractors.size < 3) {
        const d = availableDistractorsInPool[Math.floor(Math.random() * availableDistractorsInPool.length)];
        distractors.add(d);
      }
    } else {
      availableDistractorsInPool.forEach(d => distractors.add(d));
      while (distractors.size < 3) {
        const d = KANA_DATA[Math.floor(Math.random() * KANA_DATA.length)];
        if (d.romaji !== correct.romaji) {
          distractors.add(d);
        }
      }
    }
    
    const allOptions = [correct, ...Array.from(distractors)].sort(() => Math.random() - 0.5);
    
    setCurrentQuestion(correct);
    setOptions(allOptions);
    setRoundState('waiting');
    setMnemonic(null);
  };

  const handleTimeout = () => {
    setRoundState('failure');
    playEffect('failure');
    speakAnime('timeout');
    setStreak(0);
    // Heartbeat penalty
    if (config.gameMode === 'heartbeat') {
      setClothingLevel(prev => Math.min(10, prev + 1));
    }
    setTimeout(() => generateQuestion(), 1500);
  };

  const handleAnswer = async (selected: Kana) => {
    if (!currentQuestion || roundState !== 'waiting') return;

    if (selected.romaji === currentQuestion.romaji) {
      // Correct
      setScore(s => s + 10);
      setStreak(s => s + 1);
      setRoundState('success');
      playEffect('success');
      
      if (config.gameMode === 'heartbeat') {
        setClothingLevel(prev => Math.max(0, prev - 1));
        speakAnime('correct_strip');
      }

      setTimeout(() => generateQuestion(), 1000); 
    } else {
      // Wrong
      setStreak(0);
      setRoundState('failure');
      playEffect('failure');

      if (config.gameMode === 'heartbeat') {
        setClothingLevel(prev => Math.min(10, prev + 1));
        speakAnime('wrong_dress');
        setTimeout(() => generateQuestion(), 1500);
      } else {
        // Normal Mode Mnemonic Logic
        let targetForMnemonic: Kana | null = null;
        let targetType: 'Hiragana' | 'Katakana' | null = null;
        const qType = currentRoundTypes.q;
        const aType = currentRoundTypes.a;

        if (aType === 'hiragana' || qType === 'hiragana') {
          targetForMnemonic = currentQuestion;
          targetType = 'Hiragana';
        } else if (aType === 'katakana' || qType === 'katakana') {
          targetForMnemonic = currentQuestion;
          targetType = 'Katakana';
        }

        if (targetForMnemonic && targetType) {
          setLoadingMnemonic(true);
          const data = await getMnemonic(
            targetType === 'Hiragana' ? targetForMnemonic.hiragana : targetForMnemonic.katakana,
            targetForMnemonic.romaji,
            targetType
          );
          setMnemonic(data);
          setLoadingMnemonic(false);
        }
      }
    }
  };

  const endHeartbeatGame = () => {
    setStatus('result');
    if (clothingLevel === 0) speakAnime('win_naked');
    else if (clothingLevel <= 5) speakAnime('win_normal');
    else speakAnime('lose');
  };

  // --- RENDER: MENU ---
  if (status === 'menu') {
    const isSameType = config.questionType !== 'random' && config.answerType !== 'random' && config.questionType === config.answerType;
    const isReady = !isSameType && config.selectedCategories.length > 0;

    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-indigo-50 mt-4 animate-fade-in">
        <div className="text-center mb-6">
          <span className="text-5xl mb-2 block">🎮</span>
          <h2 className="text-2xl font-bold text-slate-800">配置你的挑战</h2>
        </div>

        <div className="space-y-6 mb-8">
          {/* Types Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">题目显示 (Question)</label>
              <div className="flex flex-col gap-2">
                {(['hiragana', 'katakana', 'romaji', 'random'] as CharType[]).map(type => (
                  <button
                    key={`q-${type}`}
                    onClick={() => setConfig({ ...config, questionType: type })}
                    className={`py-2 px-3 rounded-lg text-sm font-bold border text-left transition-all ${
                      config.questionType === type
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {CHAR_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">选项显示 (Answer)</label>
              <div className="flex flex-col gap-2">
                {(['hiragana', 'katakana', 'romaji', 'random'] as CharType[]).map(type => (
                  <button
                    key={`a-${type}`}
                    onClick={() => setConfig({ ...config, answerType: type })}
                    className={`py-2 px-3 rounded-lg text-sm font-bold border text-left transition-all ${
                      config.answerType === type
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {CHAR_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row Selection */}
          <div className="border-t pt-4">
             <div className="flex justify-between items-center mb-3">
               <label className="block text-sm font-bold text-slate-700">考察范围 (Scope)</label>
               <div className="space-x-2">
                 <button onClick={selectAllCategories} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">全选</button>
                 <span className="text-slate-300">|</span>
                 <button onClick={deselectAllCategories} className="text-xs text-slate-500 hover:text-slate-700">清空</button>
               </div>
             </div>
             
             <div className="space-y-6">
               {Object.entries(CATEGORY_GROUPS).map(([groupName, cats]) => {
                 const isGroupFull = cats.every(c => config.selectedCategories.includes(c));
                 return (
                   <div key={groupName}>
                     <button 
                       onClick={() => toggleGroup(cats)}
                       className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase transition-colors ${isGroupFull ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        {groupName}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${isGroupFull ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                          {isGroupFull ? '已全选' : '点击全选'}
                        </span>
                     </button>
                     <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                       {cats.map((cat) => (
                         <button
                           key={cat}
                           onClick={() => toggleCategory(cat)}
                           className={`py-1.5 px-1 rounded text-sm font-medium border transition-all ${
                             config.selectedCategories.includes(cat)
                               ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                               : 'bg-white border-slate-200 text-slate-400'
                           }`}
                         >
                           {ROW_LABELS[cat] || cat}
                         </button>
                       ))}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => startGame('regular')}
              disabled={!isReady}
              className={`flex-1 py-4 rounded-xl text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                !isReady
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 hover:-translate-y-1'
              }`}
            >
              <span>▶️</span> 常规挑战
            </button>
            
            <button
              onClick={() => startGame('mixed')}
              disabled={config.selectedCategories.length === 0}
              className={`flex-1 py-4 rounded-xl text-lg font-bold shadow-lg transition-all flex flex-col items-center justify-center gap-0 ${
                config.selectedCategories.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white hover:shadow-fuchsia-200 hover:-translate-y-1'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🔀</span> 混合挑战
              </div>
              <span className="text-[10px] font-normal opacity-90">题目/选项随机互换</span>
            </button>
          </div>

          <button
            onClick={() => startGame('heartbeat')}
            disabled={config.selectedCategories.length === 0}
            className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all flex flex-col items-center justify-center gap-0 border-2 ${
              config.selectedCategories.length === 0
                ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'
                : 'bg-pink-50 border-pink-400 text-pink-600 hover:bg-pink-100 hover:shadow-pink-200 hover:-translate-y-1'
            }`}
          >
             <div className="flex items-center gap-2">
                <span>💓</span> 心动挑战 (限时)
              </div>
              <span className="text-[10px] font-normal opacity-80">5秒限时 | 10层衣服挑战 | 像素风少女</span>
          </button>
        </div>
        
        <div className="mt-2 text-center h-5">
           {isSameType && (
            <p className="text-red-400 text-xs">常规挑战：题目和答案类型不能相同（选择「随机」则无限制）</p>
           )}
           {config.selectedCategories.length === 0 && (
             <p className="text-red-400 text-xs">请至少选择一行</p>
           )}
        </div>
      </div>
    );
  }

  // --- RENDER: RESULT (Heartbeat only) ---
  if (status === 'result') {
    const isPerfect = clothingLevel === 0;
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl mt-8 text-center animate-fade-in border-4 border-pink-100">
        <div className="text-8xl mb-4">{isPerfect ? '😍' : (clothingLevel <= 5 ? '😊' : '😓')}</div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{isPerfect ? '攻略成功！' : '挑战结束'}</h2>
        
        <div className="bg-pink-50 rounded-xl p-4 mb-6">
           <p className="text-pink-800 font-bold mb-1">最终剩余衣物</p>
           <p className="text-4xl font-bold text-pink-600">{clothingLevel} <span className="text-lg text-pink-400">层</span></p>
        </div>
        
        <div className="mb-6 h-64 w-48 mx-auto border-2 border-pink-100 rounded-lg overflow-hidden bg-white">
           <PixelAnimeGirl level={clothingLevel} mood={isPerfect ? 'happy' : 'shocked'} />
        </div>

        <button 
          onClick={stopGame}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
        >
          返回菜单
        </button>
      </div>
    )
  }

  // --- RENDER: GAME ---
  if (!currentQuestion) return <div>Loading...</div>;

  const questionText = getDisplayText(currentQuestion, currentRoundTypes.q);
  const isQuestionRomaji = currentRoundTypes.q === 'romaji';
  const isAnswerRomaji = currentRoundTypes.a === 'romaji';
  const isHeartbeat = config.gameMode === 'heartbeat';

  return (
    <div className={`mx-auto p-4 animate-fade-in ${isHeartbeat ? 'max-w-6xl' : 'max-w-2xl'}`}>
      {/* Game Header */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <button 
          onClick={stopGame}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-bold text-sm px-4 py-2 rounded-lg transition-all flex items-center gap-1"
        >
          <span>🔚</span> 退出
        </button>
        
        <div className="flex flex-col items-center">
           <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">得分</span>
           <span className="text-2xl font-bold text-indigo-600">{score}</span>
        </div>
        
        <div className="flex flex-col items-end">
           <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">连胜</span>
           <span className="text-2xl font-bold text-orange-500">🔥 {streak}</span>
        </div>
      </div>
      
      {/* HEARTBEAT SPLIT LAYOUT (Adjusted: Girl 1 col, Quiz 3 cols) */}
      <div className={`grid gap-8 ${isHeartbeat ? 'lg:grid-cols-4' : 'grid-cols-1'}`}>
      
        {/* 1. Left Side: The Anime Girl (Visible only in Heartbeat mode) */}
        {isHeartbeat && (
          <div className="flex flex-col items-center justify-start lg:col-span-1 lg:h-[600px] sticky top-4">
            <div className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200 w-full h-full flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
               <div className="absolute top-4 right-4 bg-white/80 px-3 py-1 rounded-full text-xs font-bold text-pink-600 border border-pink-200 backdrop-blur-sm z-10">
                 {clothingLevel} / 10 层
               </div>
               
               {/* THE AVATAR */}
               <div className="w-full h-full max-h-[550px] flex items-center justify-center">
                 <PixelAnimeGirl 
                   level={clothingLevel} 
                   mood={roundState === 'failure' ? 'angry' : (roundState === 'success' ? 'happy' : 'shocked')} 
                 />
               </div>
            </div>
            
            <div className="mt-4 text-center">
               <p className="text-sm font-bold text-slate-600">AI-Chan</p>
               <p className="text-xs text-slate-400">
                 {clothingLevel <= 3 ? "已经...很害羞了..." : (clothingLevel <= 7 ? "不要一直盯着看啦..." : "准备好了吗？")}
               </p>
            </div>
          </div>
        )}

        {/* 2. Right Side (or Top on Mobile): Quiz Interface */}
        <div className={`${isHeartbeat ? 'lg:col-span-3' : ''}`}>
           {/* Timer for Heartbeat */}
           {isHeartbeat && (
             <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                   <span>Question {questionCount}/{HEARTBEAT_TOTAL_QUESTIONS}</span>
                   <span>{timeLeft.toFixed(1)}s</span>
                </div>
                <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-100 ease-linear ${
                      timeLeft < 2 ? 'bg-red-500' : 'bg-pink-500'
                    }`}
                    style={{ width: `${(timeLeft / 5) * 100}%` }}
                  ></div>
                </div>
             </div>
           )}

            {/* Question Card */}
            <div className="text-center mb-8 py-4 relative">
              <div className="h-32 flex items-center justify-center mb-2">
                 <h1 className={`font-bold text-slate-800 transition-all transform hover:scale-105 ${isQuestionRomaji ? 'text-7xl font-mono' : 'text-8xl kana-font'}`}>
                   {questionText}
                 </h1>
              </div>
              <p className="text-slate-400 font-medium">
                {(config.gameMode === 'mixed' || config.gameMode === 'heartbeat') && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded mr-2">混合/随机</span>}
                选择对应的 <span className="text-indigo-500 font-bold">{CHAR_TYPE_LABELS[currentRoundTypes.a].replace(' (Random)', '')}</span>
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {options.map((opt, idx) => {
                const isCorrect = opt.romaji === currentQuestion.romaji;
                let btnClass = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm";
                
                if (roundState !== 'waiting') {
                  if (isCorrect) {
                    btnClass = "bg-green-500 border-green-600 text-white shadow-green-200 shadow-lg ring-2 ring-green-300 scale-[1.02]";
                  } else {
                     btnClass = "bg-slate-100 text-slate-300 opacity-50";
                  }
                }

                const optionText = getDisplayText(opt, currentRoundTypes.a);

                return (
                  <button
                    key={idx}
                    disabled={roundState !== 'waiting'}
                    onClick={() => handleAnswer(opt)}
                    className={`h-24 rounded-2xl border-b-4 transition-all active:border-b-0 active:translate-y-1 relative overflow-hidden ${btnClass}`}
                  >
                    <span className={`text-3xl font-bold ${isAnswerRomaji ? 'font-mono' : 'kana-font'}`}>
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>

             {/* Failure / AI Help State */}
            {roundState === 'failure' && !isHeartbeat && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-6 animate-fade-in-up shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-red-100 rounded-full text-red-600">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </div>
                   <div>
                     <h3 className="text-red-800 font-bold text-lg">回答错误</h3>
                     <p className="text-red-600 text-sm">
                       正确答案: <span className="font-bold text-lg mx-1">{getDisplayText(currentQuestion, currentRoundTypes.a)}</span> 
                       ({currentQuestion.romaji})
                     </p>
                   </div>
                 </div>
                 
                 {(mnemonic || loadingMnemonic) && (
                   <div className="bg-white rounded-lg p-4 border border-red-100 shadow-inner mb-4">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🧠</span>
                        <span className="font-bold text-slate-700 text-sm">AI 记忆助手</span>
                     </div>
                     {loadingMnemonic ? (
                       <div className="flex space-x-2 animate-pulse py-2">
                          <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
                          <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
                          <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
                       </div>
                     ) : mnemonic ? (
                       <div className="animate-fade-in">
                          <p className="text-lg font-bold text-indigo-600 mb-1 leading-snug">"{mnemonic.mnemonic}"</p>
                          <p className="text-xs text-slate-500">{mnemonic.description}</p>
                       </div>
                     ) : null}
                   </div>
                 )}

                 <button 
                   onClick={() => generateQuestion()}
                   className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5"
                 >
                   继续挑战下一题 →
                 </button>
              </div>
            )}
        </div>
      
      </div>
    </div>
  );
};

export default QuizGame;
