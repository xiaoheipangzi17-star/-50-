import React, { useState } from 'react';
import { KANA_DATA } from '../constants';
import { Kana } from '../types';
import { getVocabulary } from '../services/geminiService';

const KanaGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana'>('hiragana');
  const [selectedKana, setSelectedKana] = useState<Kana | null>(null);
  const [vocab, setVocab] = useState<{word: string, reading: string, meaning: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const handleKanaClick = async (kana: Kana) => {
    setSelectedKana(kana);
    const char = activeTab === 'hiragana' ? kana.hiragana : kana.katakana;
    playAudio(char);
    
    // Reset previous vocab
    setVocab(null);
    setLoading(true);
    
    // Fetch simple vocab via Gemini
    const data = await getVocabulary(char);
    setVocab(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab('hiragana')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${
            activeTab === 'hiragana' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200'
          }`}
        >
          平假名 (Hiragana)
        </button>
        <button
          onClick={() => setActiveTab('katakana')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${
            activeTab === 'katakana' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200'
          }`}
        >
          片假名 (Katakana)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: The Grid */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="grid grid-cols-5 gap-3">
            {KANA_DATA.map((k) => (
              <button
                key={k.romaji}
                onClick={() => handleKanaClick(k)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:shadow-md ${
                  selectedKana?.romaji === k.romaji 
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                    : 'border-slate-100 hover:border-indigo-300 bg-slate-50'
                }`}
              >
                <span className="text-xl font-bold kana-font text-slate-700">
                  {activeTab === 'hiragana' ? k.hiragana : k.katakana}
                </span>
                <span className="text-xs text-slate-400 font-mono mt-1">{k.romaji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="flex flex-col space-y-4">
           {selectedKana ? (
             <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 sticky top-6">
               <div className="text-center mb-6">
                 <h2 className="text-8xl font-bold text-indigo-600 kana-font mb-2">
                   {activeTab === 'hiragana' ? selectedKana.hiragana : selectedKana.katakana}
                 </h2>
                 <p className="text-2xl text-slate-500 font-mono tracking-widest">{selectedKana.romaji}</p>
                 <button 
                  onClick={() => playAudio(activeTab === 'hiragana' ? selectedKana.hiragana : selectedKana.katakana)}
                  className="mt-4 text-indigo-500 hover:text-indigo-700 flex items-center justify-center mx-auto gap-2 text-sm font-medium"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 11H2a1 1 0 01-1-1V9a1 1 0 011-1h2.586l3.707-5.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                   </svg>
                   播放发音
                 </button>
               </div>

               <div className="border-t pt-4">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2">
                   <span className="text-xl">✨</span> AI 单词助手
                 </h3>
                 {loading ? (
                   <div className="mt-4 animate-pulse flex flex-col gap-2">
                     <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                     <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                   </div>
                 ) : vocab ? (
                   <div className="mt-4 bg-indigo-50 p-4 rounded-xl">
                     <div className="flex justify-between items-baseline mb-1">
                       <span className="text-2xl font-bold kana-font text-indigo-900">{vocab.word}</span>
                       <span className="text-sm text-indigo-600">{vocab.reading}</span>
                     </div>
                     <p className="text-slate-600">{vocab.meaning}</p>
                     <button 
                       onClick={() => playAudio(vocab.word)}
                       className="mt-2 text-xs text-indigo-400 hover:text-indigo-600"
                     >
                       读单词
                     </button>
                   </div>
                 ) : (
                   <p className="mt-2 text-slate-400 text-sm">点击左侧假名获取 AI 示例单词...</p>
                 )}
               </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300 p-12">
               <span className="text-4xl mb-4">👈</span>
               <p>点击左侧假名开始学习</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default KanaGrid;
