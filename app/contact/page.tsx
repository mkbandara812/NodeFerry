export default function Contact() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col gap-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">Contact Us</h1>
        <p className="text-slate-400 text-lg">Have a question, feedback, or need support? Drop us a line below.</p>
      </div>
      
      <form className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-300">Name</label>
          <input type="text" id="name" className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" />
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address</label>
          <input type="email" id="email" className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors" placeholder="john@example.com" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-sm font-medium text-slate-300">Message</label>
          <textarea id="message" rows={5} className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors resize-none" placeholder="How can we help?"></textarea>
        </div>

        <button type="button" className="mt-2 w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all active:scale-95">
          Send Message
        </button>
      </form>
    </div>
  );
}
