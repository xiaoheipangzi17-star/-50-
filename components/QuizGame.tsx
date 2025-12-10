
import React, { useState, useEffect } from 'react';
import { KANA_DATA } from '../constants';
import { Kana, MnemonicResponse } from '../types';
import { getMnemonic } from '../services/geminiService';

type CharType = 'hiragana' | 'katakana' | 'romaji' | 'random';
type ConcreteCharType = 'hiragana' | 'katakana' | 'romaji';

interface QuizConfig {
  questionType: CharType;
  answerType: CharType;
  selectedCategories: string[];
  isMixedMode: boolean;
}

const CHAR_TYPE_LABELS: Record<CharType, string> = {
  hiragana: '平假名 (あ)',
  katakana: '片假名 (ア)',
  romaji: '罗马音 (a)',
  random: '🎲 随机 (Random)'
};

const CATEGORIES = Array.from(new Set(KANA_DATA.map(k => k.category)));

// Define Category Groups for cleaner UI
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

const QuizGame: React.FC = () => {
  // Game Status State
  const [status, setStatus] = useState<'menu' | 'playing'>('menu');
  const [config, setConfig] = useState<QuizConfig>({
    questionType: 'hiragana',
    answerType: 'romaji',
    selectedCategories: [...CATEGORY_GROUPS['清音 (基础)']], // Default Seion only
    isMixedMode: false,
  });

  // Gameplay State
  const [currentQuestion, setCurrentQuestion] = useState<Kana | null>(null);
  
  // Track concrete types for the current specific question
  const [currentRoundTypes, setCurrentRoundTypes] = useState<{q: ConcreteCharType, a: ConcreteCharType}>({q: 'hiragana', a: 'romaji'});

  const [options, setOptions] = useState<Kana[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundState, setRoundState] = useState<'waiting' | 'success' | 'failure'>('waiting');
  
  // AI Helper State
  const [mnemonic, setMnemonic] = useState<MnemonicResponse | null>(null);
  const [loadingMnemonic, setLoadingMnemonic] = useState(false);

  // Helper to get display text based on type
  const getDisplayText = (kana: Kana, type: ConcreteCharType) => {
    switch (type) {
      case 'hiragana': return kana.hiragana;
      case 'katakana': return kana.katakana;
      case 'romaji': return kana.romaji;
    }
  };

  const toggleCategory = (cat: string) => {
    setConfig(prev => {
      const isSelected = prev.selectedCategories.includes(cat);
      if (isSelected) {
        return { ...prev, selectedCategories: prev.selectedCategories.filter(c => c !== cat) };
      } else {
        return { ...prev, selectedCategories: [...prev.selectedCategories, cat] };
      }
    });
  };

  const toggleGroup = (groupCats: string[]) => {
    setConfig(prev => {
      // Check if all categories in this group are currently selected
      const isAllSelected = groupCats.every(cat => prev.selectedCategories.includes(cat));
      
      let newSelected;
      if (isAllSelected) {
        // Deselect all in group
        newSelected = prev.selectedCategories.filter(c => !groupCats.includes(c));
      } else {
        // Select all in group (merge and deduplicate)
        const currentSet = new Set(prev.selectedCategories);
        groupCats.forEach(c => currentSet.add(c));
        newSelected = Array.from(currentSet);
      }
      
      return { ...prev, selectedCategories: newSelected };
    });
  };

  const selectAllCategories = () => {
    setConfig(prev => ({ ...prev, selectedCategories: [...CATEGORIES] }));
  };
  
  const deselectAllCategories = () => {
    setConfig(prev => ({ ...prev, selectedCategories: [] }));
  };

  const startGame = (isMixed: boolean) => {
    // Validation: If both are specific (not random) and same, prevent start
    if (!isMixed && config.questionType !== 'random' && config.answerType !== 'random' && config.questionType === config.answerType) {
      alert("题目类型和答案类型不能相同！");
      return;
    }
    if (config.selectedCategories.length === 0) {
      alert("请至少选择一行进行练习！");
      return;
    }
    
    const newConfig = { ...config, isMixedMode: isMixed };
    setConfig(newConfig);
    
    setScore(0);
    setStreak(0);
    setStatus('playing');
    generateQuestion(newConfig);
  };

  const stopGame = () => {
    setStatus('menu');
    setRoundState('waiting');
    setMnemonic(null);
  };

  // Helper to resolve 'random' to a concrete type
  const resolveType = (type: CharType, exclude?: ConcreteCharType): ConcreteCharType => {
    if (type !== 'random') return type as ConcreteCharType;
    
    const allTypes: ConcreteCharType[] = ['hiragana', 'katakana', 'romaji'];
    // If we need to exclude a type (to prevent Q==A), filter it out
    const available = exclude ? allTypes.filter(t => t !== exclude) : allTypes;
    return available[Math.floor(Math.random() * available.length)];
  };

  const generateQuestion = (activeConfig: QuizConfig = config) => {
    // 1. Resolve 'Random' selections to concrete types for this round
    let qConcrete = resolveType(activeConfig.questionType);
    // Try to resolve Answer type avoiding the Question type if possible
    let aConcrete = resolveType(activeConfig.answerType, qConcrete);

    // If strictly selected (non-random) types were same (e.g. user chose H and H),
    // logic above doesn't fix it. But we validate at start.
    // However, if "Random" resulted in same type, we re-roll answer.
    if (qConcrete === aConcrete) {
       const others = (['hiragana', 'katakana', 'romaji'] as ConcreteCharType[]).filter(t => t !== qConcrete);
       aConcrete = others[Math.floor(Math.random() * others.length)];
    }

    // 2. Handle Mixed Mode (The Swap)
    // In Mixed Mode, we swap the resolved types 50% of the time.
    // This ensures we only use the user's selected pools (unless Random was picked).
    if (activeConfig.isMixedMode) {
      if (Math.random() > 0.5) {
        [qConcrete, aConcrete] = [aConcrete, qConcrete];
      }
    }
    
    setCurrentRoundTypes({ q: qConcrete, a: aConcrete });

    // 3. Filter available Kana based on selected categories
    const pool = KANA_DATA.filter(k => activeConfig.selectedCategories.includes(k.category));
    
    if (pool.length === 0) return; 

    const randomIndex = Math.floor(Math.random() * pool.length);
    const correct = pool[randomIndex];
    
    // 4. Generate distractors
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

  const handleAnswer = async (selected: Kana) => {
    if (!currentQuestion || roundState !== 'waiting') return;

    if (selected.romaji === currentQuestion.romaji) {
      setScore(s => s + 10);
      setStreak(s => s + 1);
      setRoundState('success');
      playEffect('success');
      setTimeout(() => generateQuestion(), 1000); 
    } else {
      setStreak(0);
      setRoundState('failure');
      playEffect('failure');
      
      let targetForMnemonic: Kana | null = null;
      let targetType: 'Hiragana' | 'Katakana' | null = null;

      const qType = currentRoundTypes.q;
      const aType = currentRoundTypes.a;

      // Determine logic for Mnemonic
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
  };

  const playEffect = (type: 'success' | 'failure') => {
    if (type === 'success') {
      const audio = new AudioContext();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.frequency.value = 800;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, audio.currentTime + 0.1);
      osc.stop(audio.currentTime + 0.1);
    }
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

          {/* Row Selection - Organized by Group */}
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

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => startGame(false)}
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
            onClick={() => startGame(true)}
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

  // --- RENDER: GAME ---
  if (!currentQuestion) return <div>Loading...</div>;

  const questionText = getDisplayText(currentQuestion, currentRoundTypes.q);
  const isQuestionRomaji = currentRoundTypes.q === 'romaji';
  const isAnswerRomaji = currentRoundTypes.a === 'romaji';

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <button 
          onClick={stopGame}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-bold text-sm px-4 py-2 rounded-lg transition-all flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          退出挑战
        </button>
        
        <div className="flex flex-col items-center">
           <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">当前得分</span>
           <span className="text-2xl font-bold text-indigo-600">{score}</span>
        </div>
        
        <div className="flex flex-col items-end">
           <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">连胜</span>
           <span className="text-2xl font-bold text-orange-500">🔥 {streak}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="text-center mb-8 py-8 relative">
        <div className="h-40 flex items-center justify-center mb-2">
           <h1 className={`font-bold text-slate-800 transition-all transform hover:scale-105 ${isQuestionRomaji ? 'text-7xl font-mono' : 'text-9xl kana-font'}`}>
             {questionText}
           </h1>
        </div>
        <p className="text-slate-400 font-medium">
          {config.isMixedMode && <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded mr-2">随机混合</span>}
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
      {roundState === 'failure' && (
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
  );
};

export default QuizGame;
