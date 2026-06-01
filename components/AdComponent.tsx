export default function AdComponent() {
  return (
    <div className="w-full max-w-3xl my-6 bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center min-h-[120px]">
      <span className="text-xs text-slate-500 uppercase tracking-widest mb-2">Advertisement</span>
      <div className="w-full max-w-lg h-[90px] bg-slate-900 rounded-lg flex items-center justify-center border border-dashed border-slate-700">
        <span className="text-slate-600 text-sm">Google AdSense Placeholder</span>
      </div>
      <a href="/pricing" className="text-xs text-blue-400 hover:text-blue-300 mt-3 transition-colors">
        Upgrade to Pro to remove ads
      </a>
    </div>
  );
}
