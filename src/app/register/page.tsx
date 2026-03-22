'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
  // 📦 1. เตรียม State ให้ตรงกับที่ Backend ต้องการเป๊ะๆ 5 ตัว
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // ค่าเริ่มต้นให้เป็น user ธรรมดา

  const [error, setError] = useState('');

  // 🚀 2. ฟังก์ชันส่งข้อมูลไปหา Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('https://backendpjforfrontend.vercel.app/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // แปลงตัวแปรทั้ง 5 ตัวเป็น JSON ส่งไป
        body: JSON.stringify({
          name,
          email,
          tel,
          password,
          role
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('สมัครสมาชิกสำเร็จ! กรุณาล็อกอิน');
        // สมัครเสร็จแล้วเตะกลับไปหน้า Login
        router.push('/api/auth/signin'); 
      } else {
        setError(data.message || data.error || 'เกิดข้อผิดพลาดในการสมัคร');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
        </div>
        
        {/* โชว์ Error ถ้ามี */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            
            {/* 📝 Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>

            {/* 📧 Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>

            {/* 📱 Tel */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" required value={tel} onChange={(e) => setTel(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0812345678"
              />
            </div>

            {/* 🔑 Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {/* 🎭 Role (ซ่อนไว้ หรือจะทำเป็น Dropdown ก็ได้ แต่มักจะ fix เป็น user) */}
            <input type="hidden" value={role} />

          </div>

          <div>
            <button type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}