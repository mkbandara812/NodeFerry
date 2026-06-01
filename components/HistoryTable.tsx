import { supabase } from '@/lib/supabase';
import { FileText, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default async function HistoryTable({ userId }: { userId: string }) {
  const { data: transfers, error } = await supabase
    .from('transfers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return <div className="text-red-400 p-4 bg-red-900/20 rounded-xl border border-red-900">Failed to load transfer history.</div>;
  }

  if (!transfers || transfers.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
        <FileText className="w-12 h-12 text-slate-700 mb-4" />
        <h3 className="text-white font-bold mb-1">No Transfers Yet</h3>
        <p className="text-slate-500 text-sm">Your secure P2P file transfers will appear here once completed. Files are never stored.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg">Transfer History (Last 20)</h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-emerald-500" /> We only store metadata. Files are sent strictly P2P.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-4">File Name</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {transfers.map((t) => (
              <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-500" />
                  {t.filename}
                </td>
                <td className="px-6 py-4">
                  {(t.size_bytes / 1024 / 1024).toFixed(2)} MB
                </td>
                <td className="px-6 py-4">
                  {t.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-800/50">
                      <Clock className="w-3.5 h-3.5" /> {t.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">
                  {new Date(t.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
