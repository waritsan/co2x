'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Prize definitions for each game
const dailyPrizes = [
  { label: '5 Baht Coupon', value: 5, color: '#10B981', rarity: 'Common', probability: 0.4 },
  { label: '10 Baht Coupon', value: 10, color: '#059669', rarity: 'Uncommon', probability: 0.3 },
  { label: '20 Baht Coupon', value: 20, color: '#047857', rarity: 'Rare', probability: 0.2 },
  { label: '50 Baht Coupon', value: 50, color: '#DC2626', rarity: 'Legendary', probability: 0.1 },
];

const weeklyPrizes = [
  { label: '50 Baht Coupon', value: 50, color: '#3B82F6', rarity: 'Common', probability: 0.4 },
  { label: '100 Baht Coupon', value: 100, color: '#1D4ED8', rarity: 'Uncommon', probability: 0.3 },
  { label: '200 Baht Coupon', value: 200, color: '#1E40AF', rarity: 'Rare', probability: 0.2 },
  { label: '500 Baht Coupon', value: 500, color: '#1E3A8A', rarity: 'Legendary', probability: 0.1 },
];

const monthlyPrizes = [
  { label: '500 Baht Coupon', value: 500, color: '#F59E0B', rarity: 'Common', probability: 0.4 },
  { label: '1000 Baht Coupon', value: 1000, color: '#D97706', rarity: 'Uncommon', probability: 0.3 },
  { label: '2000 Baht Coupon', value: 2000, color: '#B45309', rarity: 'Rare', probability: 0.2 },
  { label: '5000 Baht Coupon', value: 5000, color: '#92400E', rarity: 'Legendary', probability: 0.1 },
];

