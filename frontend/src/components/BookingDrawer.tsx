"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Clock, 
  AlertCircle, 
  Loader2, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SideDrawer } from "@/components/ui/SideDrawer";
import api from "@/lib/api";
import { getSocket } from "@/services/socket";
import dayjs from "dayjs";
import { toast } from "sonner";
import Link from "next/link";

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface SlotUpdate {
  doctorId?: string;
  _id?: string;
  date?: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    return (error as ApiErrorResponse).response?.data?.message;
  }

  return undefined;
};

export const BookingDrawer = ({ isOpen, onClose, doctor }: BookingDrawerProps) => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSlots = useCallback(async () => {
    if (!doctor.id) return;
    setLoading(true);
    try {
      const response = await api.get(`/doctors/${doctor.id}/slots`, {
        params: { date: selectedDate }
      });
      setAvailableSlots(response.data);
    } catch (error) {
      console.error("Failed to fetch slots", error);
    } finally {
      setLoading(false);
    }
  }, [doctor.id, selectedDate]);

  useEffect(() => {
    if (isOpen) {
      fetchSlots();
      setIsSuccess(false);
      setReason("");
      setSelectedSlot(null);
      setError("");
    }
  }, [isOpen, fetchSlots]);

  useEffect(() => {
    if (!isOpen) return;

    // Real-time synchronization
    const handleSlotUpdate = (data: SlotUpdate) => {
      const updatedDoctorId = data.doctorId || data._id;
      const isSameDoctor = updatedDoctorId === doctor.id;
      const isSameDate = !data.date || data.date === selectedDate;

      if (isSameDoctor && isSameDate) {
        fetchSlots();
      }
    };

    const socket = getSocket();
    socket.on('slot_booked', handleSlotUpdate);
    socket.on('slot_cancelled', handleSlotUpdate);
    socket.on('doctor_updated', handleSlotUpdate);

    return () => {
      socket.off('slot_booked', handleSlotUpdate);
      socket.off('slot_cancelled', handleSlotUpdate);
      socket.off('doctor_updated', handleSlotUpdate);
    };
  }, [isOpen, fetchSlots, doctor.id, selectedDate]);

  const handleBooking = async () => {
    if (!selectedSlot) return;
    if (!reason.trim()) {
      setError("Please provide a reason for your consultation.");
      return;
    }
    setIsBooking(true);
    setError("");
    
    try {
      await api.post("/appointments", {
        doctorId: doctor.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: reason
      });
      setIsSuccess(true);
      toast.success("REQUEST_SUBMITTED");
    } catch (error) {
      setError(getErrorMessage(error) || "Booking failed. Slot may have been taken.");
      fetchSlots();
    } finally {
      setIsBooking(false);
    }
  };

  const dateOptions = Array.from({ length: 7 }, (_, i) => ({
    label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayjs().add(i, 'day').format('ddd, D'),
    value: dayjs().add(i, 'day').format('YYYY-MM-DD')
  }));

  if (isSuccess) {
    return (
      <SideDrawer 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Request submitted"
        subtitle="Your appointment is waiting for admin confirmation."
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-8 border border-amber-100">
            <Clock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-4 text-slate-900">Pending Review</h2>
          <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">
            Your consultation request with {doctor.name} is pending for {dayjs(selectedDate).format('MMMM D, YYYY')} at {selectedSlot?.startTime}. You will be notified when admin confirms it.
          </p>


          <div className="space-y-4">
            <Link href="/dashboard">
              <Button className="w-full h-12 uppercase tracking-widest text-[10px]" variant="black">Go to Dashboard</Button>
            </Link>
            <Button className="w-full h-12 uppercase tracking-widest text-[10px]" variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </SideDrawer>
    );
  }

  return (
    <SideDrawer 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Book a visit"
      subtitle={`Find a time to meet with ${doctor.name}`}
    >
      <div className="space-y-8 pb-12">
        {/* Date Selection */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 block">Pick a date</label>
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {dateOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSelectedDate(opt.value);
                  setSelectedSlot(null);
                }}
                className={`py-4 px-8 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest transition-colors border shadow-sm ${
                  selectedDate === opt.value 
                    ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 block">Pick a time</label>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 no-scrollbar min-h-[100px]">
            {loading ? (
              <div className="col-span-2 flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
              </div>
            ) : availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-5 text-[10px] font-bold uppercase tracking-widest transition-colors border shadow-sm ${
                    selectedSlot?.startTime === slot.startTime 
                      ? "bg-medical-blue text-white border-medical-blue shadow-md" 
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {dayjs(`${selectedDate} ${slot.startTime}`).format('hh:mm A')}
                </button>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center bg-slate-50 border border-dashed border-slate-200 p-6">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-4" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-2">Registry Offline</h4>
                <p className="text-[10px] text-slate-400 font-medium uppercase leading-relaxed max-w-[200px]">
                  This doctor is fully booked for today. Check back tomorrow!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reason for Consultation */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 block">What can we help you with today?</label>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Chronic back pain, follow-up, etc."
            className="w-full bg-slate-50 border border-slate-200 p-4 text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300 focus:outline-none focus:border-medical-blue transition-colors min-h-[100px] resize-none"
          />
        </div>

          {error && (
            <div 
              className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 animate-slideDown"
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

        <div className="pt-4">
          <Button 
            className="w-full h-16 uppercase tracking-widest text-xs font-bold" 
            variant="black"
            disabled={!selectedSlot || isBooking}
            onClick={handleBooking}
          >
            {isBooking ? (
              <div className="flex items-center gap-2">
                 <Loader2 size={16} className="animate-spin" />
                 SAVING YOUR SPOT...
              </div>
            ) : (
              <>Confirm Booking <ArrowRight className="ml-2 w-4 h-4" /></>
            )}
          </Button>
          <p className="text-[10px] text-center text-slate-400 mt-6 font-medium uppercase tracking-wider">
            Secure connection • Verified specialists
          </p>
        </div>
      </div>
    </SideDrawer>
  );
};
