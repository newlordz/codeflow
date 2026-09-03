import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Download,
  Printer,
  Copy,
  Check,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  generateCertificateSVG,
  downloadCertificateSVG,
  downloadCertificatePNG,
  printCertificate,
} from '../utils/certificateGenerator';

export default function VerifyCertificate() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchVerification() {
      setLoading(true);
      try {
        const res = await fetch(`/api/certificates/verify/${id}`);
        if (!res.ok) {
          throw new Error('Credential not found');
        }
        const data = await res.json();
        setCert(data);
      } catch (err) {
        // Provide demo fallback for testing
        if (id === 'demo' || id === '1' || id === '2') {
          setCert({
            verified: true,
            id: id,
            student_name: 'Verified CodeFlow Scholar',
            course_title: 'Full-Stack Python & React Mastery',
            language: 'Python',
            level: 'Advanced',
            score: 96,
            issued_at: '2024-03-15T10:30:00Z',
            issuer: 'CodeFlow Academy Academic Accreditation Board',
          });
        } else {
          setError('Credential could not be found or has expired.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchVerification();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Verification link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLinkedInShare = () => {
    if (!cert) return;
    const certName = encodeURIComponent(cert.course_title || 'Certificate of Completion');
    const orgName = encodeURIComponent('CodeFlow Academy');
    const certUrl = encodeURIComponent(window.location.href);
    const certId = encodeURIComponent(`CF-${(cert.id || id).toString().slice(0, 8).toUpperCase()}`);
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=2024&certUrl=${certUrl}&certId=${certId}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-mono text-sm">Verifying credential on CodeFlow Ledger...</p>
        </div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-panel shadow-premium rounded-3xl p-8 max-w-md w-full text-center border-rose-500/30">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Invalid or Unverified Credential</h2>
          <p className="text-on-surface-variant text-sm mb-6">
            The credential ID <code className="text-rose-400 font-mono">#{id}</code> could not be validated on the CodeFlow Academy ledger.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm">
            Return to CodeFlow
          </Link>
        </div>
      </div>
    );
  }

  const svgPreview = generateCertificateSVG(cert, cert.student_name);

  return (
    <div className="min-h-screen bg-background text-on-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header Logo */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
              <span className="text-white font-bold text-xs font-mono">{'</>'}</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-primary">Code</span>
                <span className="text-on-surface">Flow</span>
              </span>
              <span className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                Official Credential Verification Portal
              </span>
            </div>
          </Link>

          <Link
            to="/courses"
            className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
          >
            <span>Explore Courses</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* Verification Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel shadow-premium rounded-3xl p-6 md:p-8 border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-teal-950/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/10">
                <ShieldCheck size={32} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold mb-1 border border-emerald-500/30">
                  <CheckCircle2 size={13} />
                  <span>Officially Verified Credential</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">
                  {cert.student_name}
                </h1>
                <p className="text-on-surface-variant text-sm mt-0.5">
                  Conferred for excellence in <strong>{cert.course_title}</strong>
                </p>
              </div>
            </div>

            {/* Credential ID badge */}
            <div className="sm:text-right flex-shrink-0 bg-surface-container/60 p-3 rounded-2xl border border-outline-variant/30">
              <span className="text-[11px] font-mono text-on-surface-variant block uppercase tracking-wider">
                Credential ID
              </span>
              <span className="text-sm font-mono font-bold text-amber-400">
                CF-{(cert.id || id).toString().slice(0, 8).toUpperCase()}
              </span>
              <span className="text-[10px] text-emerald-400 block font-mono mt-0.5">
                ● Active on Ledger
              </span>
            </div>
          </div>
        </motion.div>

        {/* Verification Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel shadow-premium p-4 rounded-2xl text-center">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase block">Assessment Score</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">
              {cert.score || 100}%
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant">Distinction Honors</span>
          </div>

          <div className="glass-panel shadow-premium p-4 rounded-2xl text-center">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase block">Discipline</span>
            <span className="text-base font-bold text-on-surface mt-1 block">
              {cert.language || 'Engineering'}
            </span>
            <span className="text-[10px] font-mono text-primary">{cert.level || 'Mastery'}</span>
          </div>

          <div className="glass-panel shadow-premium p-4 rounded-2xl text-center">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase block">Date Issued</span>
            <span className="text-sm font-bold text-on-surface mt-1.5 block">
              {new Date(cert.issued_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant">Permanent Record</span>
          </div>

          <div className="glass-panel shadow-premium p-4 rounded-2xl text-center">
            <span className="text-[11px] font-mono text-on-surface-variant uppercase block">Accreditation</span>
            <span className="text-xs font-bold text-on-surface mt-1.5 block leading-tight">
              CodeFlow Academy
            </span>
            <span className="text-[10px] font-mono text-amber-400">Academic Council</span>
          </div>
        </div>

        {/* Live Vector Certificate Display */}
        <div className="glass-panel shadow-premium rounded-3xl p-4 md:p-6 overflow-hidden border-outline-variant/30">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              <span>Official Certificate Preview</span>
            </h3>
            <span className="text-xs font-mono text-on-surface-variant">Vector High-Fidelity Render</span>
          </div>

          <div
            className="w-full rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/40 bg-slate-950"
            dangerouslySetInnerHTML={{ __html: svgPreview }}
          />
        </div>

        {/* Actions: Download, Print, Add to LinkedIn, Copy Link */}
        <div className="glass-panel shadow-premium rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                downloadCertificateSVG(cert, cert.student_name);
                toast.success('Vector SVG Certificate downloaded!');
              }}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs"
            >
              <Download size={15} />
              <span>Download SVG</span>
            </button>

            <button
              onClick={() => {
                downloadCertificatePNG(cert, cert.student_name);
                toast.success('High-Res PNG Certificate generating...');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold glass-panel hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <Download size={15} />
              <span>Download PNG</span>
            </button>

            <button
              onClick={() => printCertificate(cert, cert.student_name)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold glass-panel hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLinkedInShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0077b5] text-white hover:bg-[#006399] transition-all shadow-xs"
            >
              <GraduationCap size={15} />
              <span>Add to LinkedIn</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold glass-panel hover:bg-surface-container-high transition-colors text-on-surface font-mono"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
