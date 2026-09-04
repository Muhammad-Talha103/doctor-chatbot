"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "../AdminSidebar";

export type MessageStatus = "Pending" | "Resolved" | "Cancelled";

export type ContactMessage = {
  id: string | number;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  resolution_cancellation_details?: string;
  resolved_cancelled_at?: string;
  resolved_cancelled_by?: string;
};

// Raw database record structure from Supabase
type SupabaseContactMessage = {
  id: string | number;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status?: MessageStatus | null;
  resolution_cancellation_details?: string | null;
  resolved_cancelled_at?: string | null;
  resolved_cancelled_by?: string | null;
};

type UpdatePayload = {
  status: "Resolved" | "Cancelled";
  resolution_cancellation_details: string;
  resolved_cancelled_at: string;
  resolved_cancelled_by: string;
};

function Badge({ value }: { value: string }) {
  const tone =
    value === "Cancelled"
      ? "bg-red-50 text-red-700 border-red-200"
      : value === "Pending"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tone}`}
    >
      {value}
    </span>
  );
}

function formatDisplayDate(dateStr?: string) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getCurrentDateTimeLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AdminMessages() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<string | number | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editing Drawer State
  const [editingItem, setEditingItem] = useState<ContactMessage | null>(null);
  const [editStatus, setEditStatus] = useState<"Resolved" | "Cancelled">("Resolved");
  const [editDetails, setEditDetails] = useState<string>("");
  const [editResolvedCancelledAt, setEditResolvedCancelledAt] = useState<string>("");
  const [editResolvedCancelledBy, setEditResolvedCancelledBy] = useState<string>("Admin");

  useEffect(() => {
    if (sessionStorage.getItem("admin_authenticated") !== "true") {
      window.location.href = "/admin/login";
    } else {
      fetchMessagesFromSupabase();
    }
  }, []);

  // Fetch messages directly from Supabase
  async function fetchMessagesFromSupabase() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        showToast("Failed to fetch messages from Supabase!");
      } else {
        const rawData = (data || []) as SupabaseContactMessage[];
        const formattedData: ContactMessage[] = rawData.map((msg) => ({
          id: msg.id,
          created_at: msg.created_at,
          name: msg.name,
          email: msg.email,
          phone: msg.phone,
          subject: msg.subject,
          message: msg.message,
          status: msg.status || "Pending",
          resolution_cancellation_details: msg.resolution_cancellation_details || undefined,
          resolved_cancelled_at: msg.resolved_cancelled_at || undefined,
          resolved_cancelled_by: msg.resolved_cancelled_by || undefined,
        }));
        setMessagesList(formattedData);
      }
    } catch {
      showToast("An unexpected error occurred while fetching messages.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("admin_authenticated");
    window.location.href = "/admin/login";
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }

  function handleOpenEdit(msg: ContactMessage) {
    setEditingItem(msg);
    setEditStatus(msg.status === "Cancelled" ? "Cancelled" : "Resolved");
    setEditDetails(msg.resolution_cancellation_details || "");
    setEditResolvedCancelledAt(
      msg.resolved_cancelled_at
        ? new Date(msg.resolved_cancelled_at).toISOString().slice(0, 16)
        : getCurrentDateTimeLocal()
    );
    setEditResolvedCancelledBy(msg.resolved_cancelled_by || "Admin");
  }

  function handleSetNow() {
    setEditResolvedCancelledAt(getCurrentDateTimeLocal());
  }

  // Update Supabase with exact Column Names
  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);

    const updatePayload: UpdatePayload = {
      status: editStatus,
      resolution_cancellation_details: editDetails,
      resolved_cancelled_at: editResolvedCancelledAt
        ? new Date(editResolvedCancelledAt).toISOString()
        : new Date().toISOString(),
      resolved_cancelled_by: editResolvedCancelledBy || "Admin",
    };

    try {
      const { error } = await supabase
        .from("contact_messages")
        .update(updatePayload)
        .eq("id", editingItem.id)
        .select();

      if (error) {
        showToast("Error updating status in Supabase!");
      } else {
        setMessagesList((prev) =>
          prev.map((item) => {
            if (item.id === editingItem.id) {
              return {
                ...item,
                ...updatePayload,
              };
            }
            return item;
          })
        );

        setEditingItem(null);
        showToast(`Status updated to ${editStatus} successfully!`);
      }
    } catch {
      showToast("Something went wrong while saving!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4fbfa] text-[#12383a]">
      {/* Reusable Admin Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Top Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-[#00a7a0] px-4 py-3 text-white shadow-xl"
          >
            <CheckCircle2 size={18} />
            <p className="text-sm font-medium">{toastMessage}</p>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 rounded-lg p-1 hover:bg-white/20 transition"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Drawer */}
      <AnimatePresence>
        {editingItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setEditingItem(null)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-[#dcefed]"
            >
              <div className="flex h-20 items-center justify-between border-b border-[#edf5f4] px-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#12383a]">Update Message Status</h3>
                  <p className="text-xs text-[#789a9a]">{editingItem.name}</p>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  disabled={saving}
                  className="rounded-lg p-2 text-[#789a9a] hover:bg-[#f4fbfa]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col justify-between p-6 overflow-y-auto space-y-6">
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#dcefed] bg-[#f8fcfb] p-3.5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#00a7a0]">
                      User Inquiry Snapshot
                    </p>
                    <p className="text-xs text-[#12383a]">
                      <span className="font-semibold">Subject:</span> {editingItem.subject}
                    </p>
                    <p className="text-xs text-[#789a9a] leading-relaxed italic bg-white p-2.5 rounded-lg border border-[#e8f3f2]">
                      "{editingItem.message}"
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#789a9a] mb-2">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as "Resolved" | "Cancelled")}
                      className="w-full rounded-xl border border-[#dcefed] bg-[#f8fcfb] p-3 text-sm text-[#12383a] focus:border-[#00a7a0] focus:outline-none font-medium"
                    >
                      <option value="Resolved">Resolved</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#789a9a] mb-2">
                      {editStatus === "Cancelled" ? "Cancelled At" : "Resolved At"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        value={editResolvedCancelledAt}
                        onChange={(e) => setEditResolvedCancelledAt(e.target.value)}
                        className="w-full rounded-xl border border-[#dcefed] bg-[#f8fcfb] p-3 text-sm text-[#12383a] focus:border-[#00a7a0] focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleSetNow}
                        className="flex items-center gap-1.5 rounded-xl bg-[#e5f8f6] px-3 text-xs font-semibold text-[#008e89] hover:bg-[#d0f3ef] transition shrink-0"
                      >
                        <Clock size={14} />
                        Now
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#789a9a] mb-2">
                      {editStatus === "Cancelled" ? "Cancellation Reason" : "Resolution Details"}
                    </label>
                    <textarea
                      rows={3}
                      value={editDetails}
                      onChange={(e) => setEditDetails(e.target.value)}
                      placeholder={
                        editStatus === "Cancelled"
                          ? "State the reason for cancelling..."
                          : "Provide details about how this request was resolved..."
                      }
                      className="w-full rounded-xl border border-[#dcefed] bg-[#f8fcfb] p-3 text-sm text-[#12383a] focus:border-[#00a7a0] focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#789a9a] mb-2">
                      {editStatus === "Cancelled" ? "Cancelled By" : "Resolved By"}
                    </label>
                    <input
                      type="text"
                      value={editResolvedCancelledBy}
                      onChange={(e) => setEditResolvedCancelledBy(e.target.value)}
                      className="w-full rounded-xl border border-[#dcefed] bg-[#f8fcfb] p-3 text-sm text-[#12383a] focus:border-[#00a7a0] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#edf5f4] flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    disabled={saving}
                    className="w-1/2 rounded-xl border border-[#dcefed] py-3 text-sm font-semibold text-[#789a9a] hover:bg-[#f4fbfa] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 flex items-center justify-center gap-2 rounded-xl bg-[#00a7a0] py-3 text-sm font-semibold text-white hover:bg-[#008e89] transition shadow-xs disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Viewport */}
      <div
        className={`${
          collapsed ? "md:pl-20" : "md:pl-64"
        } min-h-screen transition-all duration-300`}
      >
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#dcefed] bg-white/90 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-[#dcefed] p-2 text-[#789a9a] hover:bg-[#f4fbfa] md:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs text-[#789a9a] sm:text-sm">Good morning, Doctor</p>
              <h1 className="text-lg font-semibold sm:text-xl">Contact Messages</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="rounded-xl p-2 text-[#789a9a] hover:bg-red-50 hover:text-red-600 md:hidden"
            >
              <LogOut size={19} />
            </button>
            <div className="grid size-10 place-items-center rounded-full bg-[#d7f3ef] font-semibold text-[#008e89]">
              AM
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          <section className="overflow-hidden rounded-2xl border border-[#dcefed] bg-white shadow-sm">
            <div className="border-b border-[#edf5f4] p-4 sm:p-5 flex justify-between items-center">
              <div>
                <h2 className="font-semibold">Contact messages</h2>
                <p className="mt-1 text-sm text-[#789a9a]">
                  Track patient enquiries and resolutions
                </p>
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#00a7a0]">
                  <Loader2 size={16} className="animate-spin" />
                  Fetching...
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-[#f8fcfb] text-xs uppercase tracking-wide text-[#789a9a]">
                  <tr>
                    {[
                      "Created",
                      "Name",
                      "Subject",
                      "Phone",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th className="px-5 py-4 font-medium" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf5f4]">
                  {!loading && messagesList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[#789a9a]">
                        No contact messages found.
                      </td>
                    </tr>
                  ) : (
                    messagesList.map((m) => {
                      const isExpanded = expanded === m.id;
                      const isPending = (m.status || "Pending") === "Pending";

                      return (
                        <React.Fragment key={m.id}>
                          <tr className="transition hover:bg-[#fbfefd]">
                            <td className="px-5 py-4 whitespace-nowrap text-xs text-[#789a9a]">
                              {formatDisplayDate(m.created_at)}
                            </td>
                            <td className="px-5 py-4 font-semibold whitespace-nowrap">
                              <div>{m.name}</div>
                              <div className="text-xs font-normal text-[#789a9a]">{m.email}</div>
                            </td>
                            <td className="px-5 py-4 font-medium max-w-[200px] truncate">
                              {m.subject}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">{m.phone || "—"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <Badge value={m.status || "Pending"} />
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <button
                                  title={isPending ? "Cannot view details for pending message" : "View Details"}
                                  disabled={isPending}
                                  onClick={() => setExpanded(isExpanded ? null : m.id)}
                                  className={`rounded-lg p-2 transition ${
                                    isPending
                                      ? "text-[#c6d8d7] cursor-not-allowed"
                                      : isExpanded
                                      ? "bg-[#00a7a0] text-white"
                                      : "text-[#789a9a] hover:bg-[#e5f8f6] hover:text-[#008e89]"
                                  }`}
                                >
                                  <Eye size={17} />
                                </button>

                                <button
                                  title="Edit Status"
                                  onClick={() => handleOpenEdit(m)}
                                  className="rounded-lg p-2 text-[#789a9a] hover:bg-[#e5f8f6] hover:text-[#008e89] transition"
                                >
                                  <Edit2 size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Collapsible Details Row */}
                          <AnimatePresence>
                            {isExpanded && !isPending && (
                              <tr>
                                <td colSpan={6} className="p-0 border-b border-[#edf5f4]">
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="overflow-hidden bg-[#f8fcfb]"
                                  >
                                    <div className="px-6 py-5 space-y-4">
                                      {/* User Original Message */}
                                      <div className="rounded-xl border border-[#dcefed] bg-white p-4 space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[#00a7a0]">
                                          Original User Message
                                        </p>
                                        <p className="text-sm font-semibold text-[#12383a]">
                                          Subject: {m.subject}
                                        </p>
                                        <p className="text-sm text-[#12383a] leading-relaxed whitespace-pre-wrap bg-[#f8fcfb] p-3 rounded-lg border border-[#edf5f4]">
                                          {m.message}
                                        </p>
                                      </div>

                                      {/* Resolution / Cancellation Info */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                                        <div className="rounded-xl border border-[#dcefed] bg-white p-3.5 shadow-2xs">
                                          <p className="text-[#789a9a] font-medium mb-1">
                                            {m.status === "Cancelled"
                                              ? "Cancellation Reason"
                                              : "Resolution Details"}
                                          </p>
                                          <p className="text-[#12383a] font-semibold">
                                            {m.resolution_cancellation_details || "No details available."}
                                          </p>
                                        </div>

                                        <div className="rounded-xl border border-[#dcefed] bg-white p-3.5 shadow-2xs">
                                          <p className="text-[#789a9a] font-medium mb-1">
                                            {m.status === "Cancelled" ? "Cancelled At" : "Resolved At"}
                                          </p>
                                          <p className="text-[#12383a] font-semibold">
                                            {formatDisplayDate(m.resolved_cancelled_at)}
                                          </p>
                                        </div>

                                        <div className="rounded-xl border border-[#dcefed] bg-white p-3.5 shadow-2xs">
                                          <p className="text-[#789a9a] font-medium mb-1">
                                            {m.status === "Cancelled" ? "Cancelled By" : "Resolved By"}
                                          </p>
                                          <p className="text-[#12383a] font-semibold">
                                            {m.resolved_cancelled_by || "—"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}