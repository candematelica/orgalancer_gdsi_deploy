import { useState } from "react";
import { useRouter } from "next/navigation";

export function useRegisterForm() {
  const router = useRouter();
  const [fields, setFields] = useState({
    full_name: "",
    email: "",
    profession: "",
    password: "",
  });
  const [accepted, set_accepted] = useState(false);
  const [error, set_error] = useState("");
  const [email_error, set_email_error] = useState("");
  const [loading, set_loading] = useState(false);

  const handle_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handle_email_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFields({ ...fields, email: value });
    set_email_error(
      value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? "El email no tiene un formato válido"
        : ""
    );
  };

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    set_error("");

    if (!accepted) return set_error("Debés aceptar los términos y condiciones");

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(fields.password)) {
      return set_error(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
      );
    }

    set_loading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) return set_error(data.error || "Error al registrar");

      localStorage.setItem("user", JSON.stringify(data));
      router.push("/dashboard");
    } catch {
      set_error("Error de conexión, intentá de nuevo");
    } finally {
      set_loading(false);
    }
  };

  return {
    fields,
    accepted,
    set_accepted,
    error,
    email_error,
    loading,
    handle_change,
    handle_email_change,
    handle_submit,
  };
}
