"use client";

interface Props {
  message: string;
  onClose: () => void;
}

export default function ExpenseDeleteErrorDialog({ message, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-base font-bold text-gray-800 mb-2">No se puede eliminar</h2>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}