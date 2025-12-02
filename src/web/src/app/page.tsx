'use client';

import { useState } from 'react';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-green-600">การซื้อขายเครดิตคาร์บอน CO2X</h1>
            <div className="text-sm text-gray-600">แอปเดโม</div>
          </div>
        </div>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">ยอดคงเหลือคาร์บอน</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">1,250 tCO2e</p>
            <p className="text-sm text-gray-500">เครดิตที่มีอยู่</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">มูลค่าพอร์ต</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">฿625,000</p>
            <p className="text-sm text-gray-500">+5.2% ในเดือนนี้</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">การซื้อขายที่ใช้งานอยู่</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">3</p>
            <p className="text-sm text-gray-500">รอการชำระ</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="ค้นหาโครงการ ผู้ขาย ผู้ซื้อ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">ทุกประเภท</option>
              <option value="ป่าไม้">ป่าไม้</option>
              <option value="พลังงานหมุนเวียน">พลังงานหมุนเวียน</option>
              <option value="จัดการขยะ">จัดการขยะ</option>
            </select>
          </div>
        </div>

        {/* Trading Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">การซื้อขายด่วน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ซื้อเครดิต</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="จำนวน (tCO2e)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  ขาย
                </button>
              </div>
            </div>
          </div>
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
                        onClick={() => setSelectedItem(item)}
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
                      onClick={() => setSelectedItem(seller)}
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
                        onClick={() => setSelectedItem(buyer)}
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

        {/* Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">รายละเอียด</h3>
              {selectedItem.project ? (
                // Market item details
                <div>
                  <p><strong>โครงการ:</strong> {selectedItem.project}</p>
                  <p><strong>ประเภท:</strong> {selectedItem.type}</p>
                  <p><strong>ราคา:</strong> ฿{selectedItem.price}</p>
                  <p><strong>ผู้ขาย:</strong> {selectedItem.seller}</p>
                  <p><strong>ผู้ซื้อ:</strong> {selectedItem.buyer}</p>
                  <p><strong>ปริมาณ:</strong> {selectedItem.volume} tCO2e</p>
                </div>
              ) : selectedItem.credits ? (
                // Seller details
                <div>
                  <p><strong>ชื่อ:</strong> {selectedItem.name}</p>
                  <p><strong>สถานที่:</strong> {selectedItem.location}</p>
                  <p><strong>เครดิตที่มี:</strong> {selectedItem.credits} tCO2e</p>
                  <p><strong>คะแนน:</strong> {selectedItem.rating}/5</p>
                </div>
              ) : (
                // Buyer details
                <div>
                  <p><strong>ชื่อ:</strong> {selectedItem.name}</p>
                  <p><strong>สถานที่:</strong> {selectedItem.location}</p>
                  <p><strong>ความต้องการ:</strong> {selectedItem.demand} tCO2e</p>
                  <p><strong>คะแนน:</strong> {selectedItem.rating}/5</p>
                </div>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                ปิด
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
