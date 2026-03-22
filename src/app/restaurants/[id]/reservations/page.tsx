'use client'
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// 📦 ข้อมูล Mock จำลอง (เพิ่มข้อมูลร้านอาหารเข้าไป)
const mockAdminReservations = [
  { _id: 'res-01', apptDate: '2026-03-25T18:00:00', user: { name: 'สมชาย ใจดี' }, Reservat_at: '2026-03-01T10:00:00', restaurant: { name: 'อร่อยเหาะ เรสเตอรองต์' } },
  { _id: 'res-02', apptDate: '2026-03-25T19:30:00', user: { name: 'สมหญิง รักเรียน' }, Reservat_at: '2026-03-02T11:20:00', restaurant: { name: 'อร่อยเหาะ เรสเตอรองต์' } }
];

export default function ReservationPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isMockMode = searchParams.get('mock') === 'true';
  const isAdmin = (session as any)?.user?.role === 'admin';
  const token = (session as any)?.user?.token;

  const [reserveDate, setReserveDate] = useState('');
  const [reservationsList, setReservationsList] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');

  const fetchReservations = useCallback(async () => {
    if (!token && !isMockMode) return;
    
    if (isMockMode) {
      setReservationsList(mockAdminReservations);
      return;
    }

    setIsLoadingList(true);
    try {
      const res = await fetch(`https://backendpjforfrontend.vercel.app/api/v1/restaurants/${params.id}/reservations`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const resData = await res.json();
        const sortedData = resData.data.sort((a: any, b: any) => 
          new Date(a.apptDate).getTime() - new Date(b.apptDate).getTime()
        );
        setReservationsList(sortedData);
      }
    } catch (error) { console.error(error); } 
    finally { setIsLoadingList(false); }
  }, [isMockMode, params.id, token]);

  useEffect(() => {
    if (status === 'authenticated' || isMockMode) fetchReservations();
  }, [status, fetchReservations, isMockMode]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reservation?")) return;
    if (isMockMode) { alert("Mock Mode: ลบข้อมูลสำเร็จ!"); return; }
    try {
      const res = await fetch(`https://backendpjforfrontend.vercel.app/api/v1/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("ลบสำเร็จ!");
        fetchReservations();
      } else alert("ไม่สามารถลบได้");
    } catch (err) { console.error(err); }
  };

  const handleSaveUpdate = async (id: string) => {
    if (isMockMode) { alert("Mock Mode: อัปเดตสำเร็จ!"); setEditingId(null); return; }
    try {
      const res = await fetch(`https://backendpjforfrontend.vercel.app/api/v1/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ apptDate: editDate })
      });
      if (res.ok) {
        alert("อัปเดตเวลาจองสำเร็จ!");
        setEditingId(null);
        fetchReservations();
      } else alert("แก้ไขไม่สำเร็จ");
    } catch (err) { console.error(err); }
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session && !isMockMode) { alert("กรุณา Login"); router.push('/api/auth/signin'); return; }
    if (isMockMode) { alert("✅ จองสำเร็จ (Mock)"); router.push(`/restaurants?mock=true`); return; }

    try {
      const res = await fetch(`https://backendpjforfrontend.vercel.app/api/v1/restaurants/${params.id}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ apptDate: reserveDate, Reservat_at: new Date().toISOString() })
      });
      if (res.ok) {
        alert("🎉 จองคิวสำเร็จ!");
        setReserveDate(''); // ล้างช่องจอง
        fetchReservations(); // โหลดข้อมูลใหม่เข้าตารางด้านล่างทันที
      } else {
        const err = await res.json();
        alert(`❌ ${err.message}`);
      }
    } catch (error) { alert("❌ เชื่อมต่อ Server ไม่ได้"); }
  };

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 flex-col mt-8">
      
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold mb-2">
          {isAdmin ? "Restaurant Reservations (Admin)" : "Make & Manage Reservations"}
        </h2>
        <div className="text-sm">
          {isMockMode ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">🟢 Mock Mode</span> : <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">🌐 Real API</span>}
        </div>
      </div>

      {/* 👤 ถ้าไม่ใช่ Admin ให้โชว์ฟอร์มจองตรงนี้ */}
      {!isAdmin && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mb-8">
          <form onSubmit={handleReserve} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Select Date & Time</label>
              <input type="datetime-local" value={reserveDate} onChange={(e) => setReserveDate(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-700">Confirm Reservation</button>
          </form>
        </div>
      )}

      {/* 📋 ตารางการจอง */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl overflow-x-auto">
        <h3 className="text-xl font-bold mb-4">{isAdmin ? "All Reservations" : "Your Reservations Here"}</h3>
        
        {isLoadingList ? (
          <p className="text-center text-gray-500 py-4">Loading...</p>
        ) : reservationsList.length > 0 ? (
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3">#</th>
                
                {/* 🟢 เพิ่มคอลัมน์ชื่อร้านอาหาร */}
                <th className="p-3">Restaurant Name</th>
                
                {isAdmin && <th className="p-3">Customer Name</th>}
                <th className="p-3">Appointment Time</th>
                <th className="p-3 hidden md:table-cell">Booked At</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservationsList.map((res, index) => {
                const apptDate = new Date(res.apptDate);
                const bookedAt = new Date(res.Reservat_at || res.createdAt || new Date());
                const isEditing = editingId === res._id;

                return (
                  <tr key={res._id} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="p-3">{index + 1}</td>
                    
                    {/* 🟢 ดึงชื่อร้านอาหารมาแสดงผล */}
                    <td className="p-3 font-semibold text-indigo-600">
                      {res.restaurant?.name || 'Unknown Restaurant'}
                    </td>
                    
                    {isAdmin && <td className="p-3 font-semibold">{res.user?.name || res.user?.email || res.user || 'Unknown'}</td>}
                    
                    <td className="p-3 text-blue-600 font-medium">
                      {isEditing ? (
                        <input type="datetime-local" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="border rounded px-2 py-1" />
                      ) : apptDate.toLocaleString('th-TH')}
                    </td>
                    
                    <td className="p-3 text-gray-500 text-sm hidden md:table-cell">{bookedAt.toLocaleString('th-TH')}</td>

                    <td className="p-3 text-center">
                      {isEditing ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleSaveUpdate(res._id)} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => {
                            setEditingId(res._id);
                            setEditDate(new Date(res.apptDate).toISOString().slice(0, 16));
                          }} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                          <button onClick={() => handleDelete(res._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8 text-lg">No reservations found.</p>
        )}
      </div>
    </div>
  );
}