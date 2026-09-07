import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Swords,
  Zap,
  Terminal,
  Brain,
  Database,
  ArrowRight,
  Shield,
  Star,
  Award,
  BookOpen,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { soundEngine } from '../utils/soundEngine';

export const SKILL_TREE_DATA = [
  // PYTHON CONSTELLATION
  {
    id: 'py_foundations',
    track: 'python',
    title: 'Python Foundations',
    subtitle: 'Zero to Code',
    desc: 'Variables, dynamic data types, conditional branching, and clean syntax.',
    icon: Terminal,
    tier: 1,
    x: 120,
    y: 80,
    requires: [],
    xp: 200,
    link: '/courses',
    status: 'completed', // 'completed' | 'unlocked' | 'locked'
  },
  {
    id: 'py_ds_oop',
    track: 'python',
    title: 'Data Structures & OOP',
    subtitle: 'Classes & Collections',
    desc: 'Lists, dictionaries, list comprehensions, classes, and inheritance.',
    icon: Database,
    tier: 2,
    x: 120,
    y: 220,
    requires: ['py_foundations'],
    xp: 350,
    link: '/courses',
    status: 'unlocked',
  },
  {
    id: 'py_ai_ml',
    track: 'python',
    title: 'AI & Neural Networks',
    subtitle: 'Model Training',
    desc: 'NumPy matrix operations, Pandas modeling, and deep learning backprop.',
    icon: Brain,
    tier: 3,
    x: 120,
    y: 360,
    requires: ['py_ds_oop'],
    xp: 500,
    link: '/courses',
    status: 'locked',
  },
  {
    id: 'boss_python',
    track: 'python',
    title: 'Python Grandmaster',
    subtitle: 'Boss Challenge',
    desc: 'Solve the production neural inference challenge under 5 minutes.',
    icon: Swords,
    isBoss: true,
    tier: 4,
    x: 120,
    y: 500,
    requires: ['py_ai_ml'],
    xp: 1000,
    link: '/battles',
    status: 'locked',
  },

  // JAVASCRIPT CONSTELLATION
  {
    id: 'js_basics',
    track: 'javascript',
    title: 'Modern JavaScript',
    subtitle: 'ES6+ & DOM',
    desc: 'Arrow functions, event listeners, promises, and dynamic DOM manipulation.',
    icon: Zap,
    tier: 1,
    x: 380,
    y: 80,
    requires: [],
    xp: 200,
    link: '/courses',
    status: 'completed',
  },
  {
    id: 'js_async_api',
    track: 'javascript',
    title: 'Async & APIs',
    subtitle: 'Fetch & Event Loop',
    desc: 'Async/await, microtask queue, REST endpoints, and error handling.',
    icon: Sparkles,
    tier: 2,
    x: 380,
    y: 220,
    requires: ['js_basics'],
    xp: 350,
    link: '/courses',
    status: 'unlocked',
  },
  {
    id: 'js_fullstack',
    track: 'javascript',
    title: 'Full-Stack Architecture',
    subtitle: 'Node & Express',
    desc: 'Build scalable backend services, JWT auth, and middleware pipelines.',
    icon: Shield,
    tier: 3,
    x: 380,
    y: 360,
    requires: ['js_async_api'],
    xp: 500,
    link: '/courses',
    status: 'locked',
  },
  {
    id: 'boss_javascript',
    track: 'javascript',
    title: 'Full-Stack Titan',
    subtitle: 'Boss Challenge',
    desc: 'Deploy an end-to-end authenticated API with zero runtime errors.',
    icon: Swords,
    isBoss: true,
    tier: 4,
    x: 380,
    y: 500,
    requires: ['js_fullstack'],
    xp: 1000,
    link: '/battles',
    status: 'locked',
  },

  // ALGORITHMS & BATTLES
  {
    id: 'algo_linear',
    track: 'algo',
    title: 'Linear Data & Pointers',
    subtitle: 'Two Pointers & Sliders',
    desc: 'Master array sliding windows, fast/slow pointers, and two sum.',
    icon: Swords,
    tier: 1,
    x: 640,
    y: 80,
    requires: [],
    xp: 250,
    link: '/battles',
    status: 'completed',
  },
  {
    id: 'algo_binary_trees',
    track: 'algo',
    title: 'Trees & Logarithmic Search',
    subtitle: 'Binary Search & BST',
    desc: 'Binary search over arrays and recursive tree traversals (DFS/BFS).',
    icon: Brain,
    tier: 2,
    x: 640,
    y: 220,
    requires: ['algo_linear'],
    xp: 400,
    link: '/battles',
    status: 'unlocked',
  },
  {
    id: 'algo_dp',
    track: 'algo',
    title: 'Dynamic Programming',
    subtitle: 'Memoization & Tabulation',
    desc: 'Knapsack, longest common subsequence, and optimal substructure.',
    icon: Sparkles,
    tier: 3,
    x: 640,
    y: 360,
    requires: ['algo_binary_trees'],
    xp: 600,
    link: '/battles',
    status: 'locked',
  },
  {
    id: 'boss_algo',
    track: 'algo',
    title: 'Battle Arena Champion',
    subtitle: 'Boss Challenge',
    desc: 'Win 3 consecutive 1v1 PvP Code Battles against top contenders.',
    icon: Swords,
    isBoss: true,
    tier: 4,
    x: 640,
    y: 500,
    requires: ['algo_dp'],
    xp: 1200,
    link: '/battles',
    status: 'locked',
  },

  // DATABASE & BACKEND
  {
    id: 'db_sql_basics',
    track: 'database',
    title: 'SQL & Relational Logic',
    subtitle: 'Queries & Filtering',
    desc: 'SELECT, WHERE, JOINs, group by aggregations, and subqueries.',
    icon: Database,
    tier: 1,
    x: 900,
    y: 80,
    requires: [],
    xp: 200,
    link: '/courses',
    status: 'completed',
  },
  {
    id: 'db_indexing',
    track: 'database',
    title: 'Indexing & Transactions',
    subtitle: 'ACID & B-Trees',
    desc: 'PostgreSQL performance optimization, B-Tree indexes, and locks.',
    icon: Shield,
    tier: 2,
    x: 900,
    y: 220,
    requires: ['db_sql_basics'],
    xp: 400,
    link: '/courses',
    status: 'unlocked',
  },
  {
    id: 'db_sharding',
    track: 'database',
    title: 'Distributed Databases',
    subtitle: 'Replication & Cache',
    desc: 'Read replicas, Redis caching layers, and partitioning strategies.',
    icon: Zap,
    tier: 3,
    x: 900,
    y: 360,
    requires: ['db_indexing'],
    xp: 600,
    link: '/courses',
    status: 'locked',
  },
  {
    id: 'boss_db',
    track: 'database',
    title: 'Database Architect',
    subtitle: 'Boss Challenge',
    desc: 'Optimize a high-throughput transaction system under 10ms p99 latency.',
    icon: Swords,
    isBoss: true,
    tier: 4,
    x: 900,
    y: 500,
    requires: ['db_sharding'],
    xp: 1000,
    link: '/battles',
    status: 'locked',
  },
];

