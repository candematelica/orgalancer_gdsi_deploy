"use client";

import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  icon,
  children,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          {icon}
          {title}
        </h1>

        <p className="text-gray-600 mt-1 text-sm">
          {subtitle}
        </p>
      </div>

      {children && (
        <div className="flex items-center">
          {children}
        </div>
      )}
    </div>
  );
}