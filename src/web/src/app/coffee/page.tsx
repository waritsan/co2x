'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Coffee = {
  id: number;
  name: string;
  price: number;
  co2e: number;
  description: string;
};

const coffeeMenu: Coffee[] = [
  { id: 1, name: 'Americano', price: 45, co2e: 0.5, description: 'Strong espresso with hot water' },
  { id: 2, name: 'Latte', price: 55, co2e: 0.8, description: 'Espresso with steamed milk' },
  { id: 3, name: 'Cappuccino', price: 55, co2e: 0.8, description: 'Espresso with milk foam' },
  { id: 4, name: 'Espresso', price: 35, co2e: 0.3, description: 'Concentrated coffee shot' },
  { id: 5, name: 'Macchiato', price: 50, co2e: 0.6, description: 'Espresso marked with milk' },
  { id: 6, name: 'Flat White', price: 60, co2e: 0.9, description: 'Espresso with velvety microfoam' },
  { id: 7, name: 'Cold Brew', price: 55, co2e: 0.4, description: 'Smooth cold coffee' },
  { id: 8, name: 'Mocha', price: 65, co2e: 1.0, description: 'Espresso with chocolate and milk' },
];

export default function CoffeePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedCredits = localStorage.getItem('userCredits');
    if (savedCredits) {
      setUserCredits(parseInt(savedCredits));
    }
    const savedBalance = localStorage.getItem('userBalance');
    if (savedBalance) {
      setUserBalance(parseInt(savedBalance));
    }
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest('header')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleBuyCoffee = (coffee: Coffee) => {
    setUserCredits(prev => {
      const newCredits = prev + coffee.co2e;
      localStorage.setItem('userCredits', newCredits.toString());
      return newCredits;
    });
    setUserBalance(prev => {
      const newBalance = prev - coffee.price;
      localStorage.setItem('userBalance', newBalance.toString());
      return newBalance;
    });
    setMessage(`${coffee.name} purchased! +${coffee.co2e} kg CO₂e added to your credit`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-green-600">WinFor.Earth</h1>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center space-x-6 lg:space-x-12">
              <Link href="/" className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 relative group rounded-md hover:bg-green-50">
                หน้าแรก
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/game" className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 relative group rounded-md hover:bg-green-50">
                เกมลอตเตอรี่
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/coffee" className="px-4 py-2 text-green-600 font-medium transition-colors duration-200 relative rounded-md">
                ร้านกาแฟ
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
              </Link>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">แอปเดโม</div>
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
            <nav className="px-4 py-4 space-y-2">
              <Link
                href="/"
                className="block px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                หน้าแรก
              </Link>
              <Link
                href="/game"
                className="block px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                เกมลอตเตอรี่
              </Link>
              <Link
                href="/coffee"
                className="block px-4 py-3 text-green-600 hover:bg-green-50 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ร้านกาแฟ
              </Link>
              <div className="px-4 py-2">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">แอปเดโม</span>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">CO₂e เครดิต</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{userCredits.toFixed(1)} kg</p>
            <p className="text-xs sm:text-sm text-gray-500">เครดิตคาร์บอนของคุณ</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">ยอดเงิน</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">฿{userBalance.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500">เงินอุดหนุนของคุณ</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm sm:text-base">
            {message}
          </div>
        )}

        {/* Coffee Menu */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">☕ เมนูกาแฟ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {coffeeMenu.map((coffee) => (
              <div key={coffee.id} className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 sm:p-5 border border-amber-200 hover:shadow-lg transition-shadow duration-200">
                {/* Coffee Name */}
                <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-1">{coffee.name}</h3>
                
                {/* Description */}
                <p className="text-xs sm:text-sm text-amber-700 mb-4">{coffee.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm sm:text-base">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">ราคา:</span>
                    <span className="text-green-600 font-semibold">฿{coffee.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">CO₂e:</span>
                    <span className="text-blue-600 font-semibold">{coffee.co2e} kg</span>
                  </div>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => handleBuyCoffee(coffee)}
                  disabled={userBalance < coffee.price}
                  className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {userBalance >= coffee.price ? '🛒 ซื้อ' : 'เงินไม่พอ'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ วิธีการใช้</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm sm:text-base">
            <li>เลือกกาแฟที่คุณต้องการและคลิก "ซื้อ"</li>
            <li>CO₂e จากการสร้างสินค้าจะถูกเพิ่มเข้าเครดิตของคุณ</li>
            <li>คุณสามารถใช้เครดิตนี้ในตลาด T-VER</li>
            <li>การซื้อ 1 กาแฟ ≈ 0.3-1.0 kg CO₂e</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
