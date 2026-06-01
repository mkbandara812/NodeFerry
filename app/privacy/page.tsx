export default function PrivacyPolicy() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col gap-8">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Privacy Policy</h1>
      
      <div className="prose prose-invert max-w-none text-slate-400 text-lg space-y-6">
        <p>Last updated: June 1, 2026</p>
        <p>
          At NodeFerry, privacy is not just a feature; it is the foundation of our technology. This Privacy Policy outlines what information we collect, how we use it, and how we ensure your file transfers remain strictly confidential.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Zero File Storage & Peer-to-Peer Transfers</h2>
        <p>
          NodeFerry is built on WebRTC peer-to-peer technology. When you transfer a file, the data flows directly from your device to the recipient's device. <strong>We do not upload, store, or process your files on our servers at any point.</strong> All file chunks transmitted through the NodeFerry data channel are end-to-end encrypted securely (AES-GCM).
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Data We Collect</h2>
        <p>
          <strong>Account Information:</strong> If you choose to upgrade to our Pro subscription, we collect basic account information necessary for billing and authentication, such as your email address and name. We use third-party authentication providers (like Clerk) to manage your login securely.
        </p>
        <p>
          <strong>Payment Information:</strong> All payments are processed securely via our merchant of record, Lemon Squeezy. We do not store your credit card details on our servers. Lemon Squeezy collects and processes your payment information in accordance with their privacy policy.
        </p>
        <p>
          <strong>Connection Metadata:</strong> To establish a connection between two devices, our Signaling Server temporarily handles connection metadata (Session Description Protocol and ICE candidates). This metadata is ephemeral, contains no file data, and is deleted immediately after the connection is established.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Cookies and Advertising (Google AdSense)</h2>
        <p>
          We use cookies to improve your experience, manage user sessions, and serve advertisements.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website or other websites.</li>
          <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</li>
          <li>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Ads Settings</a>.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Analytics and Tracking</h2>
        <p>
          We do not track individual file transfer metrics or store identifying information about who sends what. We may collect anonymous, aggregated data (such as the number of active rooms or website visits) strictly to monitor server health, ensure service reliability, and understand website traffic.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:support@nodeferry.com" className="text-blue-400 hover:underline">support@nodeferry.com</a>.
        </p>
      </div>
    </div>
  );
}
