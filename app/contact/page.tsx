export default function Contact() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl min-h-[60vh]" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Contact Support</h1>
      <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mb-8">
        Have questions, feedback, or feature requests? We'd love to hear from you. 
        This app is built by parents, for parents.
      </p>
      
      <form className="max-w-xl space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" id="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
          <textarea id="message" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" placeholder="How can we help?"></textarea>
        </div>
        <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
          Send Message
        </button>
      </form>
    </div>
  );
}
