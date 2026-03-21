'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// 📦 ข้อมูล Mock สำหรับ Admin
const mockAdminReservations = [
  { _id: 'res-01', apptDate: '2024-12-25T18:00:00', user: { name: 'สมชาย ใจดี' }, Reservat_at: '2024-12-01T10:00:00' },
  { _id: 'res-02', apptDate: '2024-12-25T19:30:00', user: { name: 'สมหญิง รักเรียน' }, Reservat_at: '2024-12-02T11:20:00' },
  { _id: 'res-03', apptDate: '2024-12-26T12:00:00', user: { name: 'John Doe' }, Reservat_at: '2024-12-03T09:15:00' }
];

export default function ReservationPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 🔍 เช็คสถานะโหมดและสิทธิ์
  const isMockMode = searchParams.get('mock') === 'true';
  const isAdmin = (session as any)?.user?.role === 'admin';

  // State สำหรับฟอร์มจองของ User
  const [reserveDate, setReserveDate] = useState('');
  
  // State สำหรับรายการจองของ Admin
  const [reservationsList, setReservationsList] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // 🛡️ Effect สำหรับ Admin: ดึงข้อมูลการจองของร้านนี้
  useEffect(() => {
    if (isAdmin) {
      if (isMockMode) {
        setReservationsList(mockAdminReservations);
      } else {
        const fetchReservations = async () => {
          setIsLoadingList(true);
          try {
            // ดึงข้อมูลจาก Backend (ส่ง Token ไปด้วยเพราะ Admin ต้องใช้สิทธิ์)
            const res = await fetch(`https://backendpjforfrontend.vercel.app/api/v1/restaurants/${params.id}/reservations`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${(session as any)?.user?.token}`
              }
            });
            
            if (res.ok) {
              const resData = await res.json();
              // เรียงล าดับตามเวลา apptDate (จากเก่าไปใหม่)
              const sortedData = resData.data.sort((a: any, b: any) => 
                new Date(a.apptDate).getTime() - new Date(b.apptDate).getTime()
              );
              setReservationsList(sortedData);
            } else {
              console.error("Failed to fetch reservations");
            }
          } catch (error) {
            console.error("Error fetching admin data:", error);
          } finally {
            setIsLoadingList(false);
          }
        };
        fetchReservations();
      }
    }
  }, [isAdmin, isMockMode, params.id, session]);

  // 📝 ฟังก์ชั่นจองคิว (สำหรับ User)
  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session && !isMockMode) {
      alert("กรุณา Login ก่อนทำรายการ");
      router.push('/api/auth/signin'); 
      return;
    }

    if (isMockMode) {
      console.log("Mock Payload:", { restaurantId: params.id, apptDate: reserveDate });
      alert("✅ จองคิวสำเร็จ! (Mock Mode)");
      router.push(`/restaurants?mock=true`); 
      return; 
    }

    try {
      const res = await fetch(`https://backendpjforfrontend.vercel.app/api/v1/restaurants/${params.id}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any)?.user?.token}`
        },
        body: JSON.stringify({
          apptDate: reserveDate, 
          Reservat_at: new Date().toISOString() 
        })
      });

      if (res.ok) {
        alert("🎉 จองคิวสำเร็จ!");
        router.push('/restaurants');
      } else {
        const errorData = await res.json();
        alert(`❌ เกิดข้อผิดพลาด: ${errorData.message || 'ไม่สามารถจองได้'}`);
      }
    } catch (error) {
      alert("❌ ไม่สามารถเชื่อมต่อกับ Server ได้");
      console.error(error);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 flex-col">
      
      {/* หัวข้อและป้ายสถานะ (แสดงเหมือนกันทั้ง Admin และ User) */}
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold mb-2">
          {isAdmin ? "Restaurant Reservations (Admin View)" : "Make a Reservation"}
        </h2>
        <div className="text-sm font-normal">
          {isMockMode ? (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full shadow-sm">🟢 Running in Mock Mode</span>
          ) : (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow-sm">🌐 Running with Real API</span>
          )}
        </div>
      </div>

      {/* 🛡️ ส่วนของ ADMIN: แสดงตารางการจอง */}
      {isAdmin ? (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl overflow-x-auto">
          {isLoadingList ? (
            <p className="text-center text-gray-500 py-4">Loading reservations...</p>
          ) : reservationsList.length > 0 ? (
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 border-b border-gray-300">#</th>
                  <th className="p-3 border-b border-gray-300">Customer Name</th>
                  <th className="p-3 border-b border-gray-300">Appointment Time</th>
                  <th className="p-3 border-b border-gray-300">Booked At</th>
                </tr>
              </thead>
              <tbody>
                {reservationsList.map((res, index) => {
                  const apptDate = new Date(res.apptDate);
                  const bookedAt = new Date(res.Reservat_at);
                  return (
                    <tr key={res._id} className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="p-3">{index + 1}</td>
                      {/* ถ้า API ไม่ได้ populate user.name มา ให้ fallback เป็นรหัส ID หรือคำว่า Unknown */}
                      <td className="p-3 font-semibold">{res.user?.name || res.user || 'Unknown User'}</td>
                      <td className="p-3 text-blue-600 font-medium">{apptDate.toLocaleString('th-TH')}</td>
                      <td className="p-3 text-gray-500 text-sm">{bookedAt.toLocaleString('th-TH')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-8 text-lg">No reservations found for this restaurant.</p>
          )}
        </div>
      ) : (
        /* 👤 ส่วนของ USER / GUEST: แสดงฟอร์มจองปกติ */
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <form onSubmit={handleReserve} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Select Date & Time</label>
              <input 
                type="datetime-local" 
                value={reserveDate}
                onChange={(e) => setReserveDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition shadow-md"
            >
              Confirm Reservation
            </button>
          </form>
        </div>
      )}
    </div>
  );
}