"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import AddEmployeeModal from "./components/AddEmployeeModal";
import EmployeeViewCard from "./components/Employeeviewcard";
import EmployeeEditCard from "./components/Employeeeditcard";
import {
  employeeService,
  Employee,
} from "@/features/admin/services/employee.service";
import { AxiosError } from "axios";

const Page = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);

  // ── status toggle in-flight tracker ──
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
    (emp) =>
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp._id?.toLowerCase().includes(search.toLowerCase()),
  );

  const initialsColor = (i: number) =>
    ["#18A096", "#7C5CFC", "#F5A623", "#2D7DFF", "#E0475E"][i % 5];

  const handleView = (id?: string) => {
    if (!id) return;
    const emp = employees.find((e) => e._id === id);
    if (!emp) return;
    setSelectedEmployee(emp);
    setModalMode("view");
  };

  const handleEdit = (id?: string) => {
    if (!id) return;
    const emp = employees.find((e) => e._id === id);
    if (!emp) return;
    setSelectedEmployee(emp);
    setModalMode("edit");
  };

  //  API CALL: employee ka active/inactive status toggle

  const handleToggleActive = async (emp: Employee) => {
    if (!emp._id || togglingId) return;

    const id = emp._id;
    const prevStatus = emp.isActive;
    const nextStatus = !(prevStatus === false ? false : true);

    setTogglingId(id);
    setEmployees((prev) =>
      prev.map((e) => (e._id === id ? { ...e, isActive: nextStatus } : e)),
    );
    setSelectedEmployee((prev) =>
      prev && prev._id === id ? { ...prev, isActive: nextStatus } : prev,
    );

    try {
      const res = await employeeService.toggleActive(id);
      const finalStatus = res?.data ? res.data.isActive : nextStatus;

      setEmployees((prev) =>
        prev.map((e) => (e._id === id ? { ...e, isActive: finalStatus } : e)),
      );
      setSelectedEmployee((prev) =>
        prev && prev._id === id ? { ...prev, isActive: finalStatus } : prev,
      );
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      console.error(
        "Toggle active error:",
        axiosErr.response?.status,
        axiosErr.response?.data,
      );

      // revert on failure
      setEmployees((prev) =>
        prev.map((e) => (e._id === id ? { ...e, isActive: prevStatus } : e)),
      );
      setSelectedEmployee((prev) =>
        prev && prev._id === id ? { ...prev, isActive: prevStatus } : prev,
      );
      alert(
        axiosErr.response?.data?.message ||
          `Failed to update status (status: ${axiosErr.response?.status ?? "network error"})`,
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveEdit = async (updatedData: Partial<Employee>) => {
    if (!selectedEmployee?._id) return;

    try {
      const res = await employeeService.update(
        selectedEmployee._id,
        updatedData,
      );

      console.log("Update API response:", res);

      const isSuccess = res.success !== false && !!res.data;

      if (!isSuccess) {
        alert(
          res.message || "Update failed — server did not return updated data",
        );
        return;
      }

      setModalMode(null);
      setSelectedEmployee(null);
      await fetchEmployees();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      console.error(
        "Update employee error:",
        axiosErr.response?.status,
        axiosErr.response?.data,
      );
      alert(
        axiosErr.response?.data?.message ||
          `Failed to update employee (status: ${axiosErr.response?.status ?? "network error"})`,
      );
    }
  };

  //  API CALL: employee ka password reset karna
  const handleResetPassword = async (newPassword: string) => {
    if (!selectedEmployee?._id) return;

    console.log(
      "Reset password → calling for id:",
      selectedEmployee._id,
      "id length:",
      selectedEmployee._id.length,
    );

    try {
      const res = await employeeService.resetPassword(
        selectedEmployee._id,
        newPassword,
      );

      console.log("Reset password response:", res);

      if (res.success === false) {
        throw new Error(res.message || "Failed to reset password");
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;

      // ── detailed diagnostics ──
      console.error("Reset password error message:", axiosErr.message);
      console.error("Reset password error code:", axiosErr.code);
      console.error("Reset password request config url:", axiosErr.config?.url);
      console.error("Reset password request config method:", axiosErr.config?.method);
      console.error(
        "Reset password error status/data:",
        axiosErr.response?.status,
        axiosErr.response?.data,
      );
      console.error("Reset password full error object:", axiosErr);

      throw new Error(
        axiosErr.response?.data?.message ||
          axiosErr.message ||
          (err instanceof Error ? err.message : "Failed to reset password"),
      );
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#18A096] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">
          Loading dashboard...
        </p>
      </div>
    );
  }

  const getCardFields = (emp: Employee | null) => {
    if (!emp) return [];
    return [
      { label: "Email", value: emp.email || "" },
      { label: "Phone", value: emp.phone || "" },
      { label: "Department", value: emp.department || "" },
      { label: "Designation", value: emp.designation || "" },
      {
        label: "Joining Date",
        value: emp.joinDate ? emp.joinDate.split("T")[0] : "",
      },
      { label: "Employment Type", value: "Full-time" },
    ];
  };

  const getInitials = (name?: string) => {
    if (!name) return "EMP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className="min-h-screen bg-[#F4F6F6] p-6"
      style={{ fontFamily: "Poppins, Inter, sans-serif" }}
    >
      <div className="space-y-6">
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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-white text-[#12544F] font-medium text-sm px-5 py-2.5 rounded-full hover:bg-[#F4F6F6] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Employee
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
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
          </div>

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
                {filtered.map((emp, i) => (
                  <tr
                    key={emp._id ?? i}
                    className="border-b border-gray-50 hover:bg-[#F4F6F6]/60 transition-colors"
                  >
                    <td className="py-4 pr-4 flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: initialsColor(i) }}
                      >
                        {getInitials(emp.name)}
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
                      {emp.joinDate ? emp.joinDate.split("T")[0] : ""}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                          emp.isActive
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {emp.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-sm">
                      <button
                        onClick={() => handleView(emp._id)}
                        className="text-[#18A096] font-medium mr-4 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(emp._id)}
                        className="text-[#18A096] font-medium hover:underline"
                      >
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

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchEmployees}
      />

      {modalMode === "view" && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <EmployeeViewCard
            name={selectedEmployee.name}
            employeeId={
              selectedEmployee._id
                ? selectedEmployee._id.slice(-6).toUpperCase()
                : "EMP"
            }
            status={
              selectedEmployee.isActive === false ? "Inactive" : "Active"
            }
            initials={getInitials(selectedEmployee.name)}
            fields={getCardFields(selectedEmployee)}
            onClose={() => {
              setModalMode(null);
              setSelectedEmployee(null);
            }}
            onEdit={() => setModalMode("edit")}
          />
        </div>
      )}

      {modalMode === "edit" && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <EmployeeEditCard
            key={selectedEmployee._id}
            employee={selectedEmployee}
            onClose={() => {
              setModalMode(null);
              setSelectedEmployee(null);
            }}
            onSave={handleSaveEdit}
            onToggleStatus={() => handleToggleActive(selectedEmployee)}
            isTogglingStatus={togglingId === selectedEmployee._id}
            onResetPassword={handleResetPassword}
          />
        </div>
      )}
    </div>
  );
};

export default Page;