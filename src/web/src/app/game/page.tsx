'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';

type Prize = {
  label: string;
  value: number;
  color: string;
  rarity: string;
  probability: number;
};

const prizes: Prize[] = [
  { label: '10 Baht Coupon', value: 10, color: '#10B981', rarity: 'Common', probability: 0.4 },
  { label: '20 Baht Coupon', value: 20, color: '#059669', rarity: 'Uncommon', probability: 0.3 },
  { label: '50 Baht Coupon', value: 50, color: '#047857', rarity: 'Rare', probability: 0.2 },
  { label: '100 Baht Coupon', value: 100, color: '#DC2626', rarity: 'Legendary', probability: 0.1 },
];

export default function GamePage() {
  const [isPulling, setIsPulling] = useState(false);
  const [results, setResults] = useState<(string | null)[]>([null, null, null]);
  const [userCredits, setUserCredits] = useState(1250);
  const [userBalance, setUserBalance] = useState(625000);
  const [cardFlipped, setCardFlipped] = useState([false, false, false]);
  const [showParticles, setShowParticles] = useState([false, false, false]);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [availablePrizes, setAvailablePrizes] = useState<Prize[]>([]);
  const [screenFlash, setScreenFlash] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    // Show cards by default
    setCardsVisible(true);

    // Check for token in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token === 'gacha2025') { // Simple token validation
      setHasToken(true);
      // Clean up URL by removing the token parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  useEffect(() => {
    if (showScanner) {
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      setScanner(qrScanner);

      qrScanner.render((decodedText: string) => {
        console.log('Scanned:', decodedText);
        // Assume any scanned QR is a valid token
        setHasToken(true);
        setShowScanner(false);
        qrScanner.clear();
      }, (errorMessage: string) => {
        console.log('QR scan error:', errorMessage);
      });
    } else if (scanner) {
      scanner.clear();
      setScanner(null);
    }
  }, [showScanner]);

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

  const selectCard = (index: number) => {
    if (selectedCard !== null || isPulling) return;
    
    // Check if user has at least 1kg CO2e to play
    if (userCredits < 1) {
      setMessage('ต้องมี 1kg CO₂e ขึ้นไปเพื่อเล่น');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsPulling(true);
    setSelectedCard(index);
    console.log('Selected card:', index);
    
    // Deduct 1kg CO2e credit for playing
    const newCredits = userCredits - 1;
    setUserCredits(newCredits);
    localStorage.setItem('userCredits', newCredits.toString());

    // Generate prizes when card is selected
    const selectedPrizes: Prize[] = [];
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

      // Update balance with the winning prize (baht coupons)
      setUserBalance(prev => {
        const newBalance = prev + selectedPrize.value;
        localStorage.setItem('userBalance', newBalance.toString());
        return newBalance;
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
              <Link href="/game" className="px-4 py-2 text-green-600 font-medium transition-colors duration-200 relative rounded-md">
                เกมลอตเตอรี่
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
              </Link>
              <Link href="/coffee" className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 relative group rounded-md hover:bg-green-50">
                ร้านกาแฟ
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
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
                className="block px-4 py-3 text-green-600 hover:bg-green-50 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                เกมลอตเตอรี่
              </Link>
              <Link
                href="/coffee"
                className="block px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md font-medium transition-colors"
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
        {/* Credits Display */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">เครดิตของคุณ</h2>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{userCredits.toLocaleString()} tCO2e</p>
        </div>

        {/* Game Cost Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-blue-900">💰 ค่าเล่นเกม</h2>
          <div className="space-y-3">
            <p className="text-blue-800"><strong>ค่าเล่นต่อครั้ง:</strong> 1kg CO₂e</p>
            <p className="text-blue-800"><strong>เครดิตปัจจุบัน:</strong> <span className="text-green-600 font-bold">{userCredits.toLocaleString()}</span> kg</p>
            {userCredits < 1 ? (
              <p className="text-red-600 font-semibold">❌ เครดิตไม่พอเล่นเกม ให้ซื้อกาแฟเพื่อรับเครดิตเพิ่มเติม</p>
            ) : (
              <p className="text-green-600 font-semibold">✅ คุณสามารถเล่นได้ {Math.floor(userCredits)} ครั้ง</p>
            )}
          </div>
        </div>

        {/* Card Reveal System */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          {message && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm sm:text-base">
              {message}
            </div>
          )}

          <div className="flex flex-col items-center">
            {/* Three Cards Display */}
            <div className="relative flex justify-center items-center mb-8 portrait-h-64 portrait-w-48 landscape-flex-col landscape-sm-flex-row landscape-gap-4 landscape-sm-gap-8 landscape-lg-gap-12">
              {cardsVisible && [0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`absolute inset-0 portrait-transition-transform portrait-duration-300 ${
                    index === 0 ? 'z-10' :
                    index === 1 ? 'z-20 portrait-translate-x-2 portrait--translate-y-2' :
                    'z-30 portrait-translate-x-4 portrait--translate-y-4'
                  }`}
                  style={{
                    perspective: '1000px',
                    width: '140px',
                    height: '196px'
                  }}
                >
                  {/* Card back */}
                  <div
                    className={`card-simple w-35 h-49 sm:w-40 sm:h-56 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-4 border-yellow-300 flex items-center justify-center relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 ${
                      cardFlipped[index] ? 'hidden' : 'visible'
                    } ${isPulling && selectedCard === null ? 'animate-pulse' : ''} ${userCredits < 1 ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''} portrait-shadow-2xl`}
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
                      className={`card-simple absolute inset-0 w-35 h-49 sm:w-40 sm:h-56 bg-gradient-to-br from-white via-gray-50 to-gray-100 border-4 flex flex-col items-center justify-center prize-glow relative overflow-hidden portrait-shadow-2xl ${
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
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">กฎของเกม</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base">
            <li>ต้องมี 1kg CO₂e เพื่อเล่นเกมหนึ่งครั้ง</li>
            <li>คลิกที่การ์ดใดก็ได้เพื่อเปิดดูรางวัล</li>
            <li>ระดับความหายาก: Common (10 Baht), Uncommon (20 Baht), Rare (50 Baht), Legendary (100 Baht)</li>
            <li>โอกาสได้รับ: Common 40%, Uncommon 30%, Rare 20%, Legendary 10%</li>
            <li>คูปองที่ได้จะถูกเพิ่มเข้าบัญชีของคุณทันที</li>
            <li>ซื้อกาแฟจาก "ร้านกาแฟ" เพื่อรับเครดิต CO₂e เพิ่มเติม</li>
          </ul>
        </div>
      </main>
    </div>
  );
}