type Prize = typeof dailyPrizes[0];

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [userCredits, setUserCredits] = useState(1250);
  const [userBalance, setUserBalance] = useState(625000);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  // Daily game state
  const [dailyResults, setDailyResults] = useState<(string | null)[]>([null, null, null]);
  const [cardFlipped, setCardFlipped] = useState([false, false, false]);
  const [showParticles, setShowParticles] = useState([false, false, false]);
  const [screenFlash, setScreenFlash] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [availableDailyPrizes, setAvailableDailyPrizes] = useState<Prize[]>([]);
  const [cardsVisible, setCardsVisible] = useState(false);

  // Weekly game (slot machine) state
  const [weeklySpinning, setWeeklySpinning] = useState(false);
  const [weeklyResults, setWeeklyResults] = useState<string[]>(['?', '?', '?']);
  const [weeklyPrize, setWeeklyPrize] = useState<Prize | null>(null);
  const [weeklyReelSpins, setWeeklyReelSpins] = useState<number[]>([0, 0, 0]);
  const [reelStopped, setReelStopped] = useState<boolean[]>([false, false, false]);

  // Monthly game (wheel) state
  const [monthlySpinning, setMonthlySpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [monthlyPrize, setMonthlyPrize] = useState<Prize | null>(null);

  useEffect(() => {
    const savedCredits = localStorage.getItem('userCredits');
    if (savedCredits) {
      setUserCredits(parseInt(savedCredits));
    }
    const savedBalance = localStorage.getItem('userBalance');
    if (savedBalance) {
      setUserBalance(parseInt(savedBalance));
    }
    setCardsVisible(true);
  }, []);

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

  // QR Scanner setup
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
        let creditAmount = 10;
        if (decodedText.startsWith('gacha:')) {
          const amount = parseInt(decodedText.substring(6));
          if (!isNaN(amount) && amount > 0) {
            creditAmount = amount;
          }
        }
        setUserCredits(prev => {
          const newCredits = prev + creditAmount;
          localStorage.setItem('userCredits', newCredits.toString());
          return newCredits;
        });
        setMessage(`✅ QR Code scanned! +${creditAmount} kg CO₂e added to your account`);
        setTimeout(() => setMessage(''), 3000);
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

  const playDailyGame = (index: number) => {
    if (selectedCard !== null || isPulling) return;
    if (userCredits < 1) {
      setMessage('ต้องมี 1kg CO₂e ขึ้นไปเพื่อเล่น');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newCredits = userCredits - 1;
    setUserCredits(newCredits);
    localStorage.setItem('userCredits', newCredits.toString());

    setIsPulling(true);
    setSelectedCard(index);

    const selectedPrizes: Prize[] = [];
    for (let i = 0; i < 3; i++) {
      const random = Math.random();
      let cumulativeProbability = 0;
      let selectedPrize = dailyPrizes[0];

      for (const prize of dailyPrizes) {
        cumulativeProbability += prize.probability;
        if (random <= cumulativeProbability) {
          selectedPrize = prize;
          break;
        }
      }
      selectedPrizes.push(selectedPrize);
    }

    setAvailableDailyPrizes(selectedPrizes);
    setDailyResults([null, null, null]);

    setTimeout(() => {
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 200);

      const newCardFlipped = [...cardFlipped];
      newCardFlipped[index] = true;
      setCardFlipped(newCardFlipped);

      const selectedPrize = selectedPrizes[index];
      setDailyResults(prev => {
        const newResults = [...prev];
        newResults[index] = selectedPrize.label;
        return newResults;
      });

      setTimeout(() => {
        const newShowParticles = [...showParticles];
        newShowParticles[index] = true;
        setShowParticles(newShowParticles);
      }, 300);

      setUserBalance(prev => {
        const newBalance = prev + selectedPrize.value;
        localStorage.setItem('userBalance', newBalance.toString());
        return newBalance;
      });
    }, 800);

    setTimeout(() => {
      setIsPulling(false);
      setShowParticles([false, false, false]);
    }, 4000);
  };

  const playWeeklyGame = () => {
    if (weeklySpinning) return;
    if (userCredits < 5) {
      setMessage('ต้องมี 5kg CO₂e เพื่อเล่น');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newCredits = userCredits - 5;
    setUserCredits(newCredits);
    localStorage.setItem('userCredits', newCredits.toString());

    setWeeklySpinning(true);
    setWeeklyResults(['?', '?', '?']);
    setWeeklyPrize(null);
    setReelStopped([false, false, false]);

    // Stagger the reel stops for realistic slot machine feel
    const spinDurations = [2500, 3000, 3500]; // Each reel spins for different duration
    const prizes = [weeklyPrizes[Math.floor(Math.random() * weeklyPrizes.length)],
                    weeklyPrizes[Math.floor(Math.random() * weeklyPrizes.length)],
                    weeklyPrizes[Math.floor(Math.random() * weeklyPrizes.length)]];

    // Stop each reel sequentially
    spinDurations.forEach((duration, index) => {
      setTimeout(() => {
        setReelStopped(prev => {
          const newStopped = [...prev];
          newStopped[index] = true;
          return newStopped;
        });
      }, duration);
    });

    // Final results after all reels stop
    setTimeout(() => {
      setWeeklyResults([prizes[0].label, prizes[1].label, prizes[2].label]);

      // Main prize is the middle one
      const winnerPrize = prizes[1];
      setWeeklyPrize(winnerPrize);

      setUserBalance(prev => {
        const newBalance = prev + winnerPrize.value;
        localStorage.setItem('userBalance', newBalance.toString());
        return newBalance;
      });

      setMessage(`🎰 You won: ${winnerPrize.label}! +${winnerPrize.value} Baht`);
      setTimeout(() => setMessage(''), 3000);
      setWeeklySpinning(false);
    }, 3500);
  };

  const playMonthlyGame = () => {
    if (monthlySpinning) return;
    if (userCredits < 20) {
      setMessage('ต้องมี 20kg CO₂e เพื่อเล่น');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newCredits = userCredits - 20;
    setUserCredits(newCredits);
    localStorage.setItem('userCredits', newCredits.toString());

    setMonthlySpinning(true);
    setMonthlyPrize(null);

    // Spin wheel
    const spins = Math.random() * 360 + 720; // At least 2 full rotations
    const randomIndex = Math.floor(Math.random() * monthlyPrizes.length);
    const winnerPrize = monthlyPrizes[randomIndex];

    setWheelRotation(spins);

    setTimeout(() => {
      setMonthlyPrize(winnerPrize);
      setUserBalance(prev => {
        const newBalance = prev + winnerPrize.value;
        localStorage.setItem('userBalance', newBalance.toString());
        return newBalance;
      });

      setMessage(`🎡 You won: ${winnerPrize.label}! +${winnerPrize.value} Baht`);
      setTimeout(() => setMessage(''), 3000);
      setMonthlySpinning(false);
    }, 3000);
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
              <Link href="/games" className="px-4 py-2 text-green-600 font-medium transition-colors duration-200 relative rounded-md">
                เกม
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
              </Link>
              <Link href="/market" className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 relative group rounded-md hover:bg-green-50">
                ตลาด
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
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
                href="/games"
                className="block px-4 py-3 text-green-600 hover:bg-green-50 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                เกม
              </Link>
              <Link
                href="/market"
                className="block px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ตลาด
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
        {/* Credits and Balance Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">CO₂e เครดิต</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{userCredits.toFixed(1)} kg</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">ยอดเงิน</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">฿{userBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm sm:text-base">
            {message}
          </div>
        )}

        {/* Game Selection Tabs */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-visible">
          <div className="flex w-full">
            <button
              onClick={() => { setActiveGame('daily'); setCardFlipped([false, false, false]); setSelectedCard(null); setDailyResults([null, null, null]); }}
              className={`flex-1 min-w-0 px-2 sm:px-4 py-3 sm:py-4 font-semibold transition-colors text-xs sm:text-sm md:text-base ${
                activeGame === 'daily'
                  ? 'bg-green-600 text-white border-b-4 border-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Daily (1kg)
            </button>
            <button
              onClick={() => { setActiveGame('weekly'); setWeeklyResults(['?', '?', '?']); setWeeklyPrize(null); }}
              className={`flex-1 min-w-0 px-2 sm:px-4 py-3 sm:py-4 font-semibold transition-colors text-xs sm:text-sm md:text-base ${
                activeGame === 'weekly'
                  ? 'bg-blue-600 text-white border-b-4 border-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎰 Weekly (5kg)
            </button>
            <button
              onClick={() => { setActiveGame('monthly'); setWheelRotation(0); setMonthlyPrize(null); }}
              className={`flex-1 min-w-0 px-2 sm:px-4 py-3 sm:py-4 font-semibold transition-colors text-xs sm:text-sm md:text-base ${
                activeGame === 'monthly'
                  ? 'bg-yellow-600 text-white border-b-4 border-yellow-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎡 Monthly (20kg)
            </button>
          </div>
        </div>

        {/* Daily Game - Gacha */}
        {activeGame === 'daily' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">📅 Daily Gacha (1kg per play)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">Select a card to reveal the prize</p>
                <div className="flex justify-center items-center gap-4 mb-6">
                  {cardsVisible && [0, 1, 2].map((index) => (
                    <div key={index} className="relative w-24 h-32">
                      {/* Unflipped Card */}
                      {!cardFlipped[index] && (
                        <div
                          onClick={() => playDailyGame(index)}
                          className={`absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg border-4 border-yellow-300 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform ${
                            userCredits < 1 ? 'opacity-40 cursor-not-allowed hover:scale-100' : ''
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-2">🌿</div>
                            <div className="text-xs font-bold text-yellow-50">?</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Flipped Card showing Prize */}
                      {cardFlipped[index] && dailyResults[index] && (
                        <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-green-600 rounded-lg border-4 border-green-400 flex items-center justify-center text-center">
                          <div>
                            <div className="text-lg font-bold text-green-900">{dailyResults[index]}</div>
                            {showParticles[index] && (
                              <div className="text-2xl mt-2">✨</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Replay Button */}
                {cardFlipped.some(flipped => flipped) && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => {
                        setCardFlipped([false, false, false]);
                        setDailyResults([null, null, null]);
                        setSelectedCard(null);
                        setShowParticles([false, false, false]);
                      }}
                      className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      🔄 Replay
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Prize Tiers:</h3>
                {dailyPrizes.map((prize) => (
                  <div key={prize.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{prize.label}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: prize.color, color: 'white' }}>
                      {(prize.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Game - Slot Machine */}
        {activeGame === 'weekly' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">🎰 Weekly Slot Machine (5kg per play)</h2>
            <div className="flex flex-col items-center gap-8">
              {/* Slot Machine Reels */}
              <div className="flex gap-2 justify-center bg-gradient-to-r from-yellow-900 to-yellow-800 p-6 rounded-lg shadow-lg border-4 border-yellow-700">
                {[0, 1, 2].map((reelIndex) => (
                  <div
                    key={reelIndex}
                    className="w-24 h-24 bg-gradient-to-br from-blue-300 to-blue-500 rounded-lg border-4 border-blue-400 shadow-inner overflow-hidden"
                  >
                    <div
                      className={`slot-reel-container h-full ${
                        weeklySpinning && !reelStopped[reelIndex] ? `spin-reel-${reelIndex}` : ''
                      }`}
                    >
                      {weeklySpinning && !reelStopped[reelIndex] ? (
                        // Show multiple items while spinning
                        <div className="slot-reel">
                          {[...weeklyPrizes, ...weeklyPrizes, ...weeklyPrizes, ...weeklyPrizes].map((prize, i) => (
                            <div key={i} className="slot-reel-item text-xs sm:text-sm">
                              {prize.label.split(' ')[0]}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl">
                          {weeklyResults[reelIndex]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={playWeeklyGame}
                disabled={weeklySpinning || userCredits < 5}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {weeklySpinning ? 'Spinning...' : '🎰 SPIN'}
              </button>
              {weeklyPrize && (
                <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="font-semibold text-blue-900">🎉 You won!</p>
                  <p className="text-lg font-bold text-blue-600">{weeklyPrize.label}</p>
                  <p className="text-sm text-blue-700">+{weeklyPrize.value} Baht</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {weeklyPrizes.map((prize) => (
                  <div key={prize.label} className="p-2 bg-gray-50 rounded text-xs">
                    <div className="font-semibold">{prize.label}</div>
                    <div className="text-gray-600">{(prize.probability * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Game - Wheel of Fortune */}
        {activeGame === 'monthly' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">🎡 Monthly Wheel of Fortune (20kg per play)</h2>
            <div className="flex flex-col items-center gap-8">
              <div
                className={`relative w-64 h-64 rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 border-8 border-yellow-600 flex items-center justify-center transition-transform duration-3000 ${
                  monthlySpinning ? 'animate-spin' : ''
                }`}
                style={{
                  transform: monthlySpinning ? `rotate(${wheelRotation}deg)` : 'rotate(0deg)',
                }}
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-2xl">🎯</div>
              </div>
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-3xl">🔼</div>
              <button
                onClick={playMonthlyGame}
                disabled={monthlySpinning || userCredits < 20}
                className="px-8 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {monthlySpinning ? 'Spinning...' : '🎡 SPIN'}
              </button>
              {monthlyPrize && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                  <p className="font-semibold text-yellow-900">🎉 You won!</p>
                  <p className="text-lg font-bold text-yellow-600">{monthlyPrize.label}</p>
                  <p className="text-sm text-yellow-700">+{monthlyPrize.value} Baht</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {monthlyPrizes.map((prize) => (
                  <div key={prize.label} className="p-2 bg-gray-50 rounded text-xs">
                    <div className="font-semibold">{prize.label}</div>
                    <div className="text-gray-600">{(prize.probability * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">📱 สแกน QR เพื่อรับเครดิต</h2>
          <p className="text-sm text-gray-600 mb-4">QR codes have different amounts (0.3kg - 10kg) just like coffee prices</p>
          {!showScanner ? (
            <button
              onClick={() => setShowScanner(true)}
              className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
            >
              🔍 สแกน QR Code
            </button>
          ) : (
            <button
              onClick={() => setShowScanner(false)}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base font-medium"
            >
              ยกเลิก
            </button>
          )}
          <div id="qr-reader" className="mt-4 max-w-sm mx-auto" style={{ display: showScanner ? 'block' : 'none' }}></div>
        </div>

        {/* How to Play */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">📖 How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-700">📅 Daily Gacha</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Cost: 1kg CO₂e</li>
                <li>• Pick a card</li>
                <li>• Win 5-50 Baht</li>
                <li>• Lower stakes, quick plays</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-700">🎰 Weekly Slot</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Cost: 5kg CO₂e</li>
                <li>• Spin the slots</li>
                <li>• Win 50-500 Baht</li>
                <li>• Medium rewards</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-700">🎡 Monthly Wheel</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Cost: 20kg CO₂e</li>
                <li>• Spin the wheel</li>
                <li>• Win 500-5000 Baht</li>
                <li>• High stakes, big rewards</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
