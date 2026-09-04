"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  Menu,
  Pencil,
  RefreshCw,
  Search,
  UserCheck,
  Video,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AdminSidebar from "../AdminSidebar";

export type Appointment = {
  id: string | number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  whatsapp_number: string;
  patient_location: string;
  disease_summary: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  payment_method: string;
  payment_status: string;
  appointment_type: string;
  created_at: string;
};

function formatCreatedDate(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr === "N/A") return "N/A";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date
      .toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "")
      .replace(" at", " ·");
  } catch {
    return dateStr;
  }
}

function formatTo12Hour(timeStr: string | null | undefined): string {
  if (!timeStr || timeStr === "N/A") return "N/A";

  const trimmed = timeStr.trim();
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
  const match = trimmed.match(timeRegex);

  if (!match) return trimmed;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
}

function parseTo24Hour(timeStr: string | null | undefined): string {
  if (!timeStr) return "00:00:00";

  const trimmed = timeStr.trim().toUpperCase();

  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(trimmed)) {
    return trimmed.length === 5 ? `${trimmed}:00` : trimmed;
  }

  const regex = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/;
  const match = trimmed.match(regex);

  if (!match) return trimmed;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] || "00";
  const period = match[3];

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const formattedHours = hours.toString().padStart(2, "0");
  return `${formattedHours}:${minutes}:00`;
}

function formatPaymentMethod(method: string | null | undefined): string {
  if (!method || method.trim() === "" || method.trim().toUpperCase() === "N/A") {
    return "Cash";
  }
  return method;
}

function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

