import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200" style={{ marginTop: '8rem' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl" style={{ paddingTop: '4rem', paddingBottom: '3rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                CC
              </div>
              <span className="font-bold text-lg text-gray-900">Parent Schedule</span>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs">
              Simplifying shared custody management so you can focus on what matters most—your child.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/how-to-use" className="text-sm text-gray-500 hover:text-indigo-600">How to Use</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-indigo-600">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-indigo-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-indigo-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-gray-500 hover:text-indigo-600">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Parent Schedule. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
