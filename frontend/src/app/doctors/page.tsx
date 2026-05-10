"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, X, ChevronDown, SlidersHorizontal, Loader2 } from "lucide-react";
import { DoctorCard, DoctorSkeleton } from "@/components/DoctorCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import socket from "@/services/socket";
import { toast } from "sonner";

export default function DoctorDiscoveryPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [specializations, setSpecializations] = useState<string[]>(["All Specialties"]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSpecializations = async () => {
    try {
      const response = await api.get("/doctors/specializations");
      setSpecializations(["All Specialties", ...response.data]);
    } catch (error) {
      console.error("Failed to fetch specializations");
    }
  };

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/doctors", {
        params: {
          search: searchQuery,
          specialization: selectedSpecialty === "All Specialties" ? undefined : selectedSpecialty
        }
      });
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error("Failed to fetch clinical registry");
      toast.error("Connectivity error: Unable to sync with medical database.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedSpecialty]);

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();

    // Real-time synchronization for directory
    if (socket) {
      socket.on('doctor_registered', fetchDoctors);
      socket.on('doctor_decommissioned', fetchDoctors);
    }

    return () => {
      if (socket) {
        socket.off('doctor_registered', fetchDoctors);
        socket.off('doctor_decommissioned', fetchDoctors);
      }
    };
  }, [fetchDoctors]);

  // Debounced search could be added here for production, but using fetchDoctors on dependency change for now

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Search Area */}
      <section className="bg-white border-b border-slate-200 pt-32 pb-12 px-8 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <h1 className="text-6xl font-bold uppercase tracking-tighter mb-4">
                Find Your <br /> Specialist.
              </h1>
              <p className="text-slate-500 font-medium max-w-md">
                Browse our real-time directory of verified medical professionals and secure your consultation session.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-grow lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search by name or specialty..." 
                  className="pl-12 h-14 bg-slate-50 border-none uppercase font-mono text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="black" 
                className="h-14 px-8 uppercase tracking-widest text-xs font-bold"
                onClick={fetchDoctors}
              >
                Search Now
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-2 ${
                  selectedSpecialty === spec 
                    ? "bg-medical-blue text-white border-medical-blue" 
                    : "bg-white text-slate-500 border-transparent hover:border-slate-200"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 lg:px-24 py-16">
        <div className="flex items-center justify-between mb-8">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Showing {doctors.length} Verified Specialists
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => <DoctorSkeleton key={i} />)}
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doctor) => (
              <DoctorCard 
                key={doctor._id} 
                id={doctor._id}
                name={doctor.name}
                specialty={doctor.specialization}
                experience={doctor.experience}
                location={doctor.location}
                availability="Active"
                imageUrl={doctor.image}
                rating={4.9}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 flex items-center justify-center mb-8">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4">No Specialists Found</h3>
            <p className="text-slate-400 font-medium text-[11px] max-w-sm mb-8 uppercase tracking-wider">
              We couldn't find any specialists matching your criteria. Try adjusting your filters.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialty("All Specialties");
              }}
              className="uppercase tracking-widest text-[10px] font-bold"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
