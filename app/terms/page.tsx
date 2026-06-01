export default function TermsAndConditions() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col gap-8">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Terms & Conditions</h1>
      
      <div className="prose prose-invert max-w-none text-slate-400 text-lg space-y-6">
        <p>Last updated: June 1, 2026</p>
        <p>
          Welcome to NodeFerry. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our service.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Use of the Service</h2>
        <p>
          NodeFerry provides a peer-to-peer file transfer service. You agree to use the service only for lawful purposes. You are strictly prohibited from using NodeFerry to transfer:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Illegal, copyrighted, or pirated materials without authorization.</li>
          <li>Malware, viruses, or any harmful code.</li>
          <li>Content that violates the rights of others, including privacy and intellectual property rights.</li>
        </ul>
        <p>
          Because NodeFerry is a peer-to-peer service without central storage, we cannot monitor the content being transferred. However, any reported abuse may result in an immediate ban from the service.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. User Accounts</h2>
        <p>
          While the basic service is available for free without an account, accessing premium ("Pro") features requires creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Subscriptions, Billing, and Cancellation</h2>
        <p>
          <strong>Billing:</strong> NodeFerry offers a Pro subscription billed on a monthly or yearly basis. Payments are securely processed by our merchant of record, Lemon Squeezy. By subscribing, you authorize Lemon Squeezy to charge the applicable subscription fees to your chosen payment method.
        </p>
        <p>
          <strong>Auto-Renewal:</strong> Subscriptions automatically renew at the end of each billing cycle unless you cancel them before the renewal date.
        </p>
        <p>
          <strong>Cancellation:</strong> You may cancel your subscription at any time through your dashboard. If you cancel, your subscription will remain active until the end of your current billing period. We do not provide prorated refunds for mid-cycle cancellations.
        </p>
        <p>
          <strong>Refunds:</strong> Due to the digital nature of our service, all payments are non-refundable unless required by applicable law.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Limitation of Liability</h2>
        <p>
          NodeFerry is provided "as is" and "as available". We make no warranties regarding the reliability, accuracy, or availability of the service. We shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the service or any file transfers made through it.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Modifications to the Service and Terms</h2>
        <p>
          We reserve the right to modify or discontinue the service at any time. We also reserve the right to update these Terms & Conditions. Continued use of the service after such changes constitutes your consent to the changes.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">6. Contact Us</h2>
        <p>
          If you have any questions about these Terms & Conditions, please contact us at: <a href="mailto:support@nodeferry.com" className="text-blue-400 hover:underline">support@nodeferry.com</a>.
        </p>
      </div>
    </div>
  );
}
