"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  CalendarCheck, 
  DollarSign, 
  ArrowUpRight, 
  Activity,
  Clock,
  ChevronRight,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import socket from "@/services/socket";
import dayjs from "dayjs";

interface Stats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, apptsRes] = await Promise.all([
        api.get("/admin/dashboard-stats"),
        api.get("/admin/appointments")
      ]);
      setStats(statsRes.data);
      setRecentAppointments(apptsRes.data.slice(0, 5));
      setLastSync(new Date());
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Real-time listeners
    if (socket) {
      socket.on('slot_booked', fetchDashboardData);
      socket.on('slot_cancelled', fetchDashboardData);
      socket.on('appointment_status_updated', fetchDashboardData);
    }

    return () => {
      if (socket) {
        socket.off('slot_booked', fetchDashboardData);
        socket.off('slot_cancelled', fetchDashboardData);
        socket.off('appointment_status_updated', fetchDashboardData);
      }
    };
  }, []);

  const kpis = [
    { label: "Doctors", value: stats?.totalDoctors || 0, icon: Users, change: "+2.5%" },
    { label: "Total Visits", value: stats?.totalAppointments || 0, icon: CalendarCheck, change: "+14%" },
    { label: "Pending Approvals", value: stats?.pendingAppointments || 0, icon: Activity, change: "Review Required" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest">Management Overview</h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-medium">Keep track of everything happening at the clinic</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="p-2 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)
        ) : (
          kpis.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, ease: "linear" }}
              className="bg-white border border-slate-200 p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 border border-slate-100 flex items-center justify-center bg-slate-50 text-ink-black">
                  <stat.icon size={20} />
                </div>
                <div className="flex items-center gap-1 text-emerald-600">
                  <span className="text-[10px] font-mono font-bold">{stat.change}</span>
                  <ArrowUpRight size={12} />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  {stat.label}
                </span>
                <span className="text-3xl font-mono font-bold tracking-tight text-ink-black">
                  {stat.value.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-3 bg-white border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-deep-blue" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Latest Visits</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-100 min-h-[300px]">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="p-6"><Skeleton className="h-10" /></div>)
            ) : recentAppointments.length > 0 ? (
              recentAppointments.map((activity) => (
                <div key={activity._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-400">{activity._id.slice(-6).toUpperCase()}</span>
                      <span className="text-xs font-bold uppercase tracking-wider">{activity.startTime}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{dayjs(activity.date).format('MMM DD')}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-ink-black">{activity.doctorId?.name || "Unassigned"}</span>
                      <span className="text-[10px] text-slate-400">Patient: {activity.patientId?.name || "Anonymous"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "status-label",
                      activity.status === "confirmed" && "bg-status-confirmed text-emerald-700 border-emerald-200",
                      activity.status === "cancelled" && "bg-status-cancelled text-rose-700 border-rose-200",
                      activity.status === "pending" && "bg-status-pending text-amber-700 border-amber-200",
                    )}>
                      {activity.status}
                    </div>
                    <ChevronRight size={14} className="text-slate-200 group-hover:text-ink-black transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 font-medium text-xs uppercase tracking-wider">No Recent Appointments</div>
            )}
          </div>
          <button className="w-full p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-ink-black transition-colors border-t border-slate-100">
            See all visits
          </button>
        </div>

      </div>
    </div>
  );
}
