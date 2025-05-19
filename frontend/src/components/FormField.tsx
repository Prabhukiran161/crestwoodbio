import React from "react";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  placeholder?: string;
}

export const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  min,
  placeholder,
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        min={min}
        placeholder={placeholder}
        className={`w-full ${disabled ? "bg-gray-100" : "bg-white"}`}
      />
    </div>
  );
};
