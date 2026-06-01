export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-slate-300 min-h-[70vh]">
      <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
      
      <div className="space-y-6 text-lg leading-relaxed">
        <p>
          Thank you for subscribing to NodeFerry Pro. We want to ensure you have a great experience with our P2P file sharing service.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. 14-Day Money-Back Guarantee</h2>
        <p>
          We offer a full 14-day money-back guarantee for all new NodeFerry Pro subscriptions. If you are not completely satisfied with our service, you can request a full refund within the first 14 days of your initial purchase.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Eligibility for Refunds</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>The refund request must be submitted within 14 days of the original purchase date.</li>
          <li>This guarantee applies to your first subscription only (not renewals).</li>
          <li>Accounts terminated due to a violation of our Terms of Service (e.g., sharing illegal content) are not eligible for any refunds.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. How to Request a Refund</h2>
        <p>
          To request a refund, please contact our support team at <strong>support@nodeferry.com</strong> with your account email address and order number. We will process your refund within 3-5 business days.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Cancellations</h2>
        <p>
          You can cancel your subscription at any time from your account dashboard. Canceling prevents future billing, but does not automatically issue a refund for the current billing cycle. You will continue to have access to Pro features until the end of your billing period.
        </p>
      </div>
    </div>
  );
}
