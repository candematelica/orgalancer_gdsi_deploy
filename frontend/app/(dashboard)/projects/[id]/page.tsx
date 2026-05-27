"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { useProjectDetail } from "./_hooks/use_project_detail";
import DetailHeader   from "./_components/detail_header";
import StatsBar       from "./_components/stats_bar";
import DetailTabs, { DetailTab } from "./_components/detail_tabs";

import OverviewTab   from "./_components/tabs/overview_tab";
import BudgetsTab    from "./_components/tabs/budgets_tab";
import TasksTab      from "./_components/tabs/tasks_tab";
import TimesTab      from "./_components/tabs/times_tab";
import DocumentsTab  from "./_components/tabs/documents_tab";
import ReceiptsTab from "./_components/tabs/receipts_tab";
import NotesTab      from "./_components/tabs/notes_tab";

import EditProjectPanel from "../_components/edit_project_panel";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { project, loading, error, refetch } = useProjectDetail(id);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [timeRefreshKey, setTimeRefreshKey] = useState(0);

  // ── handlers ──────────────────────────────────────────────────
  const handleEditClick = () => setEditOpen(true);

  // TODO: replace with TaskModal — passes project.id as project_id.
  //       On success, call refetch() to update task count in the tabs bar.
  const handleAddTaskClick = () => {
    console.log("TODO: open TaskModal for project", project?.id);
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">Cargando proyecto...</p>
      </div>
    );
  }

  // ── Error / not found ─────────────────────────────────────────────────────
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-red-400">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm text-red-400">{error ?? "Proyecto no encontrado."}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ── Tab renderer ──────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case "overview":   return <OverviewTab  project={project} />;
      case "budgets":    return <BudgetsTab   projectId={project.id} />;
      case "tasks":      return <TasksTab     projectId={project.id} onTaskChange={refetch} />;
      case "tiempos":    return <TimesTab     projectId={project.id} refreshKey={timeRefreshKey} />;
      case "documents":  return <DocumentsTab projectId={project.id} />;
      case "receipts": return (<ReceiptsTab projectId={project.id} clientId={project.client_id} clientName={project.client_name}/>);
      case "notes":      return <NotesTab     projectId={project.id} />;
      default:           return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <DetailHeader
        project={project}
        onEditClick={handleEditClick}
        onAddTaskClick={handleAddTaskClick}
      />

      <EditProjectPanel
        project={editOpen ? project : null}
        onClose={() => setEditOpen(false)}
        onSaved={() => { setEditOpen(false); refetch(); }}
      />

      <StatsBar    project={project} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <DetailTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          taskCount={project.total_tasks - project.completed_tasks}
        />
        <hr className="border-gray-100" />
        <div className="p-6">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}