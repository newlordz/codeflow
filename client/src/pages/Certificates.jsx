import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Download, X, Calendar, Medal, Star, Shield, Sparkles, Printer, ExternalLink, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';
import {
  downloadCertificateSVG,
  downloadCertificatePNG,
  printCertificate,
} from '../utils/certificateGenerator';

const fallbackCerts = [
  { id: 1, course_title: 'Python Mastery', quiz_title: 'Python Fundamentals Quiz', language: 'Python', level: 'Beginner', difficulty: 'easy', score: 85, issued_at: '2024-03-15T10:30:00Z' },
  { id: 2, course_title: 'Web Development Bootcamp', quiz_title: 'Web Development Challenge', language: 'JavaScript', level: 'Intermediate', difficulty: 'intermediate', score: 92, issued_at: '2024-04-02T14:00:00Z' },
];

export default function Certificates() {
  const { user } = useAuth();
  const { get } = useApi();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    async function fetchCerts() {
      try {
        const data = await get('/certificates');
        setCertificates(data.certificates || data || fallbackCerts);
      } catch {
        setCertificates(fallbackCerts);
      } finally {
        setLoading(false);
      }
    }
    fetchCerts();
  }, [get]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 glass-panel shimmer rounded-lg" />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass-panel rounded-xl p-6 shimmer h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-12"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-1">Your Certificates</h1>
        <p className="text-on-surface-variant">Achievements earned through hard work</p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-20">
          <Award size={64} className="text-on-surface-variant/20 mx-auto mb-4" />
          <h3 className="text-lg text-on-surface font-semibold mb-1">No certificates yet</h3>
          <p className="text-sm text-on-surface-variant">Complete courses and pass quizzes to earn certificates.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassPanel
                className="p-6 hover:border-tertiary/40 transition-all duration-300 cursor-pointer relative overflow-hidden"
                hover
                onClick={() => setSelectedCert(cert)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 rounded-bl-full" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-md shadow-violet-500/25 flex items-center justify-center flex-shrink-0">
                    <Medal size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{cert.language}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono">{cert.level}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-on-surface mb-0.5">{cert.course_title}</h3>
                    <p className="text-xs text-on-surface-variant">{cert.quiz_title}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs font-mono">
                      <span className="flex items-center gap-1 text-on-surface-variant">
                        <Calendar size={12} /> {formatDate(cert.issued_at)}
                      </span>
                      <span className="flex items-center gap-1 text-tertiary font-semibold">
                        <Star size={12} /> {cert.score}%
                      </span>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedCert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedCert(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-4"
            >
              <div className="relative glass-panel shadow-premium rounded-2xl p-6 md:p-8">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors z-10"
                >
                  <X size={18} />
                </button>

                <div className="relative rounded-xl overflow-hidden border border-tertiary/25 bg-surface-container/60 shadow-inner">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[70px]" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)' }} />
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-[70px]" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10), transparent 70%)' }} />
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500" />

                  <div className="relative p-8 md:p-10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs">
                        <span className="text-white font-bold text-[10px] font-mono">{'</>'}</span>
                      </div>
                      <span className="text-sm font-bold text-on-surface tracking-tight">CodeFlow Academy</span>
                    </div>

                    <div className="relative w-20 h-20 mx-auto mb-5">
                      <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-lg" />
                      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/30 flex items-center justify-center">
                        <Award size={36} className="text-white" />
                      </div>
                    </div>

                    <p className="text-[11px] uppercase tracking-[0.25em] text-on-surface-variant font-mono mb-2">
                      Certificate of Completion
                    </p>
                    <p className="text-sm text-on-surface-variant mb-4">This certifies that</p>

                    <h3 className="text-3xl font-bold gradient-text-primary display-tight mb-5">
                      {selectedCert.user_name || 'Student'}
                    </h3>

                    <p className="text-sm text-on-surface-variant mb-1.5">has successfully completed</p>
                    <p className="text-lg font-semibold text-on-surface mb-0.5">{selectedCert.course_title}</p>
                    <p className="text-xs text-on-surface-variant mb-6">
                      {selectedCert.quiz_title} &middot; Score: <span className="text-tertiary font-semibold">{selectedCert.score}%</span>
                    </p>

                    <div className="divider-premium mb-6" />

                    <div className="flex items-center justify-between text-left">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/60 font-mono">Issued</p>
                        <p className="text-xs text-on-surface font-mono mt-0.5">{formatDate(selectedCert.issued_at)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
                        <Shield size={13} className="text-secondary" />
                        <span className="text-[11px] text-secondary font-mono font-medium">Verified</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-on-surface-variant/40 mt-6 font-mono">
                      Certificate ID: CF-{selectedCert.id?.toString().slice(0, 8)?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const sName = selectedCert.user_name || user?.full_name || user?.username || 'CodeFlow Scholar';
                        downloadCertificateSVG(selectedCert, sName);
                        toast.success('Vector SVG Certificate downloaded!');
                      }}
                      className="btn-primary py-2.5 text-xs shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Download size={14} />
                      Download SVG
                    </button>

                    <button
                      onClick={() => {
                        const sName = selectedCert.user_name || user?.full_name || user?.username || 'CodeFlow Scholar';
                        downloadCertificatePNG(selectedCert, sName);
                        toast.success('Generating High-Res PNG Certificate...');
                      }}
                      className="glass-panel hover:bg-surface-container-high text-on-surface py-2.5 text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download size={14} />
                      Download PNG
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const sName = selectedCert.user_name || user?.full_name || user?.username || 'CodeFlow Scholar';
                        printCertificate(selectedCert, sName);
                      }}
                      className="glass-panel hover:bg-surface-container-high text-on-surface py-2 text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Printer size={13} />
                      Print / Save PDF
                    </button>

                    <Link
                      to={`/verify/${selectedCert.id || 'demo'}`}
                      target="_blank"
                      className="glass-panel hover:bg-surface-container-high text-primary py-2 text-xs flex items-center justify-center gap-1.5 transition-colors font-semibold"
                    >
                      <ExternalLink size={13} />
                      Public Ledger
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
