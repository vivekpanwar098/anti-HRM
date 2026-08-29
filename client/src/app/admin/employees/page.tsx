"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import AddEmployeeModal from "./components/AddEmployeeModal";
import { employeeService, Employee } from "@/services/employeeService";

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeService.getAll();
      setEmployees(res.data);
    } catch (err) {
      console.error("Employee fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter(
    (emp: any) =>
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.id?.toLowerCase().includes(search.toLowerCase())
  );

  const initialsColor = (i: number) =>
    ["#18A096", "#7C5CFC", "#F5A623", "#2D7DFF", "#E0475E"][i % 5];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#18A096] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F4F6F6]"
      style={{ fontFamily: "Poppins, Inter, sans-serif" }}
    >
      {/* Page content */}
      <div className="space-y-6">
        {/* Header banner */}
        <div
          className="flex items-center justify-between rounded-2xl px-6 py-6"
          style={{
            background: "linear-gradient(135deg, #18A096 0%, #12544F 100%)",
          }}
        >
          <div>
            <h1 className="text-white text-3xl font-semibold">Employees</h1>
            <p className="text-white/80 text-sm mt-1">
              {employees.length || 0} total employees
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white text-[#12544F] font-medium text-sm px-5 py-2.5 rounded-full hover:bg-[#F4F6F6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Employee
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search by name or ID..."
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#18A096]/30"
              />
            </div>
            <select className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 outline-none">
              <option>All</option>
            </select>
            <select className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 outline-none">
              <option>Status</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="py-3 pr-4">Employee</th>
                  <th className="py-3 pr-4">Department</th>
                  <th className="py-3 pr-4">Designation</th>
                  <th className="py-3 pr-4">Joining Date</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp: any, i: number) => (
                  <tr
                    key={emp.id ?? i}
                    className="border-b border-gray-50 hover:bg-[#F4F6F6]/60 transition-colors"
                  >
                    <td className="py-4 pr-4 flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: initialsColor(i) }}
                      >
                        {emp.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <span className="font-medium text-[#403E41] text-sm">
                        {emp.name}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-500">
                      {emp.department}
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-500">
                      {emp.designation}
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-500">
                      {emp.joiningDate}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#18A096]/10 text-[#18A096] border border-[#18A096]/30">
                        {emp.status ?? "Active"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm">
                      <button className="text-[#18A096] font-medium mr-4 hover:underline">
                        View
                      </button>
                      <button className="text-[#18A096] font-medium hover:underline">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-sm text-gray-400"
                    >
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          console.log("Employee added successfully!");
          fetchEmployees();
        }}
      />
    </div>
  );
};

export default Page;
