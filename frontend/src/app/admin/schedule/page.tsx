"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Save,
  RotateCcw,
  MousePointer2,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function SchedulingEngine() {
  const [duration, setDuration] = useState(30);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const toggleSlot = (day: string, time: string) => {
    const slotId = `${day}-${time}`;
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(s => s !== slotId) 
        : [...prev, slotId]
    );
  };

  const handleMouseEnter = (day: string, time: string) => {
    if (isDragging) {
      toggleSlot(day, time);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-ink-black">Scheduling Engine</h1>
          <p className="text-xs font-mono text-slate-400 mt-1">MODULE: SLOT_ORCHESTRATOR // MODE: INTERACTIVE</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white border border-slate-200 p-1">
          {[15, 30, 60].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={cn(
                "px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                duration === d 
                  ? "bg-ink-black text-white" 
                  : "text-slate-400 hover:text-ink-black hover:bg-slate-50"
              )}
            >
              {d} MIN
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200">
        {/* Calendar Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-deep-blue" />
              <span className="text-sm font-bold uppercase tracking-wider">May 12 - May 18, 2026</span>
            </div>
            <div className="flex items-center border border-slate-200">
              <button className="p-2 hover:bg-slate-50 border-r border-slate-200"><ChevronLeft size={16} /></button>
              <button className="p-2 hover:bg-slate-50"><ChevronRight size={16} /></button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 mr-4">
                <div className="w-3 h-3 bg-deep-blue" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Selected</span>
             </div>
             <button className="p-2 text-slate-400 hover:text-ink-black transition-colors">
                <RotateCcw size={18} />
             </button>
             <Button className="h-10 px-6 bg-ink-black text-white uppercase text-[10px] tracking-widest font-bold gap-2">
                <Save size={14} />
                Deploy Schedule
             </Button>
          </div>
        </div>

        {/* Grid Interface */}
        <div 
          className="overflow-x-auto"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              <div className="p-4 border-r border-slate-200 bg-slate-50/50 flex items-center justify-center">
                <Clock size={16} className="text-slate-300" />
              </div>
              {days.map((day) => (
                <div key={day} className="p-4 text-center border-r border-slate-200 last:border-r-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{day}</span>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="divide-y divide-slate-100">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-7 group">
                  <div className="p-4 border-r border-slate-200 bg-slate-50/30 flex items-center justify-center font-mono text-[10px] text-slate-400 font-bold group-hover:text-ink-black transition-colors">
                    {time}
                  </div>
                  {days.map((day) => {
                    const slotId = `${day}-${time}`;
                    const isSelected = selectedSlots.includes(slotId);
                    return (
                      <div
                        key={slotId}
                        onMouseEnter={() => handleMouseEnter(day, time)}
                        onMouseDown={() => toggleSlot(day, time)}
                        className={cn(
                          "h-14 border-r border-slate-100 last:border-r-0 transition-all duration-75 cursor-crosshair relative group/slot",
                          isSelected ? "bg-deep-blue" : "hover:bg-slate-50"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute inset-1 border border-white/20 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white uppercase tracking-tighter opacity-50">Locked</span>
                          </div>
                        )}
                        {!isSelected && (
                          <div className="absolute inset-0 opacity-0 group-hover/slot:opacity-100 flex items-center justify-center pointer-events-none">
                             <Plus size={14} className="text-slate-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* UX Hint */}
      <div className="flex items-center gap-3 text-slate-400 bg-white border border-slate-200 p-4 w-fit">
        <MousePointer2 size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Tip: Click and drag to multi-select time blocks for rapid deployment</span>
      </div>
    </div>
  );
}
