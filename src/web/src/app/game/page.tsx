'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const prizes = [
  { label: '100 tCO2e', color: '#10B981', rarity: 'Common', probability: 0.4 },
  { label: '500 tCO2e', color: '#059669', rarity: 'Uncommon', probability: 0.3 },
  { label: '1000 tCO2e', color: '#047857', rarity: 'Rare', probability: 0.2 },
  { label: '2000 tCO2e', color: '#DC2626', rarity: 'Legendary', probability: 0.1 },
];

export default function GamePage() {
  const [isPulling, setIsPulling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState(1250);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const savedCredits = localStorage.getItem('userCredits');
    if (savedCredits) {
      setUserCredits(parseInt(savedCredits));
    }
  }, []);

  const openCard = () => {
    if (isPulling) return;

    console.log('Starting card animation');
    setIsPulling(true);
    setResult(null);
    setCardFlipped(false);

    // Select random prize based on probability
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedPrize = prizes[0];

    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        selectedPrize = prize;
        break;
      }
    }

    console.log('Selected prize:', selectedPrize.label);

    // Simple flip animation
    setTimeout(() => {
      console.log('Flipping card');
      setCardFlipped(true);
      setResult(selectedPrize.label);

      // Update credits
      const amount = parseInt(selectedPrize.label.split(' ')[0]);
      setUserCredits(prev => {
        const newCredits = prev + amount;
        localStorage.setItem('userCredits', newCredits.toString());
        return newCredits;
      });
    }, 500);

    setTimeout(() => {
      console.log('Ending animation');
      setIsPulling(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-green-600">WinFor.Earth: A Green Lottery Platform</h1>
            <nav className="flex items-center space-x-12">
              <Link href="/" className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 relative group rounded-md hover:bg-green-50">
                หน้าแรก
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/game" className="px-4 py-2 text-green-600 font-medium transition-colors duration-200 relative rounded-md">
                เกมลอตเตอรี่
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
              </Link>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">แอปเดโม</div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Credits Display */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">เครดิตของคุณ</h2>
          <p className="text-3xl font-bold text-green-600">{userCredits.toLocaleString()} tCO2e</p>
        </div>

        {/* Card Reveal System */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-center">ระบบเปิดการ์ดสีเขียว</h2>

          <div className="flex flex-col items-center">
            {/* Card Machine */}
            <div className="relative mb-8">
              <div className="w-80 h-96 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-4 border-gray-600 relative overflow-hidden">
                {/* Machine top */}
                <div className="h-16 bg-gray-700 border-b-2 border-gray-600 flex items-center justify-center">
                  <div className="text-white font-bold text-lg">🌱 GREEN LOTTERY 🌱</div>
                </div>

                {/* Card slot */}
                <div className={`flex items-center justify-center h-64 bg-gradient-to-b from-gray-100 to-gray-200 transition-all duration-300 ${isShaking ? 'shake' : ''}`}>
                  <div className="card-container" style={{ perspective: '1000px' }}>
                    {/* Card back */}
                    <div
                      className={`card-simple w-48 h-64 bg-gradient-to-br from-green-400 to-green-600 rounded-lg border-4 border-green-300 shadow-lg flex items-center justify-center ${
                        cardFlipped ? 'hidden' : 'visible'
                      }`}
                    >
                      <div className="text-white text-center">
                        <div className="text-4xl mb-2">🎁</div>
                        <div className="font-bold text-lg">การ์ด</div>
                        <div className="text-sm">คลิกเพื่อเปิด</div>
                      </div>
                    </div>

                    {/* Card front (revealed prize) */}
                    <div
                      className={`card-simple w-48 h-64 bg-white rounded-lg border-4 border-yellow-400 shadow-xl flex flex-col items-center justify-center ${
                        cardFlipped ? 'visible' : 'hidden'
                      }`}
                    >
                      {result && (
                        <div className="text-center">
                          <div className="text-3xl mb-2">🎉</div>
                          <div className="font-bold text-xl text-green-600">{result}</div>
                          <div className="text-sm text-gray-600 mt-2">
                            {prizes.find(p => p.label === result)?.rarity}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Machine bottom */}
                <div className="h-16 bg-gray-700 border-t-2 border-gray-600 flex items-center justify-center">
                  <div className="text-yellow-400 text-sm">✨ Limited Time Event ✨</div>
                </div>
              </div>
            </div>

            {/* Pull Button */}
            <button
              onClick={openCard}
              disabled={isPulling}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
            >
              {isPulling ? 'กำลังเปิด...' : 'เปิดการ์ด'}
            </button>

            {/* Result */}
            {result && cardFlipped && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center border-2 border-blue-200">
                <p className="text-lg font-semibold text-blue-800">
                  คุณได้รับ: {result}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  เครดิตถูกเพิ่มเข้าบัญชีแล้ว!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">กฎของเกม</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>เปิดการ์ดเพื่อลุ้นรับเครดิตคาร์บอน</li>
            <li>ระดับความหายาก: Common (100 tCO2e), Uncommon (500 tCO2e), Rare (1000 tCO2e), Legendary (2000 tCO2e)</li>
            <li>โอกาสได้รับ: Common 40%, Uncommon 30%, Rare 20%, Legendary 10%</li>
            <li>เครดิตที่ได้จะถูกเพิ่มเข้าบัญชีของคุณทันที</li>
          </ul>
        </div>
      </main>
    </div>
  );
}