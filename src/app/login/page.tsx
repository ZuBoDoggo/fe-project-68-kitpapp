// app/login/page.tsx
'use client'
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/restaurants'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 
              placeholder-gray-300 text-black" 
              placeholder="Enter your email" required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 
              placeholder-gray-300 text-black" 
              placeholder="Enter your password" required
            />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 transition duration-300">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}