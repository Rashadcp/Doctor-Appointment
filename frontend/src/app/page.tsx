import React from "react";
import { 
  Stethoscope, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Users, 
  Zap, 
  Heart, 
  Brain, 
  Bone, 
  Eye, 
  Baby, 
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { HeroSearch } from "@/components/HeroSearch";
import { ClientMotionWrapper } from "@/components/ClientMotionWrapper";

const TOP_SPECIALTIES = [
  { name: "Cardiology", icon: Heart, count: "12 Specialists" },
  { name: "Neurology", icon: Brain, count: "08 Specialists" },
  { name: "Orthopedics", icon: Bone, count: "15 Specialists" },
  { name: "Ophthalmology", icon: Eye, count: "06 Specialists" },
  { name: "Pediatrics", icon: Baby, count: "22 Specialists" },
  { name: "General Medicine", icon: Stethoscope, count: "40+ Specialists" },
];

async function getSpecializationStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/doctors/stats/specializations`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch clinical stats for SSG");
    return [];
  }
}

export default async function Home() {
  const stats = await getSpecializationStats();

  // Map icons to the fetched stats
  const specialtyDisplay = stats.map((s: any) => {
    const top = TOP_SPECIALTIES.find(t => t.name.toLowerCase() === s.name.toLowerCase());
    return {
      ...s,
      icon: top?.icon || Stethoscope,
      label: s.name
    };
  });

  return (
    <div className="min-h-screen bg-white selection:bg-medical-blue selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 lg:px-24 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ClientMotionWrapper initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-medical-blue/10 text-medical-blue text-[10px] font-bold uppercase tracking-widest mb-6 border border-medical-blue/20">
              <Zap className="w-3 h-3" /> Book your visit in real-time
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold uppercase tracking-tighter leading-[1.1] mb-6">
              Better Healthcare <br />
              <span className="text-medical-blue italic font-light lowercase">Simplified</span> <br />
              for your life.
            </h1>
            
            <p className="text-lg text-slate-500 font-medium max-w-xl mb-10 leading-relaxed">
              Skip the waiting room. Connect with top-tier doctors and specialists through a platform designed for your convenience.
            </p>

            {/* Client-Side Interactive Search REMOVED as per request */}

            <div className="flex items-center gap-8 text-slate-400 mt-10">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} /> <span className="text-[9px] font-bold uppercase tracking-widest">Verified Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} /> <span className="text-[9px] font-bold uppercase tracking-widest">Easy Booking</span>
              </div>
            </div>
          </ClientMotionWrapper>

          <ClientMotionWrapper initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden border-2 border-slate-900 shadow-[15px_15px_0px_0px_rgba(15,103,254,1)]">
                <Image
                  src="/doctor_consulting_patient.png"
                  alt="Doctor Consulting Patient"
                  fill
                  sizes="(max-width: 1024px) 0vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </ClientMotionWrapper>
        </div>
      </section>

      {/* Specialty Discovery */}
      <section className="py-24 px-8 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-medical-blue mb-4">Explore Care</div>
              <h2 className="text-4xl lg:text-5xl font-bold uppercase tracking-tighter leading-none">
                What kind of <br /> help do you need?
              </h2>
            </div>
            <Link href="/doctors">
              <Button variant="outline" className="h-12 px-6 border-2 uppercase text-[10px] font-bold tracking-widest">
                See all specialties <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialtyDisplay.map((spec: any, i: number) => (
              <Link key={spec.label} href={`/doctors?specialization=${spec.label}`}>
                <div className="bg-white border border-slate-100 p-8 flex flex-col items-center text-center group cursor-pointer hover:border-medical-blue transition-colors h-full">
                  <div className="w-16 h-16 bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-medical-blue/10 transition-colors">
                    <spec.icon className="w-8 h-8 text-slate-400 group-hover:text-medical-blue transition-colors" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-2">{spec.label}</h4>
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {spec.count.toString().padStart(2, '0')} doctors
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical Metrics / Stats Row */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-8 lg:px-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Happy Patients", value: "50k+", sub: "Trusted Care" },
              { label: "Verified Experts", value: "240+", sub: "Top Specialists" },
              { label: "Patient Satisfaction", value: "99.2%", sub: "High Standards" },
              { label: "Average Wait", value: "< 2min", sub: "Fast Response" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</div>
                <div className="text-4xl font-bold tracking-tighter text-medical-blue mb-1">{stat.value}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Clinical Protocol */}
      <section className="py-32 px-8 lg:px-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-20">
            <div className="max-w-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-medical-blue mb-6">How it works</div>
              <h2 className="text-5xl font-bold uppercase tracking-tighter leading-none mb-8 text-white">
                Your Health, <br /> Made Simple.
              </h2>
              <p className="text-slate-300 font-medium leading-relaxed">
                We've designed every step to be as easy as possible. From finding a doctor to your final consultation, we're with you all the way.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
              {[
                { step: "01", title: "Find", desc: "Browse our network to find the right doctor for your needs." },
                { step: "02", title: "Book", desc: "Choose a time that works for you and get instant confirmation." },
                { step: "03", title: "Meet", desc: "Speak with your doctor and get the care you deserve." },
              ].map((item, i) => (
                <div key={i} className="p-8 border border-white/20 hover:border-medical-blue/70 transition-colors group">
                  <div className="text-4xl font-light italic text-medical-blue/60 group-hover:text-medical-blue transition-colors mb-6">{item.step}</div>
                  <h4 className="text-xl font-bold uppercase tracking-tight mb-4 text-white">{item.title}</h4>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features & Trust */}
      {/* ... existing content ... */}

      {/* Gallery Section */}
      <section className="py-24 px-8 lg:px-24 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-medical-blue mb-4">Clinical Environment</div>
            <h2 className="text-5xl lg:text-6xl font-bold uppercase tracking-tighter">Premier Healthcare <br /> Infrastructure.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-video bg-slate-200 border-2 border-slate-900 overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,103,254,1)] relative">
              <Image
                src="/professional_nurse.png"
                alt="Hospital Care"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="aspect-video bg-slate-200 border-2 border-slate-900 overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
              <Image
                src="/medical_team.png"
                alt="Clinical Team"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white px-8 lg:px-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl lg:text-7xl font-bold uppercase tracking-tighter mb-12">
            Experience Medical <br /> Infrastructure <br /> at its finest.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register">
              <Button className="h-20 px-12 bg-slate-900 text-white hover:bg-black text-sm uppercase tracking-widest font-bold shadow-[10px_10px_0px_0px_rgba(15,103,254,1)]">
                Create Patient Account
              </Button>
            </Link>
            <Link href="/doctors">
              <Button variant="ghost" className="h-20 px-12 text-slate-900 hover:bg-slate-100 text-sm uppercase tracking-widest font-bold">
                Browse Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 px-8 lg:px-24 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-medical-blue flex items-center justify-center">
                  <Stethoscope className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tighter uppercase">MedMatch</span>
              </div>
              <p className="text-sm text-slate-500 font-medium max-w-sm leading-relaxed mb-8">
                The world's first precision-engineered medical consultation platform. 
                Connecting patients with elite clinical practitioners through high-performance scheduling protocols.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center hover:border-medical-blue transition-colors cursor-pointer">
                  <Activity size={18} className="text-slate-400" />
                </div>
                <div className="w-10 h-10 bg-white border border-slate-200 flex items-center justify-center hover:border-medical-blue transition-colors cursor-pointer">
                  <Heart size={18} className="text-slate-400" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Platform</h4>
              <ul className="space-y-4">
                <li><Link href="/doctors" className="text-xs font-bold uppercase tracking-widest hover:text-medical-blue transition-colors">Directory</Link></li>
                <li><Link href="/login" className="text-xs font-bold uppercase tracking-widest hover:text-medical-blue transition-colors">Patient Login</Link></li>
                <li><Link href="/register" className="text-xs font-bold uppercase tracking-widest hover:text-medical-blue transition-colors">Registration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Infrastructure</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-xs font-bold uppercase tracking-widest hover:text-medical-blue transition-colors">Security</Link></li>
                <li><Link href="#" className="text-xs font-bold uppercase tracking-widest hover:text-medical-blue transition-colors">API Docs</Link></li>
                <li><Link href="#" className="text-xs font-bold uppercase tracking-widest hover:text-medical-blue transition-colors">System Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              © 2026 MedMatch Clinical Infrastructure. Built for Precision.
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">Privacy Protocol</Link>
              <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">Legal Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
