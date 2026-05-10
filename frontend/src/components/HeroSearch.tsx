"use client";

import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const HeroSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-white border-2 border-slate-900 p-2 flex flex-col md:flex-row gap-2 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl mb-12">
      <div className="flex-grow flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-100">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search symptoms, doctors, or specialty..."
          className="w-full h-14 bg-transparent outline-none text-sm font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-100 shrink-0">
        <MapPin className="w-5 h-5 text-slate-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-900">New York, NY</span>
      </div>
      <Link href={`/doctors?search=${searchQuery}`}>
        <Button className="h-14 px-8 bg-medical-blue text-white uppercase text-[10px] font-bold tracking-widest shrink-0 w-full md:w-auto">
          Find Doctor
        </Button>
      </Link>
    </div>
  );
};
