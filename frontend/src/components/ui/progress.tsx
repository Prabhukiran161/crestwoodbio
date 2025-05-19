import React from "react";

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

export const Progress = ({
  value,
  className = "w-full h-2 bg-gray-200 rounded-full",
  indicatorClassName = "bg-blue-500",
}: ProgressProps) => {
  return (
    <div className={className}>
      <div
        className={`${indicatorClassName} h-full rounded-full transition-all duration-300`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};
