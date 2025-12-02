'use client';

import { useState } from 'react';
import Link from 'next/link';

const prizes = [
  { label: '100 tCO2e', color: '#10B981', probability: 0.3 },
  { label: '500 tCO2e', color: '#059669', probability: 0.2 },
  { label: '1000 tCO2e', color: '#047857', probability: 0.1 },
  { label: 'ลองใหม่', color: '#DC2626', probability: 0.4 },
];

export default function GamePage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState(1250);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

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

    // Calculate rotation (random full rotations + exact segment center)
    const rotations = 5 + Math.random() * 5; // 5-10 full rotations
    const segmentAngle = 360 / prizes.length;
    const angle = segmentAngle * prizes.indexOf(selectedPrize) + segmentAngle / 2;

    const wheel = document.getElementById('wheel');
    if (wheel) {
      wheel.style.transform = `rotate(${rotations * 360 + angle}deg)`;
    }

    setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedPrize.label);

      // Update credits if won
      if (selectedPrize.label !== 'ลองใหม่') {
        const amount = parseInt(selectedPrize.label.split(' ')[0]);
        setUserCredits(prev => prev + amount);
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-red-600">WinFor.Earth</h1>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-300 hover:text-white font-medium transition-colors">
                หน้าแรก
              </Link>
              <Link href="/game" className="text-white hover:text-red-400 font-medium transition-colors">
                เกมลอตเตอรี่
              </Link>
              <div className="text-sm text-gray-400">แอปเดโม</div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Credits Display */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl mb-12 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">เครดิตของคุณ</h2>
          <p className="text-4xl font-bold text-green-400">{userCredits.toLocaleString()} tCO2e</p>
        </div>

        {/* Lottery Wheel */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 mb-12 border border-gray-700">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-100">วงล้อลอตเตอรี่สีเขียว</h2>

          <div className="flex flex-col items-center">
            <div className="relative mb-12">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-red-500 drop-shadow-lg"></div>
              </div>

              {/* Wheel */}
              <div
                id="wheel"
                className="w-96 h-96 rounded-full border-8 border-gray-600 relative overflow-hidden transition-transform duration-3000 ease-out shadow-2xl"
                style={{
                  background: `conic-gradient(${prizes.map((prize, index) =>
                    `${prize.color} ${index * (360 / prizes.length)}deg ${(index + 1) * (360 / prizes.length)}deg`
                  ).join(', ')})`,
                }}
              >
                {prizes.map((prize, index) => {
                  const angle = (360 / prizes.length) * index + (360 / prizes.length) / 2;
                  const radian = (angle * Math.PI) / 180;
                  const radius = 140; // distance from center
                  const x = Math.cos(radian) * radius;
                  const y = Math.sin(radian) * radius;

                  return (
                    <div
                      key={index}
                      className="absolute text-white font-bold text-xl"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                        textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
                      }}
                    >
                      {prize.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spin Button */}
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="px-12 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-full font-bold text-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
            >
              {isSpinning ? 'กำลังหมุน...' : 'หมุนวงล้อ'}
            </button>

            {/* Result */}
            {result && (
              <div className="mt-8 p-6 bg-gray-700 rounded-xl border border-gray-600 shadow-lg">
                <p className="text-xl font-semibold text-center text-white">
                  คุณได้: <span className="text-green-400">{result}</span>
                </p>
                {result !== 'ลองใหม่' && (
                  <p className="text-sm text-center text-gray-300 mt-2">
                    เครดิตถูกเพิ่มเข้าบัญชีแล้ว!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">กฎของเกม</h2>
          <ul className="list-disc list-inside space-y-3 text-gray-300 text-lg">
            <li>หมุนวงล้อเพื่อลุ้นรับเครดิตคาร์บอน</li>
            <li>รางวัลต่างๆ: 100, 500, หรือ 1000 tCO2e</li>
            <li>หากได้ &quot;ลองใหม่&quot; สามารถหมุนได้อีกครั้ง</li>
            <li>เครดิตที่ได้จะถูกเพิ่มเข้าบัญชีของคุณทันที</li>
          </ul>
        </div>
      </main>
    </div>
  );
}