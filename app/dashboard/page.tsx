import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BrandForm from "@/components/BrandForm";
import HistoryTable from "@/components/HistoryTable";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();
  const plan = user?.publicMetadata?.plan || "free";
  const isAdmin = user?.emailAddresses?.some(e => e.emailAddress === 'melanbandara24@gmail.com') || false;
  const isPro = plan === "pro" || user?.publicMetadata?.isPro === true || isAdmin;
  const brandName = (user?.publicMetadata?.brandName as string) || "";
  const vanityUrl = (user?.publicMetadata?.vanityUrl as string) || "";
  const customerPortalUrl = user?.publicMetadata?.customerPortalUrl as string | undefined;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-8">
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6">
        <img src={user?.imageUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-800" />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.firstName || 'User'}!</h1>
          <p className="text-slate-400">Manage your NodeFerry account and subscriptions here.</p>
        </div>
        <div className="bg-slate-950 px-6 py-4 rounded-xl border border-slate-800 text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-1">Current Plan</p>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">
            {isPro ? "PRO" : "FREE"}
          </p>
        </div>
      </div>

      {!isPro ? (
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-500/30 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Unlock Pro Features</h3>
            <p className="text-sm text-slate-300">Get multiple files, branding, live analytics, chat, and zero ads.</p>
          </div>
          <Link href="/pricing" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors whitespace-nowrap">
            Upgrade Now
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-4">Subscription Management</h3>
          <p className="text-slate-400 mb-6">
            You are currently on the Pro plan. You have access to unlimited file sizes, multi-file queues, and end-to-end encryption.
          </p>
          {customerPortalUrl ? (
            <div>
              <a 
                href={customerPortalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors border border-slate-700 hover:border-slate-600"
              >
                Manage / Cancel Subscription
              </a>
              <p className="text-xs text-slate-500 mt-3 max-w-lg">
                Cancellations will take effect at the end of your current billing cycle. You will continue to have Pro access until then.
              </p>
            </div>
          ) : (
            <p className="text-yellow-500/80 text-sm">
              Your billing portal link is being generated. Please check back later or contact support if you need immediate assistance.
            </p>
          )}
        </div>
      )}

      <BrandForm currentBrand={brandName} currentVanity={vanityUrl} isPro={isPro} />
      
      {isPro && <HistoryTable userId={userId} />}
    </div>
  );
}
