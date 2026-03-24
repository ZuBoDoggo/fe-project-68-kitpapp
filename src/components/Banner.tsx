'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Playfair_Display, Mitr } from 'next/font/google';

//serif font for the Header
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

//font for the Thai Description
const mitr = Mitr({
  subsets: ['thai', 'latin'],
  weight: ['300', '400'], // 300 (Light) looks very sleek for descriptions
  display: 'swap',
});

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
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]"
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
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div
        className="relative z-10 text-center bg-white/10 p-12 rounded-2xl shadow-2xl backdrop-blur-md max-w-3xl border border-white/20"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* HEADER STYLING */}
        <h1 className={`text-white mb-6 tracking-wide drop-shadow-lg ${playfair.className}`}>
          <div className="text-2xl md:text-3xl font-medium">
            Welcome to
          </div>

          <div className="text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 font-black italic">
            RestaReserve
          </div>
        </h1>
        
        {/* DESCRIPTION STYLING */}
        <p className={`text-l text-gray-100 mb-10 leading-loose drop-shadow-md font-light ${mitr.className}`}>
          สัมผัสประสบการณ์การจองร้านอาหารที่ง่ายและสะดวกที่สุด <br />
          เลือกร้านที่คุณชื่นชอบและจองโต๊ะได้ทันที ไม่ต้องรอนาน!
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/restaurants"
            className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-lg font-bold py-3 px-8 rounded-full hover:from-yellow-400 hover:to-amber-500 transition-all duration-300 shadow-xl transform hover:-translate-y-1"
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