"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, X, AlertTriangle } from "lucide-react";
import {
  announcementService,
  Announcement,
  CreateAnnouncementPayload,
} from "@/features/admin/services/Announcement.service";

const AUDIENCE_OPTIONS = ["All", "IT", "Marketing"]; 

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAnnouncementPayload>({
    title: "",
    body: "",
    type: "All",
  });

  // ── Delete confirmation state ──
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ API CALL: announcements list fetch karna
  const fetchAnnouncements = useCallback(
    async (pageNum: number = 1) => {
      try {
        setLoading(true);
        setError(null);
        const res = await announcementService.getAll(pageNum, limit);
        setAnnouncements(res.data || []);
        setTotalCount(res.pagination?.total ?? res.data?.length ?? 0);
      } catch (err) {
        console.error("Announcements fetch error:", err);
        setError("Announcements could not be loaded. Please retry.");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchAnnouncements(page);
  }, [page, fetchAnnouncements]);

  // ✅ API CALL: naya announcement create karna
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setCreateError("Title and description are required.");
      return;
    }
    try {
      setCreating(true);
      setCreateError(null);
      await announcementService.create(form);
      setShowCreateModal(false);
      setForm({ title: "", body: "", type: "All" });
      setPage(1);
      fetchAnnouncements(1);
    } catch (err) {
      console.error("Create announcement error:", err);
      setCreateError("Could not create announcement. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // ── Delete: opens confirmation modal instead of deleting directly ──
  const handleDeleteClick = (item: Announcement) => {
    setDeleteTarget(item);
  };

  const closeDeleteModal = () => {
    if (deleting) return; // avoid closing mid-request
    setDeleteTarget(null);
  };

  // ✅ API CALL: announcement delete karna (runs only after confirmation)
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await announcementService.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchAnnouncements(page);
    } catch (err) {
      console.error("Delete announcement error:", err);
      setError("Could not delete announcement. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#18A096] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-linear-to-r from-[#18A096] to-[#12544F] rounded-2xl p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-sm text-white/80 mt-0.5">
            Communicate important updates to your team
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} className="text-[#18A096]" /> Create Announcement
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
          >
            {/* Top row inside card: Badges & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Audience Badge */}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {item.type}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Edit announcement: ${item.title}`)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(item)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-medium transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-gray-900">{item.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
            </div>

            {/* Footer Metadata (Author & Date) */}
            <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-50">
              <span className="font-medium text-gray-500">By {item.createdBy?.name}</span>
              <span>•</span>
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
            No announcements found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > limit && (
        <div className="flex items-center justify-end gap-3 text-sm text-slate-500">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            Page {page} of {Math.max(1, Math.ceil(totalCount / limit))}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(Math.ceil(totalCount / limit), p + 1))
            }
            disabled={page >= Math.ceil(totalCount / limit)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Create Announcement</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                  {createError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#18A096]/20"
                  placeholder="e.g. Office Closure on 28th August"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#18A096]/20 resize-none"
                  placeholder="Details employees need to know..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Audience</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none"
                >
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-[#18A096] hover:bg-[#12544F] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {creating ? "Publishing..." : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-7 space-y-5">
              <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={22} strokeWidth={2} />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Delete this announcement?
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  <span className="font-medium text-slate-700">
                    &ldquo;{deleteTarget.title}&rdquo;
                  </span>{" "}
                  will be permanently removed. This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2 min-w-[92px] justify-center"
                >
                  {deleting ? (
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Delete"
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