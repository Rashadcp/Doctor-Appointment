"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/services/socket";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface AppointmentStatusUpdate {
  patientId?: string;
  status?: string;
  doctorName?: string;
}

export const RealTimeNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    const currentSocket = getSocket();
    if (!user || !currentSocket) return;

    const handleStatusUpdate = (data: AppointmentStatusUpdate) => {
      // Check if the updated appointment belongs to this user
      // and if the status was changed to 'confirmed'
      if (data.patientId === user._id && data.status === 'confirmed') {
        const description = `Your appointment with ${data.doctorName || 'your specialist'} has been officially confirmed.`;

        window.dispatchEvent(new CustomEvent("medmatch:notification", {
          detail: {
            title: "Booking Confirmed",
            description,
          },
        }));

        toast.success("Booking Confirmed", {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          description,
          duration: 6000,
        });
      }
    };

    currentSocket.on('appointment_status_updated', handleStatusUpdate);

    return () => {
      currentSocket.off('appointment_status_updated', handleStatusUpdate);
    };
  }, [user]);

  return null; // This is a logic-only component
};
