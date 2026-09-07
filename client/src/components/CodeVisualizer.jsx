import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sliders,
  Layers,
  Variable,
  Code2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const VISUALIZER_PRESETS = [
  {
    id: 'binary_search',
    title: 'Binary Search',
    language: 'javascript',
    description: 'Logarithmic O(log n) search over sorted array with left/mid/right pointers.',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid;
    }
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

const numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const result = binarySearch(numbers, 23);`,
    steps: [
      { line: 16, stack: ['Global'], vars: { numbers: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91] }, pointers: {}, note: 'Initialized sorted array of 10 items.' },
      { line: 17, stack: ['Global', 'binarySearch(arr, 23)'], vars: { arr: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23 }, pointers: {}, note: 'Calling binarySearch with target = 23.' },
      { line: 2, stack: ['Global', 'binarySearch'], vars: { left: 0 }, pointers: { left: 0 }, note: 'Initialize left pointer at index 0.' },
      { line: 3, stack: ['Global', 'binarySearch'], vars: { left: 0, right: 9 }, pointers: { left: 0, right: 9 }, note: 'Initialize right pointer at index 9 (last item).' },
      { line: 4, stack: ['Global', 'binarySearch'], vars: { left: 0, right: 9 }, pointers: { left: 0, right: 9 }, note: 'Condition 0 <= 9 is TRUE. Entering loop.' },
      { line: 5, stack: ['Global', 'binarySearch'], vars: { left: 0, right: 9, mid: 4 }, pointers: { left: 0, mid: 4, right: 9 }, note: 'Compute mid index = floor((0 + 9)/2) = 4.' },
      { line: 6, stack: ['Global', 'binarySearch'], vars: { 'arr[mid]': 16, target: 23 }, pointers: { left: 0, mid: 4, right: 9 }, note: 'Compare arr[4] (16) === target (23) -> FALSE.' },
      { line: 9, stack: ['Global', 'binarySearch'], vars: { 'arr[mid]': 16, target: 23 }, pointers: { left: 0, mid: 4, right: 9 }, note: 'arr[4] (16) < target (23) is TRUE. Target is in right half!' },
      { line: 10, stack: ['Global', 'binarySearch'], vars: { left: 5, right: 9, mid: 4 }, pointers: { left: 5, mid: 4, right: 9 }, note: 'Shift left pointer to mid + 1 = 5.' },
      { line: 4, stack: ['Global', 'binarySearch'], vars: { left: 5, right: 9 }, pointers: { left: 5, right: 9 }, note: 'Condition 5 <= 9 is TRUE. Loop iteration 2.' },
      { line: 5, stack: ['Global', 'binarySearch'], vars: { left: 5, right: 9, mid: 7 }, pointers: { left: 5, mid: 7, right: 9 }, note: 'Compute mid index = floor((5 + 9)/2) = 7.' },
      { line: 6, stack: ['Global', 'binarySearch'], vars: { 'arr[mid]': 56, target: 23 }, pointers: { left: 5, mid: 7, right: 9 }, note: 'Compare arr[7] (56) === target (23) -> FALSE.' },
      { line: 9, stack: ['Global', 'binarySearch'], vars: { 'arr[mid]': 56, target: 23 }, pointers: { left: 5, mid: 7, right: 9 }, note: 'arr[7] (56) < 23 is FALSE. Target is in left half.' },
      { line: 12, stack: ['Global', 'binarySearch'], vars: { left: 5, right: 6, mid: 7 }, pointers: { left: 5, right: 6 }, note: 'Shift right pointer to mid - 1 = 6.' },
      { line: 4, stack: ['Global', 'binarySearch'], vars: { left: 5, right: 6 }, pointers: { left: 5, right: 6 }, note: 'Condition 5 <= 6 is TRUE. Loop iteration 3.' },
      { line: 5, stack: ['Global', 'binarySearch'], vars: { left: 5, right: 6, mid: 5 }, pointers: { left: 5, mid: 5, right: 6 }, note: 'Compute mid index = floor((5 + 6)/2) = 5.' },
      { line: 6, stack: ['Global', 'binarySearch'], vars: { 'arr[mid]': 23, target: 23 }, pointers: { left: 5, mid: 5, right: 6 }, note: 'arr[5] (23) === target (23) is TRUE! Element found!' },
      { line: 7, stack: ['Global', 'binarySearch'], vars: { returnVal: 5 }, pointers: { found: 5 }, note: 'Returning index 5. Search complete in 3 steps!' },
      { line: 17, stack: ['Global'], vars: { result: 5 }, pointers: {}, note: 'Execution terminated: result = 5.' }
    ]
  },
  {
    id: 'bubble_sort',
    title: 'Bubble Sort Pass',
    language: 'javascript',
    description: 'Visual step-by-step element swapping comparing adjacent items.',
    code: `function bubbleSortPass(arr) {
  let swapped = false;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      let temp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = temp;
      swapped = true;
    }
  }
  return arr;
}

