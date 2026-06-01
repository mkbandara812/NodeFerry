"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/pricing');
      return;
    }

    setLoading(true);
    try {
      const variantId = isYearly 
        ? process.env.NEXT_PUBLIC_LEMON_YEARLY_VARIANT_ID 
        : process.env.NEXT_PUBLIC_LEMON_MONTHLY_VARIANT_ID;

      if (!variantId) {
        alert("Variant IDs are not configured in environment variables.");
        setLoading(false);
        return;
      }

      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">Choose Your Plan</h1>
      <p className="text-slate-400 text-lg text-center mb-10 max-w-2xl">
        Experience the future of WebRTC file sharing. Upgrade to unlock military-grade encryption, multi-file queues, and custom branding.
      </p>

      {/* Toggle */}
      <div className="flex items-center gap-3 mb-12 bg-slate-900/80 p-1.5 rounded-full border border-slate-800">
        <button 
          onClick={() => setIsYearly(false)}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${!isYearly ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Monthly
        </button>
        <button 
          onClick={() => setIsYearly(true)}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${isYearly ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Yearly <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30">Save ~16%</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Free Plan */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col relative opacity-80 hover:opacity-100 transition-opacity">
          <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-4xl font-extrabold text-white">$0</span>
            <span className="text-slate-400 mb-1">/ forever</span>
          </div>
          <ul className="space-y-4 mb-8 text-slate-300 flex-1 text-sm md:text-base">
            <li className="flex items-center gap-3">✅ Single File Transfer</li>
            <li className="flex items-center gap-3">✅ Up to 2GB File Size</li>
            <li className="flex items-center gap-3 text-slate-500 line-through">❌ Multi-File Queue</li>
            <li className="flex items-center gap-3 text-slate-500 line-through">❌ Password Protected Rooms</li>
            <li className="flex items-center gap-3 text-slate-500 line-through">❌ E2E Encryption (AES-GCM)</li>
            <li className="flex items-center gap-3 text-slate-500 line-through">❌ Custom Branding / White-label</li>
            <li className="flex items-center gap-3 text-slate-500 line-through">❌ Live Analytics & Chat</li>
            <li className="flex items-center gap-3 text-slate-500 line-through">❌ Ad-Free Experience</li>
          </ul>
          <Link href="/" className="w-full py-4 text-center border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-300 rounded-xl font-semibold transition-all">
            Continue with Free
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-b from-blue-900/50 to-slate-900/80 border border-blue-500 p-8 rounded-3xl flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-6 rounded-full shadow-lg">
            Recommended
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
          <div className="flex items-end gap-1 mb-6">
            <span className="text-4xl font-extrabold text-white">{isYearly ? '$49.99' : '$4.99'}</span>
            <span className="text-slate-400 mb-1">/ {isYearly ? 'year' : 'month'}</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-sm md:text-base">
            <li className="flex items-center gap-3 font-medium text-blue-100">✅ Unlimited File Size</li>
            <li className="flex items-center gap-3 font-medium text-blue-100">✅ Send Multiple Files Instantly</li>
            <li className="flex items-center gap-3 font-medium text-emerald-400">✅ Password Protected Rooms</li>
            <li className="flex items-center gap-3 font-medium text-emerald-400">✅ E2E Encryption (AES-GCM)</li>
            <li className="flex items-center gap-3 font-medium text-emerald-400">✅ Custom Receiver Branding</li>
            <li className="flex items-center gap-3 font-medium text-blue-100">✅ Live Analytics & Room Chat</li>
            <li className="flex items-center gap-3 font-medium text-blue-100">✅ Completely Ad-Free</li>
          </ul>
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 text-center bg-blue-600 hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            {loading ? 'Preparing Checkout...' : 'Upgrade to Pro'}
            {!loading && (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
