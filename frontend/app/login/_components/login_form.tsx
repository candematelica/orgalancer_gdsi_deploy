import Link from "next/link";
import type { useLoginForm } from "../_hooks/use_login_form";

type Props = ReturnType<typeof useLoginForm>;

export default function LoginForm({
  fields,
  error,
  loading,
  show_password,
  remember_me,
  handle_change,
  handle_submit,
  toggle_password_visibility,
  toggle_remember_me,
}: Props) {
  return (
    <>
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="white" />
            <path d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2L19 15Z" fill="white" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl font-bold text-center text-violet-700 mb-1">Orgalancer</h1>
      <p className="text-sm text-center text-gray-400 mb-7">Bienvenido de vuelta</p>

      {/* Error global */}
      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handle_submit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={fields.email}
              onChange={handle_change}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-gray-300"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <input
              type={show_password ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={fields.password}
              onChange={handle_change}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-gray-300"
            />
            <button
              type="button"
              onClick={toggle_password_visibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition-colors"
              aria-label={show_password ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show_password ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember_me}
              onChange={toggle_remember_me}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 focus:ring-2"
            />
            <span className="text-sm text-gray-600">Recordarme</span>
          </label>

          <Link href="#" className="text-sm text-violet-600 hover:text-violet-700 font-medium hover:underline transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Iniciando sesión...
            </span>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </form>

      <p className="text-sm text-center text-gray-400 mt-5">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="text-violet-600 font-semibold hover:underline">Regístrate gratis</Link>
      </p>
    </>
  );
}
