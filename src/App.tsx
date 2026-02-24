import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Trophy, RotateCcw, Info, CheckCircle2, XCircle, Zap, Github } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
interface Color {
  h: number;
  s: number;
  l: number;
}

interface GameState {
  score: number;
  level: number;
  timeLeft: number;
  isActive: boolean;
  isGameOver: boolean;
  bestScore: number;
}

// --- Constants ---
const GRID_SIZE = 5;
const TOTAL_BLOCKS = GRID_SIZE * GRID_SIZE;
const INITIAL_TIME = 30;

// --- Utils ---
const getRandomColor = (): Color => ({
  h: Math.floor(Math.random() * 360),
  s: 40 + Math.floor(Math.random() * 40), // 40-80% saturation
  l: 40 + Math.floor(Math.random() * 30), // 40-70% lightness
});

const colorToCss = (c: Color) => `hsl(${c.h}, ${c.s}%, ${c.l}%)`;

const getOffsetColor = (base: Color, level: number): Color => {
  // Difficulty scaling: delta decreases as level increases
  // Level 1: delta = 15
  // Level 50: delta = 1
  const delta = Math.max(1, 15 - Math.floor(level / 4));
  
  // Randomly adjust hue, saturation or lightness
  const type = Math.floor(Math.random() * 3);
  const direction = Math.random() > 0.5 ? 1 : -1;
  
  const offset = { ...base };
  if (type === 0) offset.h = (offset.h + delta * direction + 360) % 360;
  else if (type === 1) offset.s = Math.min(100, Math.max(0, offset.s + delta * direction));
  else offset.l = Math.min(100, Math.max(0, offset.l + delta * direction));
  
  return offset;
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    timeLeft: INITIAL_TIME,
    isActive: false,
    isGameOver: false,
    bestScore: parseInt(localStorage.getItem('chroma-best') || '0'),
  });

  const [colors, setColors] = useState<Color[]>([]);
  const [targetIndex, setTargetIndex] = useState<number>(-1);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateLevel = useCallback((level: number) => {
    const base = getRandomColor();
    const target = getOffsetColor(base, level);
    const newColors = Array(TOTAL_BLOCKS).fill(base);
    const randomIndex = Math.floor(Math.random() * TOTAL_BLOCKS);
    newColors[randomIndex] = target;
    
    setColors(newColors);
    setTargetIndex(randomIndex);
  }, []);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      level: 1,
      timeLeft: INITIAL_TIME,
      isActive: true,
      isGameOver: false,
    }));
    setElapsedTime(0);
    setStartTime(Date.now());
    generateLevel(1);
  };

  const endGame = useCallback(() => {
    setGameState(prev => {
      const isNewBest = prev.score > prev.bestScore;
      if (isNewBest) {
        localStorage.setItem('chroma-best', prev.score.toString());
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      return {
        ...prev,
        isActive: false,
        isGameOver: true,
        bestScore: isNewBest ? prev.score : prev.bestScore,
      };
    });
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (gameState.isActive && gameState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            endGame();
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
        if (startTime) {
          setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isActive, startTime, endGame]);

  const handleBlockClick = (index: number) => {
    if (!gameState.isActive) return;

    if (index === targetIndex) {
      // Correct!
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        level: prev.level + 1,
        timeLeft: Math.min(INITIAL_TIME, prev.timeLeft + 2), // Add bonus time
      }));
      generateLevel(gameState.level + 1);
    } else {
      // Wrong! Penalty
      setGameState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 3),
      }));
      // Visual shake or feedback could be added here
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header Section */}
      <header className="w-full max-w-md mb-8 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
              Chroma<br /><span className="text-zinc-400">Vision</span>
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest mt-2 opacity-50">
              Color Sensitivity Challenge v1.0
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-1">Best Score</div>
            <div className="text-2xl font-mono font-bold leading-none">{gameState.bestScore}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-black/5 flex flex-col items-center">
            <Trophy className="w-4 h-4 mb-1 text-amber-500" />
            <span className="text-[10px] font-mono uppercase opacity-50">Score</span>
            <span className="text-xl font-bold font-mono">{gameState.score}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-black/5 flex flex-col items-center">
            <Timer className={`w-4 h-4 mb-1 ${gameState.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`} />
            <span className="text-[10px] font-mono uppercase opacity-50">Time</span>
            <span className="text-xl font-bold font-mono">{gameState.timeLeft}s</span>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-black/5 flex flex-col items-center">
            <Zap className="w-4 h-4 mb-1 text-blue-500" />
            <span className="text-[10px] font-mono uppercase opacity-50">Level</span>
            <span className="text-xl font-bold font-mono">{gameState.level}</span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="relative w-full max-w-md aspect-square">
        <AnimatePresence mode="wait">
          {!gameState.isActive && !gameState.isGameOver ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-black/5 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">准备好挑战了吗？</h2>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                在 25 个色块中找出那个颜色略有不同的。随着关卡提升，差异会越来越小。
              </p>
              <button
                onClick={startGame}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-colors shadow-lg active:scale-95"
              >
                开始挑战
              </button>
            </motion.div>
          ) : gameState.isGameOver ? (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-black/5 flex flex-col items-center justify-center p-8 text-center"
            >
              <h2 className="text-3xl font-black uppercase mb-2">挑战结束</h2>
              <p className="text-zinc-500 text-sm mb-8">你的色彩敏感度超越了 {Math.min(99, gameState.score * 2)}% 的人</p>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-zinc-50 p-4 rounded-2xl">
                  <div className="text-[10px] font-mono uppercase opacity-50 mb-1">最终得分</div>
                  <div className="text-3xl font-bold font-mono">{gameState.score}</div>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl">
                  <div className="text-[10px] font-mono uppercase opacity-50 mb-1">总用时</div>
                  <div className="text-3xl font-bold font-mono">{elapsedTime}s</div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-lg active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                重新开始
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="color-grid w-full h-full"
            >
              {colors.map((color, i) => (
                <motion.button
                  key={`${gameState.level}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  onClick={() => handleBlockClick(i)}
                  className="w-full h-full rounded-xl shadow-sm border border-black/5 active:scale-90 transition-transform"
                  style={{ backgroundColor: colorToCss(color) }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Info Section */}
      <footer className="w-full max-w-md mt-12">
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-black/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-zinc-100 rounded-lg">
              <Info className="w-3 h-3 text-zinc-500" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">色彩差异说明</h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-green-50 rounded-lg shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold mb-1">正确选择</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  点击差异色块可获得 1 分，并奖励 2 秒剩余时间。
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-red-50 rounded-lg shrink-0">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-bold mb-1">错误惩罚</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  点击错误色块将扣除 3 秒剩余时间。
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-black/5 flex justify-between items-center">
              <p className="text-[10px] font-mono text-zinc-400 leading-relaxed max-w-[200px]">
                算法基于 HSL 色彩空间。随着关卡提升，偏移量将逐渐降低，考验视网膜敏感度。
              </p>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <Github className="w-3 h-3" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
