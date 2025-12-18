'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type MarketItem = {
  id: number;
  project: string;
  price: number;
  change: number;
  volume: number;
  type: string;
  seller: string;
  buyer: string;
};

type Seller = {
  id: number;
  name: string;
  credits: number;
  rating: number;
  location: string;
};

type Buyer = {
  id: number;
  name: string;
  demand: number;
  rating: number;
  location: string;
};

type Transaction = {
  type: string;
  product: string;
  amount: number;
  cost?: number;
  revenue?: number;
  date: string;
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MarketItem | Seller | Buyer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userCredits, setUserCredits] = useState(1250);
  const [userBalance, setUserBalance] = useState(625000); // THB
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [message, setMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<MarketItem | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('userCredits');
      localStorage.removeItem('userBalance');
      setUserCredits(1250);
      setUserBalance(625000);
      setMessage('Data cleared and reset to initial values');
      setTimeout(() => setMessage(''), 3000);
    }
  };

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

  // Mock data for Thailand T-VER market
  const marketData = [
    { id: 1, project: 'ป่าอนุรักษ์แม่แจ่ม', price: 1250, change: 2.1, volume: 1200, type: 'ป่าไม้', seller: 'บริษัทรักษ์ป่าธรรมชาติ', buyer: 'บริษัทเทคโนโลยีสีเขียว' },
    { id: 2, project: 'ฟาร์มโซลาร์เชียงใหม่', price: 1100, change: -1.5, volume: 850, type: 'พลังงานหมุนเวียน', seller: 'บริษัทพลังงานสุริยะไทย', buyer: 'บริษัทก่อสร้างเขียว' },
    { id: 3, project: 'โครงการพลังงานลมภูเก็ต', price: 1400, change: 3.2, volume: 2100, type: 'พลังงานหมุนเวียน', seller: 'เทคโนโลยีลมไทย', buyer: 'บริษัทคาร์บอนเป็นกลาง' },
    { id: 4, project: 'การจัดการขยะอินทรีย์กรุงเทพ', price: 1500, change: 1.8, volume: 950, type: 'จัดการขยะ', seller: 'บริษัทจัดการขยะเขียว', buyer: 'องค์กรธุรกิจโลก' },
  ];

  const sellers = [
    { id: 1, name: 'บริษัทรักษ์ป่าธรรมชาติ', credits: 5000, rating: 4.8, location: 'เชียงใหม่' },
    { id: 2, name: 'บริษัทพลังงานสุริยะไทย', credits: 3200, rating: 4.6, location: 'กรุงเทพฯ' },
    { id: 3, name: 'เทคโนโลยีลมไทย', credits: 4100, rating: 4.9, location: 'ภูเก็ต' },
    { id: 4, name: 'บริษัทจัดการขยะเขียว', credits: 2800, rating: 4.7, location: 'ชลบุรี' },
  ];

  const buyers = [
    { id: 1, name: 'บริษัทเทคโนโลยีสีเขียว', demand: 3000, rating: 4.5, location: 'กรุงเทพฯ' },
    { id: 2, name: 'บริษัทก่อสร้างเขียว', demand: 2500, rating: 4.3, location: 'เชียงใหม่' },
    { id: 3, name: 'บริษัทคาร์บอนเป็นกลาง', demand: 4000, rating: 4.8, location: 'ปทุมธานี' },
    { id: 4, name: 'องค์กรธุรกิจโลก', demand: 3500, rating: 4.6, location: 'สมุทรปราการ' },
  ];

  const filteredMarket = marketData.filter(item =>
    item.project.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || item.type === filterType)
  );

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBuyers = buyers.filter(buyer =>
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBuy = () => {
    const amount = parseInt(buyAmount);
    if (!amount || amount <= 0) {
      setMessage('กรุณาป้อนจำนวนที่ถูกต้อง');
      return;
    }
    if (!selectedProduct) {
      setMessage('กรุณาเลือกผลิตภัณฑ์');
      return;
    }
    const cost = amount * selectedProduct.price;
    if (cost > userBalance) {
      setMessage('ยอดเงินไม่เพียงพอ');
      return;
    }
    setUserCredits(userCredits + amount);
    setUserBalance(userBalance - cost);
    setTransactions([...transactions, { type: 'ซื้อ', product: selectedProduct.project, amount, cost, date: new Date().toLocaleString('th-TH') }]);
    setBuyAmount('');
    setMessage(`ซื้อ ${selectedProduct.project} ${amount} tCO2e สำเร็จ`);
    localStorage.setItem('userCredits', (userCredits + amount).toString());
    localStorage.setItem('userBalance', (userBalance - cost).toString());
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSell = () => {
    const amount = parseInt(sellAmount);
    if (!amount || amount <= 0) {
      setMessage('กรุณาป้อนจำนวนที่ถูกต้อง');
      return;
    }
    if (!selectedProduct) {
      setMessage('กรุณาเลือกผลิตภัณฑ์');
      return;
    }
    if (amount > userCredits) {
      setMessage('เครดิตไม่เพียงพอ');
      return;
    }
    const revenue = amount * selectedProduct.price;
    setUserCredits(userCredits - amount);
    setUserBalance(userBalance + revenue);
    setTransactions([...transactions, { type: 'ขาย', product: selectedProduct.project, amount, revenue, date: new Date().toLocaleString('th-TH') }]);
    setSellAmount('');
    setMessage(`ขาย ${selectedProduct.project} ${amount} tCO2e สำเร็จ`);
    localStorage.setItem('userCredits', (userCredits - amount).toString());
    localStorage.setItem('userBalance', (userBalance + revenue).toString());
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
              <Link href="/" className="px-4 py-2 text-green-600 font-medium transition-colors duration-200 relative rounded-md">
                หน้าแรก
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></span>
              </Link>
              <Link href="/games" className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 relative group rounded-md hover:bg-green-50">
                เกม
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
                className="block px-4 py-3 text-green-600 hover:bg-green-50 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                หน้าแรก
              </Link>
              <Link
                href="/games"
                className="block px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                เกม
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

      {/* Compliance Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 sm:mx-6 lg:mx-8 mt-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>การปฏิบัติตามกฎระเบียบ TGO:</strong> แพลตฟอร์มนี้เป็นไปตามกฎระเบียบขององค์การบริหารจัดการก๊าซเรือนกระจก (องค์การมหาชน) สำหรับโครงการ T-VER ในประเทศไทย
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">ยอดคงเหลือคาร์บอน</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{userCredits.toLocaleString()} tCO2e</p>
            <p className="text-xs sm:text-sm text-gray-500">เครดิตที่มีอยู่</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">มูลค่าพอร์ต</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">฿{userBalance.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500">+5.2% ในเดือนนี้</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">การซื้อขายที่ใช้งานอยู่</h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">{transactions.length}</p>
            <p className="text-xs sm:text-sm text-gray-500">รอการชำระ</p>
          </div>
          <button
            onClick={handleClearData}
            className="sm:col-span-2 lg:col-span-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            🗑️ Clear All Data
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="ค้นหาโครงการ ผู้ขาย ผู้ซื้อ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            >
              <option value="all">ทุกประเภท</option>
              <option value="ป่าไม้">ป่าไม้</option>
              <option value="พลังงานหมุนเวียน">พลังงานหมุนเวียน</option>
              <option value="จัดการขยะ">จัดการขยะ</option>
            </select>
          </div>
        </div>

        {/* Trading Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">การซื้อขายด่วน</h2>
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm sm:text-base">
              {message}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">เลือกผลิตภัณฑ์</label>
            <select
              value={selectedProduct ? selectedProduct.id : ''}
              onChange={(e) => {
                const product = marketData.find(p => p.id === parseInt(e.target.value)) || null;
                setSelectedProduct(product);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">เลือกผลิตภัณฑ์...</option>
              {marketData.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.project} - ฿{product.price}/tCO2e
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ซื้อเครดิต</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="จำนวน (tCO2e)"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                />
                <button
                  onClick={handleBuy}
                  disabled={!selectedProduct}
                  className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 text-sm sm:text-base"
                >
                  ซื้อ
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ขายเครดิต</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="จำนวน (tCO2e)"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                />
                <button
                  onClick={handleSell}
                  disabled={!selectedProduct}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 text-sm sm:text-base"
                >
                  ขาย
                </button>
              </div>
            </div>
          </div>
          {selectedProduct && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>ผลิตภัณฑ์ที่เลือก:</strong> {selectedProduct.project} (ราคา: ฿{selectedProduct.price}/tCO2e)
              </p>
            </div>
          )}
        </div>

        {/* Market Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">ภาพรวมตลาด</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">โครงการ</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ประเภท</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ราคา</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">เปลี่ยนแปลง</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ปริมาณ</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarket.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{item.project}</td>
                    <td className="px-4 py-2 text-sm">{item.type}</td>
                    <td className="px-4 py-2 text-sm">฿{item.price}</td>
                    <td className={`px-4 py-2 text-sm ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </td>
                    <td className="px-4 py-2 text-sm">{item.volume} tCO2e</td>
                    <td className="px-4 py-2 text-sm">
                      <button
                        onClick={() => { setSelectedItem(item); setShowDetailsModal(true); }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        รายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">ประวัติการซื้อขาย</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ประเภท</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ผลิตภัณฑ์</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">จำนวน</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">มูลค่า</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">วันที่</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(-10).reverse().map((tx, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 text-sm">{tx.type}</td>
                    <td className="px-4 py-2 text-sm">{tx.product}</td>
                    <td className="px-4 py-2 text-sm">{tx.amount} tCO2e</td>
                    <td className="px-4 py-2 text-sm">฿{(tx.cost ?? tx.revenue ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">ยังไม่มีประวัติการซื้อขาย</p>
            )}
          </div>
        </div>

        {/* Sellers and Buyers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sellers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">ผู้ขาย</h2>
            <div className="space-y-4">
              {filteredSellers.map((seller) => (
                <div key={seller.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{seller.name}</h3>
                      <p className="text-sm text-gray-600">{seller.location}</p>
                      <p className="text-sm">เครดิตที่มี: {seller.credits} tCO2e</p>
                      <p className="text-sm">คะแนน: {seller.rating}/5</p>
                    </div>
                    <button
                      onClick={() => { setSelectedItem(seller); setShowDetailsModal(true); }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buyers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">ผู้ซื้อ</h2>
            <div className="space-y-4">
              {filteredBuyers.map((buyer) => (
                <div key={buyer.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{buyer.name}</h3>
                        <p className="text-sm text-gray-600">{buyer.location}</p>
                        <p className="text-sm">ความต้องการ: {buyer.demand} tCO2e</p>
                        <p className="text-sm">คะแนน: {buyer.rating}/5</p>
                      </div>
                      <button
                        onClick={() => { setSelectedItem(buyer); setShowDetailsModal(true); }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">
                {'project' in selectedItem ? selectedItem.project : selectedItem.name}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {'project' in selectedItem ? (
                <>
                  <p><strong>ประเภท:</strong> {selectedItem.type}</p>
                  <p><strong>ราคา:</strong> ฿{selectedItem.price}/tCO2e</p>
                  <p><strong>เปลี่ยนแปลง:</strong> {selectedItem.change > 0 ? '+' : ''}{selectedItem.change}%</p>
                  <p><strong>ปริมาณ:</strong> {selectedItem.volume} tCO2e</p>
                  <p><strong>ผู้ขาย:</strong> {selectedItem.seller}</p>
                  <p><strong>ผู้ซื้อ:</strong> {selectedItem.buyer}</p>
                </>
              ) : (
                <>
                  <p><strong>สถานที่:</strong> {selectedItem.location}</p>
                  {'credits' in selectedItem ? (
                    <p><strong>เครดิตที่มี:</strong> {selectedItem.credits} tCO2e</p>
                  ) : (
                    <p><strong>ความต้องการ:</strong> {selectedItem.demand} tCO2e</p>
                  )}
                  <p><strong>คะแนน:</strong> {selectedItem.rating}/5</p>
                </>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
