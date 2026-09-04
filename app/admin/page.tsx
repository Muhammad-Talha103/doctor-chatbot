"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Menu,
  MessageSquare,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { createClient } from "@supabase/supabase-js";
import AdminSidebar from "./AdminSidebar";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type MonthlyData = {
  month: string;
  appointments: number;
  messages: number;
};

type StatusDistribution = {
  name: string;
  value: number;
  color: string;
};

type WeeklyData = {
  day: string;
  count: number;
};

type RecentActivity = {
  id: string | number;
  type: "Appointment" | "Message";
  name: string;
  subjectOrDoctor: string;
  status: string;
  date: string;
};

export default function AdminDashboardMain() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Metrics State
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [pendingAppointments, setPendingAppointments] = useState<number>(0);
  const [pendingMessages, setPendingMessages] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Dynamic Chart States
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyData[]>([]);
  const [statusDist, setStatusDist] = useState<StatusDistribution[]>([]);
  const [weeklyDensity, setWeeklyDensity] = useState<WeeklyData[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("admin_authenticated") !== "true") {
      window.location.href = "/admin/login";
      return;
    }

    fetchDashboardMetrics();

    const appointmentSub = supabase
      .channel("realtime-appointments")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        fetchDashboardMetrics();
      })
      .subscribe();

    const messageSub = supabase
      .channel("realtime-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => {
        fetchDashboardMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentSub);
      supabase.removeChannel(messageSub);
    };
  }, []);

  async function fetchDashboardMetrics() {
    setLoading(true);
    try {
      const [{ count: appCount, data: appData }, { count: msgCount, data: msgData }] = await Promise.all([
        supabase.from("appointments").select("*", { count: "exact" }).order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*", { count: "exact" }).order("created_at", { ascending: false }),
      ]);

      const appointments = appData || [];
      const messages = msgData || [];

      setTotalAppointments(appCount || 0);
      setTotalMessages(msgCount || 0);

      // Pending Appointments (Case-insensitive & Null checks)
      setPendingAppointments(
        appointments.filter((a) => a.status === "Pending" || a.status === "pending" || !a.status).length
      );

      // Pending Messages (Case-insensitive & Null checks according to Contact Messages DB)
      setPendingMessages(
        messages.filter((m) => m.status === "Pending" || m.status === "pending" || !m.status).length
      );

      // 1. Process Recent Activities
      const formattedApps: RecentActivity[] = appointments.slice(0, 3).map((a) => ({
        id: a.id,
        type: "Appointment",
        name: a.patient_name || a.name || "Patient",
        subjectOrDoctor: a.doctor_name || a.department || "Consultation",
        status: a.status || "Pending",
        date: a.created_at || new Date().toISOString(),
      }));

      const formattedMsgs: RecentActivity[] = messages.slice(0, 3).map((m) => ({
        id: m.id,
        type: "Message",
        name: m.name || "User",
        subjectOrDoctor: m.subject || "General Inquiry",
        status: m.status || "Pending",
        date: m.created_at || new Date().toISOString(),
      }));

      setRecentActivities(
        [...formattedApps, ...formattedMsgs]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
      );

      // 2. Compute Dynamic Status Distribution
      const statusCounts = appointments.reduce((acc: Record<string, number>, item) => {
        const st = item.status || "Pending";
        acc[st] = (acc[st] || 0) + 1;
        return acc;
      }, {});

      const totalApps = appointments.length || 1;
      const computedStatus: StatusDistribution[] = [
        { name: "Confirmed", value: Math.round(((statusCounts["Confirmed"] || 0) / totalApps) * 100), color: "#00a7a0" },
        { name: "Pending", value: Math.round(((statusCounts["Pending"] || 0) / totalApps) * 100), color: "#f59e0b" },
        { name: "Completed", value: Math.round(((statusCounts["Completed"] || 0) / totalApps) * 100), color: "#10b981" },
        { name: "Cancelled", value: Math.round(((statusCounts["Cancelled"] || 0) / totalApps) * 100), color: "#ef4444" },
      ];
      setStatusDist(computedStatus);

      // 3. Compute Weekly Density
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];

      appointments.forEach((a) => {
        if (a.created_at) {
          const dayIndex = new Date(a.created_at).getDay();
          dayCounts[dayIndex]++;
        }
      });

      const computedWeekly: WeeklyData[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
        const idx = days.indexOf(day);
        return { day, count: dayCounts[idx] };
      });
      setWeeklyDensity(computedWeekly);

      // 4. Compute Monthly Dynamic Aggregation
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyAgg = months.map((month) => ({ month, appointments: 0, messages: 0 }));

      appointments.forEach((a) => {
        if (a.created_at) {
          const mIdx = new Date(a.created_at).getMonth();
          monthlyAgg[mIdx].appointments++;
        }
      });

      messages.forEach((m) => {
        if (m.created_at) {
          const mIdx = new Date(m.created_at).getMonth();
          monthlyAgg[mIdx].messages++;
        }
      });

      setMonthlyTrend(monthlyAgg.slice(0, new Date().getMonth() + 1));
    } catch (err) {
      console.error("Dashboard metrics error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4fbfa] text-[#12383a]">
      {/* Shared Admin Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Container */}
      <div className={`${collapsed ? "md:pl-20" : "md:pl-64"} min-h-screen transition-all duration-300`}>
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#dcefed] bg-white/90 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-[#dcefed] p-2 text-[#789a9a] hover:bg-[#f4fbfa] md:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs text-[#789a9a] sm:text-sm">Welcome back</p>
              <h1 className="text-lg font-semibold sm:text-xl">Clinic Overview & Analytics</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardMetrics}
              title="Refresh Data"
              className="p-2 rounded-xl border border-[#dcefed] text-[#789a9a] hover:text-[#00a7a0] hover:bg-[#f4fbfa] transition"
            >
              <RefreshCw size={18} className={loading ? "animate-spin text-[#00a7a0]" : ""} />
            </button>
            <div className="grid size-10 place-items-center rounded-full bg-[#d7f3ef] font-semibold text-[#008e89]">
              DR
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-8 space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl border border-[#dcefed] bg-white p-5 shadow-xs flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#789a9a]">Total Appointments</p>
                <h3 className="text-2xl font-bold mt-2 text-[#12383a]">{totalAppointments}</h3>
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                  <TrendingUp size={14} /> Live state
                </p>
              </div>
              <div className="p-3 bg-[#e5f8f6] text-[#008e89] rounded-xl">
                <CalendarDays size={22} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#dcefed] bg-white p-5 shadow-xs flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#789a9a]">Contact Messages</p>
                <h3 className="text-2xl font-bold mt-2 text-[#12383a]">{totalMessages}</h3>
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                  <TrendingUp size={14} /> Live state
                </p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <MessageSquare size={22} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#dcefed] bg-white p-5 shadow-xs flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#789a9a]">Pending Bookings</p>
                <h3 className="text-2xl font-bold mt-2 text-[#12383a]">{pendingAppointments}</h3>
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium">
                  <Clock size={14} /> Action required
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertCircle size={22} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#dcefed] bg-white p-5 shadow-xs flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#789a9a]">Pending Messages</p>
                <h3 className="text-2xl font-bold mt-2 text-[#12383a]">{pendingMessages}</h3>
                <p className="text-xs text-purple-600 mt-2 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={14} /> Unresolved inquiries
                </p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Users size={22} />
              </div>
            </div>
          </section>

          {/* Monthly Trend Area Chart */}
          <section className="rounded-2xl border border-[#dcefed] bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="font-semibold text-lg">Monthly Patient Engagement & Inquiries</h2>
                <p className="text-xs text-[#789a9a]">Appointments booked vs contact forms submitted over time</p>
              </div>
              <span className="text-xs font-semibold bg-[#e5f8f6] text-[#008e89] px-3 py-1.5 rounded-lg self-start sm:self-auto">
                Realtime Aggregation
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a7a0" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00a7a0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf5f4" />
                  <XAxis dataKey="month" stroke="#789a9a" fontSize={12} tickLine={false} />
                  <YAxis stroke="#789a9a" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      borderColor: "#dcefed",
                      fontSize: "12px",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    name="Appointments"
                    stroke="#00a7a0"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorApps)"
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    name="Inquiries"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMsgs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Grid Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-[#dcefed] bg-white p-6 shadow-xs">
              <h2 className="font-semibold text-lg mb-1">Weekly Appointment Density</h2>
              <p className="text-xs text-[#789a9a] mb-6">Patient volume distribution across days of the week</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyDensity}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf5f4" />
                    <XAxis dataKey="day" stroke="#789a9a" fontSize={12} tickLine={false} />
                    <YAxis stroke="#789a9a" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        borderColor: "#dcefed",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" name="Appointments" fill="#00a7a0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-[#dcefed] bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="font-semibold text-lg mb-1">Status Distribution</h2>
                <p className="text-xs text-[#789a9a] mb-4">Overall breakdown of booking statuses</p>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#edf5f4]">
                {statusDist.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-[#789a9a] font-medium">
                      {item.name}: <strong className="text-[#12383a]">{item.value}%</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Activity Table */}
          <section className="rounded-2xl border border-[#dcefed] bg-white shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#edf5f4] flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">Recent Clinic Activity</h2>
                <p className="text-xs text-[#789a9a]">Latest bookings and inquiries needing attention</p>
              </div>
              <Link
                href="/admin/appointments"
                className="text-xs font-semibold text-[#00a7a0] hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8fcfb] text-xs uppercase tracking-wide text-[#789a9a]">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Type</th>
                    <th className="px-5 py-3.5 font-medium">Patient / User</th>
                    <th className="px-5 py-3.5 font-medium">Details</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf5f4]">
                  {recentActivities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-xs text-[#789a9a]">
                        No recent activity found.
                      </td>
                    </tr>
                  ) : (
                    recentActivities.map((act) => (
                      <tr key={`${act.type}-${act.id}`} className="hover:bg-[#fbfefd] transition">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              act.type === "Appointment"
                                ? "bg-teal-50 text-teal-700 border border-teal-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {act.type === "Appointment" ? <CalendarDays size={13} /> : <MessageSquare size={13} />}
                            {act.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium whitespace-nowrap">{act.name}</td>
                        <td className="px-5 py-3.5 text-xs text-[#789a9a] truncate max-w-[200px]">
                          {act.subjectOrDoctor}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              act.status === "Pending"
                                ? "bg-amber-50 text-amber-700"
                                : act.status === "Cancelled"
                                ? "bg-red-50 text-red-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))
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