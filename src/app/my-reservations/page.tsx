'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 📦 ข้อมูล Mock สำหรับเทส (เพิ่ม email เข้าไปจำลองด้วย)
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

  // 🔍 เช็คสิทธิ์ว่าเป็นแอดมินไหม
  const isAdmin = (session as any)?.user?.role === 'admin';

  const [groupedReservations, setGroupedReservations] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const fetchMyReservations = async () => {
        try {
          let dataToProcess = [];

          if (isMockMode) {
            dataToProcess = mockMyReservations;
          } else {
            const res = await fetch('https://backendpjforfrontend.vercel.app/api/v1/reservations', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${(session as any)?.user?.token}`
              }
            });
            
            if (res.ok) {
              const resData = await res.json();
              dataToProcess = resData.data;
            } else {
              console.error("Failed to fetch reservations");
            }
          }

          const grouped = dataToProcess.reduce((acc: any, curr: any) => {
            const restId = curr.restaurant?._id || curr.restaurant;
            const restName = curr.restaurant?.name || 'Unknown Restaurant';

            if (!acc[restId]) {
              acc[restId] = { name: restName, items: [] }; 
            }
            acc[restId].items.push(curr); 
            return acc;
          }, {});

          setGroupedReservations(grouped);
        } catch (error) {
          console.error("Error fetching reservations:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMyReservations();
    }
  }, [status, session, isMockMode, router]);

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading reservations...</div>;
  }

  const restaurantIds = Object.keys(groupedReservations);

  return (
    <main className="container mx-auto p-4 max-w-4xl mt-8">
      
      <h1 className="text-3xl font-bold mb-6 text-center">
        {isAdmin ? "All System Reservations (Admin)" : "My Reservations"}
      </h1>
      
      {restaurantIds.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-4">No reservations found.</p>
          {!isAdmin && (
            <Link href={`/restaurants${isMockMode ? '?mock=true' : ''}`} className="text-blue-600 font-bold hover:underline">
              Browse Restaurants
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {restaurantIds.map((restId) => {
            const restaurantGroup = groupedReservations[restId];
            
            const sortedItems = restaurantGroup.items.sort((a: any, b: any) => 
              new Date(a.apptDate).getTime() - new Date(b.apptDate).getTime()
            );

            return (
              <div key={restId} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gray-800 text-white px-6 py-4">
                  <h2 className="text-xl font-bold">{restaurantGroup.name}</h2>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {sortedItems.map((res: any, index: number) => {
                      const dateObj = new Date(res.apptDate);
                      return (
                        <li key={res._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          
                          <div className="flex items-center gap-4">
                            <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm">
                              Reservation #{index + 1}
                            </span>
                            <span className="text-gray-700 font-medium">
                              {dateObj.toLocaleDateString('th-TH')} at {dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* 🛡️ ส่วนของ ADMIN: เปลี่ยนมาแสดง Email แทนชื่อ */}
                          {isAdmin && (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 text-sm">
                              <span className="text-gray-500">Booked by:</span>
                              <span className="font-bold text-gray-800">
                                {/* โชว์ Email เป็นหลัก ถ้าไม่มีให้พยายามโชว์ Name แทน หรือ Unknown */}
                                {res.user?.email || res.user?.name || res.user || 'Unknown Email'}
                              </span>
                            </div>
                          )}

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