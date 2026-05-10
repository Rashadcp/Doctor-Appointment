"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/services/socket";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface AppointmentStatusUpdate {
  id?: string;
  patientId?: string;
  status?: string;
  doctorName?: string;
}

interface AppointmentBookedNotification {
  patientId?: string;
  doctorName?: string;
  date?: string;
  startTime?: string;
}

export const RealTimeNotifications = () => {
  const { user } = useAuth();
  const recentlyHandledUpdates = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentSocket = getSocket();
    if (!user || !currentSocket) return;

    const pushNotification = (title: string, description: string) => {
      window.dispatchEvent(new CustomEvent("medmatch:notification", {
        detail: {
          title,
          description,
        },
      }));
    };

    const handleAppointmentBooked = (data: AppointmentBookedNotification) => {
      if (String(data.patientId) !== String(user._id)) return;

      const scheduledFor = [data.date, data.startTime].filter(Boolean).join(" at ");
      const description = `Your appointment request with ${data.doctorName || 'your specialist'} is pending admin confirmation${scheduledFor ? ` for ${scheduledFor}` : ""}.`;

      pushNotification("Request Submitted", description);

      toast.success("Request Submitted", {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        description,
        duration: 6000,
      });
    };

    const handleStatusUpdate = (data: AppointmentStatusUpdate) => {
      if (String(data.patientId) === String(user._id) && data.status) {
        const updateKey = `${data.id || data.patientId}-${data.status}`;
        if (recentlyHandledUpdates.current.has(updateKey)) return;
        recentlyHandledUpdates.current.add(updateKey);
        window.setTimeout(() => {
          recentlyHandledUpdates.current.delete(updateKey);
        }, 1000);

        const statusCopy: Record<string, { title: string; description: string }> = {
          confirmed: {
            title: "Booking Confirmed",
            description: `Your appointment with ${data.doctorName || 'your specialist'} has been officially confirmed.`,
          },
          completed: {
            title: "Appointment Completed",
            description: `Your appointment with ${data.doctorName || 'your specialist'} has been marked as completed.`,
          },
          cancelled: {
            title: "Appointment Cancelled",
            description: `Your appointment with ${data.doctorName || 'your specialist'} has been cancelled.`,
          },
          pending: {
            title: "Appointment Pending",
            description: `Your appointment with ${data.doctorName || 'your specialist'} is pending admin confirmation.`,
          },
        };
        const message = statusCopy[data.status] || {
          title: "Appointment Update",
          description: `Your appointment status has been updated to ${data.status}.`,
        };

        pushNotification(message.title, message.description);
      }
    };

    currentSocket.on('appointment_booked', handleAppointmentBooked);
    currentSocket.on('appointment_confirmed', handleStatusUpdate);
    currentSocket.on('appointment_status_updated', handleStatusUpdate);
    currentSocket.on('appointment_updated', handleStatusUpdate);

    return () => {
      currentSocket.off('appointment_booked', handleAppointmentBooked);
      currentSocket.off('appointment_confirmed', handleStatusUpdate);
      currentSocket.off('appointment_status_updated', handleStatusUpdate);
      currentSocket.off('appointment_updated', handleStatusUpdate);
    };
  }, [user]);

  return null; // This is a logic-only component
};
