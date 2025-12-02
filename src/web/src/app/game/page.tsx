'use client';

import { useState } from 'react';

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

    // Calculate rotation (random + full rotations)
    const rotations = 5 + Math.random() * 5; // 5-10 full rotations
    const angle = (360 / prizes.length) * prizes.indexOf(selectedPrize) + (360 / prizes.length) * Math.random();

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-green-600">WinFor.Earth: A Green Lottery Platform</h1>
            <div className="text-sm text-gray-600">เกมลอตเตอรี่</div>
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

        {/* Lottery Wheel */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-center">วงล้อลอตเตอรี่สีเขียว</h2>

          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
              </div>

              {/* Wheel */}
              <div
                id="wheel"
                className="w-80 h-80 rounded-full border-8 border-gray-300 relative overflow-hidden transition-transform duration-3000 ease-out"
                style={{
                  background: `conic-gradient(${prizes.map((prize, index) =>
                    `${prize.color} ${index * (360 / prizes.length)}deg ${(index + 1) * (360 / prizes.length)}deg`
                  ).join(', ')})`,
                }}
              >
                {prizes.map((prize, index) => {
                  const angle = (360 / prizes.length) * index;
                  return (
                    <div
                      key={index}
                      className="absolute w-full h-full flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        transform: `rotate(${angle + (360 / prizes.length) / 2}deg)`,
                      }}
                    >
                      <span
                        style={{
                          transform: `rotate(${(360 / prizes.length) / 2}deg)`,
                        }}
                      >
                        {prize.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spin Button */}
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSpinning ? 'กำลังหมุน...' : 'หมุนวงล้อ'}
            </button>

            {/* Result */}
            {result && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-lg font-semibold text-blue-800">
                  คุณได้: {result}
                </p>
                {result !== 'ลองใหม่' && (
                  <p className="text-sm text-blue-600 mt-2">
                    เครดิตถูกเพิ่มเข้าบัญชีแล้ว!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">กฎของเกม</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>หมุนวงล้อเพื่อลุ้นรับเครดิตคาร์บอน</li>
            <li>รางวัลต่างๆ: 100, 500, หรือ 1000 tCO2e</li>
            <li>หากได้ "ลองใหม่" สามารถหมุนได้อีกครั้ง</li>
            <li>เครดิตที่ได้จะถูกเพิ่มเข้าบัญชีของคุณทันที</li>
          </ul>
        </div>
      </main>
    </div>
  );
}</content>
<parameter name="filePath">/Users/waritsan/Developer/co2x/src/web/src/app/game/page.tsx