import Link from 'next/link';
import { Restaurant, RestaurantJson } from '@/interfaces';

// 📦 ข้อมูลจำลอง (Mock Data)
const mockRestaurants: Restaurant[] = [
  {
    _id: "mock-id-001",
    name: "อร่อยเหาะ เรสเตอรองต์",
    address: "123 ถ.สุขุมวิท",
    district: "วัฒนา",
    province: "กรุงเทพมหานคร",
    postalcode: "10110",
    tel: "02-123-4567",
    region: "Bangkok",
    open: "10:00",
    close: "22:00"
  },
  {
    _id: "mock-id-002",
    name: "แซ่บนัว ครัวอีสาน",
    address: "456 ถ.มิตรภาพ",
    district: "เมือง",
    province: "ขอนแก่น",
    postalcode: "40000",
    tel: "043-987-654",
    region: "North East",
    open: "11:00",
    close: "23:00"
  }
];

async function getRestaurants(): Promise<RestaurantJson> {
  const res = await fetch('https://backendpjforfrontend.vercel.app/api/v1/restaurants', { 
    next: { tags: ['restaurants'] },
    cache: 'no-store' // ไม่ต้อง cache จะได้เทสสลับไปมาได้ชัวร์ๆ
  });
  if (!res.ok) throw new Error('Failed to fetch restaurants');
  return res.json();
}

// รับ props searchParams เพื่อดูว่ามี ?mock=true ต่อท้าย URL ไหม
export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: { mock?: string };
}) {
  const isMockMode = searchParams.mock === 'true'; // เช็คสถานะปัจจุบัน
  let restaurants: Restaurant[] = [];

  if (isMockMode) {
    restaurants = mockRestaurants;
  } else {
    try {
      const restaurantJson = await getRestaurants();
      restaurants = restaurantJson.data;
    } catch (error) {
      console.error("Backend error:", error);
      restaurants = mockRestaurants; 
    }
  }

  return (
    <main className="container mx-auto p-4">
      {/* 🔘 ปุ่มสลับโหมด มีแค่หน้านี้หน้าเดียว */}
      <div className="flex justify-center mt-6 mb-2">
        {isMockMode ? (
          <Link href="/restaurants" className="bg-green-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-green-600 transition flex items-center gap-2">
            🟢 Mock Mode: ON <span className="text-xs font-normal">(Click for Real API)</span>
          </Link>
        ) : (
          <Link href="/restaurants?mock=true" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2">
            🌐 Real API: ON <span className="text-xs font-normal">(Click for Mock Data)</span>
          </Link>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Select Your Restaurant</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {restaurants.map((rest: Restaurant) => (
          <div key={rest._id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            <div className="h-48 bg-gray-300 relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">Image Placeholder</div>
            </div>
            <div className="p-4 flex-grow">
              <h3 className="font-bold text-xl mb-2">{rest.name}</h3>
              <p className="text-gray-600 text-sm mb-1">{rest.address}, {rest.district}, {rest.province}</p>
            </div>
            <div className="p-4 mt-auto">
                {/* 🔴 จุดที่แก้: แนบ ?mock=true ไปด้วยถ้าเปิดโหมด Mock อยู่ */}
                <Link 
                  href={`/restaurants/${rest._id}/reservations${isMockMode ? '?mock=true' : ''}`} 
                  className="block w-full text-center bg-gray-900 !text-white font-bold py-2 px-4 rounded hover:bg-gray-700 transition"
                >
                  Go to reserve
                </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}