export default function SkillTree() {
  const { user } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);

  const completedCount = SKILL_TREE_DATA.filter((n) => n.status === 'completed').length;
  const totalCount = SKILL_TREE_DATA.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const filteredNodes = selectedTrack === 'all'
    ? SKILL_TREE_DATA
    : SKILL_TREE_DATA.filter((n) => n.track === selectedTrack);

  // Compute SVG connections
  const connections = [];
  SKILL_TREE_DATA.forEach((node) => {
    node.requires.forEach((reqId) => {
      const parent = SKILL_TREE_DATA.find((n) => n.id === reqId);
      if (parent) {
        connections.push({
          from: parent,
          to: node,
          isActive: parent.status === 'completed' && node.status !== 'locked',
        });
      }
    });
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-[#232d47] p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-semibold">
                <Sparkles size={12} /> RPG Mastery Progression
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                <Star size={13} className="fill-amber-400 text-amber-400" /> Tier 2 Mage
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Developer Skill Constellation
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Unlock interconnected nodes across Python, JavaScript, Algorithms, and Databases. Complete prerequisite nodes to challenge legendary Boss Trials.
            </p>
          </div>

          {/* Player Progress Stats Card */}
          <div className="bg-[#0c1222]/80 backdrop-blur-md p-4 rounded-xl border border-[#232d47] min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Constellation Mastery</span>
              <span className="text-white font-mono font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#172036] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-sm"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>{completedCount} of {totalCount} Nodes Unlocked</span>
              <span className="text-amber-400 font-bold">+{user?.xp || 1450} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Track Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Constellations', icon: Sparkles },
          { id: 'python', label: 'Python Track', icon: Terminal },
          { id: 'javascript', label: 'JavaScript & Web', icon: Zap },
          { id: 'algo', label: 'Algorithms & Battles', icon: Swords },
          { id: 'database', label: 'PostgreSQL & Databases', icon: Database },
        ].map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTrack === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/25'
                  : 'bg-[#111726] border-[#222a3d] text-slate-400 hover:text-white hover:bg-[#182033]'
              }`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Constellation Canvas Map */}
      <div className="relative rounded-2xl bg-[#090d16] border border-[#222a3d] p-6 overflow-x-auto min-h-[640px] shadow-2xl">
        <div className="relative min-w-[1020px] h-[600px]">
          {/* Connecting SVG Illuminated Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="activeLine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {connections.map((c, i) => (
              <path
                key={i}
                d={`M ${c.from.x + 32} ${c.from.y + 32} L ${c.to.x + 32} ${c.to.y + 32}`}
                fill="none"
                stroke={c.isActive ? 'url(#activeLine)' : '#1e293b'}
                strokeWidth={c.isActive ? 3 : 2}
                strokeDasharray={c.isActive ? 'none' : '4 4'}
                className={c.isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}
              />
            ))}
          </svg>

          {/* Interactive Skill Nodes */}
          {filteredNodes.map((node) => {
            const Icon = node.icon;
            const isCompleted = node.status === 'completed';
            const isUnlocked = node.status === 'unlocked';
            const isLocked = node.status === 'locked';

            return (
              <motion.div
                key={node.id}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className="absolute z-10"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
              >
                <button
                  onClick={() => {
                    setSelectedNode(node);
                    if (isCompleted) soundEngine.playSuccess();
                    else if (isLocked) soundEngine.playError();
                    else soundEngine.playKeypress('Enter');
                  }}
                  className={`group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-2 ${
                    node.isBoss
                      ? isCompleted
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300 text-white shadow-lg shadow-amber-500/40'
                        : isUnlocked
                        ? 'bg-gradient-to-br from-rose-600 to-red-800 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-600/40'
                        : 'bg-[#121622] border-slate-700 text-slate-600'
                      : isCompleted
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                      : isUnlocked
                      ? 'bg-[#141d33] border-blue-500/60 text-blue-400 hover:border-blue-400 hover:text-white shadow-md'
                      : 'bg-[#0f1422] border-slate-800 text-slate-600 opacity-60'
                  }`}
                >
                  <Icon size={node.isBoss ? 26 : 22} />

                  {/* Status Badge */}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border border-emerald-300">
                        <CheckCircle2 size={12} />
                      </div>
                    ) : isLocked ? (
                      <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
                        <Lock size={10} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center animate-ping" />
                    )}
                  </span>

                  {/* Boss Crown Badge */}
                  {node.isBoss && (
                    <span className="absolute -bottom-2.5 px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold uppercase font-mono">
                      Boss
                    </span>
                  )}
                </button>

                {/* Node Title Label */}
                <div className="mt-2 text-center w-28 -ml-6">
                  <p className={`text-[11px] font-bold truncate ${isCompleted || isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                    {node.title}
                  </p>
                  <p className="text-[9px] font-mono text-slate-400 truncate">
                    {node.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Modal */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#0f1422] border border-[#2b354d] rounded-2xl p-6 shadow-2xl space-y-4 text-slate-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                    selectedNode.status === 'completed'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
                      : selectedNode.isBoss
                      ? 'bg-gradient-to-br from-rose-600 to-orange-600'
                      : 'bg-[#1c243b]'
                  }`}>
                    <selectedNode.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{selectedNode.title}</h3>
                    <span className="text-xs font-mono text-primary font-semibold">{selectedNode.subtitle}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#141b2e] p-3 rounded-xl border border-[#232d47]">
                {selectedNode.desc}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#141b2e] border border-[#232d47] flex flex-col">
                  <span className="text-slate-400 text-[10px]">REWARD</span>
                  <span className="text-amber-400 font-bold text-sm mt-0.5">+{selectedNode.xp} XP</span>
                </div>
                <div className="p-3 rounded-xl bg-[#141b2e] border border-[#232d47] flex flex-col">
                  <span className="text-slate-400 text-[10px]">STATUS</span>
                  <span className={`font-bold text-sm mt-0.5 capitalize ${
                    selectedNode.status === 'completed'
                      ? 'text-emerald-400'
                      : selectedNode.status === 'unlocked'
                      ? 'text-blue-400'
                      : 'text-slate-500'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>
              </div>

              {selectedNode.status === 'locked' ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  <Lock size={14} className="flex-shrink-0" />
                  <span>Complete prerequisite node(s) to unlock this trial!</span>
                </div>
              ) : (
                <Link
                  to={selectedNode.link}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                >
                  <span>{selectedNode.status === 'completed' ? 'Replay Challenge' : 'Enter Challenge Node'}</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
