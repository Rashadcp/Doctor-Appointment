"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Calendar, 
  Star, 
  MapPin, 
  Award, 
  Users, 
  Clock, 
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookingDrawer } from "@/components/BookingDrawer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import socket from "@/services/socket";

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const fetchDoctor = async () => {
    try {
      const response = await api.get(`/doctors/${id}`);
      setDoctor(response.data);
    } catch (err) {
      setError("Failed to load clinical practitioner details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const handleBookingClick = () => {
    if (!user) {
      router.push(`/login?redirect=/doctors/${id}`);
      return;
    }
    setIsBookingOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-medical-blue" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white border border-red-100 p-8 text-center space-y-6 shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold uppercase tracking-tighter">System Error</h2>
          <p className="text-slate-500 text-sm font-medium">{error || "Doctor record not found."}</p>
          <Link href="/doctors" className="block">
            <Button variant="black" className="w-full h-12 uppercase tracking-widest text-xs">Return to Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Portrait */}
            <div className="w-full lg:w-72 shrink-0 aspect-[3/4] bg-slate-100 border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,103,254,1)] relative overflow-hidden">
              <img 
                src={doctor.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600&h=800"} 
                alt={doctor.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Link href="/doctors">
                  <Button variant="black" className="h-8 w-8 p-0 flex items-center justify-center shadow-lg">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="px-3 py-1 bg-medical-blue/10 text-medical-blue text-[9px] font-black uppercase tracking-[0.2em] border border-medical-blue/20">
                    {doctor.specialization}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 4.9 <span className="text-slate-300 mx-1">|</span> 124 Reviews
                  </div>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-tight text-ink-black">
                  {doctor.name}
                </h1>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-1 bg-slate-200 border border-slate-200">
                <div className="bg-white p-5 text-center sm:text-left">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Experience</div>
                  <div className="text-xl font-bold">{doctor.experience} Years</div>
                </div>
                <div className="bg-white p-5 text-center sm:text-left">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Consultation</div>
                  <div className="text-xl font-bold">${doctor.fee}</div>
                </div>
                <div className="bg-white p-5 hidden md:block">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</div>
                  <div className="text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Active Duty
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                    <MapPin className="w-4 h-4 text-medical-blue" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Facility</h4>
                    <p className="text-xs font-bold uppercase tracking-wider">{doctor.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                    <Clock className="w-4 h-4 text-medical-blue" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hours</h4>
                    <p className="text-xs font-bold uppercase tracking-wider">Mon - Fri : 09:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio & Booking */}
      <section className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-tighter mb-6 border-b-2 border-slate-900 inline-block">Specialist Profile</h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              {doctor.name} is a certified specialist in {doctor.specialization} with {doctor.experience} years of clinical background. 
              Currently serving as a primary consultant at {doctor.location}, providing high-precision medical oversight and strategic health management.
            </p>
          </div>
        </div>

        {/* Booking Trigger */}
        <div className="lg:col-span-1">
          <Card className="sticky top-28 bg-white border-2 border-slate-900 p-8 shadow-[20px_20px_0px_0px_rgba(15,103,254,1)]">
            <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4">Ready for <br /> Consultation?</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8 leading-relaxed">
              Secure your slot through our real-time clinical scheduling protocol.
            </p>
            
            <Button 
              className="w-full h-16 uppercase tracking-widest text-sm font-bold" 
              variant="black"
              onClick={handleBookingClick}
            >
              Book Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 size={12} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Verified Credentials</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-medical-blue/10 text-medical-blue flex items-center justify-center border border-medical-blue/20">
                  <Shield size={12} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Secure Transmission</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <BookingDrawer 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        doctor={{
          id: id,
          name: doctor.name,
          specialization: doctor.specialization
        }}
      />
    </div>
  );
}
