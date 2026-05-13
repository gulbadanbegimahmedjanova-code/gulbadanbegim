import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, User, Calculator, Hash, Star } from 'lucide-react';

// --- Components ---
const BoyCharacter = ({ color, isP1 }: { color: string; isP1: boolean }) => (
  <div className="relative flex flex-col items-center">
    {/* Doppi - Uzbek National Cap */}
    <div className="absolute -top-6 z-20">
      <svg width="60" height="30" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 25C5 15 15 5 30 5C45 5 55 15 55 25V30H5V25Z" fill="#1A1A1A" />
        <path d="M10 25C10 20 15 15 30 15C45 15 50 20 50 25" stroke="white" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
        <circle cx="30" cy="12" r="2" fill="white" opacity="0.3" />
      </svg>
    </div>
    {/* Boy Avatar */}
    <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${isP1 ? 'from-blue-500 to-blue-700' : 'from-red-500 to-red-700'} shadow-xl border-4 border-white flex items-center justify-center relative overflow-hidden`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Face */}
        <circle cx="50" cy="45" r="25" fill="#FFDBAC" />
        {/* Shirt */}
        <path d="M20 100 Q20 75 50 75 Q80 75 80 100" fill="white" fillOpacity="0.2" />
        {/* Eyes */}
        <circle cx="42" cy="42" r="2.5" fill="#333" />
        <circle cx="58" cy="42" r="2.5" fill="#333" />
        {/* Smile */}
        <path d="M45 52 Q50 56 55 52" stroke="#333" strokeWidth="1.5" fill="none" />
      </svg>
      {/* Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] pointer-events-none" />
    </div>
  </div>
);

// --- Types ---
type Problem = {
  question: string;
  answer: number;
  options: number[];
};

type Player = 1 | 2;

// --- Helpers ---
const generateProblem = (level: number = 1): Problem => {
  const max = level * 10;
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * max) + 1;
  const operators = ['+', '-'];
  if (level > 2) operators.push('*');
  const op = operators[Math.floor(Math.random() * operators.length)];

  let question = '';
  let answer = 0;

  switch (op) {
    case '+':
      question = `${a} + ${b}`;
      answer = a + b;
      break;
    case '-':
      question = `${Math.max(a, b)} - ${Math.min(a, b)}`;
      answer = Math.max(a, b) - Math.min(a, b);
      break;
    case '*':
      const smallA = Math.floor(Math.random() * 10) + 1;
      const smallB = Math.floor(Math.random() * 5) + 1;
      question = `${smallA} × ${smallB}`;
      answer = smallA * smallB;
      break;
  }

  const options = new Set<number>();
  options.add(answer);
  while (options.size < 3) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const fake = answer + offset;
    if (fake >= 0 && fake !== answer) options.add(fake);
  }

  return {
    question,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

export default function App() {
  const [ropePosition, setRopePosition] = useState(0); 
  const [p1Problem, setP1Problem] = useState<Problem>(() => generateProblem());
  const [p2Problem, setP2Problem] = useState<Problem>(() => generateProblem());
  const [winner, setWinner] = useState<Player | null>(null);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [level, setLevel] = useState(1);

  const WIN_THRESHOLD = 100;
  const PULL_STRENGTH = 20;

  const checkAnswer = useCallback((player: Player, choice: number) => {
    if (winner) return;

    if (player === 1) {
      if (choice === p1Problem.answer) {
        setRopePosition((prev) => Math.max(prev - PULL_STRENGTH, -WIN_THRESHOLD));
        setP1Problem(generateProblem(level));
      } else {
        setRopePosition((prev) => Math.min(prev + PULL_STRENGTH / 2, WIN_THRESHOLD));
      }
    } else {
      if (choice === p2Problem.answer) {
        setRopePosition((prev) => Math.min(prev + PULL_STRENGTH, WIN_THRESHOLD));
        setP2Problem(generateProblem(level));
      } else {
        setRopePosition((prev) => Math.max(prev - PULL_STRENGTH / 2, -WIN_THRESHOLD));
      }
    }
  }, [p1Problem, p2Problem, winner, level]);

  useEffect(() => {
    if (ropePosition <= -WIN_THRESHOLD) {
      setWinner(1);
      setScores(s => ({ ...s, 1: s[1] + 1 }));
    } else if (ropePosition >= WIN_THRESHOLD) {
      setWinner(2);
      setScores(s => ({ ...s, 2: s[2] + 1 }));
    }
  }, [ropePosition]);

  const resetGame = () => {
    setRopePosition(0);
    setWinner(null);
    setP1Problem(generateProblem(level));
    setP2Problem(generateProblem(level));
  };

  const increaseLevel = () => {
    setLevel(l => Math.min(l + 1, 5));
    resetGame();
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 overflow-hidden flex flex-col">
      <header className="p-4 bg-white shadow-sm flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Calculator className="text-emerald-600" />
          <h1 className="font-bold text-xl tracking-tight text-emerald-900 hidden sm:block">Milliy Matematik O'yin</h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full text-emerald-700 text-sm font-semibold border border-emerald-100">
            <Hash size={16} />
            Bosqich {level}
          </div>
          <div className="flex gap-3 text-sm font-bold">
            <span className="text-blue-600">Bola 1: {scores[1]}</span>
            <span className="text-slate-300">|</span>
            <span className="text-red-600">Bola 2: {scores[2]}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col">
        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#e2e8f0_100%)] flex items-center justify-center">
          
          {/* Traditional Pattern Decorations */}
          <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="absolute w-64 h-64 border-[16px] border-emerald-500 rounded-full" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
             ))}
          </div>

          <div className="absolute w-full h-3 bg-[#5D4037] shadow-xl flex items-center justify-center overflow-visible z-10">
            <motion.div 
              animate={{ x: `${ropePosition * 2}px` }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="w-10 h-10 rounded-full border-4 border-white shadow-2xl bg-amber-400 z-20 flex items-center justify-center"
            >
               <div className="w-1 h-16 bg-red-600/80 absolute top-[-25px] shadow-sm" />
            </motion.div>
          </div>

          <div className="w-full max-w-5xl px-12 flex justify-between items-end relative h-80 z-0">
            {/* Player 1 (National Dress) */}
            <motion.div 
              animate={{ x: `${ropePosition * 0.4}px`, scale: ropePosition < 0 ? 1.05 : 1 }}
              className="flex flex-col items-center gap-6"
            >
              <BoyCharacter color="blue" isP1={true} />
              <div className="font-mono text-center bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-blue-100 min-w-[120px]">
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1 italic">Savol</div>
                <div className="text-3xl font-black text-blue-700">{p1Problem.question}</div>
              </div>
            </motion.div>

            {/* Player 2 (National Dress) */}
            <motion.div 
              animate={{ x: `${ropePosition * 0.4}px`, scale: ropePosition > 0 ? 1.05 : 1 }}
              className="flex flex-col items-center gap-6"
            >
              <BoyCharacter color="red" isP1={false} />
              <div className="font-mono text-center bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-red-100 min-w-[120px]">
                <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1 italic">Savol</div>
                <div className="text-3xl font-black text-red-700">{p2Problem.question}</div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="bg-white p-8 grid grid-cols-1 md:grid-cols-2 gap-12 border-t-4 border-emerald-500">
          <div className="flex flex-col gap-5">
            <h3 className="text-blue-800 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-10 h-1 bg-blue-200 rounded-full" />
              1-Bola Javoblari
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {p1Problem.options.map((opt, i) => (
                <button
                  key={i}
                  id={`p1-opt-${i}`}
                  onClick={() => checkAnswer(1, opt)}
                  className="group relative overflow-hidden py-5 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all duration-300 rounded-2xl font-mono text-2xl font-black text-blue-900 border-b-4 border-blue-200 active:translate-y-1 active:border-b-0"
                >
                  <span className="relative z-10">{opt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h3 className="text-red-800 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 justify-end">
              2-Bola Javoblari
              <span className="w-10 h-1 bg-red-200 rounded-full" />
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {p2Problem.options.map((opt, i) => (
                <button
                  key={i}
                  id={`p2-opt-${i}`}
                  onClick={() => checkAnswer(2, opt)}
                  className="group relative overflow-hidden py-5 bg-red-50 hover:bg-red-600 hover:text-white transition-all duration-300 rounded-2xl font-mono text-2xl font-black text-red-900 border-b-4 border-red-200 active:translate-y-1 active:border-b-0"
                >
                  <span className="relative z-10">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/90 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.9, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center flex flex-col items-center gap-8 border-t-8 border-emerald-500"
            >
              <div className="relative">
                <div className={`w-24 h-24 rounded-3xl ${winner === 1 ? 'bg-blue-600' : 'bg-red-600'} flex items-center justify-center text-white shadow-2xl relative z-10`}>
                  <Trophy size={48} className="animate-bounce" />
                </div>
                <Star className="absolute -top-4 -left-4 text-emerald-400 fill-emerald-400 w-10 h-10 animate-pulse" />
                <Star className="absolute -bottom-4 -right-4 text-amber-400 fill-amber-400 w-8 h-8 animate-pulse delay-75" />
              </div>
              
              <div>
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-tight">
                  {winner}-BO'LA G'O'LIB! 
                </h2>
                <p className="text-slate-500 mt-3 font-medium">Ofarin! Matematika bilimingiz sizga g'alaba olib keldi.</p>
              </div>

              <div className="flex flex-col w-full gap-4">
                <button
                  onClick={resetGame}
                  className="w-full py-5 bg-emerald-600 text-white rounded-[20px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200"
                >
                  <RefreshCw size={24} />
                  Qaytadan
                </button>
                <button
                  onClick={increaseLevel}
                  className="w-full py-4 bg-amber-500 text-white rounded-[20px] font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-md"
                >
                  Qiyinroq bosqich (Lvl {Math.min(level + 1, 5)})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="p-4 text-center text-[11px] text-emerald-800/40 font-bold uppercase tracking-[0.3em] bg-white border-t border-emerald-50">
        Milliy Matematik O'yin • O'zbekistonda tayyorlandi • 2026
      </footer>
    </div>
  );
}

