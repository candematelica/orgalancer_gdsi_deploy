import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLoginForm() {
  const router = useRouter();
  const [fields, setFields] = useState({
    email: "",
    password: "",
  });
  const [error, set_error] = useState("");
  const [loading, set_loading] = useState(false);
  const [success, set_success] = useState(false);

  const handle_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    set_error("");
    set_loading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const data = await res.json();

      if (!res.ok) {
        return set_error(data.error || "Email o contraseña incorrectos");
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      set_success(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch {
      set_error("Error de conexión, intentá de nuevo");
    } finally {
      set_loading(false);
    }
  };

  return {
    fields,
    error,
    loading,
    success,
    handle_change,
    handle_submit,
  };
}