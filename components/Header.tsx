import Link from 'next/link';
import { Share2 } from 'lucide-react';
import { SignInButton, Show, UserButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-105">
            <rect width="40" height="40" rx="12" fill="url(#paint0_linear)" />
            <path d="M12 28C12 28 14.5 16 20 16C25.5 16 28 28 28 28" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 20L16 12L24 12L28 20" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="20" cy="20" r="3" fill="white" />
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-2xl font-black text-white tracking-tight">NodeFerry</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          
          <Show when="signed-in">
            <Link href="/dashboard" className="hover:text-white transition-colors text-blue-400">Dashboard</Link>
          </Show>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/pricing" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm hover:shadow">
            Upgrade to Pro
          </Link>

          <Show when="signed-out">
            <div className="text-sm font-medium bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-md transition-colors cursor-pointer text-white border border-slate-700 shadow-sm">
              <SignInButton mode="modal" />
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
