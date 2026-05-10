"use client";

import React, { useState, Suspense } from "react";
import { User, Mail, Lock, ArrowRight, CheckCircle2, ChevronLeft, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-white" />}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, redirectTo);
    } catch (err: any) {
      setError(err || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden relative">
      {/* Floating Home Button */}
      <div className="absolute top-8 left-8 lg:left-auto lg:right-8 z-50">
        <Link href="/">
          <Button variant="outline" className="h-10 px-4 text-[10px] font-bold uppercase tracking-widest bg-white/80 backdrop-blur-sm border-slate-200 text-slate-900 hover:text-black">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </div>

      {/* Left Side: Image */}
      <div className="hidden lg:flex w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200" 
          alt="Clinic" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-medical-blue/10 backdrop-none" />
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div 
          className="w-full max-w-md animate-slideUp"
        >
          <div className="mb-10">
            <div className="w-12 h-12 bg-medical-blue flex items-center justify-center mb-6">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold uppercase tracking-tighter mb-2 text-slate-900">Create Account</h2>
            <p className="text-slate-500 font-medium text-sm">Join our medical platform today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest rounded-none animate-slideDown">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="John Doe" 
                  className="pl-12 h-11"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="pl-12 h-11"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-12 h-11"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-12 h-11"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 uppercase tracking-widest text-sm mt-4" 
              isLoading={isLoading}
              variant="black"
            >
              Sign Up <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center text-sm">
            <p className="text-slate-500 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-medical-blue font-bold uppercase hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