const list = [42, 15, 8, 30];
bubbleSortPass(list);`,
    steps: [
      { line: 14, stack: ['Global'], vars: { list: [42, 15, 8, 30] }, pointers: {}, note: 'Created unsorted list: [42, 15, 8, 30].' },
      { line: 15, stack: ['Global', 'bubbleSortPass'], vars: { arr: [42, 15, 8, 30] }, pointers: {}, note: 'Entering bubbleSortPass.' },
      { line: 2, stack: ['Global', 'bubbleSortPass'], vars: { swapped: false }, pointers: {}, note: 'Initialize swapped flag to false.' },
      { line: 3, stack: ['Global', 'bubbleSortPass'], vars: { i: 0 }, pointers: { i: 0, 'i+1': 1 }, note: 'First loop pass at index i = 0.' },
      { line: 4, stack: ['Global', 'bubbleSortPass'], vars: { 'arr[0]': 42, 'arr[1]': 15 }, pointers: { i: 0, 'i+1': 1 }, note: 'Compare 42 > 15: TRUE! Elements out of order.' },
      { line: 5, stack: ['Global', 'bubbleSortPass'], vars: { temp: 42 }, pointers: { i: 0, 'i+1': 1 }, note: 'Store temp = 42.' },
      { line: 6, stack: ['Global', 'bubbleSortPass'], vars: { arr: [15, 15, 8, 30] }, pointers: { i: 0, 'i+1': 1 }, note: 'arr[0] set to arr[1] (15).' },
      { line: 7, stack: ['Global', 'bubbleSortPass'], vars: { arr: [15, 42, 8, 30] }, pointers: { i: 0, 'i+1': 1 }, note: 'arr[1] set to temp (42). Swap complete!' },
      { line: 3, stack: ['Global', 'bubbleSortPass'], vars: { i: 1 }, pointers: { i: 1, 'i+1': 2 }, note: 'Advance to index i = 1.' },
      { line: 4, stack: ['Global', 'bubbleSortPass'], vars: { 'arr[1]': 42, 'arr[2]': 8 }, pointers: { i: 1, 'i+1': 2 }, note: 'Compare 42 > 8: TRUE! Swap needed.' },
      { line: 7, stack: ['Global', 'bubbleSortPass'], vars: { arr: [15, 8, 42, 30] }, pointers: { i: 1, 'i+1': 2 }, note: 'Swapped 42 and 8.' },
      { line: 3, stack: ['Global', 'bubbleSortPass'], vars: { i: 2 }, pointers: { i: 2, 'i+1': 3 }, note: 'Advance to index i = 2.' },
      { line: 4, stack: ['Global', 'bubbleSortPass'], vars: { 'arr[2]': 42, 'arr[3]': 30 }, pointers: { i: 2, 'i+1': 3 }, note: 'Compare 42 > 30: TRUE! Swap needed.' },
      { line: 7, stack: ['Global', 'bubbleSortPass'], vars: { arr: [15, 8, 30, 42] }, pointers: { i: 2, 'i+1': 3 }, note: 'Swapped 42 and 30. Largest item (42) bubbled to end!' },
      { line: 11, stack: ['Global'], vars: { arr: [15, 8, 30, 42] }, pointers: {}, note: 'Pass complete. Notice 42 is now in its sorted final position.' }
    ]
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Stack Frames',
    language: 'javascript',
    description: 'Visualizing recursive stack frames and return values for fib(3).',
    code: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

const ans = fib(3);`,
    steps: [
      { line: 6, stack: ['Global'], vars: {}, pointers: {}, note: 'Calling top-level fib(3).' },
      { line: 1, stack: ['Global', 'fib(3)'], vars: { n: 3 }, pointers: {}, note: 'Frame 1: n = 3. Check base case n <= 1 (False).' },
      { line: 3, stack: ['Global', 'fib(3)', 'fib(2)'], vars: { n: 2 }, pointers: {}, note: 'Branching left: Calling fib(2).' },
      { line: 3, stack: ['Global', 'fib(3)', 'fib(2)', 'fib(1)'], vars: { n: 1 }, pointers: {}, note: 'Branching left: Calling fib(1). Base case hit! Returns 1.' },
      { line: 3, stack: ['Global', 'fib(3)', 'fib(2)', 'fib(0)'], vars: { n: 0 }, pointers: {}, note: 'Branching right: Calling fib(0). Base case hit! Returns 0.' },
      { line: 3, stack: ['Global', 'fib(3)', 'fib(2)'], vars: { 'fib(2)_result': '1 + 0 = 1' }, pointers: {}, note: 'fib(2) resolves to 1 and pops from stack.' },
      { line: 3, stack: ['Global', 'fib(3)', 'fib(1)'], vars: { n: 1 }, pointers: {}, note: 'Calling right branch of fib(3): fib(1). Base case returns 1.' },
      { line: 3, stack: ['Global', 'fib(3)'], vars: { 'fib(3)_result': 'fib(2) + fib(1) = 1 + 1 = 2' }, pointers: {}, note: 'fib(3) resolves to 2.' },
      { line: 6, stack: ['Global'], vars: { ans: 2 }, pointers: {}, note: 'Final answer ans = 2.' }
    ]
  }
];

