"use client";

import { useState, useEffect } from "react";
import { X, KeyRound, Eye, EyeOff, UserCheck, UserX } from "lucide-react";
import { Employee } from "@/features/admin/services/employee.service";

interface EmployeeEditCardProps {
  employee: Employee;
  onClose: () => void;
  onSave: (updatedData: Partial<Employee>) => void;
  onResetPassword: (newPassword: string) => Promise<void>;
  onToggleStatus?: () => void;
  isTogglingStatus?: boolean;
}

export default function EmployeeEditCard({
  employee,
  onClose,
  onSave,
  onResetPassword,
  onToggleStatus,
  isTogglingStatus = false,
}: EmployeeEditCardProps) {
  const [formData, setFormData] = useState({
    name: employee.name || "",
    email: employee.email || "",
    phone: employee.phone || "",
    department: employee.department || "",
    designation: employee.designation || "",
    joinDate: employee.joinDate ? employee.joinDate.split("T")[0] : "",
  });

  const [saving, setSaving] = useState(false);

  // ── Reset password section ──
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      joinDate: employee.joinDate ? employee.joinDate.split("T")[0] : "",
    });
  }, [employee]);

  const initials = employee.name
    ? employee.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "EMP";

  const employeeId = employee._id ? employee._id.slice(-6).toUpperCase() : "EMP";
  const isActive = employee.isActive !== false;
  const status = isActive ? "Active" : "Inactive";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<Employee> = {};
    (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
      const newVal = formData[key];
      const oldVal =
        key === "joinDate"
          ? employee.joinDate
            ? employee.joinDate.split("T")[0]
            : ""
          : (employee[key] as string) || "";
      if (newVal !== oldVal) {
        payload[key] = newVal as Employee[typeof key];
      }
    });

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      console.log("PATCH payload being sent:", payload);
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setPwError(null);
    setPwSuccess(null);

    if (!newPassword || !confirmPassword) {
      setPwError("Both fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }

    try {
      setPwSaving(true);
      await onResetPassword(newPassword);
      setPwSuccess("Password reset successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(
        err instanceof Error ? err.message : "Failed to reset password"
      );
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="absolute right-5 top-5 text-gray-400 transition-colors hover:text-gray-600"
      >
        <X size={18} />
      </button>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg font-semibold text-white">
          {initials}
        </div>
        <div className="flex-1">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md border border-transparent px-1 -mx-1 text-lg font-semibold text-gray-900 transition-colors focus:border-emerald-300 focus:bg-emerald-50/50 focus:outline-none"
          />
          <p className="mt-0.5 text-sm">
            <span className="text-emerald-600">{employeeId}</span>
            <span className="mx-1.5 text-gray-300">•</span>
            <span className="text-emerald-600">{status}</span>
          </p>
        </div>
      </div>

      {/* Status toggle row — moved here from EmployeeViewCard */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Employee Status</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isActive ? "Currently active and enabled" : "Currently inactive and disabled"}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleStatus}
          disabled={isTogglingStatus || !onToggleStatus}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            isActive
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          }`}
        >
          {isTogglingStatus ? (
            <span
              className={`h-3.5 w-3.5 border-2 border-t-transparent rounded-full animate-spin ${
                isActive ? "border-red-500" : "border-emerald-500"
              }`}
            />
          ) : isActive ? (
            <UserX size={14} />
          ) : (
            <UserCheck size={14} />
          )}
          {isTogglingStatus ? "Updating..." : isActive ? "Deactivate" : "Activate"}
        </button>
      </div>

      <h3 className="mt-6 text-[15px] font-semibold text-gray-900">
        Personal Information
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="mt-3 space-y-3 divide-y divide-gray-100">
          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="w-1/3 shrink-0 text-sm text-gray-400">Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-right text-sm font-medium text-gray-900 transition-colors focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-3">
            <span className="w-1/3 shrink-0 text-sm text-gray-400">Phone</span>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-right text-sm font-medium text-gray-900 transition-colors focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-3">
            <span className="w-1/3 shrink-0 text-sm text-gray-400">Department</span>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-right text-sm font-medium text-gray-900 transition-colors focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-3">
            <span className="w-1/3 shrink-0 text-sm text-gray-400">Designation</span>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-right text-sm font-medium text-gray-900 transition-colors focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-3">
            <span className="w-1/3 shrink-0 text-sm text-gray-400">Joining Date</span>
            <input
              type="date"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
              className="flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-right text-sm font-medium text-gray-900 transition-colors focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* ── Reset Password ── */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowPasswordSection((v) => !v);
            setPwError(null);
            setPwSuccess(null);
          }}
          className="flex w-full items-center justify-between text-[15px] font-semibold text-gray-900"
        >
          <span className="flex items-center gap-2">
            <KeyRound size={16} className="text-gray-400" />
            Reset Password
          </span>
          <span className="text-xs font-medium text-emerald-600">
            {showPasswordSection ? "Hide" : "Change"}
          </span>
        </button>

        {showPasswordSection && (
          <div className="mt-3 space-y-3">
            {pwError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {pwError}
              </p>
            )}
            {pwSuccess && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
                {pwSuccess}
              </p>
            )}

            <div className="flex items-center justify-between gap-4">
              <span className="w-1/3 shrink-0 text-sm text-gray-400">
                New Password
              </span>
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 pr-8 text-right text-sm font-medium text-gray-900 transition-colors focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="w-1/3 shrink-0 text-sm text-gray-400">
                Confirm
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-right text-sm font-medium text-gray-900 transition-colors focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={pwSaving}
              className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pwSaving ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}