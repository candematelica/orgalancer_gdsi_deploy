"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TimerTask {
  id: string;
  title: string;
  project_id: string;
}

interface TimerContextType {
  task: TimerTask | null;
  setTask: (task: TimerTask | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [task, setTask] = useState<TimerTask | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Restaurar desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("timer_widget_state");
    if (saved) {
      try {
        const { task: savedTask, isOpen: savedIsOpen } = JSON.parse(saved);
        setTask(savedTask);
        setIsOpen(savedIsOpen);
      } catch (e) {
        localStorage.removeItem("timer_widget_state");
      }
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (task || isOpen) {
      localStorage.setItem("timer_widget_state", JSON.stringify({ task, isOpen }));
    } else {
      localStorage.removeItem("timer_widget_state");
    }
  }, [task, isOpen]);

  return (
    <TimerContext.Provider value={{ task, setTask, isOpen, setIsOpen }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimerContext debe usarse dentro de TimerProvider");
  }
  return context;
}
