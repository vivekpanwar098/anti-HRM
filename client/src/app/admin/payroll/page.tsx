"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";
import {
  payrollService,
  PayrollRow,
  PayrollSummary,
  PayrollDetail,
  PayrollStatus,
} from "@/features/admin/services/payroll.service";

import PayrollDetailsModal from "./components/PayrollDetailsModal";

const statusStyles: Record<PayrollStatus, string> = {
  not_calculated: "text-slate-400 font-medium",
  draft: "text-slate-500 font-medium",
  calculated: "text-blue-500 font-medium",
  approved: "text-amber-500 font-medium",
  paid: "text-emerald-600 font-medium",
};

const statusLabels: Record<PayrollStatus, string> = {
  not_calculated: "Not Calculated",
  draft: "Draft",
  calculated: "Calculated",
  approved: "Approved",
  paid: "Paid",
};

const currency = (v: number | null | undefined) =>
  v == null ? "—" : `₹ ${v.toLocaleString("en-IN")}`;

const getDefaultPayrollPeriod = () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { month: lastMonth.getMonth() + 1, year: lastMonth.getFullYear() };
};
const defaultPeriod = getDefaultPayrollPeriod();

// 🔧 FIX: debounce delay — user ke typing rukne ke 350ms baad hi search fire hoga
const SEARCH_DEBOUNCE_MS = 350;

