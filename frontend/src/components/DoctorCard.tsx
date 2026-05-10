"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, ArrowUpRight, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { BookingDrawer } from "./BookingDrawer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  location: string;
  availability: string;
  imageUrl: string;
}

export const DoctorCard = ({ 
  id, 
  name, 
  specialty, 
  experience, 
  location, 
  availability, 
  imageUrl 
}: DoctorCardProps) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleBookClick = () => {
    if (!user) {
      router.push(`/login?redirect=/doctors/${id}`);
      return;
    }
    setIsBookingOpen(true);
  };

  return (
    <>
      <Card className="group border-slate-200 hover:border-slate-900 transition-colors bg-white">
        <Link href={`/doctors/${id}`}>
          <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 cursor-pointer">
            <Image
              src={imageUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600&h=800"}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-all duration-500 scale-105 group-hover:scale-100"
            />
            <div className="absolute top-4 right-4 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
              Available {availability}
            </div>
          </div>
        </Link>
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-medical-blue mb-1">
              {specialty}
            </div>
            <Link href={`/doctors/${id}`}>
              <h3 className="text-xl font-bold uppercase leading-tight group-hover:text-medical-blue transition-colors cursor-pointer">
                {name}
              </h3>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Exp.</div>
              <div className="text-sm font-bold">{experience} Years</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-6">
            <MapPin className="w-3 h-3" />
            {location}
          </div>

          <Button 
            variant="outline" 
            className="w-full uppercase text-xs tracking-widest h-14 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
            onClick={handleBookClick}
          >
            Book <ArrowUpRight className="ml-2 w-3 h-3" />
          </Button>
        </CardContent>
      </Card>

      <BookingDrawer 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        doctor={{ id, name, specialization: specialty }}
      />
    </>
  );
};

export const DoctorSkeleton = () => (
  <Card className="border-slate-200 animate-pulse">
    <div className="aspect-[4/5] bg-slate-100 flex items-center justify-center">
      <Stethoscope className="w-12 h-12 text-slate-200" />
    </div>
    <CardContent className="p-6 space-y-4">
      <div className="h-3 w-20 bg-slate-100" />
      <div className="h-6 w-full bg-slate-100" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-8 bg-slate-50" />
        <div className="h-8 bg-slate-50" />
      </div>
      <div className="h-12 w-full bg-slate-50" />
    </CardContent>
  </Card>
);
