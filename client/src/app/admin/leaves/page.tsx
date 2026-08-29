"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  XCircle,
  FileText,
  ChevronDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  leaveService,
  LeaveRequest,
  LeaveSummary,
  LeaveStatus,
} from "@/services/leaveService";

const statusStyles: Record<LeaveStatus, string> = {
  Pending: "bg-amber-50 text-amber-600 border border-amber-200/50",
  Approved: "bg-emerald-50 text-emerald-600 border border-emerald-200/50",
  Rejected: "bg-rose-50 text-rose-600 border border-rose-200/50",
};

export default function LeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [summary, setSummary] = useState<LeaveSummary>({
    pendingRequests: 0,
    approved: 0,
    rejected: 0,
    totalRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ API CALL: leave overview fetch karna (summary + list)
  const fetchLeaves = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await leaveService.getOverview(pageNum, rowsPerPage);

      setSummary(res.data.summary);
      setLeaveRequests(res.data.leaves || []);
      setTotalCount(res.data.pagination?.total ?? res.data.leaves?.length ?? 0);
    } catch (err) {
      console.error("Leave overview fetch error:", err);
      setError("Leave requests could not be loaded. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves(page);
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  // ✅ API CALL: leave request delete karna
  const handleDelete = async (id: string) => {
    try {
      await leaveService.delete(id);
      fetchLeaves(page); // list refresh
    } catch (err) {
      console.error("Delete leave error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#18A096] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Loading leave requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #18A096 0%, #12544F 100%)",
        }}>
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <p className="text-sm text-white/90 mt-1">
          Manage and monitor employee leave requests and balance.
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
            <h3 className="text-3xl font-bold text-gray-800">{summary.pendingRequests}</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">Pending Requests</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-full">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{summary.approved}</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">Approved</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{summary.rejected}</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">Rejected</p>
          </div>
          <div className="p-3 bg-pink-50 text-pink-500 rounded-full">
            <XCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-800">{summary.totalRequests}</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">Total Requests</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-500 rounded-full">
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Employee Name</th>
                <th className="px-6 py-4 font-medium">Leave type</th>
                <th className="px-6 py-4 font-medium">
                  <span className="inline-flex items-center gap-1">
                    From <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                </th>
                <th className="px-6 py-4 font-medium">
                  <span className="inline-flex items-center gap-1">
                    To <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                </th>
                <th className="px-6 py-4 font-medium">Days</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Approver</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaveRequests.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-5 text-slate-700 font-medium">{row.employeeName}</td>
                    <td className="px-6 py-5 text-slate-600">{row.leaveType}</td>
                    <td className="px-6 py-5 text-slate-600">{row.from}</td>
                    <td className="px-6 py-5 text-slate-600">{row.to}</td>
                    <td className="px-6 py-5 text-slate-600">{row.days}</td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${statusStyles[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-600">{row.reason}</td>
                    <td className="px-6 py-5 text-slate-600">{row.approver}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`Edit ${row.employeeName}'s leave request`}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          aria-label={`Delete ${row.employeeName}'s leave request`}
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

        {/* Pagination footer - ✅ ab API se connected */}
        <div className="flex items-center justify-end gap-4 px-6 py-4 text-sm text-slate-500 border-t border-slate-100">
          <span>Rows per page:</span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
            {rowsPerPage} <ChevronDown className="h-3.5 w-3.5" />
          </span>
          <span>
            {(page - 1) * rowsPerPage + 1}-{Math.min(page * rowsPerPage, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={handlePrev}
              disabled={page === 1}
              className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next page"
              onClick={handleNext}
              disabled={page === totalPages}
              className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}