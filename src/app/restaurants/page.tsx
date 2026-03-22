'use client'
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 📦 ข้อมูล Mock ร้านอาหาร (ปรับให้ตรงกับ Schema ใหม่)
const mockRestaurants = [
  { 
    _id: 'rest1', 
    name: 'อร่อยเหาะ เรสเตอรองต์', 
    address: '123 ซอยสุขุมวิท', 
    district: 'คลองเตย', 
    province: 'กรุงเทพมหานคร', 
    postalcode: '10110', 
    tel: '02-111-1111', 
    region: 'ภาคกลาง', 
    open: '08:00', 
    close: '22:00', 
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' 
  },
  { 
    _id: 'rest2', 
    name: 'แซ่บนัว ครัวอีสาน', 
    address: '456 ถ.มิตรภาพ', 
    district: 'เมือง', 
    province: 'ขอนแก่น', 
    postalcode: '40000', 
    tel: '043-222-2222', 
    region: 'ภาคตะวันออกเฉียงเหนือ', 
    open: '10:00', 
    close: '20:00', 
    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' 
  }
];

export default function RestaurantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isMockMode = searchParams.get('mock') === 'true';
  const isAdmin = (session as any)?.user?.role === 'admin';
  const token = (session as any)?.user?.token;

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 State สำหรับจัดการฟอร์ม (รองรับทุกฟิลด์ตาม Schema)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    district: '',
    province: '',
    postalcode: '',
    tel: '',
    region: '',
    open: '',
    close: '',
    imageUrl: ''
  });

  // 🔄 ฟังก์ชันโหลดข้อมูลร้านอาหาร
  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        setRestaurants(mockRestaurants);
        return;
      }
      
      const res = await fetch('https://backendpjforfrontend.vercel.app/api/v1/restaurants', {
        method: 'GET'
      });
      if (res.ok) {
        const resData = await res.json();
        setRestaurants(resData.data);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isMockMode]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // 🔴 ลบร้านอาหาร
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบร้านอาหารนี้? ข้อมูลการจองทั้งหมดของร้านนี้จะถูกลบด้วย!")) return;
    
    if (isMockMode) {
      alert("Mock Mode: ลบร้านอาหารสำเร็จ!");
      return;
    }

    try {
      const res = await fetch(`https://backendpjforfrontend.vercel.app/api/v1/restaurants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert("ลบร้านอาหารสำเร็จ!");
        fetchRestaurants();
      } else {
        alert("ไม่สามารถลบร้านอาหารได้");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🟡 เปิดฟอร์มเพิ่ม/แก้ไข
  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormData({ name: '', address: '', district: '', province: '', postalcode: '', tel: '', region: '', open: '', close: '', imageUrl: '' });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (rest: any) => {
    setEditingId(rest._id);
    setFormData({
      name: rest.name || '',
      address: rest.address || '',
      district: rest.district || '',
      province: rest.province || '',
      postalcode: rest.postalcode || '',
      tel: rest.tel || '',
      region: rest.region || '',
      open: rest.open || '',
      close: rest.close || '',
      imageUrl: rest.imageUrl || ''
    });
    setIsFormOpen(true);
  };

  // 🟢 บันทึกข้อมูล
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMockMode) {
      alert(`Mock Mode: ${editingId ? 'แก้ไข' : 'เพิ่ม'}ร้านอาหารสำเร็จ!`);
      setIsFormOpen(false);
      return;
    }

    const url = editingId 
      ? `https://backendpjforfrontend.vercel.app/api/v1/restaurants/${editingId}`
      : `https://backendpjforfrontend.vercel.app/api/v1/restaurants`;
      
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(`${editingId ? 'อัปเดต' : 'เพิ่ม'}ร้านอาหารสำเร็จ!`);
        setIsFormOpen(false);
        fetchRestaurants(); 
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.message || 'ข้อมูลไม่ถูกต้อง'}`);
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อกับ Server ได้");
    }
  };

  // ฟังก์ชันช่วยจัดการ input แบบลดรูปโค้ด
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading Restaurants...</div>;

  return (
    <main className="container mx-auto p-4 max-w-6xl mt-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Restaurants</h1>
          <p className="text-gray-500 mt-1">
            {isMockMode ? "🟢 Mock Mode" : "🌐 Real API"}
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAddForm} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition">
            + Add New Restaurant
          </button>
        )}
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No restaurants available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest) => (
            <div key={rest._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100 flex flex-col">
              
              <div className="h-48 w-full bg-gray-200 relative">
                <img src={rest.imageUrl || 'https://via.placeholder.com/500'} alt={rest.name} className="w-full h-full object-cover"/>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-800">{rest.name}</h2>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">{rest.region}</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-1 flex-1">📍 {rest.address}, {rest.district}, {rest.province} {rest.postalcode}</p>
                
                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                  <p>📞 {rest.tel}</p>
                  <p className="font-semibold text-green-700">🕒 {rest.open} - {rest.close}</p>
                </div>

                <div className="mt-auto space-y-3">
                  <Link href={`/restaurants/${rest._id}/reservations${isMockMode ? '?mock=true' : ''}`}>
                    <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg font-semibold transition">
                      View / Book Reservation
                    </button>
                  </Link>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEditForm(rest)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold transition">Edit</button>
                      <button onClick={() => handleDelete(rest._id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📝 Modal Form สำหรับเพิ่ม/แก้ไขร้านอาหาร (รองรับทุกฟิลด์ตาม Schema) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
            <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white font-bold text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmitForm} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* แถวที่ 1 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Restaurant Name *</label>
                  <input type="text" name="name" required maxLength={50} value={formData.name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ไม่เกิน 50 ตัวอักษร"/>
                </div>

                {/* แถวที่ 2 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Address *</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="บ้านเลขที่, ถนน, ซอย"/>
                </div>

                {/* แถวที่ 3 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">District (เขต/อำเภอ) *</label>
                  <input type="text" name="district" required value={formData.district} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. คลองเตย"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Province (จังหวัด) *</label>
                  <input type="text" name="province" required value={formData.province} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. กรุงเทพมหานคร"/>
                </div>

                {/* แถวที่ 4 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Postal Code *</label>
                  <input type="text" name="postalcode" required maxLength={5} value={formData.postalcode} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 10110"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Region (ภูมิภาค) *</label>
                  <input type="text" name="region" required value={formData.region} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. ภาคกลาง"/>
                </div>

                {/* แถวที่ 5 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Telephone *</label>
                  <input type="tel" name="tel" required value={formData.tel} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 02-123-4567"/>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Open Time *</label>
                    <input type="time" name="open" required value={formData.open} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"/>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Close Time *</label>
                    <input type="time" name="close" required value={formData.close} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"/>
                  </div>
                </div>

                {/* แถวที่ 6 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Image URL *</label>
                  <input type="url" name="imageUrl" required value={formData.imageUrl} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://example.com/image.jpg"/>
                  <p className="text-xs text-gray-500 mt-1">Must be a valid HTTP/HTTPS URL.</p>
                </div>

              </div>

              {/* ปุ่มบันทึก */}
              <div className="pt-6 flex gap-3 mt-4 border-t">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition shadow-md">
                  {editingId ? 'Save Changes' : 'Create Restaurant'}
                </button>
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-bold transition shadow-md">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}