export default function CodeVisualizer({ customCode = null, customLanguage = 'javascript' }) {
  const [selectedPreset, setSelectedPreset] = useState(VISUALIZER_PRESETS[0]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 2x
  const timerRef = useRef(null);

  const steps = selectedPreset.steps;
  const currentStep = steps[currentStepIdx] || steps[0];
  const codeLines = selectedPreset.code.split('\n');

  // Handle play/pause auto-stepping
  useEffect(() => {
    if (isPlaying) {
      const interval = 1200 / speed;
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            soundEngine.playSuccess();
            return prev;
          }
          soundEngine.playKeypress('Enter');
          return prev + 1;
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, steps.length]);

  const handleStepForward = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
      soundEngine.playKeypress('ArrowDown');
    }
  };

  const handleStepBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
      soundEngine.playKeypress('ArrowUp');
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const handleSelectPreset = (preset) => {
    setIsPlaying(false);
    setSelectedPreset(preset);
    setCurrentStepIdx(0);
  };

  // Find array in vars to render memory slots
  const activeArrayKey = Object.keys(currentStep.vars).find(
    (k) => Array.isArray(currentStep.vars[k])
  );
  const activeArray = activeArrayKey ? currentStep.vars[activeArrayKey] : null;

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] rounded-xl border border-[#222a3d] overflow-hidden text-slate-200">
      {/* Visualizer Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#111726] border-b border-[#222a3d]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
              Visual Execution Tracer
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live State
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Step-by-step memory & call stack debugger</p>
          </div>
        </div>

        {/* Algorithm Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {VISUALIZER_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedPreset.id === p.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-[#182033] text-slate-400 hover:text-white hover:bg-[#202b45]'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Column: Code Line Stepper (5 cols) */}
        <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[#222a3d] flex flex-col min-h-0 bg-[#070a10]">
          <div className="px-3 py-2 bg-[#0e1422] border-b border-[#222a3d] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Code2 size={13} className="text-blue-400" />
              Source Lines (Execution Flow)
            </span>
            <span>Line {currentStep.line}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] space-y-1">
            {codeLines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const isCurrent = lineNum === currentStep.line;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-2 py-1 rounded transition-all ${
                    isCurrent
                      ? 'bg-blue-600/25 border-l-4 border-blue-400 text-white font-semibold shadow-inner'
                      : 'text-slate-400 hover:bg-white/[0.02]'
                  }`}
                >
                  <span className={`w-6 text-right select-none text-[11px] ${isCurrent ? 'text-blue-400 font-bold' : 'text-slate-600'}`}>
                    {lineNum}
                  </span>
                  <span className="flex-1 whitespace-pre">{lineText || ' '}</span>
                  {isCurrent && (
                    <motion.span
                      layoutId="activePointer"
                      className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500 text-white font-bold flex items-center gap-1"
                    >
                      <ArrowRight size={10} /> Active
                    </motion.span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Step Insight Banner */}
          <div className="p-3 bg-[#111726] border-t border-[#222a3d]">
            <div className="flex items-start gap-2 text-xs">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={12} />
              </div>
              <div>
                <span className="font-semibold text-white">Step {currentStepIdx + 1}: </span>
                <span className="text-slate-300">{currentStep.note}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Call Stack + Memory Grid + Array Visualizer (6 cols) */}
        <div className="lg:col-span-6 flex flex-col min-h-0 bg-[#0b0f17] overflow-y-auto p-4 space-y-4">
          {/* Dynamic Array / Collection Memory Slots */}
          {activeArray && (
            <div className="p-3.5 rounded-xl bg-[#131b2e] border border-[#222a3d] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Database size={13} className="text-emerald-400" />
                  Array Memory Slots: <code className="text-emerald-400 font-mono">{activeArrayKey}</code>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{activeArray.length} slots</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto py-2">
                {activeArray.map((val, i) => {
                  // Check if any pointer is targeting this index
                  const pointerNames = Object.keys(currentStep.pointers).filter(
                    (pKey) => currentStep.pointers[pKey] === i
                  );
                  const isTargeted = pointerNames.length > 0;

                  return (
                    <div key={i} className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all border ${
                          isTargeted
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-400 text-white scale-105 shadow-md shadow-blue-500/30'
                            : 'bg-[#1a233a] border-[#2d3854] text-slate-300'
                        }`}
                      >
                        {val}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 mt-1">[{i}]</span>
                      {isTargeted && (
                        <span className="text-[9px] font-mono font-bold text-sky-400 mt-0.5 uppercase">
                          {pointerNames.join(',')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Local Variables Memory Table */}
          <div className="p-3.5 rounded-xl bg-[#131b2e] border border-[#222a3d] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Variable size={13} className="text-sky-400" />
                Local Scope Variables
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {Object.keys(currentStep.vars).length} values in frame
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              {Object.entries(currentStep.vars).map(([name, value]) => {
                const displayVal = Array.isArray(value) ? `Array(${value.length})` : JSON.stringify(value);
                return (
                  <motion.div
                    key={name}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-2.5 rounded-lg bg-[#0d1322] border border-[#222a3d] flex flex-col"
                  >
                    <span className="text-[10px] text-slate-400 font-semibold">{name}</span>
                    <span className="text-xs text-sky-300 font-bold truncate mt-0.5" title={displayVal}>
                      {displayVal}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Active Call Stack Frames */}
          <div className="p-3.5 rounded-xl bg-[#131b2e] border border-[#222a3d] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Layers size={13} className="text-purple-400" />
                Execution Call Stack
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Depth: {currentStep.stack.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {currentStep.stack.map((frame, fIdx) => {
                const isTopFrame = fIdx === currentStep.stack.length - 1;
                return (
                  <div
                    key={fIdx}
                    className={`px-3 py-2 rounded-lg font-mono text-xs flex items-center justify-between border ${
                      isTopFrame
                        ? 'bg-purple-600/20 border-purple-500/40 text-purple-200 font-semibold'
                        : 'bg-[#0d1322] border-[#222a3d] text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">#{fIdx + 1}</span>
                      <span>{frame}</span>
                    </span>
                    {isTopFrame && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">
                        Active Frame
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Control Player Footer */}
      <div className="px-4 py-3 bg-[#111726] border-t border-[#222a3d] flex flex-wrap items-center justify-between gap-3">
        {/* Playback Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-[#1a233a] hover:bg-[#253252] text-slate-300 hover:text-white transition-colors"
            title="Reset to beginning"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={handleStepBack}
            disabled={currentStepIdx === 0}
            className="p-2 rounded-lg bg-[#1a233a] hover:bg-[#253252] text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            title="Step Back"
          >
            <SkipBack size={15} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentStepIdx === steps.length - 1}
            className="p-2 rounded-lg bg-[#1a233a] hover:bg-[#253252] text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            title="Step Forward"
          >
            <SkipForward size={15} />
          </button>
        </div>

        {/* Timeline Progress Bar */}
        <div className="flex-1 max-w-xs flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>{currentStepIdx + 1}</span>
          <div className="flex-1 h-2 rounded-full bg-[#1e2740] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-200"
              style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span>{steps.length}</span>
        </div>

        {/* Speed Toggles */}
        <div className="flex items-center gap-1 bg-[#0e1422] p-1 rounded-lg border border-[#222a3d] text-xs">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                speed === s ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
