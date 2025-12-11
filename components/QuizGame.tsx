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

// --- SVG Anime Avatar Component (Ultra High Precision Version) ---
const PixelAnimeGirl: React.FC<{ level: number, mood: 'happy' | 'shocked' | 'angry' }> = ({ level, mood }) => {
  // Enhanced Color Palette
  const c = {
    skin: "#FFF0E0",
    skinShadow: "#FAD0B0",
    skinDark: "#E8B090",
    hair: "#3A2E44", // Deep Purple
    hairMid: "#584666",
    hairLight: "#8B7098",
    hairHighlight: "#D0B0E0",
    eyeWhite: "#FFFFFF",
    eyeBase: mood === 'shocked' ? "#334155" : "#3B82F6",
    eyeMid: "#2563EB",
    eyeDark: "#1E3A8A",
    blush: "#FF9090",
    lip: "#F472B6",
    shirt: "#FAFAFA",
    shirtShadow: "#E2E8F0",
    vest: "#FEF08A", // Pastel Yellow
    vestShadow: "#EAB308",
    vestDark: "#CA8A04",
    skirt: "#60A5FA",
    skirtShadow: "#2563EB",
    skirtDark: "#1E40AF",
    socks: "#1E293B",
    shoes: "#451a03",
    shoesLight: "#78350f",
    blazer: "#1e3a8a",
    blazerLight: "#2563eb",
    scarf: "#ef4444",
    scarfShadow: "#b91c1c",
    glasses: "#475569"
  };

  return (
    <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-2xl" shapeRendering="geometricPrecision">
      <defs>
        <filter id="pag_glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="pag_hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stopColor={c.hairMid} />
           <stop offset="100%" stopColor={c.hair} />
        </linearGradient>
        <linearGradient id="pag_legGrad" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0%" stopColor={c.skinShadow} />
           <stop offset="20%" stopColor={c.skin} />
           <stop offset="80%" stopColor={c.skin} />
           <stop offset="100%" stopColor={c.skinShadow} />
        </linearGradient>
      </defs>

      {/* --- BACK HAIR --- */}
      <g id="hair-back">
        <path d="M120 120 L80 400 Q200 420 320 400 L280 120" fill="url(#pag_hairGrad)" />
        <path d="M80 400 L90 440 L110 410" fill={c.hair} />
        <path d="M320 400 L310 440 L290 410" fill={c.hair} />
      </g>

      {/* --- BODY --- */}
      <g id="body">
        {/* Legs */}
        <path d="M165 350 L162 550 L188 550 L190 350" fill="url(#pag_legGrad)" />
        <path d="M210 350 L212 550 L238 550 L235 350" fill="url(#pag_legGrad)" />
        
        {/* Knees */}
        <ellipse cx="175" cy="460" rx="6" ry="4" fill={c.skinShadow} opacity="0.3" />
        <ellipse cx="225" cy="460" rx="6" ry="4" fill={c.skinShadow} opacity="0.3" />

        {/* Torso */}
        <path d="M150 180 Q140 250 145 360 L255 360 Q260 250 250 180 Z" fill={c.skin} />
        <path d="M145 360 L255 360 L245 380 L155 380 Z" fill="white" opacity="0.9" /> {/* Panties base */}
        
        {/* Neck */}
        <rect x="182" y="160" width="36" height="40" fill={c.skin} />
        <path d="M182 160 L182 200 L190 200 L190 170" fill={c.skinShadow} opacity="0.5" />
      </g>

      {/* --- HEAD & FACE --- */}
      <g id="head">
        <path d="M140 80 L140 160 Q140 210 200 210 Q260 210 260 160 L260 80 Z" fill={c.skin} />
        
        {/* Blush */}
        {(mood === 'shocked' || level <= 3) && (
           <>
            <ellipse cx="165" cy="165" rx="15" ry="8" fill={c.blush} opacity="0.6" filter="url(#pag_glow)" />
            <ellipse cx="235" cy="165" rx="15" ry="8" fill={c.blush} opacity="0.6" filter="url(#pag_glow)" />
            <line x1="160" y1="165" x2="170" y2="160" stroke={c.blush} strokeWidth="2" />
            <line x1="230" y1="160" x2="240" y2="165" stroke={c.blush} strokeWidth="2" />
           </>
        )}

        {/* Eyes - Ultra Detailed */}
        <g id="eyes" transform="translate(0, 5)">
           {/* Whites */}
           <path d="M155 135 Q175 125 190 135 Q190 150 172 150 Q155 150 155 135" fill="white" />
           <path d="M210 135 Q225 125 245 135 Q245 150 228 150 Q210 150 210 135" fill="white" />
           
           {/* Iris */}
           <circle cx="172" cy="138" r="11" fill={c.eyeBase} />
           <circle cx="228" cy="138" r="11" fill={c.eyeBase} />
           
           {/* Pupil */}
           <circle cx="172" cy="138" r="6" fill={c.eyeDark} />
           <circle cx="228" cy="138" r="6" fill={c.eyeDark} />
           
           {/* Highlights */}
           <circle cx="168" cy="134" r="3" fill="white" opacity="0.9" />
           <circle cx="175" cy="142" r="1.5" fill="white" opacity="0.7" />
           <circle cx="224" cy="134" r="3" fill="white" opacity="0.9" />
           <circle cx="231" cy="142" r="1.5" fill="white" opacity="0.7" />

           {/* Eyelashes */}
           <path d="M152 135 Q172 122 192 135" stroke={c.hair} strokeWidth="3" fill="none" />
           <path d="M152 135 L148 132" stroke={c.hair} strokeWidth="2" />
           <path d="M208 135 Q228 122 248 135" stroke={c.hair} strokeWidth="3" fill="none" />
           <path d="M248 135 L252 132" stroke={c.hair} strokeWidth="2" />
        </g>

        {/* Mouth */}
        <g transform="translate(0, 10)">
           {mood === 'happy' && <path d="M190 175 Q200 185 210 175" stroke={c.lip} strokeWidth="2" fill="none" strokeLinecap="round" />}
           {mood === 'shocked' && <circle cx="200" cy="180" r="6" fill={c.lip} />}
           {mood === 'angry' && <path d="M190 180 Q200 170 210 180" stroke={c.lip} strokeWidth="2" fill="none" strokeLinecap="round" />}
        </g>
      </g>
      
      {/* --- CLOTHING SYSTEM (Stacked Layers) --- */}

      {/* 1. Shirt */}
      <g style={{ opacity: level >= 1 ? 1 : 0, transition: 'opacity 0.5s' }}>
         <path d="M150 190 L140 240 L135 350 L265 350 L260 240 L250 190" fill={c.shirt} />
         {/* Shadow under breast */}
         <path d="M150 270 Q200 290 250 270 L250 280 Q200 300 150 280 Z" fill={c.shirtShadow} opacity="0.5" />
         {/* Collar */}
         <path d="M182 190 L200 220 L218 190 L230 200 L200 240 L170 200 Z" fill="white" stroke={c.shirtShadow} strokeWidth="1" />
         {/* Sleeves */}
         <path d="M140 195 L110 220 L120 300 L145 280" fill={c.shirt} />
         <path d="M260 195 L290 220 L280 300 L255 280" fill={c.shirt} />
      </g>

      {/* 2. Socks */}
      <g style={{ opacity: level >= 2 ? 1 : 0, transition: 'opacity 0.5s' }}>
         <path d="M164 450 L162 560 L188 560 L191 450" fill={c.socks} />
         <path d="M209 450 L212 560 L238 560 L236 450" fill={c.socks} />
         {/* Ribbing */}
         <path d="M164 450 L191 450" stroke="#334155" strokeWidth="4" />
         <path d="M209 450 L236 450" stroke="#334155" strokeWidth="4" />
      </g>

      {/* 3. Vest (Sweater) */}
      <g style={{ opacity: level >= 3 ? 1 : 0, transition: 'opacity 0.5s' }}>
         <path d="M148 200 L142 340 L258 340 L252 200 L220 195 L200 250 L180 195 Z" fill={c.vest} />
         <path d="M142 330 L258 330 L258 340 L142 340 Z" fill={c.vestDark} /> {/* Hem */}
         {/* Texture */}
         <path d="M160 210 L155 330" stroke={c.vestShadow} strokeWidth="1" strokeDasharray="2,2" />
         <path d="M240 210 L245 330" stroke={c.vestShadow} strokeWidth="1" strokeDasharray="2,2" />
         {/* School Badge */}
         <path d="M230 260 L245 260 L242 275 L233 275 Z" fill={c.vestDark} />
      </g>

      {/* 4. Skirt (Detailed Pleats) */}
      <g style={{ opacity: level >= 4 ? 1 : 0, transition: 'opacity 0.5s' }}>
         <path d="M145 335 L125 420 L275 420 L255 335 Z" fill={c.skirt} />
         {/* Shadows for pleats */}
         <path d="M165 335 L155 420 L175 420 L180 335" fill={c.skirtShadow} opacity="0.4" />
         <path d="M200 335 L195 420 L205 420 L210 335" fill={c.skirtShadow} opacity="0.4" />
         <path d="M235 335 L225 420 L245 420 L250 335" fill={c.skirtShadow} opacity="0.4" />
         {/* Stitching */}
         <path d="M130 415 L270 415" stroke={c.skirtDark} strokeWidth="1" fill="none" />
      </g>

      {/* 5. Shoes */}
      <g style={{ opacity: level >= 5 ? 1 : 0, transition: 'opacity 0.5s' }}>
         <path d="M158 555 L158 580 Q158 590 170 590 L182 590 Q194 590 194 580 L194 570 L185 555 Z" fill={c.shoes} />
         <rect x="165" y="560" width="20" height="5" fill={c.shoesLight} />
         <path d="M208 555 L208 580 Q208 590 220 590 L232 590 Q244 590 244 580 L244 570 L235 555 Z" fill={c.shoes} />
         <rect x="215" y="560" width="20" height="5" fill={c.shoesLight} />
      </g>

      {/* 6. Bag */}
      <g style={{ opacity: level >= 6 ? 1 : 0, transition: 'opacity 0.5s' }}>
         <rect x="260" y="380" width="80" height="50" rx="5" fill="#5D4037" transform="rotate(-10 260 380)" />
         <rect x="260" y="380" width="80" height="15" rx="2" fill="#8D6E63" transform="rotate(-10 260 380)" />
         <path d="M220 220 Q240 300 265 385" stroke="#5D4037" strokeWidth="4" fill="none" />
      </g>

      {/* 7. Blazer */}
      <g style={{ opacity: level >= 7 ? 1 : 0, transition: 'opacity 0.5s' }}>
         <path d="M135 200 L135 350 L190 350 L195 280 L205 280 L210 350 L265 350 L265 200 L240 190 L200 210 L160 190 Z" fill={c.blazer} />
         <path d="M135 200 L195 280" stroke="#172554" strokeWidth="1" />
         <path d="M265 200 L205 280" stroke="#172554" strokeWidth="1" />
         {/* Gold Buttons */}
         <circle cx="200" cy="300" r="3" fill="#FBBF24" />
         <circle cx="200" cy="320" r="3" fill="#FBBF24" />
         {/* Sleeves over shirt */}
         <path d="M135 200 L105 225 L115 305 L140 285" fill={c.blazer} />
         <path d="M265 200 L295 225 L285 305 L260 285" fill={c.blazer} />
      </g>

      {/* 8. Scarf */}
      <g style={{ opacity: level >= 8 ? 1 : 0, transition: 'opacity 0.5s' }}>
         <path d="M165 190 Q200 230 235 190 L235 210 Q200 250 165 210 Z" fill={c.scarf} />
         <rect x="210" y="210" width="20" height="60" fill={c.scarf} />
         <path d="M210 260 L230 260" stroke={c.scarfShadow} strokeWidth="1" />
      </g>

      {/* 9. Beret */}
      <g style={{ opacity: level >= 9 ? 1 : 0, transition: 'opacity 0.5s' }}>
         <path d="M140 85 Q200 50 260 85 Q280 100 260 110 Q200 125 140 110 Q120 100 140 85" fill="#EC4899" />
         <path d="M200 60 L205 70" stroke="#BE185D" strokeWidth="3" />
      </g>

      {/* 10. Glasses */}
      <g style={{ opacity: level >= 10 ? 1 : 0, transition: 'opacity 0.5s' }}>
         <circle cx="172" cy="138" r="14" stroke={c.glasses} strokeWidth="2" fill="blue" fillOpacity="0.05" />
         <circle cx="228" cy="138" r="14" stroke={c.glasses} strokeWidth="2" fill="blue" fillOpacity="0.05" />
         <line x1="186" y1="138" x2="214" y2="138" stroke={c.glasses} strokeWidth="2" />
         {/* Glare */}
         <path d="M165 130 L175 130" stroke="white" strokeWidth="1" opacity="0.5" />
      </g>

      {/* --- FRONT HAIR (Bangs & Flow) --- */}
      <g id="hair-front">
        <path d="M140 80 Q130 130 150 140 Q160 110 170 130 Q180 80 200 120 Q220 80 230 130 Q240 110 250 140 Q270 130 260 80" fill={c.hair} />
        {/* Hair Highlight Halo */}
        <path d="M150 90 Q200 80 250 90" stroke={c.hairHighlight} strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />
        {/* Side Strands */}
        <path d="M140 110 Q135 180 155 220" fill="none" stroke={c.hair} strokeWidth="8" strokeLinecap="round" />
        <path d="M260 110 Q265 180 245 220" fill="none" stroke={c.hair} strokeWidth="8" strokeLinecap="round" />
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

  // Audio Voices State
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // --- Effects ---

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

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
    
    // Voice Selection: Prioritize high-quality female voices
    const jaVoices = voices.filter(v => v.lang.includes('ja') || v.lang.includes('JP'));
    const bestVoice = jaVoices.find(v => v.name.includes('Google')) || 
                      jaVoices.find(v => v.name.includes('Kyoko')) ||
                      jaVoices.find(v => v.name.includes('Haruka')) ||
                      jaVoices.find(v => v.name.includes('Ayumi')) ||
                      jaVoices.find(v => !v.name.toLowerCase().includes('ichiro'));

    if (bestVoice) {
      u.voice = bestVoice;
    }

    u.pitch = 1.4; // Make it sound younger/anime-like (Slightly higher than learning mode)
    u.rate = 1.1; // Slightly faster for energy
    
    window.speechSynthesis.cancel();
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
      
      {/* HEARTBEAT SPLIT LAYOUT (Adjusted: Girl 1 col [16%], Quiz 5 cols [84%]) */}
      <div className={`grid gap-8 ${isHeartbeat ? 'lg:grid-cols-6' : 'grid-cols-1'}`}>
      
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
        <div className={`${isHeartbeat ? 'lg:col-span-5' : ''}`}>
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