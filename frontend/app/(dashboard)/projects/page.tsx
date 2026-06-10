"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Briefcase, Sparkles } from 'lucide-react';

import { EnrichedProject, useProjects } from "./_hooks/use_projects";
import { useCreateProjectForm } from "./_hooks/create_new_project";

import SectionHeader from "./../_components/section_header";
import StatsHeader from "./_components/stats_header";
import ProjectFilters from "./_components/project_filters";
import ProjectsGrid from "./_components/projects_grid";
import EditProjectPanel from "./_components/edit_project_panel";
import BudgetModal from "./_components/budget_modal";
import { useTimerContext } from "../_lib/TimerContext";
import OnboardingStepHint from "../_components/onboarding_step_hint";
import OnboardingBanner from "../_components/onboarding_banner";

export default function ProjectsPage() {
  const router = useRouter();
  const { setTask: setTimerProject, setIsOpen: setTimerOpen } = useTimerContext();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<EnrichedProject | null>(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [timeRefreshKey, setTimeRefreshKey] = useState(0);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    console.log("USERRAW: ", userRaw)

    if (!userRaw) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      if (!user?.id) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
    } catch {
      router.push("/login");
    } finally {
      setCheckingAuth(false);
    }
  }, [router]);

  // get logic
  const { state, actions } = useProjects();

  // form logic (post) ---
  const [showForm, setShowForm] = useState(false);
  const {
    formData,
    setFormData,
    handleSubmit,
    error: formError,
    saved,
    loading: formLoading,
    clients
  } = useCreateProjectForm();

  async function onSubmit(e: React.FormEvent) {
    const isSuccess = await handleSubmit(e);
    if (isSuccess) {
      setTimeout(() => {
        setShowForm(false);
        actions.reload();
        actions.reloadStats();
      }, 1500);
    }
  }

  // this prevents rendering before auth check
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
      { /* header */}
      <OnboardingBanner />
      <SectionHeader title="Proyectos" subtitle="Gestioná todos tus proyectos freelance" icon={<Briefcase className="w-8 h-8 text-indigo-600" />}>
        <button
          onClick={() => setBudgetModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 border border-indigo-200 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all font-medium text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generar presupuesto</span>
        </button>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-medium shadow-sm"
        >
          {showForm ? (<X className="w-5 h-5" />) : (<Plus className="w-5 h-5" />)}
          <span>
            {showForm ? "Cancelar" : "Nuevo Proyecto"}
          </span>
        </button>
      </SectionHeader>


      <OnboardingStepHint step="project" />

      {/* form (post) */}
      {showForm && (
        <form
          onSubmit={onSubmit}
          className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-md space-y-4 transition-all animate-in fade-in slide-in-from-top-4"
        >
          <h2 className="text-lg font-semibold text-gray-800">Crear nuevo proyecto</h2>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {formError}
            </p>
          )}

          {saved && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              ✓ Proyecto creado correctamente
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Nombre del proyecto *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej: Rediseño E-commerce"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Cliente *</label>
              <select
                required
                value={formData.client_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, client_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-800 font-medium text-gray-800 mb-1">Tipo de contrato *</label>
              <select
                value={formData.contract_type}
                onChange={(e) => setFormData((prev) => ({ ...prev, contract_type: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="fixed_price">Precio Fijo</option>
                <option value="hourly">Por Hora</option>
                <option value="retainer">Retainer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-800 font-medium text-gray-800 mb-1">Presupuesto estimado (€) *</label>
              <input
                type="number"
                required
                min={0}
                value={formData.estimated_budget ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, estimated_budget: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-800 font-medium mb-1">Fecha límite</label>
              <input
                type="date"
                value={formData.deadline ? formData.deadline.toISOString().split("T")[0] : ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value ? new Date(e.target.value) : null }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={formLoading}
              className="px-6 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
            >
              {formLoading ? "Guardando..." : "Crear proyecto"}
            </button>
          </div>
        </form>
      )}

      {/* stats */}
      <StatsHeader
        stats={state.stats}
        loading={state.statsLoading}
        currency="€"
      />

      {/* filters */}
      <ProjectFilters
        activeFilter={state.activeFilter}
        onFilterChange={actions.handleFilterChange}
        viewMode={state.viewMode}
        onViewModeChange={actions.setViewMode}
      />

      {/* projects list */}
      <ProjectsGrid
        projects={state.projects}
        viewMode={state.viewMode}
        loading={state.loading}
        activeFilter={state.activeFilter}
        currency="€"
        onEdit={(project) => setEditingProject(project)}
        onStateChange={() => { actions.reload(); actions.reloadStats(); }}
        onStartTimer={(project) => {
          setTimerProject({
            id: project.id,
            title: project.name,
            project_id: project.id,
          });
          setTimerOpen(true);
        }}
      />
    </>
  );
}