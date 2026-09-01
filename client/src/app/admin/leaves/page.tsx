"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Clock,
  XCircle,
  FileText,
  ChevronDown,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import {
  leaveService,
  LeaveRequest,
  LeaveSummary,
  LeaveStatus,
} from "@/features/admin/services/leave.service";
import { AxiosError } from "axios";

const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<{ message?: string }>;
  return (
    axiosErr.response?.data?.message ||
    `${fallback} (status: ${axiosErr.response?.status ?? "network error"})`
  );
};

const statusStyles: Record<LeaveStatus, string> = {
  pending: "bg-amber-50 text-amber-600 border border-amber-200/50",
  approved: "bg-emerald-50 text-emerald-600 border border-emerald-200/50",
  rejected: "bg-rose-50 text-rose-600 border border-rose-200/50",
  cancelled: "bg-gray-100 text-gray-500 border border-gray-200/50",
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
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  // ── Detail modal state ──
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchLeaves = useCallback(
    async (pageNum: number = 1) => {
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
    },
    [rowsPerPage]
  );

  useEffect(() => {
    fetchLeaves(page);
  }, [page, fetchLeaves]);

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const adjustSummary = (oldStatus: LeaveStatus, newStatus: LeaveStatus) => {
    setSummary((prev) => {
      const next = { ...prev };
      if (oldStatus === "pending") next.pendingRequests = Math.max(0, next.pendingRequests - 1);
      if (newStatus === "approved") next.approved += 1;
      if (newStatus === "rejected") next.rejected += 1;
      return next;
    });
  };

  const handleApprove = async (id: string) => {
    const prevRow = leaveRequests.find((r) => r.id === id);
    if (!prevRow) return;
    if (prevRow.status === "approved") return;

    setActionLoadingId(id);
    setLeaveRequests((rows) =>
      rows.map((r) =>
        r.id === id
          ? { ...r, status: "approved" as LeaveStatus, actions: { canApprove: false, canReject: false } }
          : r
      )
    );
    adjustSummary(prevRow.status, "approved");

    try {
      await leaveService.approve(id);
      await fetchLeaves(page);
      closeModal();
    } catch (err) {
      console.error("Approve leave error (full):", err);
      setLeaveRequests((rows) => rows.map((r) => (r.id === id ? prevRow : r)));
      adjustSummary("approved", prevRow.status);
      alert(getErrorMessage(err, "Failed to approve leave request"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const prevRow = leaveRequests.find((r) => r.id === id);
    if (!prevRow) return;
    if (prevRow.status === "rejected") return;

    setActionLoadingId(id);
    setLeaveRequests((rows) =>
      rows.map((r) =>
        r.id === id
          ? { ...r, status: "rejected" as LeaveStatus, actions: { canApprove: false, canReject: false } }
          : r
      )
    );
    adjustSummary(prevRow.status, "rejected");

    try {
      await leaveService.reject(id);
      await fetchLeaves(page);
      closeModal();
    } catch (err) {
      console.error("Reject leave error (full):", err);
      setLeaveRequests((rows) => rows.map((r) => (r.id === id ? prevRow : r)));
      adjustSummary("rejected", prevRow.status);
      alert(getErrorMessage(err, "Failed to reject leave request"));
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Modal open/close ──
const openModal = async (row: LeaveRequest) => {
  setModalOpen(true);
  setSelectedLeave(row); 
  setModalError(null);

  try {
    setModalLoading(true);
    const res = await leaveService.getById(row.id);
    if (res?.data) {
     
      setSelectedLeave({ ...res.data, id: row.id });
    }
  } catch (err) {
    console.error("Leave detail fetch error:", err);
    setModalError("Could not load full details — showing cached data.");
  } finally {
    setModalLoading(false);
  }
};

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLeave(null);
    setModalError(null);
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
      <div
        className="rounded-2xl p-6 text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #18A096 0%, #12544F 100%)",
        }}
      >
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

      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-225 table-fixed">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[8%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
            </colgroup>
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
                <th className="px-6 py-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaveRequests.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-5 text-slate-700 font-medium truncate">{row.employeeName}</td>
                    <td className="px-6 py-5 text-slate-600 capitalize">{row.leaveType}</td>
                    <td className="px-6 py-5 text-slate-600 text-sm">{row.from?.slice(0, 10)}</td>
                    <td className="px-6 py-5 text-slate-600 text-sm">{row.to?.slice(0, 10)}</td>
                    <td className="px-6 py-5 text-slate-600">{row.days}</td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold capitalize ${statusStyles[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => openModal(row)}
                          aria-label={`View ${row.employeeName}'s leave request`}
                          className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-500 border border-slate-200 hover:bg-[#18A096] hover:text-white hover:border-[#18A096] hover:shadow-md active:scale-95 transition-all duration-150"
                        >
                          <Eye className="h-4 w-4" strokeWidth={2.25} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {/* ── Detail / Approve-Reject Modal ── */}
      {modalOpen && selectedLeave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-6 py-5 text-white flex items-start justify-between"
              style={{ background: "linear-gradient(135deg, #18A096 0%, #12544F 100%)" }}
            >
              <div>
                <h3 className="text-lg font-bold">{selectedLeave.employeeName}</h3>
                <p className="text-sm text-white/80 capitalize">{selectedLeave.leaveType} leave</p>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="h-8 w-8 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalError && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {modalError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-1">From</p>
                  <p className="font-medium text-slate-700">{selectedLeave.from?.slice(0, 10)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">To</p>
                  <p className="font-medium text-slate-700">{selectedLeave.to?.slice(0, 10)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Days</p>
                  <p className="font-medium text-slate-700">{selectedLeave.days}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Status</p>
                  <span
                    className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold capitalize ${statusStyles[selectedLeave.status]}`}
                  >
                    {selectedLeave.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-1">Reason</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words bg-slate-50 rounded-xl p-3 border border-slate-100 max-h-40 overflow-y-auto">
                  {modalLoading ? "Loading full details…" : selectedLeave.reason || "No reason provided"}
                </p>
              </div>
            </div>

            {(() => {
              const isBusy = actionLoadingId === selectedLeave.id;
              const canApprove = selectedLeave.actions?.canApprove ?? selectedLeave.status === "pending";
              const canReject = selectedLeave.actions?.canReject ?? selectedLeave.status === "pending";

              if (!canApprove && !canReject) return null;

              return (
                <div className="flex gap-3 px-6 pb-6">
                  {canApprove && (
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedLeave.id)}
                      disabled={isBusy}
                      className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isBusy ? (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4" strokeWidth={2.5} /> Approve
                        </>
                      )}
                    </button>
                  )}
                  {canReject && (
                    <button
                      type="button"
                      onClick={() => handleReject(selectedLeave.id)}
                      disabled={isBusy}
                      className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 bg-rose-500 text-white font-semibold hover:bg-rose-600 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isBusy ? (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4" strokeWidth={2.5} /> Reject
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}