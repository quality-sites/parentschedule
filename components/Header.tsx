'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-16 flex items-center justify-between">
        
        {/* Logo and Branding */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
              CC
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Parent Schedule
            </span>
          </Link>
        </div>

        {/* Global Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Calendar</Link>
          <Link href="/how-to-use" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">How To Use</Link>
          <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">About Us</Link>
          <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Contact</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="hidden sm:block text-sm text-gray-500">Hi, {session.user?.name || 'User'}</span>
              <button 
                onClick={() => signOut()} 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/signin"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/auth/signin?type=register"
                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
