"use client";

import { X } from "lucide-react";

interface EmployeeField {
  label: string;
  value: string;
}

interface EmployeeViewCardProps {
  name?: string;
  employeeId?: string;
  status?: string;
  initials?: string;
  fields?: EmployeeField[];
  onClose?: () => void;
  onEdit?: () => void;
}

const defaultFields: EmployeeField[] = [
  { label: "Email", value: "" },
  { label: "Phone", value: "" },
  { label: "Department", value: "" },
  { label: "Designation", value: "" },
  { label: "Email", value: "" },
  { label: "Joining Date", value: "" },
  { label: "Employment Type", value: "" },
];

export default function EmployeeViewCard({
  name = "",
  employeeId = "",
  status = "",
  initials = "",
  fields = defaultFields,
  onClose,
  onEdit,
}: EmployeeViewCardProps) {
  const isActive = status === "Active";

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Close (X) icon top-right */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="absolute right-5 top-5 text-gray-400 transition-colors hover:text-gray-600"
      >
        <X size={18} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg font-semibold text-white">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
          <p className="mt-0.5 text-sm">
            <span className="text-emerald-600">{employeeId}</span>
            <span className="mx-1.5 text-gray-300">•</span>
            <span
              className={`inline-flex items-center gap-1.5 font-medium ${
                isActive ? "text-emerald-600" : "text-gray-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
              {status}
            </span>
          </p>
        </div>
      </div>

      {/* Section title */}
      <h3 className="mt-6 text-[15px] font-semibold text-gray-900">
        Personal Information
      </h3>

      {/* Field rows */}
      <div className="mt-3 divide-y divide-gray-100">
        {fields.map((field, idx) => (
          <div key={idx} className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-400">{field.label}</span>
            <span className="text-sm font-medium text-gray-900">
              {field.value}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          Edit Profile
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}