'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const covers = [
  '/img/cover1.jpg',
  '/img/cover2.jpg',
  '/img/cover3.jpg',
  '/img/cover4.jpg',
];

export default function Banner() {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % covers.length);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] cursor-pointer"
      onClick={handleNext}
    >
      {/* Background Image */}
      <Image
        src={covers[index]}
        alt={`cover ${index + 1}`}
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div
        className="relative z-10 text-center bg-white/20 p-12 rounded-2xl shadow-xl backdrop-blur-sm max-w-3xl"
        onClick={(e) => e.stopPropagation()} // prevent card clicks from cycling the image
      >
        <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
          Welcome to <span className="text-yellow-400">RestaReserve</span>
        </h1>
        <p className="text-lg text-gray-200 mb-10 leading-relaxed">
          สัมผัสประสบการณ์การจองร้านอาหารที่ง่ายและสะดวกที่สุด <br />
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

      {/* Image indicator dots */}
      <div className="absolute bottom-6 flex gap-2 z-10">
        {covers.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === index ? 'bg-white scale-125' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}