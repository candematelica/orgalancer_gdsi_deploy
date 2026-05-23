"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "../../tasks/_lib/api";

export interface ProjectTimeEntry {
  id:               string;
  entry_date:       string;
  duration_minutes: number;
  description:      string;
  source:           "manual" | "timer";
  task_name?:       string | null;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export function useProjectTimeHistory(projectId: string, refreshKey?: number) {
  const [entries,   setEntries]   = useState<ProjectTimeEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [deleteId,  setDeleteId]  = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<ProjectTimeEntry | null>(null);
  const [editHours, setEditHours] = useState("");
  const [editMins,  setEditMins]  = useState("");
  const [editDesc,  setEditDesc]  = useState("");
  const [editDate,  setEditDate]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/time-entries?project_id=${projectId}`, { headers: authHeaders() });
      if (res.ok) setEntries(await res.json());
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries, refreshKey]);

  const openEdit = (entry: ProjectTimeEntry) => {
    setEditEntry(entry);
    setEditHours(Math.floor(entry.duration_minutes / 60).toString());
    setEditMins((entry.duration_minutes % 60).toString());
    setEditDesc(entry.description ?? "");
    setEditDate(entry.entry_date);
  };

  const closeEdit = () => setEditEntry(null);

  const saveEdit = async () => {
    if (!editEntry) return;
    const duration_minutes = parseInt(editHours || "0") * 60 + parseInt(editMins || "0");
    if (duration_minutes <= 0) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/time-entries/${editEntry.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ entry_date: editDate, duration_minutes, description: editDesc }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        setEditEntry(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (id: string) => setDeleteId(id);
  const cancelDelete  = () => setDeleteId(null);

  const confirmDelete = async () => {
    if (!deleteId) return;
    await fetch(`${API_BASE}/time-entries/${deleteId}`, { method: "DELETE", headers: authHeaders() });
    setEntries((prev) => prev.filter((e) => e.id !== deleteId));
    setDeleteId(null);
  };

  const total = entries.reduce((s, e) => s + e.duration_minutes, 0);

  return {
    entries, total, loading, mounted,
    deleteId, requestDelete, cancelDelete, confirmDelete,
    editEntry, editHours, editMins, editDesc, editDate, saving,
    openEdit, closeEdit, saveEdit,
    setEditHours, setEditMins, setEditDesc, setEditDate,
  };
}