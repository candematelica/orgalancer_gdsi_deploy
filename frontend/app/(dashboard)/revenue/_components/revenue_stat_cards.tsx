"use client";

interface StatCard {
  label: string;
  amount: number;
  subtitle: string;
  currency: string;
  badge?: string;
  iconBg: string;
  icon: React.ReactNode;
}

interface Props {
  total: number;
  monetary: number;
  barter: number;
  currency: string;
}

function formatAmount(amount: number) {
  return amount.toLocaleString("es-ES");
}

export default function RevenueStatCards({ total, monetary, barter, currency }: Props) {
  const monetaryPct = total > 0 ? Math.round((monetary / total) * 100) : 0;
  const barterPct   = total > 0 ? Math.round((barter   / total) * 100) : 0;

  const cards: StatCard[] = [
    {
      label:    "Ingresos Totales",
      amount:   total,
      subtitle: "Monetario + Canje",
      currency,
      iconBg: "bg-green-500",
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <rect x="2" y="6" width="20" height="13" rx="2" stroke="white" strokeWidth="1.5" />
          <circle cx="12" cy="12.5" r="2.5" stroke="white" strokeWidth="1.5" />
          <path d="M6 12.5h.01M18 12.5h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label:    "Pagos Monetarios",
      amount:   monetary,
      subtitle: "Efectivo y transferencias",
      currency,
      badge:    `${monetaryPct}%`,
      iconBg: "bg-blue-500",
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M3 17l4-4 4 4 4-5 4-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label:    "Valuación de Canjes",
      amount:   barter,
      subtitle: "Bienes y servicios",
      currency,
      badge:    `${barterPct}%`,
      iconBg: "bg-gradient-to-br from-pink-500 to-purple-500",
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path d="M3 17l4-4 4 4 4-5 4-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center`}>
              {card.icon}
            </div>
            {card.badge && (
              <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                {card.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-1">{card.label}</p>
          <p className="text-2xl font-bold text-purple-600">
            {card.currency}{formatAmount(card.amount)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
}
