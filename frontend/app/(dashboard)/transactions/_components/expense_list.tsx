"use client";

import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { type Expense, type ExpenseCategory } from "../_hooks/use_expenses";
import SectionTabs, { type Tab } from "./section_tabs";
import ConfirmDeleteExpenseDialog from "./confirm_delete_expense_dialog";

export type GroupMode = "general" | "category" | "project" | "period";

interface Props {
  expenses:    Expense[];
  categories:  ExpenseCategory[];
  currency:    string;
  activeTab:   GroupMode;
  onTabChange: (tab: GroupMode) => void;
  onDelete?:   (id: string) => void;
  onEdit?:     (expense: Expense) => void;
}

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const EXPENSE_TABS: Tab<GroupMode>[] = [
  { id: "general",  label: "Vista General" },
  { id: "category", label: "Por Categoría" },
  { id: "project",  label: "Por Proyecto"  },
  { id: "period",   label: "Por Período"   },
];

const FALLBACK_COLOR = "#8B5CF6";

function ExpenseRow({ expense, currency, onDelete, onEdit }: { expense: Expense; currency?: string; onDelete?: (id: string) => void; onEdit?: (e: Expense) => void }) {
  const [confirming, setConfirming] = useState(false);
  const color = expense.category_color ?? FALLBACK_COLOR;
  const rowCurrency = currency ?? expense.currency;
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {expense.category_name ?? "Sin categoría"}
        </p>
        <p className="text-xs text-gray-400">{expense.project_name ?? "Sin proyecto"}</p>
        {expense.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{expense.description}</p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-red-500">
          -{rowCurrency}{expense.amount.toLocaleString("es-ES")}
        </p>
        <p className="text-xs text-gray-400">{formatDate(expense.date)}</p>
      </div>

      <div className="flex gap-1 flex-shrink-0 ml-2">
        {onEdit && (
          <button
            onClick={() => onEdit(expense)}
            className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
          >
            <Pencil size={14} />
          </button>
        )}
        <button
          onClick={() => setConfirming(true)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          title="Eliminar gasto"
        >
          <Trash2 size={14} />
        </button>

        {confirming && (
          <ConfirmDeleteExpenseDialog
            expense={expense}
            currency={currency ?? expense.currency}
            onConfirm={() => { setConfirming(false); onDelete?.(expense.id); }}
            onCancel={() => setConfirming(false)}
          />
        )}
      </div>
    </div>
  );
}

// group block
function GroupBlock({
  title, color, total, currency, expenses, onDelete, onEdit,
}: {
  title: string; color?: string; total: number;
  currency: string; expenses: Expense[];
  onDelete?: (id: string) => void; onEdit?: (e: Expense) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2">
          {color && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />}
          <span className="text-sm font-bold text-gray-700">{title}</span>
        </div>
        <span className="text-sm font-bold text-red-500">
          -{currency}{total.toLocaleString("es-ES")}
        </span>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {expenses.map((e) => (
          <ExpenseRow key={e.id} expense={e} currency={currency} onDelete={onDelete} onEdit={onEdit} />  
        ))}
      </div>
    </div>
  );
}

// main component
export default function ExpenseList({ expenses, categories, currency, activeTab, onTabChange, onDelete, onEdit }: Props) {
  const isEmpty = expenses.length === 0;

  return (
    <div>
      <SectionTabs
        tabs={EXPENSE_TABS}
        active={activeTab}
        onChange={onTabChange}
        activeColor="bg-red-500"
      />

      {isEmpty ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No hay gastos registrados aún.
        </div>
      ) : (
        <>
          {/* General */}
          {activeTab === "general" && (
            <>
              <h2 className="text-base font-bold text-gray-800 mb-4">Gastos Recientes</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {expenses.map((e) => (
                  <ExpenseRow key={e.id} expense={e} currency={currency} onDelete={onDelete} onEdit={onEdit} />
                ))}
              </div>
            </>
          )}

          {/* By category */}
          {activeTab === "category" && (() => {
            const groups = categories
              .map((cat) => ({
                cat,
                items: expenses.filter((e) => e.category_id === cat.id),
              }))
              .filter((g) => g.items.length > 0);

            const uncategorized = expenses.filter((e) => !e.category_id);

            return (
              <>
                {groups.map(({ cat, items }) => (
                  <GroupBlock
                    key={cat.id}
                    title={cat.name}
                    color={cat.color ?? FALLBACK_COLOR}
                    total={items.reduce((s, e) => s + e.amount, 0)}
                    currency={currency}
                    expenses={items}
                    onDelete={onDelete}
                  />
                ))}
                {uncategorized.length > 0 && (
                  <GroupBlock
                    title="Sin categoría"
                    total={uncategorized.reduce((s, e) => s + e.amount, 0)}
                    currency={currency}
                    expenses={uncategorized}
                    onDelete={onDelete}
                  />
                )}
              </>
            );
          })()}

          {/* By project */}
          {activeTab === "project" && (() => {
            const projectMap = new Map<string, { name: string; items: Expense[] }>();

            expenses.forEach((e) => {
              if (!e.project_id) return; // skip unassigned
              if (!projectMap.has(e.project_id))
                projectMap.set(e.project_id, { name: e.project_name ?? "Proyecto", items: [] });
              projectMap.get(e.project_id)!.items.push(e);
            });

            if (projectMap.size === 0) return (
              <div className="text-center py-12 text-gray-400 text-sm">
                No tenés gastos asociados a proyectos.
              </div>
            );

            return Array.from(projectMap.entries()).map(([key, { name, items }]) => (
              <GroupBlock
                key={key}
                title={name}
                total={items.reduce((s, e) => s + e.amount, 0)}
                currency={currency}
                expenses={items}
                onDelete={onDelete}
              />
            ));
          })()}

          {/* By period (month) */}
          {activeTab === "period" && (() => {
            const periodMap = new Map<string, Expense[]>();

            expenses.forEach((e) => {
              const d   = new Date(e.date);
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              if (!periodMap.has(key)) periodMap.set(key, []);
              periodMap.get(key)!.push(e);
            });

            const sorted = Array.from(periodMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

            return sorted.map(([key, items]) => {
              const [y, m] = key.split("-").map(Number);
              const title  = `${MONTH_NAMES[m - 1]} ${y}`;
              return (
                <GroupBlock
                  key={key}
                  title={title}
                  total={items.reduce((s, e) => s + e.amount, 0)}
                  currency={currency}
                  expenses={items}
                  onDelete={onDelete}
                />
              );
            });
          })()}
        </>
      )}
    </div>
  );
}