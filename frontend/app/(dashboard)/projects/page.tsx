"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Briefcase, Sparkles } from 'lucide-react';

import { EnrichedProject, useProjects } from "./_hooks/use_projects";

import SectionHeader from "./../_components/section_header";
import StatsHeader from "./_components/stats_header";
import ProjectFilters from "./_components/project_filters";
import ProjectsGrid from "./_components/projects_grid";
import EditProjectPanel from "./_components/edit_project_panel";
import BudgetModal from "./_components/budget_modal";
import CreateProjectModal from "./_components/create_project_modal";
import { useTimerContext } from "../_lib/TimerContext";
import OnboardingStepHint from "../_components/onboarding_step_hint";
import OnboardingBanner from "../_components/onboarding_banner";
import { getCurrency } from "@/app/_hooks/get_currency";

export default function ProjectsPage() {
  const router = useRouter();
  const { setTask: setTimerProject, setIsOpen: setTimerOpen } = useTimerContext();
  const currency = getCurrency();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [editingProject, setEditingProject] = useState<EnrichedProject | null>(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) { router.push("/login"); return; }
    try {
      const user = JSON.parse(userRaw);
      if (!user?.id) { router.push("/login"); return; }
    } catch {
      router.push("/login");
    } finally {
      setCheckingAuth(false);
    }
  }, [router]);

  const { state, actions } = useProjects();

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-gray-400 animate-pulse">Cargando proyectos...</p>
      </div>
    );
  }

  return (
    <>
      <BudgetModal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onProjectCreated={() => { actions.reload(); actions.reloadStats(); }}
      />
      <EditProjectPanel
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSaved={() => { actions.reload(); actions.reloadStats(); }}
      />
      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => { actions.reload(); actions.reloadStats(); }}
      />

      <OnboardingBanner />
      <SectionHeader title="Proyectos" subtitle="Gestioná todos tus proyectos freelance" icon={<Briefcase className="w-8 h-8 text-indigo-600" />}>
        <div className="flex gap-3">
          <button
            onClick={() => setBudgetModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-3 border border-indigo-200 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all font-medium text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generar presupuesto</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </SectionHeader>

      <OnboardingStepHint step="project" />

      <StatsHeader
        stats={state.stats}
        loading={state.statsLoading}
        currency={currency}
      />

      <ProjectFilters
        activeFilter={state.activeFilter}
        onFilterChange={actions.handleFilterChange}
        viewMode={state.viewMode}
        onViewModeChange={actions.setViewMode}
      />

      <ProjectsGrid
        projects={state.projects}
        viewMode={state.viewMode}
        loading={state.loading}
        activeFilter={state.activeFilter}
        currency={currency}
        onEdit={(project) => setEditingProject(project)}
        onStateChange={() => { actions.reload(); actions.reloadStats(); }}
        onStartTimer={(project) => {
          setTimerProject({
            id: "",
            title: project.name,
            project_id: project.id,
          });
          setTimerOpen(true);
        }}
      />
    </>
  );
}