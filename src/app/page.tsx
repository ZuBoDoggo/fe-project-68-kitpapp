import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="text-center bg-white/80 p-12 rounded-2xl shadow-xl backdrop-blur-sm max-w-3xl">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Welcome to <span className="text-blue-600">RestaReserve</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          สัมผัสประสบการณ์การจองร้านอาหารที่ง่ายและสะดวกที่สุด <br/>
          เลือกร้านที่คุณชื่นชอบและจองโต๊ะได้ทันที ไม่ต้องรอนาน!
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/restaurants" 
            className="bg-black !text-white text-lg font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition duration-300 shadow-lg transform hover:-translate-y-1"
          >
            Explore Restaurants
          </Link>
        </div>
      </div>
    </main>
  );
}