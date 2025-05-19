import React from "react";

export const Card = ({ className, ...props }) => (
  <div
    className={`rounded-lg border bg-white shadow-sm ${className}`}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={`p-4 border-b ${className}`} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h2 className={`text-xl font-bold ${className}`} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={`p-4 ${className}`} {...props} />
);
