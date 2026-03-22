'use client'
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 📦 ข้อมูล Mock สำหรับเทส
const mockMyReservations = [
  { _id: 'r1', apptDate: '2026-03-25T18:00:00', restaurant: { _id: 'rest1', name: 'อร่อยเหาะ เรสเตอรองต์' }, user: { name: 'สมชาย ใจดี', email: 'somchai@example.com' } },
  { _id: 'r2', apptDate: '2026-03-26T12:00:00', restaurant: { _id: 'rest1', name: 'อร่อยเหาะ เรสเตอรองต์' }, user: { name: 'สมหญิง รักเรียน', email: 'somying@example.com' } },
  { _id: 'r3', apptDate: '2026-03-28T19:00:00', restaurant: { _id: 'rest2', name: 'แซ่บนัว ครัวอีสาน' }, user: { name: 'John Doe', email: 'john@example.com' } }
];

export default function MyReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMockMode = searchParams.get('mock') === 'true';

  const isAdmin = (session as any)?.user?.role === 'admin';
  const token = (session as any)?.user?.token;

  const [groupedReservations, setGroupedReservations] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');

  const fetchMyReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      let dataToProcess = [];
      if (isMockMode) {
        dataToProcess = mockMyReservations;
      } else {
        const res = await fetch('https://backendpjforfrontend.vercel.app/api/v1/reservations', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const resData = await res.json();
          dataToProcess = resData.data;
        }
      }

      const grouped = dataToProcess.reduce((acc: any, curr: any) => {
        const restId = curr.restaurant?._id || curr.restaurant;
        const restName = curr.restaurant?.name || 'Unknown Restaurant';
        if (!acc[restId]) acc[restId] = { name: restName, items: [] }; 
        acc[restId].items.push(curr); 
        return acc;
      }, {});

      setGroupedReservations(grouped);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isMockMode, token]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/api/auth/signin');
    if (status === 'authenticated') fetchMyReservations();
  }, [status, fetchMyReservations, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reservation?")) return;
    if (isMockMode) { alert("Mock Mode: ลบข้อมูลสำเร็จ!"); return; }
    try {
        console.log("กำลังจะลบ ID:", id);
        console.log("Token ที่ใช้:", token);

        const res = await fetch(`https://backendpjforfrontend.vercel.app/api/v1/reservations/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            alert("ลบการจองสำเร็จ!");
            fetchMyReservations();
        } else {
            // 🔴 ดึงข้อความ Error จาก Backend ออกมาอ่าน!
            const errorData = await res.json();
            console.error("Backend Error:", errorData);
            alert(`ไม่สามารถลบได้: ${errorData.message || res.statusText}`);
        }
    } catch (err) { 
        console.error("Fetch Error:", err); 
    }
  };

  const handleSaveUpdate = async (id: string) => {
    if (isMockMode) { alert("Mock Mode: อัปเดตข้อมูลสำเร็จ!"); setEditingId(null); return; }
    try {
      const res = await fetch(`https://backendpjforfrontend.vercel.app/api/v1/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ apptDate: editDate })
      });
      if (res.ok) {
        alert("อัปเดตสำเร็จ!");
        setEditingId(null);
        fetchMyReservations();
      } else alert("แก้ไขไม่สำเร็จ");
    } catch (err) { console.error(err); }
  };

  if (status === 'loading' || isLoading) return <div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>;

  const restaurantIds = Object.keys(groupedReservations);

  return (
    <main className="container mx-auto p-4 max-w-4xl mt-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {isAdmin ? "All System Reservations (Admin)" : "My Reservations"}
      </h1>
      
      {restaurantIds.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-4">No reservations found.</p>
          {!isAdmin && <Link href={`/restaurants${isMockMode ? '?mock=true' : ''}`} className="text-blue-600 font-bold hover:underline">Browse Restaurants</Link>}
        </div>
      ) : (
        <div className="space-y-6">
          {restaurantIds.map((restId) => {
            const restaurantGroup = groupedReservations[restId];
            const sortedItems = restaurantGroup.items.sort((a: any, b: any) => new Date(a.apptDate).getTime() - new Date(b.apptDate).getTime());

            return (
              <div key={restId} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gray-800 text-white px-6 py-4">
                  <h2 className="text-xl font-bold">{restaurantGroup.name}</h2>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {sortedItems.map((res: any, index: number) => {
                      const dateObj = new Date(res.apptDate);
                      const isEditing = editingId === res._id;

                      return (
                        <li key={res._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          
                          <div className="flex items-center gap-4 flex-1">
                            <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm whitespace-nowrap">
                              Reservation #{index + 1}
                            </span>
                            
                            {isEditing ? (
                              <input 
                                type="datetime-local" 
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="border rounded px-2 py-1 text-gray-700 w-full md:w-auto"
                              />
                            ) : (
                              <span className="text-gray-700 font-medium">
                                {dateObj.toLocaleDateString('th-TH')} at {dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Admin เท่านั้นที่เห็นอีเมลคนอื่น */}
                            {isAdmin && (
                              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 text-sm">
                                <span className="text-gray-500">Booked by:</span>
                                <span className="font-bold text-gray-800">{res.user?.email || res.user?.name || res.user || 'Unknown'}</span>
                              </div>
                            )}

                            {/* 🟢 ทุกคน (User & Admin) เห็นปุ่ม Edit/Delete ของตัวเองได้แล้ว! */}
                            <div className="flex gap-2">
                              {isEditing ? (
                                <>
                                  <button onClick={() => handleSaveUpdate(res._id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">Save</button>
                                  <button onClick={() => setEditingId(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm">Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => {
                                    setEditingId(res._id);
                                    setEditDate(new Date(res.apptDate).toISOString().slice(0, 16));
                                  }} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">Edit</button>
                                  <button onClick={() => handleDelete(res._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
                                </>
                              )}
                            </div>
                          </div>
                          
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}