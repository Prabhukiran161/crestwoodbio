import React from "react";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection = ({ title, children }: FormSectionProps) => {
  return (
    <div className="border border-gray-200 rounded-md p-5 bg-white shadow-sm">
      <h3 className="font-semibold text-[#1E3D58] border-b border-gray-200 pb-2 mb-4">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};
