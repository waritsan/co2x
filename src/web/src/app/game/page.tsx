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
  const [results, setResults] = useState<(string | null)[]>([null, null, null]);
  const [userCredits, setUserCredits] = useState(1250);
  const [cardFlipped, setCardFlipped] = useState([false, false, false]);
  const [showParticles, setShowParticles] = useState([false, false, false]);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [availablePrizes, setAvailablePrizes] = useState<any[]>([]);
  const [screenFlash, setScreenFlash] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const savedCredits = localStorage.getItem('userCredits');
    if (savedCredits) {
      setUserCredits(parseInt(savedCredits));
    }
    // Show cards by default
    setCardsVisible(true);
  }, []);

  const selectCard = (index: number) => {
    if (selectedCard !== null || isPulling) return;

    setIsPulling(true);
    setSelectedCard(index);
    console.log('Selected card:', index);

    // Generate prizes when card is selected
    const selectedPrizes = [];
    for (let i = 0; i < 3; i++) {
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
      selectedPrizes.push(selectedPrize);
    }

    setAvailablePrizes(selectedPrizes);
    setResults([null, null, null]);

    // Dramatic reveal timing for selected card
    setTimeout(() => {
      console.log('Flipping selected card');
      setScreenFlash(true); // Add screen flash effect
      
      // Reset screen flash after animation completes
      setTimeout(() => {
        setScreenFlash(false);
      }, 200);
      
      const newCardFlipped = [...cardFlipped];
      newCardFlipped[index] = true;
      setCardFlipped(newCardFlipped);

      const selectedPrize = selectedPrizes[index];
      setResults(prev => {
        const newResults = [...prev];
        newResults[index] = selectedPrize.label;
        return newResults;
      });

      // Start particles after card is fully revealed
      setTimeout(() => {
        const newShowParticles = [...showParticles];
        newShowParticles[index] = true;
        setShowParticles(newShowParticles);
      }, 300);

      // Update credits with the selected prize
      const amount = parseInt(selectedPrize.label.split(' ')[0]);
      setUserCredits(prev => {
        const newCredits = prev + amount;
        localStorage.setItem('userCredits', newCredits.toString());
        return newCredits;
      });
    }, 800);

    setTimeout(() => {
      console.log('Ending animation');
      setIsPulling(false);
      setShowParticles([false, false, false]);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Screen Flash Effect */}
      {screenFlash && (
        <>
          <div className="fixed inset-0 bg-white z-50 pointer-events-none screen-flash"></div>
          {/* Floating sparkles */}
          <div className="fixed inset-0 z-40 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              ></div>
            ))}
          </div>
        </>
      )}

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

          <div className="flex flex-col items-center">
            {/* Three Cards Display */}
            <div className="flex justify-center gap-12 mb-8 relative flex-nowrap">
              {cardsVisible && [0, 1, 2].map((index) => (
                <div key={index} className="relative" style={{ perspective: '1000px', width: '160px', height: '224px' }}>
                  {/* Card back */}
                  <div
                    className={`card-simple w-40 h-56 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-4 border-yellow-300 flex items-center justify-center relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 ${
                      cardFlipped[index] ? 'hidden' : 'visible'
                    } ${isPulling && selectedCard === null ? 'animate-pulse' : ''}`}
                    onClick={() => selectedCard === null && selectCard(index)}
                  >
                    {/* Ornate border pattern */}
                    <div className="absolute inset-2 border-2 border-yellow-200 rounded-lg opacity-80"></div>
                    <div className="absolute inset-4 border border-yellow-100 rounded opacity-60"></div>
                    
                    {/* Central emblem */}
                    <div className="text-center relative z-10">
                      <div className="text-5xl mb-2 animate-pulse drop-shadow-lg">🌿</div>
                      <div className="font-bold text-base mb-1 text-yellow-100 drop-shadow-md">MYSTERY</div>
                      <div className="text-sm opacity-90 text-yellow-50">Choose me!</div>
                    </div>
                    
                    {/* Corner decorations */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-yellow-200 rounded-tl opacity-70"></div>
                    <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-yellow-200 rounded-tr opacity-70"></div>
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-yellow-200 rounded-bl opacity-70"></div>
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-yellow-200 rounded-br opacity-70"></div>
                  </div>

                  {/* Card front (revealed prize) */}
                  {cardsVisible && (
                    <div
                      className={`card-simple w-40 h-56 bg-gradient-to-br from-white via-gray-50 to-gray-100 border-4 flex flex-col items-center justify-center prize-glow relative overflow-hidden ${
                        cardFlipped[index] ? 'visible' : 'hidden'
                      } ${availablePrizes[index]?.rarity === 'Legendary' ? 'legendary-card' : 
                          availablePrizes[index]?.rarity === 'Rare' ? 'rare-card' : 
                          availablePrizes[index]?.rarity === 'Uncommon' ? 'uncommon-card' : 'common-card'}`}
                    >
                      {/* Radial light burst effect */}
                      {cardFlipped[index] && (
                        <div className="absolute inset-0 radial-burst"></div>
                      )}

                      {/* Rarity border effect */}
                      <div className="absolute inset-0 border-2 rounded-lg opacity-50"
                           style={{borderColor: availablePrizes[index]?.color || '#10B981'}}></div>
                      
                      {results[index] && (
                        <div className="text-center relative z-10">
                          <div className="text-4xl mb-3 drop-shadow-lg">💎</div>
                          <div className="font-bold text-xl mb-2 drop-shadow-md"
                               style={{color: availablePrizes[index]?.color || '#10B981'}}>
                            {results[index]}
                          </div>
                          <div className="text-sm font-semibold uppercase tracking-wide drop-shadow-sm"
                               style={{color: availablePrizes[index]?.color || '#10B981'}}>
                            {availablePrizes[index]?.rarity}
                          </div>
                        </div>
                      )}

                      {/* Floating particles */}
                      {showParticles[index] && (
                        <>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pull Button */}
            <button
              onClick={() => {
                setResults([null, null, null]);
                setCardFlipped([false, false, false]);
                setShowParticles([false, false, false]);
                setSelectedCard(null);
                setIsPulling(false);
                setAvailablePrizes([]);
              }}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
            >
              เล่นใหม่
            </button>

            {/* Result */}
            {selectedCard !== null && cardFlipped.some(flipped => flipped) && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center border-2 border-blue-200">
                <p className="text-lg font-semibold text-blue-800">
                  คุณเลือกการ์ดที่ {selectedCard + 1} และได้รับ: {results[selectedCard]}
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
            <li>คลิกที่การ์ดใดก็ได้เพื่อเปิดดูรางวัล</li>
            <li>ระดับความหายาก: Common (100 tCO2e), Uncommon (500 tCO2e), Rare (1000 tCO2e), Legendary (2000 tCO2e)</li>
            <li>โอกาสได้รับ: Common 40%, Uncommon 30%, Rare 20%, Legendary 10%</li>
            <li>เครดิตที่ได้จะถูกเพิ่มเข้าบัญชีของคุณทันที</li>
            <li>คลิก "เล่นใหม่" เพื่อเริ่มเกมรอบใหม่</li>
          </ul>
        </div>
      </main>
    </div>
  );
}