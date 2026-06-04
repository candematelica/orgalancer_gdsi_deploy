"use client";

// components/portal_link_button.tsx
// Drop this button into your ProjectCard or action menu for each project.
// On click: calls API to get/create portal token, then copies the link to clipboard.

import { Link, Check, Loader2 } from "lucide-react";
import { usePortalLink } from "../../../_hooks/use_portal_link";

interface Props {
  projectId: string;
  /** Optional: extra classes for the button */
  className?: string;
}

export default function PortalLinkButton({ projectId, className = "" }: Props) {
  const { generateAndCopyLink, loadingId, copiedId } = usePortalLink();

  const isLoading = loadingId === projectId;
  const isCopied = copiedId === projectId;

  return (
    <button
      onClick={() => generateAndCopyLink(projectId)}
      disabled={isLoading}
      title={isCopied ? "¡Link copiado!" : "Generar link del portal"}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200
        ${
          isCopied
            ? "bg-green-100 text-green-700 border border-green-200"
            : "bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
        }
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isCopied ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Link className="w-3.5 h-3.5" />
      )}
      {isLoading ? "Generando..." : isCopied ? "¡Link copiado!" : "Link del portal"}
    </button>
  );
}