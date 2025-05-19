"use client";

import React from "react";
import { cn } from "@/lib/utils"; // Optional: utility for conditional classNames

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export const Button = ({
  className,
  variant = "default",
  ...props
}: ButtonProps) => {
  const baseStyles = "px-4 py-2 rounded-md text-sm font-medium transition-all";

  const variants = {
    default: "bg-[#057DCD] text-white hover:bg-[#1E3D58]",
    outline:
      "border border-[#057DCD] text-[#057DCD] bg-white hover:bg-[#E8EEF1]",
    ghost: "text-[#057DCD] hover:underline",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
};
