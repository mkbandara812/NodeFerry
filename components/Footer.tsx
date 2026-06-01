import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-400 text-sm text-center md:text-left">
          &copy; {new Date().getFullYear()} NodeFerry. All rights reserved. <br />
          Built for secure, instant P2P file sharing.
        </div>
        <div className="flex gap-6 text-sm text-slate-400 flex-wrap justify-center md:justify-end">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
