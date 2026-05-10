"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  Calendar, Clock, Settings, LogOut, Stethoscope,
  LayoutGrid, User, Loader2, XCircle, Menu
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { getSocket } from "@/services/socket";
import { toast } from "sonner";
import dayjs from "dayjs";

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "Upcoming");

  useEffect(() => {
    const tab = searchParams.get("tab") || "Upcoming";
    setActiveTab(tab);
  }, [searchParams]);
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState<any>({ total: 0, completed: 0, nextSession: null });
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const [appointmentsRes, statsRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/appointments/stats")
      ]);
      setAppointments(appointmentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to load appointments");
      toast.error("Unable to sync your appointments at this time.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) return;
    
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success("Appointment cancelled successfully.");
      fetchAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      toast.error("Failed to cancel appointment. Please try again.");
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Listen for status updates from Admin — lazy socket
    const socket = getSocket();
    socket.on('appointment_updated', (data: any) => {
      if (data.patientId === user?._id) {
        fetchAppointments();
      }
    });

    return () => {
      socket.off('appointment_updated');
    };
  }, [user?._id]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["Upcoming", "Completed", "Cancelled", "Profile", "Settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const now = dayjs();

  const getFilteredAppointments = () => {
    return appointments.filter(apt => {
      if (activeTab === "Upcoming") {
        return apt.status === 'confirmed' || apt.status === 'pending';
      }
      return apt.status.toLowerCase() === activeTab.toLowerCase();
    });
  };

  const getNextSessionDisplay = () => {
    if (!stats.nextSession) return "--";
    const aptDate = dayjs(stats.nextSession.date);
    const diffDays = aptDate.diff(now, 'day');
    
    if (aptDate.isSame(now, 'day')) return `Today @ ${stats.nextSession.startTime}`;
    if (diffDays === 0) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays + 1} Days`;
    return aptDate.format('MMM DD');
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col h-screen sticky top-0">
        <div className="p-8 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-medical-blue flex items-center justify-center">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <span className="font-bold uppercase tracking-tighter text-xl">MedMatch</span>
          </Link>
        </div>

        <nav className="p-4 flex-grow space-y-2">
          {[
            { name: "My Visits", icon: LayoutGrid, href: "/dashboard", active: ["Upcoming", "Completed", "Cancelled"].includes(activeTab) },
            { name: "Profile", icon: User, href: "/dashboard?tab=Profile", active: activeTab === "Profile" },
          ].map((item) => (
            <Link key={item.name} href={item.href || "#"}>
              <button
                className={`w-full flex items-center gap-4 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                  item.active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-200">
          <button 
            onClick={() => {
              logout();
              toast.success("Successfully logged out.");
            }}
            className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        <header className="bg-white border-b border-slate-200 h-24 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl lg:text-2xl font-bold uppercase tracking-tighter leading-none">Your Visits</h1>
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Good to see you, {user?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 flex items-center justify-center border border-slate-200 uppercase font-bold text-xs">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl animate-slideRight">
              <div className="p-8 border-b border-slate-200 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-medical-blue flex items-center justify-center">
                    <Stethoscope className="text-white w-5 h-5" />
                  </div>
                  <span className="font-bold uppercase tracking-tighter text-xl">MedMatch</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-900">
                  <XCircle size={20} />
                </button>
              </div>

              <nav className="p-4 flex-grow space-y-2">
                {[
                  { name: "My Visits", icon: LayoutGrid, href: "/dashboard", active: ["Upcoming", "Completed", "Cancelled"].includes(activeTab) },
                  { name: "Profile", icon: User, href: "/dashboard?tab=Profile", active: activeTab === "Profile" },
                ].map((item) => (
                  <Link key={item.name} href={item.href || "#"} onClick={() => setIsMobileMenuOpen(false)}>
                    <button
                      className={`w-full flex items-center gap-4 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                        item.active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </button>
                  </Link>
                ))}
              </nav>

              <div className="p-8 border-t border-slate-200">
                <button 
                  onClick={() => {
                    logout();
                    toast.success("Successfully logged out.");
                  }}
                  className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        <div className="p-8 lg:p-12 max-w-6xl mx-auto">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-slate-200 border border-slate-200 mb-12">
            <div className="bg-white p-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Appointments</div>
              <div className="text-4xl font-bold">{stats.total.toString().padStart(2, '0')}</div>
            </div>
            <div className="bg-white p-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Completed</div>
              <div className="text-4xl font-bold text-emerald-500">{stats.completed.toString().padStart(2, '0')}</div>
            </div>
            <div className="bg-white p-8">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Next Session</div>
              <div className="text-3xl font-bold text-medical-blue whitespace-nowrap uppercase tracking-tighter">
                {getNextSessionDisplay()}
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === "Profile" ? (
            <ProfileView user={user} />
          ) : activeTab === "Settings" ? (
            <div className="bg-white border border-slate-200 p-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                <Settings className="text-slate-200" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-widest mb-2">{activeTab} Coming Soon</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">We are currently refining the {activeTab.toLowerCase()} interface.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200">
                <div className="flex">
                  {["Upcoming", "Completed", "Cancelled"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-8 py-6 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                        activeTab === tab ? "text-slate-900 bg-white" : "text-slate-400 hover:text-slate-600 bg-slate-50/50"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-medical-blue transition-all" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <th className="px-8 py-4">ID</th>
                      <th className="px-8 py-4">Doctor</th>
                      <th className="px-8 py-4">Date & Time</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center">
                          <Loader2 size={24} className="animate-spin mx-auto text-slate-200" />
                        </td>
                      </tr>
                    ) : filteredAppointments.length > 0 ? (
                      filteredAppointments.map((apt) => (
                        <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6 font-mono text-[10px] uppercase">{apt._id.slice(-8)}</td>
                          <td className="px-8 py-6">
                            <div className="text-sm font-bold uppercase">{apt.doctorId?.name}</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wide">{apt.doctorId?.specialization}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm font-bold">{dayjs(apt.date).format('MMM D, YYYY')}</div>
                            <div className="text-[10px] text-slate-400 font-medium uppercase">{apt.startTime}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                apt.status === "confirmed" ? "bg-medical-blue" :
                                apt.status === "completed" ? "bg-emerald-500" : "bg-red-500"
                              }`} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{apt.status}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              {(apt.status === 'confirmed' || apt.status === 'pending') && (
                                <Button 
                                  variant="ghost" 
                                  onClick={() => handleCancel(apt._id)}
                                  className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50"
                                >Cancel</Button>
                              )}
                              <Button 
                                variant="ghost" 
                                onClick={() => setSelectedAppointment(apt)}
                                className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest"
                              >Details</Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-50 flex items-center justify-center mb-4">
                              <Calendar className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No appointments found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto text-slate-200" />
                  </div>
                ) : filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt) => (
                    <div key={apt._id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-tight">{apt.doctorId?.name}</div>
                          <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">{apt.doctorId?.specialization}</div>
                        </div>
                        <div className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${
                          apt.status === 'confirmed' ? "bg-medical-blue/5 text-medical-blue border-medical-blue/10" :
                          apt.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          "bg-red-50 text-red-600 border-red-100"
                        }`}>
                          {apt.status}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="text-[10px] font-bold">{dayjs(apt.date).format('MMM DD, YYYY')}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{apt.startTime}</div>
                        </div>
                        <div className="flex gap-2">
                          {(apt.status === 'confirmed' || apt.status === 'pending') && (
                            <button 
                              onClick={() => handleCancel(apt._id)}
                              className="text-[9px] font-bold uppercase text-red-500 hover:underline"
                            >Cancel</button>
                          )}
                          <button 
                            onClick={() => setSelectedAppointment(apt)}
                            className="text-[9px] font-bold uppercase text-medical-blue hover:underline"
                          >Details</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center px-6">
                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Calendar className="w-4 h-4 text-slate-200" />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">No session history found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedAppointment && (
        <AppointmentDetailModal 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)} 
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

function ProfileView({ user }: { user: any }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.put("/auth/update-password", { currentPassword, newPassword });
      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="rounded-none border-slate-200 shadow-none">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 flex items-center justify-center border border-slate-200 uppercase font-bold text-3xl mb-4">
              {user?.name?.charAt(0)}
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest">{user?.name}</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">{user?.email}</p>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Card className="rounded-none border-slate-200 shadow-none">
          <CardContent className="p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">Security Settings</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Password</label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  className="rounded-none border-slate-200 bg-slate-50 h-12 text-sm font-medium" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">New Password</label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-none border-slate-200 bg-slate-50 h-12 text-sm font-medium" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Confirm New Password</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-none border-slate-200 bg-slate-50 h-12 text-sm font-medium" required />
                </div>
              </div>
              <Button type="submit" disabled={loading}
                className="w-full h-12 bg-medical-blue text-white uppercase text-[10px] font-bold tracking-widest hover:bg-medical-blue/90">
                {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AppointmentDetailModal({ appointment, onClose, onCancel }: { appointment: any, onClose: () => void, onCancel: (id: string) => void }) {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white w-full max-w-lg border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 lg:p-12 relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
          <XCircle size={24} />
        </button>
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-medical-blue mb-2 block font-medium">Summary</span>
            <h2 className="text-3xl font-bold uppercase tracking-tighter">Visit Details</h2>
          </div>
          <div className="space-y-6 bg-slate-50 p-6 border border-slate-200">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Doctor</p>
                <p className="text-sm font-bold uppercase">{appointment.doctorId?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Specialty</p>
                <p className="text-sm font-bold uppercase">{appointment.doctorId?.specialization}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200/50">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Scheduled Date</p>
                <p className="text-sm font-bold">{dayjs(appointment.date).format('MMMM D, YYYY')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Time Slot</p>
                <p className="text-sm font-bold uppercase">{appointment.startTime}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Reference ID</p>
                <p className="text-[10px] font-mono font-bold uppercase text-slate-500">{appointment._id}</p>
              </div>
              <div className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                appointment.status === 'confirmed' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                appointment.status === 'completed' ? "bg-slate-100 text-slate-700 border-slate-200" :
                "bg-rose-50 text-rose-700 border-rose-200"
              }`}>{appointment.status}</div>
            </div>
          </div>
          <div className="space-y-3">
            {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
              <Button onClick={() => onCancel(appointment._id)} variant="outline" 
                className="w-full h-14 border-red-100 text-red-500 uppercase text-xs font-bold tracking-widest hover:bg-red-50 hover:border-red-200">
                Cancel Appointment
              </Button>
            )}
            <Button onClick={onClose} variant="outline" 
              className="w-full h-14 border-slate-200 text-slate-500 uppercase text-xs font-bold tracking-widest hover:bg-slate-50">
              Close Overview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  return (
    <ProtectedRoute>
      <React.Suspense fallback={<div className="min-h-screen bg-white" />}>
        <DashboardContent />
      </React.Suspense>
    </ProtectedRoute>
  );
}
