import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StickyNote,
  Plus,
  X,
  Edit3,
  Trash2,
  Search,
  BookOpen,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';

export default function Notes() {
  const { get, post, put, del } = useApi();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await get('/notes');
      setNotes(data.notes || data || []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Please write something');
      return;
    }
    setSaving(true);
    try {
      if (editingNote) {
        const data = await put(`/notes/${editingNote.id}`, { content });
        setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? { ...n, ...(data.note || data) } : n)));
        toast.success('Note updated');
      } else {
        const data = await post('/notes', { content });
        setNotes((prev) => [data.note || data, ...prev]);
        toast.success('Note created');
      }
      closeModal();
    } catch (err) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await del(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success('Note deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete note');
    }
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setContent(note.content);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingNote(null);
    setContent('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setContent('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filtered = notes.filter(
    (n) =>
      n.content?.toLowerCase().includes(search.toLowerCase()) ||
      n.course_title?.toLowerCase().includes(search.toLowerCase()) ||
      n.lesson_title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 glass-panel shimmer rounded-lg" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-xl p-5 shimmer h-36" />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-1">My Notes</h1>
          <p className="text-on-surface-variant">Capture your learning insights</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary px-4 py-2 text-sm shadow-xs"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="input-premium pl-10 pr-4 py-2.5"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <StickyNote size={48} className="text-on-surface-variant/30 mx-auto mb-4" />
          <h3 className="text-lg text-on-surface font-semibold mb-1">
            {search ? 'No notes match your search' : 'No notes yet'}
          </h3>
          <p className="text-sm text-on-surface-variant mb-4">
            {search ? 'Try a different search term' : 'Start capturing your learning insights'}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="btn-primary px-4 py-2 text-sm shadow-xs"
            >
              Create first note
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassPanel className="p-5 h-full flex flex-col hover:border-primary/20 transition-all duration-300" hover>
                <p className="text-sm text-on-surface leading-relaxed mb-4 flex-1 line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                  <div className="min-w-0">
                    {(note.course_title || note.lesson_title) && (
                      <p className="text-[11px] text-on-surface-variant font-mono truncate flex items-center gap-1">
                        <BookOpen size={10} />
                        {note.lesson_title || note.course_title}
                      </p>
                    )}
                    <p className="text-[10px] text-on-surface-variant/60 font-mono flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {formatDate(note.updated_at || note.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(note)}
                      className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-md hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-4"
            >
              <GlassPanel className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-on-surface">
                    {editingNote ? 'Edit Note' : 'New Note'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant"
                  >
                    <X size={18} />
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={6}
                  className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-lg p-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-3 mt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm glass-panel text-on-surface-variant rounded-lg hover:text-on-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !content.trim()}
                    className="btn-primary px-5 py-2 text-sm shadow-xs disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingNote ? 'Update' : 'Save'}
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
