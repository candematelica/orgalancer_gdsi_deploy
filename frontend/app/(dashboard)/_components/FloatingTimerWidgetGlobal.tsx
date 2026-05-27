"use client";

import { useTimerContext } from "../_lib/TimerContext";
import FloatingTimerWidget from "../tasks/_components/FloatingTimerWidget";

export default function FloatingTimerWidgetGlobal() {
  const { task, setTask, isOpen, setIsOpen } = useTimerContext();

  if (!isOpen || !task) return null;

  return (
    <FloatingTimerWidget
      task={task}
      onClose={() => {
        setIsOpen(false);
        setTask(null);
      }}
      onTimeSaved={() => {
        // El widget se cierra después de guardar
        setIsOpen(false);
        setTask(null);
      }}
    />
  );
}
