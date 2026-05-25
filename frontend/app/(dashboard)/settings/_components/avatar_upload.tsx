"use client";

// Avatar UI and upload logic (POST). Handles preview, validation, and error state.

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { API_BASE } from "../_lib/api";

const getFullUrl = (path: string | null | undefined) => {
  if (!path) return null;
  const base = API_BASE.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${base}/${cleanPath}`;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

interface AvatarUploadProps {
  fullName: string;
  avatarUrl?: string | null;
  onUploadSuccess: (url: string) => void;
}


export default function AvatarUpload({ fullName, avatarUrl, onUploadSuccess }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displaySrc = preview ?? getFullUrl(avatarUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      setError("Solo se permiten archivos JPG, PNG o GIF.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("El archivo no puede superar los 2 MB.");
      return;
    }

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const res = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al subir la imagen.");
      }

      const data = await res.json();
      onUploadSuccess(data.avatar_url ?? objectUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
      setPreview(null);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-5 mb-8">
      {/* Avatar circle */}
      <div className="relative shrink-0">
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt={fullName}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-100"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-purple-100 select-none">
            {getInitials(fullName)}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <Loader2 size={22} className="text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Action text */}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera size={14} />
          {uploading ? "Actualizando..." : "Cambiar foto"}
        </button>
        <p className="text-xs text-gray-400 mt-1.5">JPG, PNG o GIF · No más de 2 MB</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}