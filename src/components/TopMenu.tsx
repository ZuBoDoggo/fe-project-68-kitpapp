'use client'
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

export default function TopMenu() {
  const { data: session } = useSession();

  return (
    <div className="h-16 bg-white shadow-md flex items-center px-8 justify-between z-50 fixed top-0 w-full transition-all">
      <div className="flex gap-6 items-center font-semibold">
        <Link href="/" className="text-xl gap-6 font-extrabold text-gray-900">🍽️ RestaReserve</Link>
        <Link href="/my-reservations" className="text-gray-600 hover:text-gray-900 transition">My Reservations</Link>
      </div>
      <div className="flex gap-6 items-center font-semibold">
        <Link href="/restaurants" className="text-gray-600 hover:text-gray-900 transition">
          Restaurants
        </Link>
        
        {session ? (
          <>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })} 
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition shadow-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-gray-900 !text-white px-4 py-2 rounded-md hover:bg-gray-700 transition shadow-sm">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}