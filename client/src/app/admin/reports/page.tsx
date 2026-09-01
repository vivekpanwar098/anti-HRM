"use client";

import React, { useState, useEffect } from "react";
import {
  FileBarChart2,
  Download,
  Eye,
  Plus,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import {
  reportService,
  ReportActivity,
  ReportSummary,
} from "@/features/admin/services/reports.service";

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
};

// ---------------------------------------------------------------------------
// Coming Soon modal (shown instead of Create Report form)
// ---------------------------------------------------------------------------

interface ComingSoonModalProps {
  onClose: () => void;
}

function ComingSoonModal({ onClose }: ComingSoonModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">New Report</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50"
            aria-label="Close"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#62FFF3]/20 flex items-center justify-center mb-4">
            <FileBarChart2 className="w-7 h-7 text-[#12544F]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-sm text-gray-500">
            Report creation feature is currently under development. It will be
            available soon.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#18A096] hover:bg-[#12544F]"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportActivity[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalReports: 0,
    totalDownloads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportService.getOverview();
      setSummary(res.data.summary);
      setReports(res.data.recentReports || []);
    } catch (err) {
      console.error("Reports overview fetch error:", err);
      setError("Reports could not be loaded. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = async (report: ReportActivity) => {
    try {
      setDownloadingId(report.id);
      const blob = await reportService.download(report.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = report.name.toLowerCase().endsWith(".pdf")
        ? report.name
        : `${report.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      // Downloads counter only updates server-side, refresh to reflect it
      fetchReports();
    } catch (err) {
      console.error("Download report error:", err);
      setError("Failed to download report. Please retry.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (report: ReportActivity) => {
    if (!window.confirm(`Delete "${report.name}"? This cannot be undone.`)) return;
    try {
      setDeletingId(report.id);
      await reportService.remove(report.id);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      setSummary((prev) => ({ ...prev, totalReports: Math.max(0, prev.totalReports - 1) }));
    } catch (err) {
      console.error("Delete report error:", err);
      setError("Failed to delete report. Please retry.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#18A096] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-[#18A096] to-[#12544F] rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <button
          onClick={() => setShowComingSoon(true)}
          className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#62FFF3]/20 flex items-center justify-center shrink-0">
            <FileBarChart2 className="w-6 h-6 text-[#12544F]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Total Reports</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalReports}</p>
            <p className="text-sm text-gray-400">All Time</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#18A096]/10 flex items-center justify-center shrink-0">
            <Download className="w-6 h-6 text-[#18A096]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Downloads</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalDownloads}</p>
            <p className="text-sm text-gray-400">All time</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-5">Recent Reports</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="py-3 pr-4">Report Name</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Period</th>
                <th className="py-3 pr-4">Generated By</th>
                <th className="py-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-4 pr-4 text-sm font-medium text-gray-900">{report.name}</td>
                  <td className="py-4 pr-4 text-sm text-gray-500">{report.type}</td>
                  <td className="py-4 pr-4 text-sm text-gray-500">
                    {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                  </td>
                  <td className="py-4 pr-4 text-sm text-gray-500">{report.generatedBy}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        style={{ backgroundColor: "rgba(24,160,150,0.1)", color: "#18A096" }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={downloadingId === report.id}
                        title="Download"
                        type="button"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "rgba(24,160,150,0.1)", color: "#18A096" }}
                      >
                        {downloadingId === report.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(report)}
                        disabled={deletingId === report.id}
                        title="Delete"
                        type="button"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 bg-red-50 text-red-500"
                      >
                        {deletingId === report.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showComingSoon && (
        <ComingSoonModal onClose={() => setShowComingSoon(false)} />
      )}
    </div>
  );
}