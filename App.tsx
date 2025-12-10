import React, { useState } from 'react';
import KanaGrid from './components/KanaGrid';
import QuizGame from './components/QuizGame';

const App: React.FC = () => {
  const [view, setView] = useState<'study' | 'quiz'>('study');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇯🇵</span>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">AI 五十音 Dojo</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setView('study')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'study' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              学习图表
            </button>
            <button
              onClick={() => setView('quiz')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'quiz' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              记忆挑战
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow py-8 px-4">
        {view === 'study' ? (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">五十音图表</h2>
              <p className="text-slate-500">点击任意假名查看发音并获取 AI 生成的单词卡片。</p>
            </div>
            <KanaGrid />
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">快速测试</h2>
              <p className="text-slate-500">回答错误时，AI 老师会教你独特的记忆口诀。</p>
            </div>
            <QuizGame />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>Powered by Google Gemini 2.5 Flash</p>
          <p className="mt-1">Designed for Japanese Learners</p>
        </div>
      </footer>
      
      {/* Global Utility Styles for simple animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
