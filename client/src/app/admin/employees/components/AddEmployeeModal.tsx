"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { AxiosError } from "axios";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  department: "Engineering",
  designation: "",
  joinDate: "",
  baseSalary: "",
  password: "",
};

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        baseSalary: Number(formData.baseSalary) || 0,
      };

      const res = await employeeService.create(payload);
      console.log("Employee created:", res.data);

      setSuccess("Employee added successfully! ✅");
      setFormData(initialFormState);

      setTimeout(() => {
        setSuccess(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;

      if (!axiosErr.response) {
        setError("Server is not connect .");
      } else {
        setError(axiosErr.response.data?.message || "Something went wrong");
      }

      console.error(
        "Add employee error:",
        axiosErr.response?.data || axiosErr.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl p-6 md:p-8 relative text-gray-800 animate-in fade-in zoom-in duration-200">

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Employee</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Rajesh Kumar"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18A096]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="rajesh.kumar@antibikli.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18A096]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18A096]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18A096] bg-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Designation</label>
              <input
                type="text"
                name="designation"
                placeholder="Software Developer"
                value={formData.designation}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18A096]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Joining Date</label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18A096]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Base Salary</label>
              <input
                type="number"
                name="baseSalary"
                placeholder="50000"
                value={formData.baseSalary}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18A096]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                placeholder="123456"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18A096]"
              />
            </div>

          </div>

          <hr className="my-6 border-gray-100" />

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-3 px-4 bg-[#18A096] text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}