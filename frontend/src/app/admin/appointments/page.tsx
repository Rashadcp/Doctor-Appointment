"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Stethoscope,
  LayoutGrid,
  List as ListIcon,
  RefreshCcw,
  Loader2,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import socket from "@/services/socket";
import { toast } from "sonner";
import dayjs from "dayjs";

interface Appointment {
  _id: string;
  createdAt?: string;
  date: string;
  startTime: string;
  status: string;
  doctorId?: {
    name?: string;
  };
  patientId?: {
    name?: string;
  };
}

export default function AppointmentCommandCenter() {
  const [view, setView] = useState<"list" | "board">("list");
  const [activeStatus, setActiveStatus] = useState("pending");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const statusFilters = [
    { status: "pending", label: "Pending", accent: "bg-amber-500" },
    { status: "confirmed", label: "Confirmed", accent: "bg-emerald-500" },
    { status: "completed", label: "Completed", accent: "bg-slate-500" },
    { status: "cancelled", label: "Cancelled", accent: "bg-rose-500" },
  ];
  const activeFilter = statusFilters.find((filter) => filter.status === activeStatus) || statusFilters[0];
  const filteredAppointments = appointments.filter((apt) => apt.status === activeStatus);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/appointments");
      // Sort by creation time (descending) - newest bookings first
      const sorted = [...(response.data as Appointment[])].sort((a, b) => {
        return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
      });
      setAppointments(sorted);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error: Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const handleNewBooking = () => {
      fetchAppointments();
      toast.info(`New Appointment: A new booking has been scheduled.`, {
        description: "Review the dashboard for details.",
        duration: 5000,
      });
    };

    if (socket) {
      socket.on('slot_booked', handleNewBooking);
      socket.on('slot_cancelled', fetchAppointments);
      socket.on('appointment_updated', fetchAppointments);
    }

    return () => {
      if (socket) {
        socket.off('slot_booked', handleNewBooking);
        socket.off('slot_cancelled', fetchAppointments);
        socket.off('appointment_updated', fetchAppointments);
      }
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/admin/appointments/${id}`, { status });
      setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Appointment status updated to ${status.toLowerCase()}.`);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Error: Status update was not successful.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest">Appointment Command Center</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Operational • Live Sync Active</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-200 p-1">
            <button 
              onClick={() => setView("list")}
              className={cn(
                "p-2 transition-colors",
                view === "list" ? "bg-ink-black text-white" : "text-slate-400 hover:text-ink-black"
              )}
            >
              <ListIcon size={18} />
            </button>
            <button 
              onClick={() => setView("board")}
              className={cn(
                "p-2 transition-colors",
                view === "board" ? "bg-ink-black text-white" : "text-slate-400 hover:text-ink-black"
              )}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <Button onClick={fetchAppointments} className="h-11 px-4 border border-slate-200 bg-white text-ink-black uppercase text-[10px] tracking-widest font-bold gap-2">
            <RefreshCcw size={14} className={cn(loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {statusFilters.map((filter) => {
            const count = appointments.filter((apt) => apt.status === filter.status).length;
            const isActive = activeStatus === filter.status;

            return (
              <button
                key={filter.status}
                type="button"
                onClick={() => setActiveStatus(filter.status)}
                className={cn(
                  "h-16 px-4 flex items-center justify-between border text-left transition-colors",
                  isActive
                    ? "bg-ink-black text-white border-ink-black"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400 hover:text-ink-black"
                )}
              >
                <span className="flex items-center gap-3">
                  <span className={cn("h-2.5 w-2.5", filter.accent)} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{filter.label}</span>
                </span>
                <span className={cn(
                  "min-w-8 h-8 px-2 flex items-center justify-center border text-xs font-bold",
                  isActive ? "border-white/20 bg-white/10 text-white" : "border-slate-200 bg-white text-ink-black"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-6">
            {loading ? (
              <div className="bg-white border border-slate-200 overflow-hidden">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="p-4 grid grid-cols-12 items-center border-b border-slate-100 last:border-b-0">
                    <Skeleton key={i} className="col-span-12 h-10" />
                  </div>
                ))}
              </div>
            ) : filteredAppointments.length > 0 ? (
                  <div className="bg-white border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn("h-2.5 w-2.5", activeFilter.accent)} />
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-ink-black">{activeFilter.label}</h2>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {filteredAppointments.length} appointments
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="col-span-2">Time & ID</div>
                      <div className="col-span-3">Practitioner</div>
                      <div className="col-span-3">Patient Details</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {filteredAppointments.map((apt) => (
                        <div key={apt._id} className="p-4 grid grid-cols-12 items-center hover:bg-slate-50/50 transition-colors group">
                          <div className="col-span-2">
                            <div className="text-xs font-bold text-ink-black">{apt.startTime}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">{dayjs(apt.date).format('MMM DD')}</div>
                            <div className="text-[9px] font-mono text-slate-200">{apt._id.slice(-6).toUpperCase()}</div>
                          </div>
                          <div className="col-span-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <Stethoscope size={12} className="text-deep-blue/50" />
                              {apt.doctorId?.name || "Unassigned"}
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 flex items-center justify-center border border-slate-200">
                                <User size={14} className="text-slate-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold uppercase tracking-tight text-ink-black">{apt.patientId?.name || "Anonymous"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className={cn(
                              "status-label w-fit",
                              apt.status === "confirmed" && "bg-status-confirmed text-emerald-700 border-emerald-200",
                              apt.status === "pending" && "bg-status-pending text-amber-700 border-amber-200",
                              apt.status === "cancelled" && "bg-status-cancelled text-rose-700 border-rose-200",
                              apt.status === "completed" && "bg-slate-100 text-slate-700 border-slate-200",
                            )}>
                              {apt.status}
                            </div>
                          </div>
                          <div className="col-span-2 flex justify-end gap-2">
                            {updatingId === apt._id ? (
                              <Loader2 size={16} className="animate-spin text-slate-400" />
                            ) : (
                              <>
                                <button
                                  onClick={() => updateStatus(apt._id, "confirmed")}
                                  disabled={apt.status === "confirmed"}
                                  className="w-8 h-8 flex items-center justify-center border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-30"
                                  title="Confirm"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                                <button
                                  onClick={() => updateStatus(apt._id, "completed")}
                                  disabled={apt.status === "completed" || apt.status === "cancelled"}
                                  className="w-8 h-8 flex items-center justify-center border border-slate-200 text-medical-blue hover:bg-blue-50 transition-colors disabled:opacity-30"
                                  title="Complete"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => updateStatus(apt._id, "cancelled")}
                                  disabled={apt.status === "cancelled"}
                                  className="w-8 h-8 flex items-center justify-center border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30"
                                  title="Cancel"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
            ) : (
              <div className="p-20 text-center flex flex-col items-center justify-center bg-white border border-slate-200">
                <div className="w-16 h-16 bg-white border border-slate-200 flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-2">No {activeFilter.label} Appointments</h3>
                <p className="text-[10px] text-slate-400 uppercase max-w-xs leading-relaxed font-medium">
                  Click another status button to view patients in that appointment group.
                </p>
              </div>
            )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn("h-2.5 w-2.5", activeFilter.accent)} />
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-ink-black">{activeFilter.label}</h2>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {filteredAppointments.length} appointments
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAppointments.map((apt) => (
                    <div key={apt._id} className="bg-white border border-slate-200 p-6 flex flex-col gap-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4">
                  <div className={cn(
                    "status-label",
                    apt.status === "confirmed" && "bg-status-confirmed text-emerald-700",
                    apt.status === "pending" && "bg-status-pending text-amber-700",
                    apt.status === "cancelled" && "bg-status-cancelled text-rose-700",
                    apt.status === "completed" && "bg-slate-100 text-slate-700",
                  )}>
                    {apt.status}
                  </div>
               </div>
               
               <div className="space-y-4">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400">{apt._id.slice(-6).toUpperCase()}</span>
                    <h3 className="text-sm font-bold uppercase tracking-widest">{apt.patientId?.name || "Anonymous"}</h3>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{dayjs(apt.date).format('MMM DD, YYYY')}</span>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                       <Clock size={14} />
                       {apt.startTime}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                       <Stethoscope size={14} />
                       {apt.doctorId?.name || "Specialist"}
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-1 mt-auto">
                  <button 
                    disabled={updatingId === apt._id || apt.status === 'confirmed'}
                    onClick={() => updateStatus(apt._id, "confirmed")}
                    className="h-10 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button 
                    disabled={updatingId === apt._id || apt.status === 'completed' || apt.status === 'cancelled'}
                    onClick={() => updateStatus(apt._id, "completed")}
                    className="h-10 bg-medical-blue text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Complete
                  </button>
                  <button 
                    disabled={updatingId === apt._id || apt.status === 'cancelled'}
                    onClick={() => updateStatus(apt._id, "cancelled")}
                    className="h-10 border border-slate-200 text-ink-black text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
               </div>
                    </div>
                  ))}
                </div>
              </section>
          ) : (
            <div className="p-20 text-center flex flex-col items-center justify-center bg-white border border-slate-200">
              <div className="w-16 h-16 bg-white border border-slate-200 flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-2">No {activeFilter.label} Appointments</h3>
              <p className="text-[10px] text-slate-400 uppercase max-w-xs leading-relaxed font-medium">
                Click another status button to view patients in that appointment group.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
