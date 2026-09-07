import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  CloudRain,
  Music2,
  Radio,
  Keyboard,
  Clock,
  Coffee,
  CheckCircle2,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/soundEngine';

export default function FocusStudio({ isOpen, onClose }) {
  // Ambient Sound State
  const [isPlayingAmbient, setIsPlayingAmbient] = useState(false);
  const [ambientType, setAmbientType] = useState('lofi'); // 'lofi' | 'rain' | 'binaural'
  const [keyboardProfile, setKeyboardProfile] = useState('thock'); // 'thock' | 'clicky' | 'cyber' | 'off'

  // Pomodoro State
  const [pomoMode, setPomoMode] = useState('work'); // 'work' (25m) | 'shortBreak' (5m) | 'longBreak' (15m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const pomoTimerRef = useRef(null);

  // Sync keyboard profile with soundEngine
  useEffect(() => {
    if (keyboardProfile === 'off') {
      soundEngine.isKeyboardMuted = true;
    } else {
      soundEngine.isKeyboardMuted = false;
      soundEngine.keyboardProfile = keyboardProfile;
    }
  }, [keyboardProfile]);

  // Handle Pomodoro Timer Countdown
  useEffect(() => {
    if (isPomoRunning) {
      pomoTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(pomoTimerRef.current);
            setIsPomoRunning(false);
            soundEngine.playPomodoroBell();

            if (pomoMode === 'work') {
              setSessionsCompleted((c) => c + 1);
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              toast.success('🎉 Focus session complete! Time for a short break.', { icon: '☕' });
              setPomoMode('shortBreak');
              return 5 * 60;
            } else {
              toast.success('Break finished! Ready to code?', { icon: '🚀' });
              setPomoMode('work');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    }
    return () => {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    };
  }, [isPomoRunning, pomoMode]);

  const handleToggleAmbient = () => {
    if (isPlayingAmbient) {
      soundEngine.stopAmbient();
      setIsPlayingAmbient(false);
    } else {
      soundEngine.startAmbient(ambientType);
      setIsPlayingAmbient(true);
    }
  };

  const handleSelectAmbient = (type) => {
    setAmbientType(type);
    if (isPlayingAmbient) {
      soundEngine.startAmbient(type);
    }
  };

  const handlePomoModeChange = (mode) => {
    setIsPomoRunning(false);
    setPomoMode(mode);
    if (mode === 'work') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else if (mode === 'longBreak') setTimeLeft(15 * 60);
  };

  const handleResetPomo = () => {
    setIsPomoRunning(false);
    if (pomoMode === 'work') setTimeLeft(25 * 60);
    else if (pomoMode === 'shortBreak') setTimeLeft(5 * 60);
    else if (pomoMode === 'longBreak') setTimeLeft(15 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalModeSeconds = pomoMode === 'work' ? 25 * 60 : pomoMode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalModeSeconds - timeLeft) / totalModeSeconds) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="w-full max-w-md bg-[#0f1422] border border-[#2b354d] rounded-2xl shadow-2xl overflow-hidden text-slate-200"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[#141b2e] border-b border-[#2b354d] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <Headphones size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">Focus & Sensory Studio</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Synthesized Lo-Fi & Pomodoro Engine</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* 1. Pomodoro Focus Timer */}
            <div className="p-4 rounded-xl bg-[#172036] border border-[#2b354d] flex flex-col items-center text-center relative overflow-hidden">
              {/* Radial Progress Ring */}
              <div className="relative w-36 h-36 flex items-center justify-center my-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-[#222c45] stroke-[7] fill-none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-indigo-500 stroke-[7] fill-none transition-all duration-300"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-mono font-bold text-white tracking-wider">
                    {timeFormatted}
                  </span>
                  <span className="text-[11px] text-indigo-300 uppercase tracking-widest font-mono font-semibold mt-0.5">
                    {pomoMode === 'work' ? 'Focus' : 'Break'}
                  </span>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-[#0e1424] p-1 rounded-xl border border-[#2b354d] mt-2 text-xs">
                <button
                  onClick={() => handlePomoModeChange('work')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    pomoMode === 'work' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  25m Focus
                </button>
                <button
                  onClick={() => handlePomoModeChange('shortBreak')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    pomoMode === 'shortBreak' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  5m Break
                </button>
                <button
                  onClick={() => handlePomoModeChange('longBreak')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    pomoMode === 'longBreak' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  15m Rest
                </button>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleResetPomo}
                  className="p-2.5 rounded-xl bg-[#232e4d] hover:bg-[#2d3a61] text-slate-300 hover:text-white transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw size={16} />
                </button>

                <button
                  onClick={() => setIsPomoRunning(!isPomoRunning)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {isPomoRunning ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isPomoRunning ? 'Pause Session' : 'Start Focus'}</span>
                </button>
              </div>

              {sessionsCompleted > 0 && (
                <span className="text-[11px] text-emerald-400 font-mono mt-3 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {sessionsCompleted} sessions completed today
                </span>
              )}
            </div>

            {/* 2. Ambient Soundscape Generator */}
            <div className="p-4 rounded-xl bg-[#172036] border border-[#2b354d] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Music2 size={14} className="text-indigo-400" /> Ambient Focus Audio
                </span>
                <button
                  onClick={handleToggleAmbient}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isPlayingAmbient
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                  }`}
                >
                  {isPlayingAmbient ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isPlayingAmbient ? 'Playing' : 'Start Audio'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lofi', label: 'Lo-Fi Drone', icon: Sparkles },
                  { id: 'rain', label: 'Cyber Rain', icon: CloudRain },
                  { id: 'binaural', label: 'Alpha Waves', icon: Radio },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = ambientType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectAmbient(item.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs ${
                        isSelected
                          ? 'bg-indigo-600/25 border-indigo-400 text-white font-semibold'
                          : 'bg-[#0f1524] border-[#2b354d] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? 'text-indigo-400' : 'text-slate-500'} />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Keyboard Switch Sound Simulator */}
            <div className="p-4 rounded-xl bg-[#172036] border border-[#2b354d] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Keyboard size={14} className="text-indigo-400" /> Mechanical Switch SFX
                </span>
                <span className="text-[10px] font-mono text-slate-400">Zero Latency</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: 'thock', label: 'Thocky' },
                  { id: 'clicky', label: 'Clicky' },
                  { id: 'cyber', label: 'Cyber' },
                  { id: 'off', label: 'Muted' },
                ].map((k) => (
                  <button
                    key={k.id}
                    onClick={() => {
                      setKeyboardProfile(k.id);
                      if (k.id !== 'off') {
                        soundEngine.keyboardProfile = k.id;
                        soundEngine.isKeyboardMuted = false;
                        soundEngine.playKeypress('Enter');
                      }
                    }}
                    className={`py-2 rounded-lg font-medium border text-center transition-all ${
                      keyboardProfile === k.id
                        ? 'bg-indigo-600 border-indigo-400 text-white font-bold'
                        : 'bg-[#0f1524] border-[#2b354d] text-slate-400 hover:text-white'
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