function Badge({ value }: { value: string }) {
  const isCompleted = value?.toLowerCase() === "completed";
  const tone =
    value === "Cancelled"
      ? "bg-red-50 text-red-700 border-red-200"
      : value === "Pending"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tone}`}
    >
      {isCompleted && <Check size={13} className="shrink-0 stroke-[2.5]" />}
      <span>{value}</span>
    </span>
  );
}

function AppointmentTypeBadge({ type }: { type: string }) {
  const isOnline = (type || "").toLowerCase().includes("online");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        isOnline
          ? "bg-sky-50 text-sky-700 border-sky-200"
          : "bg-purple-50 text-purple-700 border-purple-200"
      }`}
    >
      {isOnline ? (
        <>
          <Video size={13} className="shrink-0" />
          <span>Online</span>
        </>
      ) : (
        <>
          <UserCheck size={13} className="shrink-0" />
          <span>In Person</span>
        </>
      )}
    </span>
  );
}

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [expanded, setExpanded] = useState<string | number | null>(null);
  const [drawer, setDrawer] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState<{
    status: string;
    payment_status: string;
    appointment_date: string;
    appointment_time: string;
    disease_summary: string;
  }>({
    status: "Pending",
    payment_status: "Pending",
    appointment_date: "",
    appointment_time: "",
    disease_summary: "",
  });

  useEffect(() => {
    if (sessionStorage.getItem("admin_authenticated") !== "true") {
      window.location.href = "/admin/login";
    } else {
      fetchAppointments();
    }
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    setFetchError(null);

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setFetchError(error.message);
      } else {
        setAppointments(data || []);
      }
    } catch {
      setFetchError("An unexpected error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEditDrawer(app: Appointment) {
    setDrawer(app);
    setEditFormData({
      status: app.status || "Pending",
      payment_status: app.payment_status || "Pending",
      appointment_date: app.appointment_date || "",
      appointment_time: formatTo12Hour(app.appointment_time),
      disease_summary: app.disease_summary || "",
    });
  }

  async function saveChanges() {
    if (!drawer) return;

    setSaving(true);
    const formattedTimeForDb = parseTo24Hour(editFormData.appointment_time);

    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: editFormData.status,
          payment_status: editFormData.payment_status,
          appointment_date: editFormData.appointment_date,
          appointment_time: formattedTimeForDb,
          disease_summary: editFormData.disease_summary,
        })
        .eq("id", drawer.id);

      if (error) {
        triggerToast("Failed to save changes: " + error.message);
      } else {
        setAppointments((prev) =>
          prev.map((item) =>
            item.id === drawer.id
              ? {
                  ...item,
                  status: editFormData.status,
                  payment_status: editFormData.payment_status,
                  appointment_date: editFormData.appointment_date,
                  appointment_time: formattedTimeForDb,
                  disease_summary: editFormData.disease_summary,
                }
              : item
          )
        );

        triggerToast("✓ Changes Saved Successfully");
        setDrawer(null);
      }
    } catch {
      triggerToast("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  function triggerToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchesSearch = `${a.patient_name} ${a.patient_phone} ${a.status} ${a.patient_email} ${formatPaymentMethod(a.payment_method)}`
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (a.status || "").toLowerCase() === statusFilter.toLowerCase();

      const matchesPayment =
        paymentFilter === "All" ||
        (a.payment_status || "").toLowerCase() === paymentFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [query, statusFilter, paymentFilter, appointments]);

  return (
    <div className="flex min-h-screen bg-[#f4fbfa] text-[#12383a]">
      {/* Admin Sidebar Component */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 min-w-0 min-h-screen transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#dcefed] bg-white/90 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-[#dcefed] p-2 text-[#789a9a] md:hidden hover:bg-[#e5f8f6] hover:text-[#00a7a0]"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs text-[#789a9a] sm:text-sm">Good morning, Doctor</p>
              <h1 className="text-lg font-semibold sm:text-xl">Appointments</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAppointments}
              title="Refresh Data"
              className="rounded-xl border border-[#dcefed] p-2 text-[#789a9a] hover:bg-[#e5f8f6] hover:text-[#00a7a0] transition"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="grid size-10 place-items-center rounded-full bg-[#d7f3ef] font-semibold text-[#008e89]">
              AM
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          {fetchError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {fetchError}
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-[#dcefed] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#edf5f4] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold">Recent appointments</h2>
                <p className="mt-1 text-sm text-[#789a9a]">
                  Review and manage patient bookings
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <label className="flex flex-1 min-w-[180px] items-center gap-2 rounded-xl border border-[#dcefed] px-3 py-2 text-sm text-[#789a9a] focus-within:border-[#00a7a0]">
                  <Search size={16} className="shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search patients..."
                    className="w-full bg-transparent outline-none"
                  />
                </label>

                <div className="flex items-center gap-1.5 rounded-xl border border-[#dcefed] px-2.5 py-2 text-xs font-medium text-[#12383a]">
                  <Filter size={14} className="text-[#789a9a] shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 rounded-xl border border-[#dcefed] px-2.5 py-2 text-xs font-medium text-[#12383a]">
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer"
                  >
                    <option value="All">All Payments</option>
                    <option value="Pending">Payment Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-[#789a9a]">
                <Loader2 className="animate-spin mb-2" size={28} />
                <p className="text-sm">Fetching appointments from Supabase...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-[#789a9a]">
                <p className="text-base font-medium">No appointments found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-[#f8fcfb] text-xs uppercase tracking-wide text-[#789a9a]">
                    <tr>
                      {[
                        "Patient",
                        "Phone",
                        "APP. Date",
                        "APP. Time",
                        "APP. Type",
                        "Status",
                        "Payment",
                        "Actions",
                      ].map((h) => (
                        <th className="px-5 py-4 font-medium" key={h}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf5f4]">
                    {filtered.map((a) => {
                      const isSameWhatsapp =
                        a.whatsapp_number && a.whatsapp_number === a.patient_phone;
                      const isOpen = expanded === a.id;
                      const formattedTime = formatTo12Hour(a.appointment_time);
                      const formattedPayment = formatPaymentMethod(a.payment_method);
                      const formattedCreatedDate = formatCreatedDate(a.created_at);

                      return (
                        <React.Fragment key={a.id}>
                          <tr className="transition hover:bg-[#fbfefd]">
                            <td className="px-5 py-4 font-semibold">
                              {a.patient_name || "N/A"}
                              <span className="block text-xs font-normal text-[#789a9a]">
                                {a.patient_email || "N/A"}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{a.patient_phone || "N/A"}</span>
                                {isSameWhatsapp && a.whatsapp_number && (
                                  <a
                                    href={`https://wa.me/${a.whatsapp_number.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Same WhatsApp Number"
                                    className="text-emerald-600 hover:text-emerald-700 transition-colors"
                                  >
                                    <WhatsAppIcon className="size-4" />
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              {a.appointment_date || "N/A"}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap font-medium">
                              {formattedTime}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <AppointmentTypeBadge type={a.appointment_type || "In Person"} />
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <Badge value={a.status || "Pending"} />
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <Badge value={a.payment_status || "Pending"} />
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setExpanded(isOpen ? null : a.id)}
                                  className="rounded-lg p-2 text-[#789a9a] hover:bg-[#e5f8f6] hover:text-[#008e89] transition-colors"
                                >
                                  {isOpen ? (
                                    <EyeOff size={17} className="text-red-500" />
                                  ) : (
                                    <Eye size={17} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleOpenEditDrawer(a)}
                                  className="rounded-lg p-2 text-[#789a9a] hover:bg-[#e5f8f6] hover:text-[#008e89] transition-colors"
                                >
                                  <Pencil size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Detail Row */}
                          <tr>
                            <td colSpan={8} className="p-0 border-0">
                              <AnimatePresence initial={false}>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.28, ease: "easeInOut" }}
                                    className="overflow-hidden bg-[#f8fcfb]"
                                  >
                                    <div className="px-5 py-5 border-b border-[#edf5f4]">
                                      <div className="grid gap-4 text-sm sm:grid-cols-2 md:grid-cols-4">
                                        <div>
                                          <p className="text-xs text-[#789a9a]">Location</p>
                                          <p className="mt-1 font-medium">{a.patient_location || "N/A"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-[#789a9a]">Payment method</p>
                                          <p className="mt-1 font-medium capitalize">{formattedPayment}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-[#789a9a]">Created</p>
                                          <p className="mt-1 font-medium">{formattedCreatedDate}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                          <p className="text-xs text-[#789a9a]">Disease summary</p>
                                          <p className="mt-1 font-medium">{a.disease_summary || "N/A"}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Edit Drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(null)}
              className="fixed inset-0 z-40 bg-black/30"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-[#dcefed] bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Edit appointment</h2>
                  <p className="text-sm text-[#789a9a]">{drawer.patient_name}</p>
                </div>
                <button
                  onClick={() => setDrawer(null)}
                  className="rounded-xl p-2 hover:bg-[#f4fbfa]"
                >
                  <X size={19} />
                </button>
              </div>
              <div className="mt-8 space-y-5">
                <label className="block text-sm font-medium">
                  Status
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-[#dcefed] bg-white px-3 py-3 outline-none focus:border-[#00a7a0]"
                  >
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Payment status
                  <select
                    value={editFormData.payment_status}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, payment_status: e.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-[#dcefed] bg-white px-3 py-3 outline-none focus:border-[#00a7a0]"
                  >
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Refunded</option>
                  </select>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block text-sm font-medium">
                    Date
                    <input
                      type="date"
                      value={editFormData.appointment_date}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, appointment_date: e.target.value }))
                      }
                      className="mt-2 w-full rounded-xl border border-[#dcefed] px-3 py-3 outline-none focus:border-[#00a7a0]"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Time
                    <input
                      type="text"
                      placeholder="e.g. 8:00 PM"
                      value={editFormData.appointment_time}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, appointment_time: e.target.value }))
                      }
                      className="mt-2 w-full rounded-xl border border-[#dcefed] px-3 py-3 outline-none focus:border-[#00a7a0]"
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium">
                  Disease summary
                  <textarea
                    value={editFormData.disease_summary}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, disease_summary: e.target.value }))
                    }
                    rows={5}
                    className="mt-2 w-full resize-none rounded-xl border border-[#dcefed] p-3 outline-none focus:border-[#00a7a0]"
                  />
                </label>
                <button
                  disabled={saving}
                  onClick={saveChanges}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#00a7a0] py-3 font-semibold text-white transition hover:bg-[#008e89] disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed right-5 top-5 z-50 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${
              toast.includes("Failed") ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}