"use client";

import ProjectTimeHistory from "../../../_components/project_time_history";
import TimeByTaskChart from "../TimeByTaskChart";

interface TimesTabProps {
  projectId: string;
  refreshKey?: number;
}

export default function TimesTab({ projectId, refreshKey }: TimesTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Registros de Tiempo</h3>
        <ProjectTimeHistory projectId={projectId} refreshKey={refreshKey} />
      </div>
      <TimeByTaskChart projectId={projectId} />
    </div>
  );
}