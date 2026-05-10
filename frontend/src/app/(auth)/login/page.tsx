"use client";

import React, { useState, Suspense } from "react";
import { Stethoscope, Activity, Lock, Mail, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-white" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || undefined;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await login(email, password, redirectTo);
    } catch (err: any) {
      setError(err || "Invalid credentials. Please try again.");
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
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" 
          alt="Healthcare" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-medical-blue/10 backdrop-none" />
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div 
          className="w-full max-w-md animate-slideUp"
        >
          <div className="mb-10">
            <div className="w-12 h-12 bg-medical-blue flex items-center justify-center mb-6">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-bold uppercase tracking-tighter mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium text-sm">Please enter your details to log in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest rounded-none animate-slideDown">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="pl-12 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                <Link href="#" className="text-[10px] font-bold uppercase text-medical-blue hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 uppercase tracking-widest text-sm" 
              isLoading={isLoading}
              variant="black"
            >
              Log In <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm">
            <p className="text-slate-500 font-medium">
              New here?{" "}
              <Link href="/register" className="text-medical-blue font-bold uppercase hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
