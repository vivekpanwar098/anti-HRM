"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Users,
  Clock,
  ArrowDownCircle,
  ChevronDown,
  Plus,
  Play,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Download,
} from "lucide-react";
import {
  payrollService,
  PayrollRow,
  PayrollSummary,
  PayrollDetail,
  PaymentStatus,
} from "@/services/payrollService";

const statusStyles: Record<string, string> = {
  Paid: "text-emerald-600 font-medium",
  Pending: "text-amber-500 font-medium",
  generated: "text-amber-500 font-medium",
};

const currency = (v: number | null | undefined) =>
  v == null ? "₹ 0" : `₹ ${v.toLocaleString("en-IN")}`;

export default function PayrollPage() {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [summary, setSummary] = useState<PayrollSummary>({
    totalPayroll: 0,
    employeesPaid: 0,
    pendingPayroll: 0,
    totalDeductions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedRecord, setSelectedRecord] = useState<PayrollDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ✅ API CALL: payroll overview fetch karna (summary + rows)
  const fetchPayroll = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await payrollService.getOverview(pageNum, rowsPerPage);

      setSummary(res.data.summary);
      setRows(res.data.rows || []);
      setTotalCount(res.data.pagination?.total ?? res.data.rows?.length ?? 0);
    } catch (err) {
      console.error("Payroll overview fetch error:", err);
      setError("Payroll data could not be loaded. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll(page);
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  // ✅ API CALL: ek employee ka full payroll breakdown (view modal ke liye)
  const handleViewDetails = async (employeeId: string) => {
    try {
      setDetailLoading(true);
      const res = await payrollService.getById(employeeId);
      setSelectedRecord(res.data);
    } catch (err) {
      console.error("Payroll detail fetch error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ✅ API CALL: payroll record delete karna
  const handleDelete = async (employeeId: string) => {
    try {
      await payrollService.delete(employeeId);
      fetchPayroll(page); // list refresh
    } catch (err) {
      console.error("Delete payroll error:", err);
    }
  };

  // ✅ API CALL: "Process Payslip" button
  const handleProcess = async (employeeId: string) => {
    try {
      await payrollService.processPayslip(employeeId);
      fetchPayroll(page);
    } catch (err) {
      console.error("Process payslip error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#18A096] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Loading payroll...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Banner */}
      <div
        className="rounded-2xl p-6 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #18A096 0%, #12544F 100%)",
        }}
      >
        <h1 className="text-3xl font-bold">Payroll</h1>
        <p className="text-sm text-white/90 mt-1">
          Manage employee salaries deductions and payslips
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Stats Cards Grid - ✅ ab summary API se aa raha hai */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total payroll</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {currency(summary.totalPayroll)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">This Month</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-full">
            <Wallet size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-medium">Employees paid</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {summary.employeesPaid}
            </h3>
            <p className="text-xs text-gray-400 mt-1">This Month</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending payroll</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {String(summary.pendingPayroll).padStart(2, "0")}
            </h3>
            <p className="text-xs text-gray-400 mt-1">This Month</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-full">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Deductions</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {currency(summary.totalDeductions)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">This Month</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full">
            <ArrowDownCircle size={20} />
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Search employee..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#18A096]/20"
            />
          </div>
          <div className="relative">
            <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none pr-8 appearance-none">
              <option>Department</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none pr-8 appearance-none">
              <option>Status</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none pr-8 appearance-none">
              <option>Salary Month</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#18A096] text-[#18A096] hover:bg-teal-50 rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Add Payroll
          </button>
          <button
            onClick={() => rows[0] && handleProcess(rows[0].employeeId)}
            className="flex items-center gap-2 px-4 py-2 bg-[#18A096] hover:bg-[#14877e] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Process Payslip
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Employee ID</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Basic Salary</th>
                <th className="px-6 py-4 font-medium">Allowances</th>
                <th className="px-6 py-4 font-medium">Deductions</th>
                <th className="px-6 py-4 font-medium">Net Salary</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                    No payroll records found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.employeeId}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-5 text-slate-700 font-medium">
                      {row.employeeName}
                    </td>
                    <td className="px-6 py-5 text-slate-600">{row.employeeId}</td>
                    <td className="px-6 py-5 text-slate-600">{row.department}</td>
                    <td className="px-6 py-5 text-slate-600">{currency(row.basicSalary)}</td>
                    <td className="px-6 py-5 text-slate-600">{currency(row.allowances)}</td>
                    <td className="px-6 py-5 text-slate-600">{currency(row.deductions)}</td>
                    <td className="px-6 py-5 text-slate-700 font-medium">
                      {currency(row.netSalary)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={statusStyles[row.status] ?? "text-slate-600"}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(row.employeeId)}
                          aria-label={`View details for ${row.employeeName}`}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Edit record for ${row.employeeName}`}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.employeeId)}
                          aria-label={`Delete record for ${row.employeeName}`}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer - API connected */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 text-sm text-slate-500 border-t border-slate-100">
          <span>
            Showing {(page - 1) * rowsPerPage + 1} to{" "}
            {Math.min(page * rowsPerPage, totalCount)} of {totalCount} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={handlePrev}
              disabled={page === 1}
              className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#18A096] text-white font-medium text-xs">
              {page}
            </button>
            <button
              type="button"
              aria-label="Next page"
              onClick={handleNext}
              disabled={page === totalPages}
              className="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Payroll Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Payroll Details</h2>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Employee Info Header */}
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedRecord.employeeName}
                </h3>
                <p className="text-xs font-medium text-[#18A096] mt-0.5">
                  {selectedRecord.employeeId}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedRecord.department} Department &bull; {selectedRecord.designation}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Joining Date: {selectedRecord.joiningDate}
                </p>
              </div>

              <hr className="border-slate-100" />

              {/* Earnings & Deductions Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Earnings */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800">Earnings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Basic Salary</span>
                      <span className="font-medium text-slate-800">
                        {currency(selectedRecord.earningsBreakdown.basic)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>HRA</span>
                      <span className="font-medium text-slate-800">
                        {currency(selectedRecord.earningsBreakdown.hra)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Conveyance</span>
                      <span className="font-medium text-slate-800">
                        {currency(selectedRecord.earningsBreakdown.conveyance)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Other Allowances</span>
                      <span className="font-medium text-slate-800">
                        {currency(selectedRecord.earningsBreakdown.otherAllowances)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Bonus</span>
                      <span className="font-medium text-slate-800">
                        {currency(selectedRecord.earningsBreakdown.bonus)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-100 font-bold text-[#18A096]">
                    <span>Total Earnings</span>
                    <span>{currency(selectedRecord.earningsBreakdown.totalEarnings)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800">Deductions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>PF</span>
                      <span className="font-medium text-slate-800">
                        {currency(selectedRecord.deductionsBreakdown.pf)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>ESI</span>
                      <span className="font-medium text-slate-800">
                        {currency(selectedRecord.deductionsBreakdown.esi)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax</span>
                      <span className="font-medium text-slate-800">
                        {currency(selectedRecord.deductionsBreakdown.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Other Deductions</span>
                      <span className="font-medium text-slate-800">
                        {currency(selectedRecord.deductionsBreakdown.otherDeductions)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-100 font-bold text-rose-500 mt-12">
                    <span>Total Deductions</span>
                    <span>{currency(selectedRecord.deductionsBreakdown.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Salary Summary Card */}
              <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Gross Salary</span>
                  <span className="font-medium text-slate-800">
                    {currency(selectedRecord.earningsBreakdown.totalEarnings)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total Deductions</span>
                  <span className="font-medium text-rose-500">
                    - {currency(selectedRecord.deductionsBreakdown.totalDeductions)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-teal-200/60 font-bold text-lg text-slate-800">
                  <span>Net Salary</span>
                  <span className="text-[#18A096] text-xl">
                    {currency(selectedRecord.netSalary)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  alert(`Downloading payslip for ${selectedRecord.employeeName}...`)
                }
                className="flex items-center gap-2 px-5 py-2.5 bg-[#18A096] hover:bg-[#14877e] text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                <Download className="h-4 w-4" /> Download Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}