export default function PayrollPage() {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [summary, setSummary] = useState<PayrollSummary>({
    totalPayroll: 0,
    employeesPaid: 0,
    pendingPayroll: 0,
    totalDeductions: 0,
  });

  // 🔧 FIX: `loading` sirf pehli-baar (page pe kuch data hi nahi hai) full-page
  // spinner ke liye. Filter/search change hone par table wahi rehta hai, sirf
  // `refetching` (halka overlay) chalta hai — isse "reload" wala jhatka nahi lagta.
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  // 🔧 FIX: input ki value alag rakhi (turant type hote hi update hoti hai,
  // UI kabhi lag nahi karta) — actual API query sirf debounced value se chalti hai.
  const [searchInput, setSearchInput] = useState("");
  const [departmentInput, setDepartmentInput] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  const [status, setStatus] = useState("");
  const [month, setMonth] = useState(defaultPeriod.month);
  const [year, setYear] = useState(defaultPeriod.year);

  const [selectedRecord, setSelectedRecord] = useState<PayrollDetail | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Process Payslip (Bulk) modal state ──
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processDays, setProcessDays] = useState("22");
  const [processError, setProcessError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // ── Single-employee "Calculate" modal state (replaces window.prompt in handleAddPayroll) ──
  const [addPayrollRow, setAddPayrollRow] = useState<PayrollRow | null>(null);
  const [addPayrollDays, setAddPayrollDays] = useState("22");
  const [addPayrollError, setAddPayrollError] = useState<string | null>(null);
  const [addPayrollProcessing, setAddPayrollProcessing] = useState(false);

  // ── Edit unpaid leave days modal state (replaces window.prompt in handleEdit) ──
  const [editRow, setEditRow] = useState<PayrollRow | null>(null);
  const [editDays, setEditDays] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editProcessing, setEditProcessing] = useState(false);

  // 🔧 FIX: mirrors backend's isMonthLockedForGeneration — true while the
  // selected month/year is the current, still-in-progress month.
  const currentDate = new Date();
  const isSelectedMonthLocked =
    year === currentDate.getFullYear() && month === currentDate.getMonth() + 1;

  // 🔧 FIX: search input debounce — typing rukne ke SEARCH_DEBOUNCE_MS baad
  // hi `search` (jo API query mein jaata hai) update hota hai.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  // 🔧 FIX: department input bhi isi tarah debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setDepartment(departmentInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [departmentInput]);

  const isFirstLoad = useRef(true);

  const fetchPayroll = useCallback(async () => {
    try {
      // 🔧 FIX: sirf pehli dafa full-page spinner; uske baad chhota overlay
      if (isFirstLoad.current) {
        setLoading(true);
      } else {
        setRefetching(true);
      }
      setError(null);
      const res = await payrollService.getOverview({
        page,
        limit: rowsPerPage,
        search: search || undefined,
        department: department || undefined,
        status: status || undefined,
        month,
        year,
      });

      setSummary(res.data.summary);
      setRows(res.data.rows || []);
      setTotalCount(res.data.pagination?.total ?? res.data.rows?.length ?? 0);
    } catch (err) {
      console.error("Payroll overview fetch error:", err);
      setError("Payroll data could not be loaded. Please retry.");
    } finally {
      setLoading(false);
      setRefetching(false);
      isFirstLoad.current = false;
    }
  }, [page, rowsPerPage, search, department, status, month, year]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const handleViewDetails = async (row: PayrollRow) => {
    if (!row.payrollId) return;
    try {
      setDetailLoading(true);
      const res = await payrollService.getById(row.payrollId);
      setSelectedRecord(res.data);
    } catch (err) {
      console.error("Payroll detail fetch error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (row: PayrollRow) => {
    if (!row.payrollId) return;
    if (!window.confirm(`Delete the payroll record for ${row.employeeName}?`))
      return;
    try {
      await payrollService.delete(row.payrollId);
      fetchPayroll();
    } catch (err) {
      console.error("Delete payroll error:", err);
    }
  };

  // ── Edit unpaid leave days: opens centered modal instead of window.prompt ──
  const openEditModal = (row: PayrollRow) => {
    setEditRow(row);
    setEditDays("");
    setEditError(null);
  };

  const closeEditModal = () => {
    if (editProcessing) return;
    setEditRow(null);
  };

  const handleEdit = async () => {
    if (!editRow?.payrollId) return;
    const unpaidLeaveDays = Number(editDays);
    if (
      editDays.trim() === "" ||
      Number.isNaN(unpaidLeaveDays) ||
      unpaidLeaveDays < 0
    ) {
      setEditError("Enter a valid non-negative number.");
      return;
    }
    try {
      setEditProcessing(true);
      setEditError(null);
      await payrollService.update(editRow.payrollId, { unpaidLeaveDays });
      setEditRow(null);
      fetchPayroll();
    } catch (err) {
      console.error("Update payroll error:", err);
      setEditError("Failed to update payroll. Please try again.");
    } finally {
      setEditProcessing(false);
    }
  };

  const handleMarkPaid = async (row: PayrollRow) => {
    if (!row.payrollId) return;
    try {
      await payrollService.updateStatus(row.payrollId, "paid");
      fetchPayroll();
    } catch (err) {
      console.error("Mark paid error:", err);
    }
  };

  // ── Single-employee Calculate: opens centered modal instead of window.prompt ──
  const openAddPayrollModal = (row: PayrollRow) => {
    if (isSelectedMonthLocked) return;
    setAddPayrollRow(row);
    setAddPayrollDays("22");
    setAddPayrollError(null);
  };

  const closeAddPayrollModal = () => {
    if (addPayrollProcessing) return;
    setAddPayrollRow(null);
  };

  const handleAddPayroll = async () => {
    if (!addPayrollRow) return;
    // 🔧 FIX: defense in depth — even though the button is disabled, refuse
    // to fire the request if the selected period is still in progress.
    if (isSelectedMonthLocked) {
      setAddPayrollError(
        "Payroll can only be generated after the selected month has ended.",
      );
      return;
    }
    const scheduledWorkingDays = Number(addPayrollDays);
    if (
      addPayrollDays.trim() === "" ||
      Number.isNaN(scheduledWorkingDays) ||
      scheduledWorkingDays < 0
    ) {
      setAddPayrollError("Enter a valid non-negative number.");
      return;
    }
    try {
      setAddPayrollProcessing(true);
      setAddPayrollError(null);
      await payrollService.calculate({
        employeeId: addPayrollRow.employeeId,
        scheduledWorkingDays,
        month,
        year,
      });
      setAddPayrollRow(null);
      fetchPayroll();
    } catch (err) {
      console.error("Calculate payroll error:", err);
      setAddPayrollError(
        "Failed to calculate payroll. Note: the backend blocks generating payroll for a month that hasn't ended yet.",
      );
    } finally {
      setAddPayrollProcessing(false);
    }
  };

  // ── Process Payslip (Bulk): opens centered modal instead of window.prompt ──
  const openProcessModal = () => {
    if (isSelectedMonthLocked) return;
    setProcessDays("22");
    setProcessError(null);
    setShowProcessModal(true);
  };

  const closeProcessModal = () => {
    if (processing) return;
    setShowProcessModal(false);
  };

  const handleProcessPayslip = async () => {
    // 🔧 FIX: defense in depth — same guard as above.
    if (isSelectedMonthLocked) {
      setProcessError(
        "Payroll can only be generated after the selected month has ended.",
      );
      return;
    }
    const scheduledWorkingDays = Number(processDays);
    if (
      processDays.trim() === "" ||
      Number.isNaN(scheduledWorkingDays) ||
      scheduledWorkingDays < 0
    ) {
      setProcessError("Enter a valid non-negative number.");
      return;
    }
    try {
      setProcessing(true);
      setProcessError(null);
      const res = await payrollService.calculateBulk({
        scheduledWorkingDays,
        month,
        year,
      });
      setShowProcessModal(false);
      alert(
        `Processed ${res.data.processedCount} employee(s). ${res.data.skipped.length} skipped (not yet joined).`,
      );
      fetchPayroll();
    } catch (err) {
      console.error("Bulk process error:", err);
      setProcessError(
        "Failed to process payroll. Note: the backend blocks generating payroll for a month that hasn't ended yet.",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#18A096] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">
          Loading payroll...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div
        className="rounded-2xl p-6 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #18A096 0%, #12544F 100%)",
        }}
      >
        <h1 className="text-3xl font-bold">Payroll</h1>
        <p className="text-sm text-white/90 mt-1">
          Manage employee salaries, deductions and payslips
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* 🔧 FIX: banner explaining why the actions are disabled for the
          currently-selected (in-progress) month */}
      {isSelectedMonthLocked && (
        <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium">
          {month}/{year} is still in progress — payroll can be generated only
          after this month ends.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total payroll</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {currency(summary.totalPayroll)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {month}/{year}
            </p>
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
            <p className="text-xs text-gray-400 mt-1">
              {month}/{year}
            </p>
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
            <p className="text-xs text-gray-400 mt-1">
              {month}/{year}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-full">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-medium">
              Total Deductions
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {currency(summary.totalDeductions)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {month}/{year}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full">
            <ArrowDownCircle size={20} />
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            placeholder="Search employee..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="min-w-50 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#18A096]/20"
          />

          <input
            type="text"
            placeholder="Department"
            value={departmentInput}
            onChange={(e) => setDepartmentInput(e.target.value)}
            className="w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none"
          />

          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none pr-8 appearance-none"
            >
              <option value="">All Status</option>
              <option value="not_calculated">Not Calculated</option>
              <option value="calculated">Calculated</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <input
            type="month"
            value={`${year}-${String(month).padStart(2, "0")}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              if (y && m) {
                setPage(1);
                setYear(y);
                setMonth(m);
              }
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openProcessModal}
            disabled={isSelectedMonthLocked}
            title={
              isSelectedMonthLocked
                ? "Payroll can only be generated after the selected month has ended"
                : undefined
            }
            className="flex items-center gap-2 px-4 py-2 bg-[#18A096] hover:bg-[#14877e] text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#18A096]"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Process Payslip (Bulk)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden relative">
        {/* 🔧 FIX: filter change se dobara data aane tak halka overlay — table
            hata ke full-page spinner nahi dikhta, isliye "reload" jaisa jhatka nahi lagta */}
        {refetching && (
          <div className="absolute inset-0 z-10 bg-white/50 flex items-start justify-center pt-10">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#18A096] rounded-full animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Employee</th>
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
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    No employees found
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
                    <td className="px-6 py-5 text-slate-600">
                      {row.department}
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      {currency(row.basicSalary)}
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      {currency(row.allowances)}
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      {currency(row.deductions)}
                    </td>
                    <td className="px-6 py-5 text-slate-700 font-medium">
                      {currency(row.netSalary)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={statusStyles[row.status]}>
                        {statusLabels[row.status]}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        {row.status === "not_calculated" ? (
                          <button
                            type="button"
                            onClick={() => openAddPayrollModal(row)}
                            disabled={isSelectedMonthLocked}
                            className="px-2.5 h-7 rounded-md flex items-center gap-1 text-xs font-medium text-[#18A096] border border-[#18A096] hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            title={
                              isSelectedMonthLocked
                                ? "Payroll can only be generated after the selected month has ended"
                                : `Calculate payroll for ${row.employeeName}`
                            }
                          >
                            <Plus className="h-3 w-3" /> Calculate
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleViewDetails(row)}
                              aria-label={`View details for ${row.employeeName}`}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(row)}
                              aria-label={`Edit record for ${row.employeeName}`}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {row.status !== "paid" && (
                              <button
                                type="button"
                                onClick={() => handleMarkPaid(row)}
                                className="px-2 h-7 rounded-md flex items-center justify-center text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Mark as Paid"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(row)}
                              aria-label={`Delete record for ${row.employeeName}`}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {/* eye button ka modal PayrollDetailsModal component se aata hai */}
      <PayrollDetailsModal
        data={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Process Payslip (Bulk) Modal — replaces window.prompt so it's centered */}
      {showProcessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={closeProcessModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                Process Payslip (Bulk)
              </h2>
              <button
                type="button"
                onClick={closeProcessModal}
                disabled={processing}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors disabled:opacity-60"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                Scheduled working days for{" "}
                <span className="font-medium text-slate-700">
                  {month}/{year}
                </span>{" "}
                (applies to every full-month employee):
              </p>

              {processError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                  {processError}
                </div>
              )}

              <input
                type="number"
                min={0}
                value={processDays}
                onChange={(e) => setProcessDays(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#18A096]/20"
                placeholder="e.g. 22"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeProcessModal}
                  disabled={processing}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessPayslip}
                  disabled={processing}
                  className="px-5 py-2 bg-[#18A096] hover:bg-[#12544F] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2 min-w-[80px] justify-center"
                >
                  {processing ? (
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Process"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single-employee Calculate Modal — replaces window.prompt so it's centered */}
      {addPayrollRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={closeAddPayrollModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                Calculate Payroll
              </h2>
              <button
                type="button"
                onClick={closeAddPayrollModal}
                disabled={addPayrollProcessing}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors disabled:opacity-60"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                Scheduled working days for{" "}
                <span className="font-medium text-slate-700">
                  {addPayrollRow.employeeName}
                </span>{" "}
                (
                <span className="font-medium text-slate-700">
                  {month}/{year}
                </span>
                ):
              </p>

              {addPayrollError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                  {addPayrollError}
                </div>
              )}

              <input
                type="number"
                min={0}
                value={addPayrollDays}
                onChange={(e) => setAddPayrollDays(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#18A096]/20"
                placeholder="e.g. 22"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddPayrollModal}
                  disabled={addPayrollProcessing}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPayroll}
                  disabled={addPayrollProcessing}
                  className="px-5 py-2 bg-[#18A096] hover:bg-[#12544F] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2 min-w-[80px] justify-center"
                >
                  {addPayrollProcessing ? (
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Calculate"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Unpaid Leave Days Modal — replaces window.prompt so it's centered */}
      {editRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                Correct Unpaid Leave Days
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={editProcessing}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors disabled:opacity-60"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                Unpaid leave days for{" "}
                <span className="font-medium text-slate-700">
                  {editRow.employeeName}
                </span>{" "}
                — current deduction:{" "}
                <span className="font-medium text-slate-700">
                  {currency(editRow.deductions)}
                </span>
              </p>

              {editError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                  {editError}
                </div>
              )}

              <input
                type="number"
                min={0}
                value={editDays}
                onChange={(e) => setEditDays(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#18A096]/20"
                placeholder="e.g. 2"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editProcessing}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={editProcessing}
                  className="px-5 py-2 bg-[#18A096] hover:bg-[#12544F] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-2 min-w-[80px] justify-center"
                >
                  {editProcessing ? (
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}