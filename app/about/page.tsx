export default function About() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col gap-8">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">About NodeFerry</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
        <p className="text-slate-400 leading-relaxed text-lg">
          NodeFerry was created with a single goal: to provide the fastest, most secure, and completely private way to transfer files between devices. We believe that your data is yours, and transferring a file shouldn't require uploading it to a third-party server first.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">How It Works</h2>
        <p className="text-slate-400 leading-relaxed text-lg">
          Using advanced WebRTC technology, NodeFerry establishes a direct, peer-to-peer (P2P) connection between your device and the receiver's device. Our signaling server simply introduces the two devices. Once connected, files flow directly from one device to another through an encrypted tunnel.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Why Choose NodeFerry?</h2>
        <ul className="list-disc list-inside text-slate-400 space-y-2 text-lg">
          <li><strong>Zero Knowledge:</strong> We don't store your files. They go straight to the destination.</li>
          <li><strong>Blazing Fast:</strong> By skipping cloud uploads, transfers are limited only by your network speed.</li>
          <li><strong>No Size Limits:</strong> Send gigabytes of data seamlessly.</li>
        </ul>
      </section>
    </div>
  );
}
