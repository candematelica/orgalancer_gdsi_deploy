"use client";

import { useState, useEffect, useCallback } from "react";

interface Note {
  id:         string;
  content:    string;
  created_at: string;
  updated_at: string;
}

interface Props { projectId: string }

export default function NotesTab({ projectId }: Props) {
  const [notes, setNotes]         = useState<Note[]>([]);
  const [loading, setLoading]     = useState(true);
  const [addOpen, setAddOpen]     = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [toast, setToast]         = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/notes`);
      if (res.ok) setNotes(await res.json());
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/projects/${projectId}/notes/${id}`, { method: "DELETE" });
    setConfirmDeleteId(null);
    showToast("Nota eliminada");
    load();
  };

  const fmt = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Notas</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? "Cargando..." : `${notes.length} nota${notes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => { setEditingNote(null); setAddOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <PlusIcon /> Agregar Nota
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      )}

      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
            <NoteIcon className="text-violet-400" />
          </div>
          <p className="text-sm text-gray-400 text-center">Todavía no hay notas en este proyecto.</p>
          <button
            onClick={() => { setEditingNote(null); setAddOpen(true); }}
            className="text-sm text-violet-600 font-medium hover:underline"
          >
            Agregar la primera nota
          </button>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 group">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">{fmt(note.updated_at)}</p>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingNote(note); setAddOpen(true); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                    title="Editar nota"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(note.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Eliminar nota"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <NoteModal
          projectId={projectId}
          note={editingNote}
          onClose={() => { setAddOpen(false); setEditingNote(null); }}
          onSaved={() => { setAddOpen(false); setEditingNote(null); load(); showToast(editingNote ? "Nota actualizada" : "Nota agregada"); }}
        />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-2">¿Eliminar nota?</h3>
            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="px-6 py-3 rounded-xl shadow-lg font-medium text-white bg-gray-900">{toast}</div>
        </div>
      )}
    </>
  );
}

function NoteModal({ projectId, note, onClose, onSaved }: {
  projectId: string;
  note: Note | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [content, setContent] = useState(note?.content ?? "");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError("La nota no puede estar vacía."); return; }
    setSaving(true);
    setError(null);
    try {
      const url    = note ? `/api/projects/${projectId}/notes/${note.id}` : `/api/projects/${projectId}/notes`;
      const method = note ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error || "Error al guardar"); return; }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">{note ? "Editar Nota" : "Nueva Nota"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
            placeholder="Escribí tu nota aquí..."
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {saving ? "Guardando..." : note ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
