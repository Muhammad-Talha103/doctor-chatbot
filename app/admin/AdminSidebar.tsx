"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CalendarDays,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Stethoscope,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();

  function logout() {
    sessionStorage.removeItem("admin_authenticated");
    window.location.href = "/admin/login";
  }

  const navItems = [
    {
      label: "Dashboard Overview",
      href: "/admin",
      icon: Activity,
    },
    {
      label: "Appointments",
      href: "/admin/appointments",
      icon: CalendarDays,
    },
    {
      label: "Contact Messages",
      href: "/admin/messages",
      icon: MessageSquare,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin" || pathname === "/admin/";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-[#dcefed] bg-white transition-all duration-300 md:flex md:flex-col ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#edf5f4] px-5">
         {!collapsed && (
  <div className="flex items-center gap-3 overflow-hidden">
    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#00a7a0] text-white">
      <Stethoscope size={21} />
    </div>
    <div className="whitespace-nowrap">
      <p className="font-semibold">Dr. Care AI</p>
      <p className="text-xs text-[#789a9a]">Admin Portal</p>
    </div>
  </div>
)}
          <button
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#789a9a] hover:text-[#00a7a0] cursor-pointer"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#e5f8f6] text-[#008e89]"
                    : "text-[#789a9a] hover:bg-[#f4fbfa]"
                }`}
              >
                <Icon size={19} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#789a9a] hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut size={19} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#dcefed] bg-white md:hidden"
            >
              <div className="flex h-20 items-center justify-between border-b border-[#edf5f4] px-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#00a7a0] text-white">
                    <Stethoscope size={21} />
                  </div>
                  <div>
                    <p className="font-semibold">Dr. Care AI</p>
                    <p className="text-xs text-[#789a9a]">Admin Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1 text-[#789a9a] hover:bg-[#f4fbfa]"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-2 p-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                        active
                          ? "bg-[#e5f8f6] text-[#008e89]"
                          : "text-[#789a9a] hover:bg-[#f4fbfa]"
                      }`}
                    >
                      <Icon size={19} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#edf5f4]">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#789a9a] hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={19} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}