"use client";

import { useEffect, useState } from "react";
import { useReceipts } from "./../../../../_receipts/_hooks/use_receipts";
import type { Receipt } from "./../../../../_receipts/types";
import ReceiptRow from "./../../../../_receipts/_components/receipt_row";
import ReceiptDetailModal from "./../../../../_receipts/_components/receipt_detail_modal";
import CreateReceiptModal from "./../../../../_receipts/_components/create_receipt_modal";

export interface ReceiptsTabProps {
  projectId?: string | null;
  clientId?: string | null;
  clientName?: string | null;
}

export default function ReceiptsTab({ projectId, clientId, clientName }: ReceiptsTabProps) {
  const { receipts, loading, error, load, create, remove, markAs } = useReceipts();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    load({
      ...(projectId ? { project_id: projectId } : {}),
      ...(clientId ? { client_id: clientId } : {}),
    });
  }, [projectId, clientId, load]);

  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    await remove(id);
    setConfirmDeleteId(null);
    setDeleteLoading(null);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Recibos</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading
              ? "Cargando..."
              : receipts.length === 0
                ? "Sin recibos generados aún"
                : `${receipts.length} recibo${receipts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <PlusIcon /> Nuevo Recibo
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && receipts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
            <ReceiptIcon className="text-violet-400" size={20} />
          </div>
          <p className="text-sm text-gray-400 text-center">
            Todavía no hay recibos.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-sm text-violet-600 font-medium hover:underline"
          >
            Crear el primer recibo
          </button>
        </div>
      )}

      {/* List */}
      {!loading && !error && receipts.length > 0 && (
        <div className="space-y-3">
          {receipts.map((r) => (
            <ReceiptRow
              key={r.id}
              receipt={r}
              isDeleting={deleteLoading === r.id}
              confirmingDelete={confirmDeleteId === r.id}
              onView={() => setViewingReceipt(r)}
              onDeleteRequest={() => setConfirmDeleteId(r.id)}
              onDeleteConfirm={() => handleDelete(r.id)}
              onDeleteCancel={() => setConfirmDeleteId(null)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateReceiptModal
        open={createOpen}
        projectId={projectId ?? null}
        clientId={clientId ?? null}
        clientName={clientName ?? null}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setCreateOpen(false)}
        onCreate={create}
      />

      <ReceiptDetailModal
        receipt={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        onMarkAsPaid={async (id) => {
          await markAs(id, "paid");
          setViewingReceipt(null);
          load({ ...(projectId ? { project_id: projectId } : {}), ...(clientId ? { client_id: clientId } : {}) });
        }}
      />
    </>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ReceiptIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" className={className}>
      <path d="M4 2h16v22l-3-2-2 2-2-2-2 2-2-2-3 2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}