"use client";

export type DetailTab = "overview" | "budgets" | "tasks" | "documents" | "receipts" | "notes" | "tiempos";

interface TabConfig {
  key:    DetailTab;
  label:  string;
  count?: number;
}

interface Props {
  activeTab:     DetailTab;
  onChange:      (tab: DetailTab) => void;
  taskCount:     number;
  receiptCount?: number;
}

export default function DetailTabs({ activeTab, onChange, taskCount, receiptCount }: Props) {
  const tabs: TabConfig[] = [
    { key: "overview",  label: "Vista General" },
    { key: "budgets",   label: "Presupuestos"  },
    { key: "tasks",     label: "Tareas",    count: taskCount     },
    { key: "documents", label: "Documentos"                      },
    { key: "receipts",  label: "Recibos",   count: receiptCount  },
    { key: "notes",     label: "Notas"                           },
    { key: "tiempos",   label: "Tiempos"                         },
  ];

  return (
    <div className="flex gap-1 px-4 pt-4 pb-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
            activeTab === tab.key
              ? "bg-violet-600 text-white"
              : "text-gray-500 hover:text-violet-600 hover:bg-violet-50"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-violet-500 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}