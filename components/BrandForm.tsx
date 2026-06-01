'use client';
import { useState } from 'react';
import { Sparkles, Upload } from 'lucide-react';

export default function BrandForm({ currentBrand, currentVanity, isPro }: { currentBrand: string, currentVanity?: string, isPro: boolean }) {
  const [brand, setBrand] = useState(currentBrand || '');
  const [vanity, setVanity] = useState(currentVanity || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) {
        alert("Custom branding is a Pro feature!");
        return;
    }
    setLoading(true);
    try {
        const formData = new FormData();
        formData.append('brandName', brand);
        formData.append('vanityUrl', vanity);
        if (logoFile) formData.append('logo', logoFile);
        if (bgFile) formData.append('background', bgFile);

        const res = await fetch('/api/user/profile', {
            method: 'POST',
            body: formData
        });
        
        if (!res.ok) throw new Error('Failed to update');
        
        alert('Profile updated successfully! Your Vanity URL and Branding are now live.');
    } catch (e) {
        alert('Failed to update profile. Make sure the Vanity URL is unique.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
       <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-4">
           <Sparkles className="w-5 h-5 text-yellow-400" />
           Pro Branding & Vanity URL
       </div>
       
       <form onSubmit={saveProfile} className="flex flex-col gap-6">
           <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-slate-300">Company / Brand Name</label>
               <input 
                   value={brand} 
                   onChange={e => setBrand(e.target.value)} 
                   placeholder="e.g. Acme Corp" 
                   disabled={!isPro || loading}
                   className="bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 disabled:opacity-50" 
               />
           </div>

           <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-slate-300">Vanity URL Slug</label>
               <div className="flex items-center">
                   <span className="bg-slate-800 border border-slate-700 border-r-0 text-slate-400 px-4 py-3 rounded-l-xl text-sm">nodeferry.com/</span>
                   <input 
                       value={vanity} 
                       onChange={e => setVanity(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                       placeholder="your-name" 
                       disabled={!isPro || loading}
                       className="bg-slate-950 border border-slate-700 border-l-0 text-white px-4 py-3 rounded-r-xl outline-none focus:border-blue-500 flex-1 disabled:opacity-50" 
                   />
               </div>
               <p className="text-xs text-slate-500">Only letters, numbers, and hyphens.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex flex-col gap-2">
                   <label className="text-sm font-medium text-slate-300">Custom Logo Image</label>
                   <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-blue-400">
                       <Upload className="w-6 h-6 mb-2" />
                       <span className="text-xs">{logoFile ? logoFile.name : 'Upload Logo (PNG/JPG)'}</span>
                       <input type="file" accept="image/*" className="hidden" disabled={!isPro || loading} onChange={e => setLogoFile(e.target.files?.[0] || null)} />
                   </label>
               </div>

               <div className="flex flex-col gap-2">
                   <label className="text-sm font-medium text-slate-300">Custom Background</label>
                   <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-blue-400">
                       <Upload className="w-6 h-6 mb-2" />
                       <span className="text-xs">{bgFile ? bgFile.name : 'Upload Background (HD)'}</span>
                       <input type="file" accept="image/*" className="hidden" disabled={!isPro || loading} onChange={e => setBgFile(e.target.files?.[0] || null)} />
                   </label>
               </div>
           </div>

           <div className="pt-2">
               <button 
                   type="submit"
                   disabled={!isPro || loading} 
                   className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                   {loading ? 'Saving Profile...' : 'Save Brand Settings'}
               </button>
               {!isPro && <p className="text-xs text-center text-amber-400 font-medium mt-3">Upgrade to Pro to unlock custom branding & vanity URLs.</p>}
           </div>
       </form>
    </div>
  )
}
