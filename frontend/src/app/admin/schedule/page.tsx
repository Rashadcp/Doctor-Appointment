"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  RefreshCcw,
  Search,
  Save,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
    slotDuration: number;
  };
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOT_DURATIONS = [15, 30, 45, 60];

const buildPreviewSlots = (startTime: string, endTime: string, duration: number) => {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  let cursor = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  while (cursor + duration <= end) {
    const hour = Math.floor(cursor / 60).toString().padStart(2, "0");
    const minute = (cursor % 60).toString().padStart(2, "0");
    slots.push(`${hour}:${minute}`);
    cursor += duration;
  }

  return slots;
};

export default function SchedulingEngine() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedDoctor = doctors.find((doctor) => doctor._id === selectedDoctorId);
  const previewSlots = useMemo(
    () => buildPreviewSlots(startTime, endTime, slotDuration),
    [startTime, endTime, slotDuration]
  );

  const hydrateSchedule = useCallback((doctor: Doctor) => {
    setSelectedDoctorId(doctor._id);
    setSelectedDays(doctor.availability?.days || []);
    setStartTime(doctor.availability?.startTime || "09:00");
    setEndTime(doctor.availability?.endTime || "17:00");
    setSlotDuration(doctor.availability?.slotDuration || 30);
  }, []);

  const loadDoctors = useCallback(async (search = searchQuery) => {
    setLoading(true);
    try {
      const response = await api.get("/doctors", {
        params: search.trim() ? { search: search.trim() } : undefined,
      });
      const doctorList = response.data.doctors || [];
      setDoctors(doctorList);

      const selectedStillVisible = doctorList.some((doctor: Doctor) => doctor._id === selectedDoctorId);
      if ((!selectedDoctorId || !selectedStillVisible) && doctorList.length > 0) {
        hydrateSchedule(doctorList[0]);
      }
      if (doctorList.length === 0) {
        setSelectedDoctorId("");
      }
    } catch (error) {
      console.error("Failed to load doctors", error);
      toast.error("Unable to load doctors for scheduling.");
    } finally {
      setLoading(false);
    }
  }, [hydrateSchedule, searchQuery, selectedDoctorId]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const toggleDay = (day: string) => {
    setSelectedDays((days) =>
      days.includes(day) ? days.filter((item) => item !== day) : [...days, day]
    );
  };

  const saveSchedule = async () => {
    if (!selectedDoctor) return;
    if (selectedDays.length === 0) {
      toast.error("Select at least one available day.");
      return;
    }
    if (startTime >= endTime) {
      toast.error("Start time must be before end time.");
      return;
    }

    setSaving(true);
    try {
      const availability = {
        days: selectedDays,
        startTime,
        endTime,
        slotDuration,
      };

      const response = await api.put(`/admin/doctors/${selectedDoctor._id}`, { availability });
      setDoctors((items) =>
        items.map((doctor) =>
          doctor._id === selectedDoctor._id ? { ...doctor, availability: response.data.availability } : doctor
        )
      );
      toast.success("Availability schedule updated live.");
    } catch (error) {
      console.error("Failed to save schedule", error);
      toast.error("Unable to save availability schedule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-ink-black">Availability Schedule</h1>
          <p className="text-xs font-mono text-slate-400 mt-1">Live doctor availability controls patient slot generation</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDoctors()}
            className="h-11 px-4 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            type="button"
          >
            <RefreshCcw size={14} className={cn(loading && "animate-spin")} />
          </button>
          <Button
            onClick={saveSchedule}
            disabled={!selectedDoctor || saving}
            className="h-11 px-6 bg-ink-black text-white uppercase text-[10px] tracking-widest font-bold gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Live Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <section className="bg-white border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex items-center gap-3">
            <Stethoscope size={16} className="text-deep-blue" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Doctor</h2>
          </div>

          <div className="p-5 space-y-5">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                loadDoctors(searchQuery);
              }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="input-field h-11 flex-1 text-xs font-bold uppercase"
                placeholder="Search doctor or specialty"
              />
              <Button
                type="submit"
                className="h-11 px-4 bg-ink-black text-white"
                disabled={loading}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              </Button>
            </form>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : doctors.length === 0 ? (
              <div className="border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  No doctors found
                </p>
              </div>
            ) : (
              <select
                value={selectedDoctorId}
                onChange={(event) => {
                  const doctor = doctors.find((item) => item._id === event.target.value);
                  if (doctor) hydrateSchedule(doctor);
                }}
                className="input-field w-full bg-white text-xs font-bold uppercase"
              >
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Slot duration</label>
              <div className="grid grid-cols-4 gap-2">
                {SLOT_DURATIONS.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setSlotDuration(duration)}
                    className={cn(
                      "h-10 border text-[10px] font-bold uppercase tracking-widest transition-colors",
                      slotDuration === duration
                        ? "bg-ink-black text-white border-ink-black"
                        : "bg-slate-50 text-slate-400 border-slate-200 hover:text-ink-black"
                    )}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon size={16} className="text-deep-blue" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Available Days</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {selectedDays.length} selected
            </span>
          </div>

          <div className="p-5 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "h-16 border text-[10px] font-bold uppercase tracking-widest transition-colors",
                    selectedDays.includes(day)
                      ? "bg-deep-blue text-white border-deep-blue"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:text-ink-black hover:border-slate-400"
                  )}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="border border-slate-200">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                <Clock size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Patient-facing slot preview
                </span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto">
                {previewSlots.length > 0 ? (
                  previewSlots.map((time) => (
                    <div
                      key={time}
                      className="h-10 flex items-center justify-center border border-slate-200 bg-white text-[10px] font-bold font-mono text-slate-500"
                    >
                      {time}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    No slots generated for this time range
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
